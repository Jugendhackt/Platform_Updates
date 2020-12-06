import { Moodle } from '../backend/moodle.js';
import { setUserIsLoggedIn,showIntegration } from "./common.js";

let moodle = new Moodle();
document.getElementById('addMoodleButton').onclick = () => moodle.login();

if (moodle.isConnected()) {
    document.getElementById('addMoodleButton').classList.add('disabled');
    setUserIsLoggedIn();
    moodle.getAllData().then((data) => {
        showIntegration('Moodle',
            {
                'moodle_siteName': data.name,
                'moodle_firstName': data.firstName,
                'moodle_unread': data.unread
            },
            (frame) => {
                frame.getElementsByClassName('moodle_messages_link')[0].href = moodle.getLoginData().site + '/message/index.php';
                for (let event in data.timeline) {
                    if (!data.timeline.hasOwnProperty(event)) continue;
                    event = data.timeline[event];
                    let rowElement = document.createElement('tr');
                    let titleElement = document.createElement('td');
                    titleElement.innerText = event.name;
                    let timeElement = document.createElement('td');
                    timeElement.innerText = new Date(event.timestart * 1000).toLocaleString();
                    rowElement.appendChild(titleElement);
                    rowElement.appendChild(timeElement);
                    frame.getElementsByClassName('moodle_abgaben')[0].appendChild(rowElement);
                }
                for (let forum in data.news) {
                    if (!data.news.hasOwnProperty(forum)) continue;
                    forum = data.news[forum];
                    for (let forumPost in forum) {
                        if (!forum.hasOwnProperty(forumPost)) continue;
                        forumPost = forum[forumPost];
                        let element = document.createElement('div');
                        element.innerHTML = '<h6>' + forumPost.userfullname + ' <i>(' + forumPost.subject + ")</i> </h6>" + forumPost.message;
                        frame.getElementsByClassName('moodle_news')[0].appendChild(element);
                    }
                }
            });
    });
}
