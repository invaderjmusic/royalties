const { getUser, setUserPassword, getUserByKey, deleteUserSignupKey, setUserSignupKey } = require("./database.js");
const crypto = require("crypto")

module.exports = {
    getUserRole: async (username, password) => {
        let user = await getUser(username);
        if (user == null) return "none";
        let hash = crypto.createHash("sha512").update(user.password_salt + password).digest('hex');
        if (hash == user.password_hash) {
            if (user.is_admin) return "admin";
            else return "user";
        }
        else return "none";
    },
    updateUserPassword: async (username, oldPassword, newPassword) => {
        let user = await getUser(username);
        if (user == null) return ["badlogin"];
        let hash = crypto.createHash("sha512").update(user.password_salt + oldPassword).digest('hex');
        if (hash == user.password_hash) {
            let newSalt = crypto.randomBytes(32).toString('hex');
            let newHash = crypto.createHash("sha512").update(newSalt + newPassword).digest('hex');
            try {
                await setUserPassword(username, newSalt, newHash);
                return ["success"]
            }
            catch (err) {
                return ["err", err]
            }
        }
        else return ["badlogin"];
    },
    addUserPassword: async (username, newPassword) => {
        let newSalt = crypto.randomBytes(32).toString('hex');
        let newHash = crypto.createHash("sha512").update(newSalt + newPassword).digest('hex');
        try {
            await setUserPassword(username, newSalt, newHash);
            await deleteUserSignupKey(username);
            return ["success"]
        }
        catch (err) {
            return ["err", err]
        }
    },
    generateSignupKey: async (username) => {
        newKey = crypto.randomBytes(16).toString('hex');
        await setUserSignupKey(username, newKey);
        return newKey;
    },
    validateSignupKey: async (signup_key) => {
        if (signup_key == "") return ["badkey"];
        let user = await getUserByKey(signup_key)
        if (user.length == 0) return ["badkey"]
        else return ["success", user[0].username]
    }
}