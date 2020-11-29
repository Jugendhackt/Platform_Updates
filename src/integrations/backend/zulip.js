import {Integration} from "./integration.js";

export class Zulip extends Integration {

    login(loginData) {
        super.login(loginData);
        if (loginData) {
            if (loginData.site && loginData.username && loginData.password) {
                let req = new XMLHttpRequest();
                req.onloadend = () => {
                    let resp = JSON.parse(req.responseText);
                    if (resp.api_key) {
                        localStorage.setItem('int_zulip_token', resp.api_key);
                        localStorage.setItem('int_zulip_email', resp.email);
                        localStorage.setItem('int_zulip_site', loginData.site);
                        location.href = '/';
                    } else {
                        alert("Verbindung zu Zulip fehlgeschlagen!");
                    }
                }
                req.open('POST', loginData.site + '/api/v1/fetch_api_key')
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.send('username=' + loginData.username + '&password=' + loginData.password)
            } else if (loginData.site && loginData.email && loginData.token) {
                localStorage.setItem('int_zulip_token', loginData.token);
                localStorage.setItem('int_zulip_email', loginData.email);
                localStorage.setItem('int_zulip_site', loginData.site);
                this.getUnreadMessages().then(() => location.href = '/').catch(() => alert("Verbindung zu Zulip fehlgeschlagen!") && Zulip.logout())
            }
        }
    }

    static logout() {
        localStorage.removeItem('int_zulip_token');
        localStorage.removeItem('int_zulip_email');
        localStorage.removeItem('int_zulip_site');
    }

    getLoginData() {
        return {
            site: localStorage.getItem('int_zulip_site'),
            token: localStorage.getItem('int_zulip_token'),
            email: localStorage.getItem('int_zulip_email')
        }
    }

    isConnected() {
        return localStorage.getItem('int_zulip_site') && localStorage.getItem('int_zulip_token') && localStorage.getItem('int_zulip_email');
    }

    async getAllData() {
        let data = await this.getUnreadMessages();
        return {'unread': data};
    }

    getUnreadMessages() {
        return new Promise((resolve, reject) => {
            let loginData = this.getLoginData();
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                if (req.status !== 200) reject();
                let resp = JSON.parse(req.responseText);
                resolve(resp);
            }
            req.open('GET', loginData.site + '/api/v1/messages?anchor=first_unread&num_before=0&num_after=1000')
            req.setRequestHeader("Authorization", "Basic " + btoa(loginData.email + ':' + loginData.token))
            req.send()
        });
    }
}
