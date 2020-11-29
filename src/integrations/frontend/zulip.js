import { Zulip } from '../backend/zulip.js';
let zulip = new Zulip();
document.getElementById('addZulipButton').onclick = () => zulip.login();

if (zulip.isConnected()) {
    document.getElementById('addZulipButton').hidden = true; //TODO disable instead of hide
    document.getElementById('logoutButton').hidden = false;
    $("#zulipFrame").load("integrations/frames/Zulip.html");
    zulip.getAllData().then((data) => {
        let siteURL = zulip.getLoginData().site;
        $(".zulip_url").text(siteURL.replace('http://', '').replace('https://', ''));
        $(".zulip_email").text(zulip.getLoginData().email);
        $(".zulip_unread_count").text(data.unread.messages.length);
        document.getElementById('zulip_messages_link').href = siteURL;
        for (let message in data.unread.messages) {
            if (!data.unread.messages.hasOwnProperty(message)) continue;
            message = data.unread.messages[message];
            let messageElement = document.createElement('li');
            message.content = message.content.replace('href="/user', 'href="' + siteURL + '/user')
            message.content = message.content.replace('src="/user', 'src="' + siteURL + '/user')
            let recipent = typeof message.display_recipient === 'string' ? message.display_recipient + ' (' + message.subject + ')' : message.display_recipient[0]['full_name'];
            messageElement.innerHTML = '<b>' + message.sender_full_name + ' -> ' + recipent + ':</b> ' + message.content;
            document.getElementById('zulip_messages').appendChild(messageElement);
        }
        document.getElementById('zulipFrame').hidden = false;
    })
}
