var jwtDecode = require('jwt-decode');
var librelay = require('librelay');

let relay = {
    messageSender: undefined,
    messageReciever: undefined,
    init: async function() {
        this.msgReceiver = await librelay.MessageReceiver.factory();
        this.msgReceiver.addEventListener('message', this.onMessage);
        await this.msgReceiver.connect();

        this.messageSender = await librelay.MessageSender.factory();
        console.log('should be initialized now . . . . ');
    },
    onMessage: async function(ev) {
        const message = ev.data;
        console.log('got message:' + message);
    },
    sendMessage: async function(dist, threadId, text){
        return this.messageSender.send({
            distribution: dist,
            threadId: threadId,
            html: `${ text }`,
            text: text
        });
    }
};

var state = {
    onboardStatus: undefined,
    passwordSet: undefined,
    userId: undefined,
    get loginTag() {
        return localStorage.getItem('loginTag') || '';
    },
    set loginTag(value) {
        if (value) localStorage.setItem('loginTag', value);
        else localStorage.removeItem('loginTag');
    },
    get apiToken() {
        const retval = localStorage.getItem('apiToken') || '';
        if (retval != this.prev) autoexpire(retval);
        this.prev = retval;
        return retval;
    },
    set apiToken(value) {
        if (value) localStorage.setItem('apiToken', value);
        else localStorage.removeItem('apiToken');
    }
};

function autoexpire(token) {
    if (this.timer) {
        clearTimeout(this.timer);
    }

    if (token) {
        const decoded = jwtDecode(token);
        const expires = new Date(decoded.exp * 1000);
        const now = new Date();

        this.timer = (setTimeout(() => {
            this.timer = null;
            console.log('apiToken expired');
            state.apiToken = null;
        }, expires - now));
    }
}

module.exports = { 
    state,
    relay
};