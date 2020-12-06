import { Moodle } from '../backend/moodle.js';
import { setUserIsLoggedIn } from "./common.js";

let moodle = new Moodle();
document.getElementById('addMoodleButton').onclick = () => moodle.login();

if (moodle.isConnected()) {
    document.getElementById('addMoodleButton').classList.add('disabled');
    setUserIsLoggedIn();
    $("#moodleFrame").load("integrations/frames/Moodle.html");
    moodle.getAllData().then((data) => {
        $(".moodle_siteName").text(data.name);
        $(".moodle_firstName").text(data.firstName);
        $(".moodle_unread").text(data.unread);
        document.getElementById('moodle_messages_link').href = moodle.getLoginData().site + '/message/index.php';
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
            document.getElementById('moodle_abgaben').appendChild(rowElement);
        }
        for (let forum in data.news) {
            if (!data.news.hasOwnProperty(forum)) continue;
            forum = data.news[forum];
            for (let forumPost in forum) {
                if (!forum.hasOwnProperty(forumPost)) continue;
                forumPost = forum[forumPost];
                let element = document.createElement('div');
                element.innerHTML = '<h6>' + forumPost.userfullname + ' <i>(' + forumPost.subject + ")</i> </h6>" + forumPost.message;
                document.getElementById('moodle_news').appendChild(element);
            }
        }
        document.getElementById('moodleFrame').hidden = false
    });
}
