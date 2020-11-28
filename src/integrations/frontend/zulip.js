import { Zulip } from '../backend/zulip.js';
let zulip = new Zulip();
document.getElementById('addZulipButton').onclick = () => zulip.login();

if (zulip.isConnected()) {
    document.getElementById('addZulipButton').hidden = true; //TODO disable instead of hide
}
