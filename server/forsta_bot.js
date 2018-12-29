'use strict';
const relay = require('librelay');
const uuid4 = require('uuid/v4');
const moment = require('moment');

const BotAtlasClient = require('./atlas_client');
const cache = require('./cache');
const PGStore = require("./pgstore");
const words = require("./authwords");

const AUTH_FAIL_THRESHOLD = 10;

class ForstaBot {

    async start() {
        this.ourId = await relay.storage.getState('addr');
        if (!this.ourId) {
            console.warn("bot is not yet registered");
            return;
        }
        //database
        this.pgStore = new PGStore('live_chat');
        await this.pgStore.initialize();
        //atlas
        this.atlas = await BotAtlasClient.factory();
        this.getUsers = cache.ttl(60, this.atlas.getUsers.bind(this.atlas));
        this.resolveTags = cache.ttl(60, this.atlas.resolveTags.bind(this.atlas));
        //relay
        this.msgReceiver = await relay.MessageReceiver.factory();
        this.msgSender = await relay.MessageSender.factory();
        this.msgReceiver.addEventListener('keychange', this.onKeyChange.bind(this));
        this.msgReceiver.addEventListener('message', ev => this.onMessage(ev), null);
        this.msgReceiver.addEventListener('error', this.onError.bind(this));
        await this.msgReceiver.connect();
        //bot
        this.getBusinessInfo = cache.ttl(120, () => relay.storage.get('live-chat-bot', 'business-info'));
        this.getQuestions = cache.ttl(120, () => relay.storage.get('live-chat-bot', 'questions'));
        this.getGroups = cache.ttl(120, () => relay.storage.get('live-chat-bot', 'groups'));
        this.threadStatus = {};
        this.sockets = {};
        this.outgoingThreadId = uuid4();
    }

    async configureSocket(io){
        let addSocket = (function (socket, userId){
            this.sockets[userId] = socket;
        }).bind(this);
        io.on('connect', function (socket) {
            let s = socket;
            socket.on('createConnection', function(userId) {
                addSocket(s, userId);
            });
        });
        this.socketio = io;
    }    

    async onMessage(event) {
        const messageBody = JSON.parse(event.data.message.body);
        const msg = messageBody.find(x => x.version === 1);
        if(!msg || (msg.messageType == 'control' && msg.data.control == 'readMark')){
            if(!msg) console.log('Dropping unsupported message:', event);
            return;
        }

        this.saveToMessageHistory(msg, event.data.message.attachments);
        if(!this.threadStatus[msg.threadId]) {
            await this.initializeNewThread(msg);
        }else{            
            await this.stepThreadState(this.threadStatus[msg.threadId], msg);
        }
    }

    async initializeNewThread(msg){
        const dist = await this.resolveTags(msg.distribution.expression);
        const questions = await this.getQuestions();        
        //assuming that only the live-chat-bot and ephemeral user are in the thread
        const ephUser = (await this.getUsers(dist.userids)).filter(user => user.id != this.ourId)[0];
        const botUser = (await this.getUsers(dist.userids)).filter(user => user.id == this.ourId)[0];
        this.threadStatus[msg.threadId] = {
            threadId: msg.threadId,
            dist,
            timeStarted: (new Date()).toUTCString(),
            timeConnected: null,
            timeEnded: null,
            questions,
            currentQuestion: questions[0],
            messageHistory: [],
            operator: null,
            onHold: false,
            bot: {
                name: this.fqName(botUser),
                id: botUser.id,
                gravatarHash: botUser.gravatar_hash
            },
            user: {
                name: this.fqName(ephUser),
                id: ephUser.id,
                gravatarHash: ephUser.gravatar_hash
            }
        };
        await this.saveToThreadMessageHistory(msg);
        this.sendQuestion(dist, msg.threadId, questions[0]);
    }

    async stepThreadState(threadStatus, msg){
        if(threadStatus.onHold){
            let onHoldMessage = 'Waiting for an operator to connect...';
            this.sendMessage(threadStatus.dist, threadStatus.threadId, onHoldMessage);
            return;
        }        
        let {action, actionOption} = threadStatus.currentQuestion.type == 'Multiple Choice'
        ?threadStatus.currentQuestion.responses[parseInt(msg.data.action)]
        :threadStatus.currentQuestion.responses[0];
        const {dist, threadId, questions} = threadStatus;
        if(action == 'Forward to Question'){
            const questionNumber = parseInt(actionOption.split(' ')[1])-1;
            threadStatus.currentQuestion = questions[questionNumber];
            this.sendQuestion(dist, threadId, questions[questionNumber]);
        }else if(action == 'Forward to Group'){
            let group = (await this.getGroups()).find(group => group.name == actionOption);
            const ts = this.threadStatus[msg.threadId];
            group.users.forEach(user => {
                if(this.sockets[user.id]){
                    this.sockets[user.id].emit('operatorConnectionRequest', 
                    {
                        threadId: ts.threadId,
                        dist: ts.dist,
                        timeStarted: ts.timeStarted,
                        timeConnected: null,
                        messageHistory: ts.messageHistory,
                        messages: [],
                        bot: ts.bot,
                        user: ts.user,
                        userIsOnline: true,
                        seen: false,
                        connected: false
                    });
                }
            });
            threadStatus.onHold = true;
            const operatorConnectMessage = 'A live chat operator will be with you shortly';
            this.sendMessage(threadStatus.dist, threadStatus.threadId, operatorConnectMessage);
        }
    }

    async sendQuestion(dist, threadId, question){
        let outgoingMessage = null;
        if(question.type=="Multiple Choice"){
            const actions = question.responses.map( 
                (response, index) => { 
                    return { title: response.text, color: response.color, action: index };
                }
            );
            outgoingMessage = await this.sendActionMessage(dist, threadId, question.prompt, actions);
        }else if(question.type=="Free Response"){
            outgoingMessage = await this.sendMessage(dist, threadId, question.prompt);
        }
        let messageBody = JSON.parse(outgoingMessage.message.dataMessage.body)[0];
        await this.saveToThreadMessageHistory(messageBody);
        this.saveToMessageHistory(messageBody);
    }

    async saveToThreadMessageHistory(message){
        let threadStatus = this.threadStatus[message.threadId];
        let sender = await this.getUsers([message.sender.userId]);        
        let text = message.data.body
        ? message.data.body[0].value //if its an outgoing message, save the text
        : threadStatus.currentQuestion.responses[parseInt(message.data.action)].text; //if its an incoming message save the response text based on the selected action
        let formattedMessage = {
            text,
            time: moment().format('HH:MM:SS'),
            sender: {
                name: this.fqName(sender),
                id: sender.id,
                gravatarHash: sender.gravatar_hash
            },
            beforeConnect: true,
            actions: message.data.actions || null
        };
        threadStatus.messageHistory.push(formattedMessage);
    }

    async saveToMessageHistory(message, attachments=[]) {
        const sender = (await this.getUsers([message.sender.userId]))[0];
        const distribution = await this.resolveTags(message.distribution.expression);
        const recipients = await this.getUsers(distribution.userids);
        //message text
        const tempBody = message.data && message.data.body;
        const tempText = tempBody && tempBody.find(x => x.type === 'text/plain');
        const messageText = (tempText && tempText.value) || '';        
        //attachments
        const attachmentMeta = (message.data && message.data.attachments) || [];
        if (attachments.length != attachmentMeta.length) {
            console.error('Received mismatched attachments with message:', message);
            return;
        }
        let attachmentIds = attachments.map(x => uuid4());

        for (let i = 0; i < attachmentIds.length; i++) {
            this.pgStore.addAttachment({
                id: attachmentIds[i],
                data: attachments[i].data,
                type: attachmentMeta[i].type,
                name: attachmentMeta[i].name,
                messageId: message.messageId
            });
        }

        this.pgStore.addMessage({
            payload: JSON.stringify(message),
            received: new Date(Date.now()),
            distribution: JSON.stringify(distribution),
            messageId: message.messageId,
            threadId: message.threadId,
            senderId: message.sender.userId,
            senderLabel: this.fqLabel(sender),
            recipientIds: recipients.map(user => user.id),
            recipientLabels: recipients.map(user => this.fqLabel(user)),
            attachmentIds,
            tsMain: messageText,
            tsTitle: message.threadTitle
        });        
    }

    outOfOffice(businessInfo){
        if(!businessInfo) return false;

        const hoursNow = moment().hours();
        const minsNow = moment().minutes();
        const openHours = Number(businessInfo.open.split(':')[0]);
        const openMins = Number(businessInfo.open.split(':')[1]);
        const closeMins = Number(businessInfo.close.split(':')[1]);
        let closeHours = Number(businessInfo.close.split(':')[0]);

        if(openHours > closeHours) closeHours += 24;
        if( (hoursNow < openHours) || (hoursNow === openHours && minsNow < openMins) ){
            return true;
        }
        if( (hoursNow > closeHours) || (hoursNow === closeHours && minsNow > closeMins) ){
            return true;
        }
        return false;
    }

    async sendMessage(dist, threadId, text){
        return this.msgSender.send({
            distribution: dist,
            threadId: threadId,
            html: `${ text }`,
            text: text
        }).catch(err => console.log(err));
    }

    async sendResponse(dist, threadId, msgId, text){
        return this.msgSender.send({
            distribution: dist,
            threadId: threadId,
            messageRef: msgId,
            html: `${ text }`,
            text: text,
        }).catch(err => console.log(err));
    }

    async sendActionMessage(dist, threadId, text, actions){
        return this.msgSender.send({
            distribution: dist,
            threadId: threadId,
            html: `${ text }`,
            text: text,
            actions
        }).catch(err => console.log(err));
    }

    async stop() {
        if (this.msgReceiver) {
            console.warn("Stopping message receiver");
            this.msgReceiver.close();
            this.msgReceiver = null;
        }
        await this.pgStore.shutdown();
    }

    async restart() {
        this.stop();
        await this.start();
    }

    async onKeyChange(ev) {
        console.warn("Auto-accepting new identity key for:", ev.addr);
        await ev.accept();
    }

    onError(e) {
        console.error('Message Error', e, e.stack);
    }

    fqTag(user) { 
        return `@${user.tag.slug}:${user.org.slug}`; 
    }

    fqName(user) {
        const fqInfo = [user.first_name, user.middle_name, user.last_name]; 
        return fqInfo.map(s => (s || '').trim()).filter(s => !!s).join(' '); 
    }

    fqLabel(user) { 
        return `${this.fqTag(user)} (${this.fqName(user)})`; 
    }
    
    forgetStaleNotificationThreads() {
        let tooOld = new Date();
        tooOld.setDate(tooOld.getDate() - 7);

        Object.keys(this.notificationThread).forEach(n => {
            if (this.notificationThread[n].flaggedEntry.received < tooOld) {
                delete this.notificationThread[n];
            }
        });
        console.log('stale notification threads removed. currently tracking:', Object.assign({}, this.notificationThread));
    }

    async incrementAuthFailCount() {
        let fails = await relay.storage.get('authentication', 'fails', {count: 0, since: new Date()});
        fails.count++;

        if (fails.count >= AUTH_FAIL_THRESHOLD) {
            await this.broadcastNotice({
                note: `SECURITY ALERT!\n\n${fails.count} failed login attempts (last successful login was ${moment(fails.since).fromNow()})`
            });
        }

        await relay.storage.set('authentication', 'fails', fails);
    }

    async resetAuthFailCount() {
        await relay.storage.set('authentication', 'fails', {count: 0, since: new Date()});
    }

    async getSoloAuthThreadId() {
        let id = await relay.storage.get('authentication', 'soloThreadId');
        if (!id) {
            id = uuid4();
            relay.storage.set('authentication', 'soloThreadId', id);
        }

        return id;
    }

    async getGroupAuthThreadId() {
        let id = await relay.storage.get('authentication', 'groupThreadId');
        if (!id) {
            id = uuid4();
            relay.storage.set('authentication', 'groupThreadId', id);
        }

        return id;
    }

    genAuthCode(expirationMinutes) {
        const code = `${words.adjective()} ${words.noun()}`;
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + expirationMinutes);
        return { code, expires };
    }

    removeExpiredAuthCodes(pending) {
        const now = new Date();

        Object.keys(pending).forEach(uid => {
            pending[uid].expires = new Date(pending[uid].expires);
            if (pending[uid].expires < now) {
                delete pending[uid];
            }
        });

        return pending;
    }

    async sendAuthCode(tag) {
        tag = (tag && tag[0] === '@') ? tag : '@' + tag;
        const resolved = await this.resolveTags(tag);
        if (resolved.userids.length === 1 && resolved.warnings.length === 0) {
            const uid = resolved.userids[0];
            const adminIds = await relay.storage.get('authentication', 'adminIds');
            if (!adminIds.includes(uid)) {
                throw { statusCode: 403, info: { tag: ['not an authorized user'] } }; 
            }

            const auth = this.genAuthCode(1);
            console.log(auth, resolved);
            this.msgSender.send({
                distribution: resolved,
                threadTitle: 'Message Bot Login',
                threadId: await this.getGroupAuthThreadId(),
                text: `codewords: ${auth.code}\n(valid for one minute)`
            });
            const pending = await relay.storage.get('authentication', 'pending', {});
            pending[uid] = auth;
            await relay.storage.set('authentication', 'pending', pending);
            
            return resolved.userids[0];
        } else {
            throw { statusCode: 400, info: { tag: ['not a recognized tag, please try again'] } }; 
        }
    }

    async validateAuthCode(userId, code) {
        console.log(userId, code);
        let pending = await relay.storage.get('authentication', 'pending', {});
        pending = this.removeExpiredAuthCodes(pending);
        const auth = pending[userId];
        if (!auth) {
            throw { statusCode: 403, info: { code: ['no authentication pending, please start over'] } }; 
        }
        if (auth.code != code) {
            this.incrementAuthFailCount();
            await relay.util.sleep(.5); // throttle guessers
            throw { statusCode: 403, info: { code: ['incorrect codewords, please try again'] } }; 
        }

        delete pending[userId];
        relay.storage.set('authentication', 'pending', pending);

        await this.broadcastNotice({note: 'LOGIN', actorUserId: userId, listAll: false});
        await this.resetAuthFailCount();
        return true;
    }

    async getAdministrators() {
        const adminIds = await relay.storage.get('authentication', 'adminIds', []);
        const adminUsers = await this.getUsers(adminIds);
        const admins = adminUsers.map(u => {
            return {
                id: u.id,
                label: this.fqLabel(u)
            };
        });
        return admins;
    }

    async broadcastNotice({note, actorUserId, listAll=true}) {
        const adminIds = await relay.storage.get('authentication', 'adminIds', []);
        let added = false;
        if (actorUserId && !adminIds.includes(actorUserId)) {
            adminIds.push(actorUserId);
            added = true;
        }
        const adminUsers = await this.getUsers(adminIds);
        const actor = adminUsers.find(u => u.id === actorUserId);
        const actorLabel = actor ? this.fqLabel(actor) : '<unknown>';
        const expression = adminUsers.map(u => this.fqTag(u)).join(' + ');
        const distribution = await this.resolveTags(expression);

        const adminList = adminUsers.filter(u => !(added && u.id === actorUserId)).map(u => this.fqLabel(u)).join('\n');

        let fullMessage = note;
        fullMessage += actorUserId ? `\n\nPerformed by ${actorLabel}` : '';
        fullMessage += listAll ? `\n\nCurrent authorized users:\n${adminList}` : '';
        fullMessage = fullMessage.replace(/<<([^>]*)>>/g, (_, id) => {
            const user = adminUsers.find(x => x.id === id);
            return this.fqLabel(user);
        });

        this.msgSender.send({
            distribution,
            threadTitle: 'Live Chat Alerts',
            threadId: await this.getSoloAuthThreadId(),
            text: fullMessage
        });
    }

    async addAdministrator({addTag, actorUserId}) {
        const tag = (addTag && addTag[0] === '@') ? addTag : '@' + addTag;
        const resolved = await this.resolveTags(tag);
        if (resolved.userids.length === 1 && resolved.warnings.length === 0) {
            const uid = resolved.userids[0];
            let newAdminUser = (await this.getUsers([uid]))[0];
            const adminIds = await relay.storage.get('authentication', 'adminIds');
            if (!adminIds.includes(uid)) {
                adminIds.push(uid);
                await relay.storage.set('authentication', 'adminIds', adminIds);
            }
            await this.broadcastNotice({note: `ADDED <<${uid}>> to authorized users`, actorUserId});
            return { id: uid, label: this.fqLabel(newAdminUser) };
        }
        throw { statusCode: 400, info: { tag: ['Not a recognized tag. Please try again!'] } }; 
    }

    async removeAdministrator({removeId, actorUserId}) {
        const adminIds = await relay.storage.get('authentication', 'adminIds', []);
        const idx = adminIds.indexOf(removeId);

        if (idx < 0) {
            throw { statusCode: 400, info: { id: ['Administrator id not found'] } };
        }
        let removingAdminUser = (await this.getUsers([adminIds[idx]]))[0];
        adminIds.splice(idx, 1);
        await this.broadcastNotice({note: `REMOVING <<${removeId}>> from authorized users`, actorUserId});
        await relay.storage.set('authentication', 'adminIds', adminIds);

        return { id: removingAdminUser.id, label: this.fqLabel(removingAdminUser) };
    }
}

module.exports = ForstaBot;