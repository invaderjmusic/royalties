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
        return result
    },
    getUsersOverview: async () => {
      let result = await client.query(`
      select User {
        username
      }
      `);
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
    },
    getLatestRoyaltyDate: async () => { 
        let result = await client.querySingle(`
        select max (
            (with
            royalties := (select Royalty {date})
            for royalty in royalties
            union(royalty.date))
        )
        `)
        return result;
    },
    getEarliestReleaseDate: async () => {
        let result = await client.querySingle(`
        select min (
            (with
            releases := (select Release {release_date})
            for release in releases
            union(release.release_date))
        )
        `);
        return result;
    },
    getReleasesBeforeDate: async (year, month, day) => {
        let result = await client.query(`
        select Release {
            name,
            release_date,
            songs: {
                name
            }
        }
        filter .release_date < <cal::local_date>$date
        `, {date: new edgedb.LocalDate(year, month, day)});
        return result;
    }
}