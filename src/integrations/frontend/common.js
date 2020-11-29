document.getElementById('logoutButton').onclick = () => {
    localStorage.removeItem('int_zulip_token');
    localStorage.removeItem('int_zulip_email');
    localStorage.removeItem('int_zulip_site');
    localStorage.removeItem('int_moodle_token');
    localStorage.removeItem('int_moodle_site');
    location.reload();
}
