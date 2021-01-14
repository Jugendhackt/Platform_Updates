import { Moodle } from '../backend/moodle.js';
import { setUserIsLoggedIn,showIntegration } from "./common.js";

document.getElementById('addMoodleButton').onclick = () => Moodle.login();

if (Moodle.isConnected()) {
    setUserIsLoggedIn();
    Moodle.getAllLogins().forEach((id) => {
        let moodle = new Moodle(id);
        moodle.getAllData().then((data) => {
            showIntegration('Moodle',
                {
                    'moodle_siteName': data.name,
                    'moodle_firstName': data.firstName,
                    'moodle_unread': data.unread
                },
                (frame) => {
                    frame.getElementsByClassName('moodle_messages_link')[0].href = moodle.loginCredentials.site + '/message/index.php';
                    let events = data.timeline;
                    events.push(...data.calendar);
                    events.sort((a, b) => a.timestart - b.timestart);
                    events.push(...data.noDueDateAssignments);
                    for (let event in data.timeline) {
                        if (!data.timeline.hasOwnProperty(event)) continue;
                        event = data.timeline[event];
                        let rowElement = document.createElement('tr');
                        let courseElement = document.createElement('td');
                        if (event.course && event.course.shortname)
                            courseElement.innerText = event.course.shortname;
                        else if (event.courseid === 0 && event.userid)
                            courseElement.innerText = 'Nutzer';
                        let titleElement = document.createElement('td');
                        titleElement.innerText = event.name;
                        let timeElement = document.createElement('td');
                        if (event.timestart)
                            timeElement.innerText = new Date(event.timestart * 1000).toLocaleString();
                        else {
                            let timeLinkElement = document.createElement('a');
                            timeLinkElement.href = moodle.loginCredentials.site + '/mod/assign/view.php?id=' + event.cmid;
                            timeLinkElement.target = '_blank';
                            timeLinkElement.innerText = "K/A";
                            timeElement.appendChild(timeLinkElement);
                        }
                        rowElement.appendChild(courseElement);
                        rowElement.appendChild(titleElement);
                        rowElement.appendChild(timeElement);
                        frame.getElementsByClassName('moodle_abgaben')[0].appendChild(rowElement);
                    }
                    data.news.sort((a,b) => a.timemodified - b.timemodified);
                    for (let forum in data.news) {
                        if (!data.news.hasOwnProperty(forum)) continue;
                        forum = data.news[forum];
                        for (let forumPost in forum) {
                            if (!forum.hasOwnProperty(forumPost)) continue;
                            forumPost = forum[forumPost];
                            let element = document.createElement('div');
                            element.classList.add('card')
                            let body = document.createElement('div');
                            body.innerHTML = forumPost.message;
                            let showMore = document.createElement('i');
                            showMore.innerText = "Klicken um mehr anzuzeigen.";
                            console.log(forumPost);
                            body.hidden = true;
                            element.innerHTML = '<h6>' + (new Date(forumPost.timemodified * 1000)).toLocaleString() + ': <b>' + forumPost.subject + '</b> <i>(' + forumPost.userfullname + ')</i> </h6></div>';
                            element.appendChild(body);
                            element.appendChild(showMore);
                            element.onclick = () => { body.hidden = !body.hidden; showMore.hidden = !body.hidden};
                            element.style.marginBottom = '5px';
                            frame.getElementsByClassName('moodle_news')[0].appendChild(element);
                        }
                    }
                    data.newFiles.sort((a, b) => a.lastModified - b.lastModified);
                    for (let file in data.newFiles) {
                        if (!data.newFiles.hasOwnProperty(file)) continue;
                        file = data.newFiles[file];
                        let element = document.createElement('li');
                        let link = document.createElement('a');
                        link.href = file['url'];
                        link.innerText = file['name'];
                        element.appendChild(link);
                        element.innerHTML = element.innerHTML + ' <i>(' + file['courseName'] + ')</i>'
                        frame.getElementsByClassName('moodle_course_files')[0].appendChild(element);
                    }
                });
        }).catch((reason => {
            if (reason === 'invalidtoken') alert("Dein Moodle Token ist ausgelaufen. Bitte logge dich erneut ein.")
            else alert(reason);
        }))
    })
}
