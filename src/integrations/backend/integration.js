export class Integration {

    /**
     * Prompts a login pane to open or performs the login
     */
    static login(loginData) {
        if (!loginData) location.href = '/integrations/loginPrompts/' + this.name + '.html';
    }


    /**
     * Check if the user is already logged in
     */
    static isConnected() {
        return false;
    }


    /**
     * Returns all data that belong to the integration
     */
    getAllData() { return new Promise(((resolve, reject) => resolve({}))); }


    /**
     * Removes all login credentials
     * This should be accessible in a static context
     */
    static logout() {}

}
