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
                        alert("Verbindung zu Moodle fehlgeschlagen!");
                    }
                }
                req.open('POST', loginData.site + '/api/v1/fetch_api_key')
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.send('username=' + loginData.username + '&password=' + loginData.password)
            } else if (loginData.site && loginData.email && loginData.token) {
                localStorage.setItem('int_zulip_token', loginData.token);
                localStorage.setItem('int_zulip_email', loginData.email);
                localStorage.setItem('int_zulip_site', loginData.site);
                location.href = '/';
            }
        }
    }

    isConnected() {
        return localStorage.getItem('int_zulip_site') && localStorage.getItem('int_zulip_token') && localStorage.getItem('int_zulip_email');
    }
}
