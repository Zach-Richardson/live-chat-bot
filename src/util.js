import md5 from "md5";
import request from "request-promise";
import shared from "./globalState";

class RequestError extends Error {
  constructor(message, code, resp) {
    super(message);
    this.name = "RequestError";
    this.code = code;
    this.response = resp;
  }
}

function mergeErrors(errObj) {
  // scoop up all form/response error messages no matter the field(s) as a single string...
  return Object.values(errObj)
    .map(x => (Array.isArray(x) ? x.join("; ") : x))
    .join("; ");
}

async function _fetch(
  url,
  { method = "get", headers = {}, body = {} } = {},
  noBodyAwaits
) {
  const token = shared.state.apiToken;
  const _headers = Object.assign(
    {
      Accept: "application/json, text/plain */*",
      "Content-Type": "application/json"
    },
    token ? { Authorization: "JWT " + token } : {},
    headers
  );
  const _body = JSON.stringify(body);
  const parms = Object.assign(
    {
      method,
      headers: _headers
    },
    method.toLowerCase() === "get" ? {} : { body: _body }
  );

  // console.log('about to do a fetch with url', url, 'and parms', parms);
  const resp = await fetch(url, parms);
  if (noBodyAwaits) return resp;

  if ((resp.headers.get("content-type") || "").startsWith("application/json")) {
    const text = await resp.text();
    resp.theJson = JSON.parse(text.trim() || "{}");
  }
  if (resp.status === 401) {
    console.log("401 from bot api, so we will visit bot authentication...");
    this.$router.push({
      name: "loginTag",
      query: { forwardTo: this.$route.fullPath }
    });
    // throw Error('not authenticated with bot server -- looping through authentication');
  }
  return resp;
}

const themeColors = {
  red: "#db2828",
  deep_red: "#851313",
  orange: "#fa7d20",
  yellow: "#fbbd08",
  olive: "#b5cc18",
  green: "#21ba45",
  light_green: "#6dcb84",
  dark_green: "#284d14",
  teal: "#00b5ad",
  blue: "#2185d0",
  light_blue: "#4b84bc",
  dark_blue: "#074483",
  violet: "#6435c9",
  pink: "#e03997",
  brown: "#a5673f",
  grey: "#767676",
  black: "#3a3b3d"
};

function getThemeColorFromHash(text) {
  const intHash = parseInt(md5(text).substr(0, 10), 16);
  const label = Object.keys(themeColors)[
    intHash % Object.keys(themeColors).length
  ];
  return themeColors[label];
}

function textAvatarURL(text, size) {
  const bgColor = getThemeColorFromHash(text);
  const pixelSize = Number(size);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}">`,
    `<defs>`,
    `<style type="text/css">`,
    `@import url(https://fonts.googleapis.com/css?family=Poppins);`,
    `@font-face {`,
    `font-family:Poppins;`,
    `}`,
    `</style>`,
    `</defs>`,
    `<circle cx="${pixelSize / 2}" cy="${pixelSize / 2}" r="${pixelSize /
      2}" fill="${bgColor}"/>`,
    `<text text-anchor="middle" fill="white" font-size="${pixelSize /
      2}" x="${pixelSize / 2}" y="${pixelSize / 2}" `,
    `font-family="Poppins" dominant-baseline="central">`,
    text,
    "</text>",
    "</svg>"
  ];
  return URL.createObjectURL(new Blob(svg, { type: "image/svg+xml" }));
}

let _defaultGravatar = null;
async function getAvatarURL(userData, size) {
  const gravatarURL = `https://www.gravatar.com/avatar/${
    userData.gravatarHash
  }`;
  let gravatar = await request(gravatarURL);
  _defaultGravatar =
    _defaultGravatar ||
    (await request("https://www.gravatar.com/avatar/a?f=y"));
  if (md5(gravatar) == md5(_defaultGravatar)) {
    const userFL = userData.name.split(" ");
    const initials =
      userFL[0].charAt(0).toUpperCase() + userFL[1].charAt(0).toUpperCase();
    return textAvatarURL(initials, size);
  } else {
    return gravatarURL + `?s=${size}`;
  }
}

export default {
  mergeErrors,
  RequestError,
  fetch: _fetch,
  getAvatarURL,
  getThemeColorFromHash
};
