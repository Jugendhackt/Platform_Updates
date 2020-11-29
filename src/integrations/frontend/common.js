import {Moodle} from "../backend/moodle.js";
import {Zulip} from "../backend/zulip.js";

document.getElementById('logoutButton').onclick = () => {
    Moodle.logout();
    Zulip.logout();
    location.reload();
}


export function setUserIsLoggedIn() {
    document.getElementById('logoutButton').hidden = false;
    document.getElementById('welcomeText').hidden = true;
    document.getElementById('loggedInHeading').hidden = false;
}
