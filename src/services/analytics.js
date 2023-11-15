import axios from 'axios';
import { v4 } from 'uuid';

const baseUrl = 'https://analytics.clouthub.com/t';
const tid = 'UA-223411442-1';
const platformId = 'desktop-web';
const screenResolution = `${screen.width}x${screen.height}`;
const viewportSize = `${window.innerWidth}x${window.innerHeight}`;
const hostname = 'https://app.clouthub.com';

let cid = localStorage.cid;
if (!cid) {
  localStorage.cid = cid = v4();
}

async function trackEvent(action, label, value) {
  await axios.post(baseUrl, {
    v: 1,
    tid,
    cid,
    an: platformId,
    ul: navigator.language,
    sr: screenResolution,
    t: 'event',
    ec: platformId,
    ea: action,
    el: label,
    ev: value,
  });
}

export default {
  trackEvent,
}
