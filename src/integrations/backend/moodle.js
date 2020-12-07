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
        let [news, unread, timeline] = await Promise.all([this.getNewForumMessages(), this.getUnreadNotifications(siteData.userid), this.getTimelineData()]);
        return {name: siteData.sitename, firstName: siteData.firstname, 'unread': unread, 'timeline': timeline, 'news': news}
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

}
