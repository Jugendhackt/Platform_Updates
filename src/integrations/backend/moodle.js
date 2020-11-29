import {Integration} from "./integration.js";

export class Moodle extends Integration {

    login(loginData) {
        super.login(loginData);
        if (loginData) {
            if (loginData.username && loginData.password && loginData.site) {
                let req = new XMLHttpRequest();
                req.onloadend = () => {
                    let resp = JSON.parse(req.responseText);
                    if (resp.token) {
                        localStorage.setItem('int_moodle_token', resp.token);
                        localStorage.setItem('int_moodle_site', loginData.site);
                        location.href = '/';
                    } else {
                        alert("Verbindung zu Moodle fehlgeschlagen!");
                    }
                }
                req.open('POST', loginData.site + '/login/token.php?service=moodle_mobile_app')
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.send('username=' + loginData.username + '&password=' + loginData.password)
            }
        }
    }

    static logout() {
        localStorage.removeItem('int_moodle_token');
        localStorage.removeItem('int_moodle_site');
    }

    getLoginData() {
        return {
            site: localStorage.getItem('int_moodle_site'),
            token: localStorage.getItem('int_moodle_token')
        }
    }

    async getAllData() {
        let siteData = await this.getSiteInfo();
        let unread = await this.getUnreadNotifications(siteData.userid);
        let timeline = await this.getTimelineData();
        return {name: siteData.sitename, firstName: siteData.firstname, 'unread': unread, 'timeline': timeline}
    }

    async getTimelineData() {
        return new Promise((resolve, reject) => {
            let loginData = this.getLoginData();
            let startTime = Math.floor(Date.now() / 1000) - (60*60*24);
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                let resp = JSON.parse(req.responseText);
                if (resp.error) reject();
                resolve(resp.events);
            }
            req.open('GET', loginData.site + '/webservice/rest/server.php?wstoken=' + loginData.token + '&wsfunction=core_calendar_get_action_events_by_timesort&moodlewsrestformat=json&timesortfrom=' + startTime)
            req.send()
        });
    }

    async getSiteInfo() {
        return new Promise((resolve, reject) => {
            let loginData = this.getLoginData();
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                resolve(JSON.parse(req.responseText));
            }
            req.open('GET', loginData.site + '/webservice/rest/server.php?wstoken=' + loginData.token + '&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json')
            req.send()
        });
    }

    async getUnreadNotifications(userid) {
        return new Promise((resolve, reject) => {
            let loginData = this.getLoginData();
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                resolve(req.responseText);
            }
            req.open('GET', loginData.site + '/webservice/rest/server.php?wstoken=' + loginData.token + '&wsfunction=core_message_get_unread_conversations_count&moodlewsrestformat=json&useridto=' + userid)
            req.send()
        });
    }

    isConnected() {
        return localStorage.getItem('int_moodle_token') && localStorage.getItem('int_moodle_site');
    }

}
