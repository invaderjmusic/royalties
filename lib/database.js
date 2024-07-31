const edgedb = require("edgedb");
const client = edgedb.createClient();

module.exports = {
    addUser: async (username, primary_contact) => {
        await client.execute(`
        insert User {
            username := <str>$name,
            primary_contact := <str>$contact,
            is_admin := false,
            password_salt := <str>"",
            password_hash := <str>""
        }
        `, { name: username, contact: primary_contact });
    },
    getUser: async (username) => {
        let result = await client.querySingle(`
        select User {
            id,
            is_admin,
            primary_contact,
            password_salt,
            password_hash,
            splits,
            signup_key
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
    getDetailedUsersInfo: async () => {
        let result = await client.query(`
        select User {
            name := .username,
            details := {
                primary_contact := User.primary_contact,
                signup_key := User.signup_key
            },
            earnings := sum(
                (with es := (select Earning filter .user.username = User.username)
                for e in es union e.amount)
            ),
            payouts := sum(
                (with ps := (select Payout filter .user.username = User.username)
                for p in ps union p.amount)
            )
        }
        `)
        return result;
    },
    getUserByKey: async (signup_key) => {
        let result = await client.query(`
        select User {
            username
        }
        filter .signup_key = <str>$key
        `, { key: signup_key })
        return result;
    },
    setUserPassword: async (username, salt, hash) => {
        await client.execute(`
        update User
        filter .username = <str>$name
            set {
                password_salt := <str>$pwdsalt,
                password_hash := <str>$pwdhash
            }
        `, { name: username, pwdsalt: salt, pwdhash: hash });
    },
    setUserSignupKey: async (username, signup_key) => {
        await client.execute(`
        update User
        filter .username = <str>$name
            set {
                signup_key := <str>$key,
            }
        `, { name: username, key: signup_key });
    },
    deleteUserSignupKey: async (username) => {
        await client.execute(`
        update User
        filter .username = <str>$name
            set {
                signup_key := <str>{},
            }
        `, { name: username });
    },
    deleteUserPassword: async (username) => {
        await client.execute(`
        update User
        filter .username = <str>$name
            set {
                password_salt := <str>"",
                password_hash := <str>""
            }
        `, { name: username });
    },
    addRelease: async (name, year, month, day, songs) => {
        let queryString = `
        insert Release {
            name := <str>$name,
            release_date := <cal::local_date>$date,
            songs := {
        `
        let parameters = { name: name, date: new edgedb.LocalDate(year, month, day) }

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
    getUserSplit: async (username, song) => {
        let result = await client.query(`
        select Split {
            percentage
        }
        filter .<splits[is User].username = <str>$user and .song.name = <str>$name
        `, {user: username, name: song});
        return result;
    },
    getLatestRoyaltyDate: async () => {
        let result = await client.querySingle(`
        select max (
            (with
            royalties := (select Royalty {date})
            for royalty in royalties
            union(royalty.date))
        )
        `);
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
        `, { date: new edgedb.LocalDate(year, month, day) });
        return result;
    },
    getSongSplits: async (song) => {
        let result = await client.query(`
        select Split { 
            percentage, 
            user := .<splits[is User].username 
        } 
        filter .song = (select Song filter .name = <str>$name)
        `, { name: song });
        return result;
    },
    addRoyaltyToSongDB: async (year, month, song, amount, earnings) => {
        let queryString = `
        update Song 
        filter .name = <str>$name
            set { 
                royalties += (insert Royalty {
                    date := <cal::local_date>$date,
                    amount := <int64>$amount,
                    earnings := {
        `
        let parameters = { name: song, date: new edgedb.LocalDate(year, month, 1), amount: amount}
        
        let keys = Object.keys(earnings); 
        if (keys.length > 1) {
            for (let i = 0; i < keys.length - 1; i++) {
                queryString = queryString + `(insert Earning { user := (select User filter .username = <str>$earning${i.toString()}name), amount := <int64>$earning${i.toString()}amount }), `
                parameters[`earning${i.toString()}name`] = keys[i];
                parameters[`earning${i.toString()}amount`] = earnings[keys[i]];
            }
        }

        queryString = queryString + `(insert Earning { user := (select User filter .username = <str>$earning${(keys.length - 1).toString()}name), amount := <int64>$earning${(keys.length - 1).toString()}amount }) } }) }`
        parameters[`earning${(keys.length - 1).toString()}name`] = keys[keys.length - 1];
        parameters[`earning${(keys.length - 1).toString()}amount`] = earnings[keys[keys.length - 1]];
        
        await client.execute(queryString, parameters);
    },
    getCreditedSongs: async(username = "") => {
        if (username == "") {
            let result = await client.query(`
            with
            splits := (select Split {
                songname := .song.name
            })
            select distinct (for split in splits union (split.songname))
            `);
            return result;
        }
        else {
            let result = await client.query(`
            with
            splits := (select Split {
                songname := .song.name
            } filter .<splits[is User].username = <str>$user)
            select distinct (for split in splits union (split.songname))
            `, { user: username });
            return result;
        }
    },
    getFullRoyalties: async (song, page) => {
        let newLimit = 12;
        let result = await client.query(`
        select Royalty {
            date,
            amount,
            earnings: {
                name := .user.username,
                amount
            }
        }
        filter .<royalties[is Song].name = <str>$name
        order by .date desc
        offset <int64>$offset limit <int64>$limit
        `, {name: song, offset: (page - 1) * newLimit, limit: newLimit});
        return result;
    },
    getUserRoyalties: async (user, song, page) => {
        let newLimit = 12;
        let result = await client.query(`
        select Royalty {
            date,
            amount,
            earnings: {
                name := .user.username,
                amount
            } filter .name = <str>$user
        }
        filter .<royalties[is Song].name = <str>$name
        order by .date desc
        offset <int64>$offset limit <int64>$limit
        `, {user: user, name: song, offset: (page - 1) * newLimit, limit: newLimit});
        return result;
    },
    getAccountEarnings: async () => {
        let result = await client.querySingle(`
        select sum (
            (with 
            royalties := (select Royalty {
                amount
            })
            for royalty in royalties
            union royalty.amount
            )
        )
        `);
        return result;
    },
    getAccountEarningsBySong: async (song) => {
        let result = await client.querySingle(`
        select sum (
            (with 
            royalties := (select Royalty {
                amount
            } filter .<royalties[is Song].name = <str>$name)
            for royalty in royalties
            union royalty.amount
            )
        )
        `, {name: song});
        return result;
    },
    getAccountPayouts: async () => {
        let result = await client.querySingle(`
        select sum (
            (with 
            transactions := (select Transaction {
                withdrawal
            })
            for transaction in transactions
            union transaction.withdrawal
            )
        )
        `);
        return result;
    },
    getUserEarnings: async (user) => {
        let result = await client.querySingle(`
        select sum (
            (with 
            earnings := (select Earning {
                amount
            } filter .user.username = <str>$name)
            for earning in earnings
            union earning.amount
            )
        )
        `, {name: user});
        return result;
    },
    getUserEarningsBySong: async (user, song) => {
        let result = await client.querySingle(`
        select sum (
            (with 
            earnings := (select Earning {
                amount
            } filter .user.username = <str>$user and .<earnings[is Royalty].<royalties[is Song].name = <str>$name)
            for earning in earnings
            union earning.amount
            )
        )
        `, {user: user, name: song});
        return result;
    },
    getUserPayouts: async (user) => {
        let result = await client.querySingle(`
        select sum (
            (with 
            payouts := (select Payout {
                amount
            } filter .user.username = <str>$name)
            for payout in payouts
            union payout.amount
            )
        )
        `, {name: user});
        return result;
    },
    listUserPayouts: async (user) => {
        let result = await client.query(`
        select Transaction {
            date,
            withdrawal,
            myPayout := (select .payouts {
                amount
            } filter .user.username = <str>$name)
        }
        filter .withdrawal > 0 or exists .myPayout
        order by .date desc
        `, {name: user});
        return result;
    },
    listAllTransactions: async () => {
        let result = await client.query(`
        select Transaction {
            date,
            withdrawal,
            payouts: {
                name := .user.username,
                amount
            }
        }
        order by .date desc
        `);
        return result;
    },
    getPrimaryContact: async (user) => {
        let result = await client.querySingle(`
        select User {
            primary_contact
        }
        filter .username = <str>$name
        `, {name: user});
        return result;
    },
    setPrimaryContact: async (user, contact) => {
        let result = await client.querySingle(`
        update User
        filter .username = <str>$name
        set {
            primary_contact := <str>$contact
        }
        `, {name: user, contact: contact});
        return result;
    },
    addTransaction: async (year, month, day, withdrawal, payouts) => {
        let queryString = `
        insert Transaction {
            date := <cal::local_date>$date,
            withdrawal := <int64>$withdrawal,
            payouts := {
        `
        let parameters = { date: new edgedb.LocalDate(year, month, day), withdrawal: withdrawal }

        if (payouts.length > 1) {
            for (let i = 0; i < payouts.length - 1; i++) {
                queryString = queryString + `(insert Payout { user := (select User filter .username = <str>$name${i.toString()}), amount := <int64>$amount${i.toString()}}), `
                parameters[`name${i}`] = payouts[i].name;
                parameters[`amount${i}`] = payouts[i].payout;
            }
        }

        queryString = queryString + `(insert Payout { user := (select User filter .username = <str>$name${(payouts.length - 1).toString()}), amount := <int64>$amount${(payouts.length - 1).toString()}}) }}`
        parameters[`name${payouts.length - 1}`] = payouts[payouts.length - 1].name;
        parameters[`amount${payouts.length - 1}`] = payouts[payouts.length - 1].payout;

        await client.execute(queryString, parameters);
    },
    deleteRoyaltiesByDate: async (date) => {
        await client.execute(`
        delete Royalty
        filter .date = <cal::local_date>$date
        `, {date: date});
    },
    addProduct: async (url, name) => {
        await client.execute(`
            insert Product {
                url := <str>$url,
                name := <str>$name
            }
            `, { url: url, name: name });
    },
    addUserProductSplit: async (username, product, percentage) => {
        await client.execute(`
        update User
        filter .username = <str>$name
            set {
                product_splits += (insert ProductSplit { percentage := <int64>$percentage, product := (select Product filter .url = <str>$url)})
            }
        `, { name: username, percentage: percentage, url: product });
    },
}