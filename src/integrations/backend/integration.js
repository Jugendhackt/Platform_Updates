export class Integration {

    loginCredentials;
    id;

    constructor(id) {
        let allLoginCredentials = JSON.parse(localStorage.getItem('int_' + this.constructor.name));
        if (!allLoginCredentials.hasOwnProperty(id)) throw "ID of Logincredentials does not exist.";
        this.loginCredentials = allLoginCredentials[id];
        this.id = id;
    }

    /**
     * Prompts a login pane to open or performs the login
     */
    static login(loginData) {
        if (!loginData) location.href = '/integrations/loginPrompts/' + this.name + '.html';
    }

    /**
     * Used to manually save Login Credentials
     */
    static addLoginCredentials(credentialsObject, id) {
        let stored = {};
        if (localStorage.getItem('int_' + this.name) != null) {
            stored = JSON.parse(localStorage.getItem('int_' + this.name));
        }
        stored[id] = credentialsObject;
        localStorage.setItem('int_' + this.name, JSON.stringify(stored));
    }


    /**
     * Check if the user is already logged in
     */
    static isConnected() {
        return localStorage.getItem('int_' + this.name) != null;
    }


    /**
     * Returns all data that belong to the integration
     */
    getAllData() { return new Promise(((resolve, reject) => resolve({}))); }



    /**
     * Removes all login credentials
     */
    static logout() {
        localStorage.removeItem('int_' + this.name);
    }

    /**
     * Logout only the current instance
     */
    logout() {
        let data = JSON.parse(localStorage.getItem('int_' + this.constructor.name));
        delete data[this.id];
        localStorage.setItem('int_' + this.name, JSON.stringify(data));
    }

    static getAllLogins() {
        let allLoginCredentials = JSON.parse(localStorage.getItem('int_' + this.name));
        let logins = [];
        for (let login in allLoginCredentials) {
            if (!allLoginCredentials.hasOwnProperty(login)) continue;
            logins.push(login);
        }
        return logins;
    }
}
