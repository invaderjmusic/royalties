const { getUser } = require("./database.js");
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
    }
}