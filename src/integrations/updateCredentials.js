import {Moodle} from "./backend/moodle.js";
import {Zulip} from "./backend/zulip.js";

/**
 * This script transforms old saved credentials into the new way.
 */


if (localStorage.getItem('int_moodle_site')) {
    Moodle.addLoginCredentials({
        token: localStorage.getItem('int_moodle_token'),
        site: localStorage.getItem('int_moodle_site')
    }, 'old credentials') // We do not know the username here
    localStorage.removeItem('int_moodle_site');
    localStorage.removeItem('int_moodle_token');
}

if (localStorage.getItem('int_zulip_site')) {
    Zulip.addLoginCredentials({
        token: localStorage.getItem('int_zulip_token'),
        site: localStorage.getItem('int_zulip_site'),
        email: localStorage.getItem('int_zulip_email')
    }, localStorage.getItem('int_zulip_email') + ' @ ' + localStorage.getItem('int_zulip_site'))
    localStorage.removeItem('int_zulip_token');
    localStorage.removeItem('int_zulip_site');
    localStorage.removeItem('int_zulip_email');
}
