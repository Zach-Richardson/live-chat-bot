const md5 = require('md5');
let request = require('request-promise');
let shared = require('./globalState');

function addFormErrors(formClass, errors) {
    const $f = $('form.ui.form.' + formClass);
    $f.form('add errors', errors);
    $f.find('div.error.message').addClass('visible'); // seriously, semantic?
    Object.keys(errors).forEach(key => $f.form('add prompt', key));
}


class RequestError extends Error {
    constructor(message, code, resp) {
        super(message);
        this.name = 'RequestError';
        this.code = code;
        this.response = resp;
    }
}

function mergeErrors(errObj) {
    // scoop up all form/response error messages no matter the field(s) as a single string...
    return Object.values(errObj).map(x => Array.isArray(x) ? x.join('; ') : x).join('; ');
}

async function _fetch(url, { method='get', headers={}, body={} }={}, noBodyAwaits) {
    const token = shared.state.apiToken;
    const _headers = Object.assign({
        'Accept': 'application/json, text/plain */*',
        'Content-Type': 'application/json'
    }, token ? { 'Authorization': 'JWT ' + token } : {}, headers);
    const _body = JSON.stringify(body);
    const parms = Object.assign({
        method,
        headers: _headers,
    }, method.toLowerCase() === 'get' ? {} : { body: _body });

    // console.log('about to do a fetch with url', url, 'and parms', parms);
    const resp = await fetch(url, parms);
    if (noBodyAwaits) return resp;

    if ((resp.headers.get('content-type') || '').startsWith('application/json')) {
        const text = await resp.text();
        resp.theJson = JSON.parse(text.trim() || '{}');
    }
    if (resp.status === 401) {
        console.log('401 from bot api, so we will visit bot authentication...');
        this.$router.push({ name: 'loginTag', query: { forwardTo: this.$route.fullPath }});
        // throw Error('not authenticated with bot server -- looping through authentication');
    }
    return resp;
}

// function versionedURL(url) {
//     url = url.trim();
//     url += ((url.match(/\?/)) ? '&' : '?');
//     url += 'v=' + F.env.GIT_COMMIT.substring(0, 8);
//     return urlurn.replace(/^\//, '');
// };

// const fetchStatic = cache.ttl(86400 * 30, async function util_fetchStatic(urn, options) {
//     const resp = await fetch('http://localhost:4096/' + versionedURL(urn), options);
//     if (!resp.ok) {
//         throw new TypeError("Invalid fetch status: " + resp.status);
//     }
//     /* Return a Response-like object that can be stored in indexeddb */
//     return {
//         type: resp.headers.get('content-type'),
//         status: resp.status,
//         arrayBuffer: await resp.arrayBuffer()
//     };
// }, {store: 'shared_db'});

// async function fetchStaticBlob(urn, options) {
//     const respLike = await fetchStatic(urn, options);
//     return new Blob([respLike.arrayBuffer], {type: respLike.type});
// };

// const themeColors = {
//     red: '#db2828',
//     deep_red: '#851313',
//     orange: '#fa7d20',
//     yellow: '#fbbd08',
//     olive: '#b5cc18',
//     green: '#21ba45',
//     light_green: '#6dcb84',
//     dark_green: '#284d14',
//     teal: '#00b5ad',
//     blue: '#2185d0',
//     light_blue: '#4b84bc',
//     dark_blue: '#074483',
//     violet: '#6435c9',
//     pink: '#e03997',
//     brown: '#a5673f',
//     grey: '#767676',
//     black: '#3a3b3d'
// };


// function pickColor(hashable) {
//     const intHash = parseInt(md5(hashable).substr(0, 10), 16);
//     const label = Object.keys(themeColors)[intHash % themeColors.length];
//     return themeColors[label];
// }

const avatarDIPSizes = {
    small: 24,   // Based on group nav avatar
    medium: 48,  // Based on single nav avatar
    large: 256   // Based on modal user card avatar
};

function getAvatarPixels(size="medium") {
    let pixels;
    if (typeof size === 'string') {
        pixels = avatarDIPSizes[size];
        console.assert(pixels);
    } else {
        console.assert(typeof size === 'number');
        pixels = size;
    }
    return Math.round(pixels * (self.devicePixelRatio || 1));
}

// async function blobToDataURL(blob) {
//     return await new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.addEventListener('load', () => resolve(reader.result));
//         reader.addEventListener('error', reject);
//         reader.readAsDataURL(blob);
//     });
// };

function textAvatarURL(text, size) {
    //let bgColor = pickColor(text);
    let bgColor ="#b5cc18";
    // const fontBlob = await fetchStaticBlob('fonts/Poppins-Medium.ttf');
    // const fontURL = await ns.blobToDataURL(fontBlob);
    const fontURL = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.ttf";
    const pixelSize = getAvatarPixels(size);
    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}">`,
            `<defs>`,
                `<style type="text/css">`,
                    `@font-face {`,
                        `font-family: 'ForstaAvatar';`,
                        `src: url(${fontURL}) format('truetype');`,
                    `}`,
                `</style>`,
            `</defs>`,
            `<circle cx="${pixelSize/2}" cy="${pixelSize/2}" r="${pixelSize/2}" fill="${bgColor}"/>`,
            `<text text-anchor="middle" fill="white" font-size="${pixelSize / 2}" x="${pixelSize / 2}" y="${pixelSize / 2}" `,
                `font-family="ForstaAvatar" dominant-baseline="central">`,
                text,
            '</text>',
        '</svg>'
    ];
    return URL.createObjectURL(new Blob(svg, {type: 'image/svg+xml'}));
}


async function getAvatarURL(userData){
    const gravatarURL = `https://www.gravatar.com/avatar/${userData.gravatarHash}`;
    let gravatar = await request(gravatarURL);
    let defaultGravatar = await request('https://www.gravatar.com/avatar/a?f=y');
    if(md5(gravatar)==md5(defaultGravatar)){
        return (await textAvatarURL(userData.name, 'medium'));
    }else{
        return gravatarURL;
    }
}

module.exports = {
    addFormErrors,
    mergeErrors,
    RequestError,
    fetch: _fetch,
    getAvatarURL
};
