const { getUser, setUserPassword } = require("./database.js");
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
    }
}