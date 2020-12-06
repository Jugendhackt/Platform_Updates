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

/**
 * Embed Integration
 * @param file the file of the frame
 * @param data simple string data in a object
 * @param custom function to be called while rendering
 */
export async function showIntegration(name, data, custom) {
    // Create div to store HTML in
    let container = document.createElement('div');
    container.classList.add('col-sm');
    let htmlFile = (await (await fetch("integrations/frames/" + name + ".html")).text());
    container.innerHTML = htmlFile;
    for (const stringName in data) {
        if (!data.hasOwnProperty(stringName)) continue;
        const string = data[stringName];
        let occurrences = container.getElementsByClassName(stringName);
        for (let element in occurrences) {
            if (!occurrences.hasOwnProperty(element)) continue;
            occurrences[element].innerHTML = string;
        }
    }
    if (custom) custom(container);
    document.getElementById('integrations').appendChild(container);
}
