import {Integration} from "./integration.js";

export class Zulip extends Integration {

    static login(loginData) {
        super.login(loginData);
        if (loginData) {
            if (loginData.site && loginData.username && loginData.password) {
                let req = new XMLHttpRequest();
                req.onloadend = () => {
                    let resp = JSON.parse(req.responseText);
                    if (resp.api_key) {
                        Zulip.addLoginCredentials({
                            'token': resp.api_key,
                            'email': resp.email,
                            'site': loginData.site
                        }, resp.email + ' @ ' + loginData.site)
                        location.href = '/';
                    } else {
                        alert("Verbindung zu Zulip fehlgeschlagen!");
                    }
                }
                req.open('POST', loginData.site + '/api/v1/fetch_api_key')
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.send('username=' + loginData.username + '&password=' + loginData.password)
            } else if (loginData.site && loginData.email && loginData.token) {
                let id = loginData.email + ' @ ' + loginData.site;
                Zulip.addLoginCredentials({
                    'token': loginData.token,
                    'email': loginData.email,
                    'site': loginData.site
                }, id);
                let zulip = new Zulip(id);
                zulip.getUnreadMessages().then(() => location.href = '/').catch(() => alert("Verbindung zu Zulip fehlgeschlagen!") && zulip.logout())
            }
        }
    }

    async getAllData() {
        let data = await this.getUnreadMessages();
        return {'unread': data};
    }

    getUnreadMessages() {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onloadend = () => {
                if (req.status !== 200) reject();
                let resp = JSON.parse(req.responseText);
                let unreadMessages = [];
                for (let message in resp.messages) {
                    if (!resp.messages.hasOwnProperty(message)) continue;
                    message = resp.messages[message];
                    if (!message.flags || !message.flags.includes("read")) unreadMessages.push(message);
                }
                resolve(unreadMessages);
            }
            req.open('GET', this.loginCredentials.site + '/api/v1/messages?anchor=first_unread&num_before=0&num_after=1000')
            req.setRequestHeader("Authorization", "Basic " + btoa(this.loginCredentials.email + ':' + this.loginCredentials.token))
            req.send()
        });
    }
}
