import {Integration} from "./integration.js";

export class Moodle extends Integration {

    static login(loginData) {
        super.login(loginData);
        if (loginData) {
            if (loginData.username && loginData.password && loginData.site) {
                let req = new XMLHttpRequest();
                req.onloadend = () => {
                    let resp = JSON.parse(req.responseText);
                    if (resp.token) {
                        Moodle.addLoginCredentials({
                            'token': resp.token,
                            'site': loginData.site,
                        }, loginData.username + ' @ ' + loginData.site);
                        location.href = '/';
                    } else {
                        alert("Verbindung zu Moodle fehlgeschlagen! Bitte überprüfe Nutzername und Passwort");
                    }
                }
                req.onerror = () => {
                    alert("Verbindung zu Moodle fehlgeschlagen! Bitte überprüfe einmal die Adresse.")
                }
                req.open('POST', loginData.site + '/login/token.php?service=moodle_mobile_app')
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.send('username=' + loginData.username + '&password=' + loginData.password)
            }
        }
    }

    async getAllData() {
        let siteData = await this.getSiteInfo();
        // all fails if a single Promise fails. We do accept that here because, it would fail in template generation either way.
        let [news, unread, timeline, newFiles, noDueAssigns] = await Promise.all([this.getNewForumMessages(), this.getUnreadNotifications(siteData.userid), this.getTimelineData(), this.getNewFilesForAllCourses(), this.getLastWeeksNoDueDateAssignments()]);
        return {name: siteData.sitename, firstName: siteData.firstname, 'unread': unread, 'timeline': timeline, 'news': news, 'newFiles': newFiles, 'noDueDateAssignments': noDueAssigns}
    }

    async getTimelineData() {
        return new Promise((resolve, reject) => {
            let startTime = Math.floor(Date.now() / 1000) - (60*60*24);
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                let resp = JSON.parse(req.responseText);
                if (resp.error) reject();
                resolve(resp.events);
            }
            req.open('GET', this.loginCredentials.site + '/webservice/rest/server.php?wstoken=' + this.loginCredentials.token + '&wsfunction=core_calendar_get_action_events_by_timesort&moodlewsrestformat=json&timesortfrom=' + startTime)
            req.send()
        });
    }

    async getSiteInfo() {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                resolve(JSON.parse(req.responseText));
            }
            req.open('GET', this.loginCredentials.site + '/webservice/rest/server.php?wstoken=' + this.loginCredentials.token + '&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json')
            req.send()
        });
    }

    async getUnreadNotifications(userid) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                resolve(req.responseText);
            }
            req.open('GET', this.loginCredentials.site + '/webservice/rest/server.php?wstoken=' + this.loginCredentials.token + '&wsfunction=core_message_get_unread_conversations_count&moodlewsrestformat=json&useridto=' + userid)
            req.send()
        });
    }

    getNewForumMessages() {
        return new Promise(async (resolve, reject) => {
            let firstWrittenTime = Math.floor(Date.now() / 1000) - (60*60*24*3);
            let forums = await this.getForums();
            let i = 0;
            let data = [];
            forums.forEach((forum) => {
                if (forum.numdiscussions === 0) {
                    i++;
                    if (i === forums.length) resolve(data);
                    return;
                }
                let req = new XMLHttpRequest();
                req.onloadend = () => {
                    let forumData = JSON.parse(req.responseText).discussions;
                    forumData = forumData.filter(data => data.modified > firstWrittenTime)
                    data[forum.id] = forumData;
                    i++;
                    if (i === forums.length) resolve(data);
                }
                req.open('GET', this.loginCredentials.site + '/webservice/rest/server.php?wstoken=' + this.loginCredentials.token + '&wsfunction=mod_forum_get_forum_discussions&moodlewsrestformat=json&forumid=' + forum.id)
                req.send()
            });

        });
    }

    getForums() {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                resolve(JSON.parse(req.responseText));
            }
            req.open('GET', this.loginCredentials.site + '/webservice/rest/server.php?wstoken=' + this.loginCredentials.token + '&wsfunction=mod_forum_get_forums_by_courses&moodlewsrestformat=json')
            req.send()
        });
    }

    getCurrentCourses() {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                resolve(JSON.parse(req.responseText)['courses'])
            }
            req.open('GET', this.loginCredentials.site + '/webservice/rest/server.php?wstoken=' + this.loginCredentials.token +
                '&wsfunction=core_course_get_enrolled_courses_by_timeline_classification&moodlewsrestformat=json&classification=inprogress')
            req.send()
        });
    }

    getNewFilesForAllCourses(){
        return new Promise((async (resolve, reject) => {
            let courses = await this.getCurrentCourses();
            let i = 0;
            let data = [];
            courses.forEach((course) => {
                this.getNewFilesInCourse(course['id'], course['shortname']).then((cData) => {
                    data.push(...cData);
                    i++;
                    if (i === courses.length) resolve(data);
                })
            });
        }));
    }

    /**
     * Get new files for a specific course
     * @param id of the course to get files
     * @param courseName name to label the course for frontend
     */
    getNewFilesInCourse(id, courseName) {
        let firstFileAddedTime = Math.floor(Date.now() / 1000) - (60*60*24*5);
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                let changed = []
                let response = JSON.parse(req.responseText);
                for (let category in response) {
                    if (!response.hasOwnProperty(category)) continue;
                    category = response[category];
                    for (let module in category['modules']) {
                        if (!category['modules'].hasOwnProperty(module)) continue;
                        module = category['modules'][module];
                        if ('contentsinfo' in module) {
                            if (module['contentsinfo']['lastmodified'] > firstFileAddedTime) {
                                changed.push({
                                    name: module['name'],
                                    lastModified: module['contentsinfo']['lastmodified'],
                                    url: module['url'],
                                    courseName: courseName
                                });
                            }
                        }
                    }
                }
                resolve(changed)
            }
            req.open('GET', this.loginCredentials.site + '/webservice/rest/server.php?wstoken=' + this.loginCredentials.token +
                '&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=' + id)
            req.send()
        });
    }

    getLastWeeksNoDueDateAssignments() {
        let firstCreatedTime = Math.floor(Date.now() / 1000) - (60*60*24*14);
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                let assignments = []
                let response = JSON.parse(req.responseText)['courses'];
                for (let course in response) {
                    if (!response.hasOwnProperty(course)) continue;
                    for (let assignment in response[course]['assignments']) {
                        if (!response[course]['assignments'].hasOwnProperty(assignment)) continue;
                        assignment = response[course]['assignments'][assignment];
                        if (assignment['duedate'] === 0 && assignment['timemodified'] > firstCreatedTime)
                            assignments.push(assignment);
                    }

                }
                resolve(assignments)
            }
            req.open('GET', this.loginCredentials.site + '/webservice/rest/server.php?wstoken=' + this.loginCredentials.token +
                '&wsfunction=mod_assign_get_assignments&moodlewsrestformat=json')
            req.send()
        });
    }

}
