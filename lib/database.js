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
        `, { name: username, pwdsalt: salt, pwdhash: hash });
    },
    addRelease: async (name, year, month, day, songs) => {
        let queryString = `
        insert Release {
          name := <str>$name,
          release_date := <cal::local_date>$date,
          songs := {
        `
        let parameters = {name: name, date: new edgedb.LocalDate(year, month, day)}

        if (songs.length > 1) {
            for (let i = 0; i < songs.length - 1; i++) {
                queryString = queryString + `(insert Song { name := <str>$song${i.toString()}name }), `
                parameters[`song${i.toString()}name`] = songs[i];
            }
        }

        queryString = queryString + `(insert Song { name := <str>$song${(songs.length - 1).toString()}name }) } }`
        parameters[`song${(songs.length - 1).toString()}name`] = songs[songs.length - 1];

        await client.execute(queryString, parameters);
    },
    addUserSplit: async (username, song, percentage) => {
        await client.execute(`
        update User
        filter .username = <str>$name
          set {
            splits += (insert Split { percentage := <int64>$percentage, song := (select Song filter .name = <str>$songname)})
          }
        `, { name: username, percentage: percentage, songname: song });
    } 
}