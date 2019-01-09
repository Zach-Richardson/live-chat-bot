var jwtDecode = require('jwt-decode');

var state = {
    onboardStatus: undefined,
    passwordSet: undefined,
    myId: undefined,
    get avatarURLs() {
        return JSON.parse(localStorage.getItem('avatarURLs')) || {};
    },
    set avatarURLs(value) {
        if (value) localStorage.setItem('avatarURLs', JSON.stringify(value));
        else localStorage.removeItem('avatarURLs');
    },
    get selectedThread() {
        return JSON.parse(localStorage.getItem('selectedThread')) || null;
    },
    set selectedThread(value) {
        if (value) localStorage.setItem('selectedThread', JSON.stringify(value));
        else localStorage.removeItem('selectedThread');
    },
    get archive() {
        return JSON.parse(localStorage.getItem('archive')) || [];
    },
    set archive(value) {
        if (value) localStorage.setItem('archive', JSON.stringify(value));
        else localStorage.removeItem('archive');
    },
    get threads() {
        return JSON.parse(localStorage.getItem('threads')) || [];
    },
    set threads(value) {
        if (value) localStorage.setItem('threads', JSON.stringify(value));
        else localStorage.removeItem('threads');
    },
    get ourName() {
        return localStorage.getItem('ourName') || '';
    },
    set ourName(value) {
        if (value) localStorage.setItem('ourName', value);
        else localStorage.removeItem('ourName');
    },
    get gravatarHash() {
        return localStorage.getItem('gravatarHash') || '';
    },
    set gravatarHash(value) {
        if (value) localStorage.setItem('gravatarHash', value);
        else localStorage.removeItem('gravatarHash');
    },
    get avatarURL() {
        return localStorage.getItem('avatarURL') || '';
    },
    set avatarURL(value) {
        if (value) localStorage.setItem('avatarURL', value);
        else localStorage.removeItem('avatarURL');
    },
    get userId() {
        return localStorage.getItem('userId') || '';
    },
    set userId(value) {
        if (value) localStorage.setItem('userId', value);
        else localStorage.removeItem('userId');
    },
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
    state
};