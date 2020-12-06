import { Zulip } from '../backend/zulip.js';
import { setUserIsLoggedIn, showIntegration } from "./common.js";

document.getElementById('addZulipButton').onclick = () => Zulip.login();

if (Zulip.isConnected()) {
    let zulip = new Zulip();
    document.getElementById('addZulipButton').classList.add('disabled');
    setUserIsLoggedIn();
    zulip.getAllData().then((data) => {
        let siteURL = zulip.getLoginData().site;
        showIntegration('Zulip', {
            'zulip_url': siteURL.replace('http://', '').replace('https://', ''),
            'zulip_email': zulip.getLoginData().email,
            'zulip_unread_count': data.unread.length
        }, (frame) => {
            frame.getElementsByClassName('zulip_messages_link')[0].href = siteURL;
            for (let message in data.unread) {
                if (!data.unread.hasOwnProperty(message)) continue;
                message = data.unread[message];
                let messageElement = document.createElement('li');
                message.content = message.content.replace('href="/user', 'href="' + siteURL + '/user')
                message.content = message.content.replace('src="/user', 'src="' + siteURL + '/user')
                let recipent = typeof message.display_recipient === 'string' ? message.display_recipient + ' (' + message.subject + ')' : message.display_recipient[0]['full_name'];
                messageElement.innerHTML = '<b>' + message.sender_full_name + ' -> ' + recipent + ':</b> ' + message.content;
                frame.getElementsByClassName('zulip_messages')[0].appendChild(messageElement);
            }
        });

    })
}
