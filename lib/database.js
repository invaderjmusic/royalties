const edgedb = require("edgedb")
const client = edgedb.createClient();

module.exports = {
    getUser: async (username) => {
        let result = await client.querySingle(`
        select User {
          id,
          is_admin,
          primary_contact,
          password_salt,
          password_hash,
          splits
        }
        filter .username = <str>$name
        `, { name: username })
        return result;
    },
    addUserPassword: async (username, salt, hash) => {
        await client.execute(`
        update User
        filter .username = <str>$name
          set {
            password_salt := <str>$pwdsalt,
            password_hash := <str>$pwdhash
          }
        `, {name: username, pwdsalt: salt, pwdhash: hash});
    }
}