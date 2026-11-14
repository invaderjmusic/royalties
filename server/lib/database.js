import { createClient, LocalDate } from "gel";
const client = createClient();

export async function addUser(username, primary_contact) {
    await client.execute(`
        insert User {
            username := <str>$name,
            primary_contact := <str>$contact,
            is_admin := false,
            password_salt := <str>"",
            password_hash := <str>""
        }
        `, { name: username, contact: primary_contact });
}

export async function getUser(username) {
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
        `, { name: username });
    return result;
}

export async function getUsersOverview() {
    let result = await client.query(`
        select User {
            username
        }
        `);
    return result;
}

export async function getDetailedUsersInfo() {
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
            ),
            sales := sum(
                (with ss := (select SaleEarning filter .user.username = User.username)
                for s in ss union s.amount)
            ),
            salepayouts := sum(
                (with sps := (select SalePayout filter .user.username = User.username)
                for sp in sps union sp.amount)
            )
        }
        `);
    return result;
}

export async function getUserByKey(signup_key) {
    let result = await client.query(`
        select User {
            username
        }
        filter .signup_key = <str>$key
        `, { key: signup_key });
    return result;
}

export async function setUserPassword(username, salt, hash) {
    await client.execute(`
        update User
        filter .username = <str>$name
            set {
                password_salt := <str>$pwdsalt,
                password_hash := <str>$pwdhash
            }
        `, { name: username, pwdsalt: salt, pwdhash: hash });
}

export async function setUserSignupKey(username, signup_key) {
    await client.execute(`
        update User
        filter .username = <str>$name
            set {
                signup_key := <str>$key,
            }
        `, { name: username, key: signup_key });
}

export async function deleteUserSignupKey(username) {
    await client.execute(`
        update User
        filter .username = <str>$name
            set {
                signup_key := <str>{},
            }
        `, { name: username });
}

export async function deleteUserPassword(username) {
    await client.execute(`
        update User
        filter .username = <str>$name
            set {
                password_salt := <str>"",
                password_hash := <str>""
            }
        `, { name: username });
}

export async function addRelease(name, year, month, day, songs) {
    let queryString = `
        insert Release {
            name := <str>$name,
            release_date := <cal::local_date>$date,
            songs := {
        `;
    let parameters = { name: name, date: new LocalDate(year, month, day) };

    if (songs.length > 1) {
        for (let i = 0; i < songs.length - 1; i++) {
            queryString = queryString + `(insert Song { name := <str>$song${i.toString()}name }), `;
            parameters[`song${i.toString()}name`] = songs[i];
        }
    }

    queryString = queryString + `(insert Song { name := <str>$song${(songs.length - 1).toString()}name }) } }`;
    parameters[`song${(songs.length - 1).toString()}name`] = songs[songs.length - 1];

    await client.execute(queryString, parameters);
}

export async function addUserSplit(username, song, percentage) {
    await client.execute(`
        update User
        filter .username = <str>$name
            set {
                splits += (insert Split { percentage := <int64>$percentage, song := (select Song filter .name = <str>$songname)})
            }
        `, { name: username, percentage: percentage, songname: song });
}

export async function getUserSplit(username, song) {
    let result = await client.query(`
        select Split {
            percentage
        }
        filter .<splits[is User].username = <str>$user and .song.name = <str>$name
        `, { user: username, name: song });
    return result;
}

export async function getLatestRoyaltyDate() {
    let result = await client.querySingle(`
        select max (
            (with
            royalties := (select Royalty {date})
            for royalty in royalties
            union(royalty.date))
        )
        `);
    return result;
}

export async function getEarliestReleaseDate() {
    let result = await client.querySingle(`
        select min (
            (with
            releases := (select Release {release_date})
            for release in releases
            union(release.release_date))
        )
        `);
    return result;
}

export async function getReleasesBeforeDate(year, month, day) {
    let result = await client.query(`
        select Release {
            name,
            release_date,
            songs: {
                name
            }
        }
        filter .release_date < <cal::local_date>$date
        `, { date: new LocalDate(year, month, day) });
    return result;
}

export async function getSongSplits(song) {
    let result = await client.query(`
        select Split { 
            percentage, 
            user := .<splits[is User].username 
        } 
        filter .song = (select Song filter .name = <str>$name)
        `, { name: song });
    return result;
}

export async function addRoyaltyToSongDB(year, month, song, amount, earnings) {
    let queryString = `
        update Song 
        filter .name = <str>$name
            set { 
                royalties += (insert Royalty {
                    date := <cal::local_date>$date,
                    amount := <int64>$amount,
                    earnings := {
        `;
    let parameters = { name: song, date: new LocalDate(year, month, 1), amount: amount };

    let keys = Object.keys(earnings);
    if (keys.length > 1) {
        for (let i = 0; i < keys.length - 1; i++) {
            queryString = queryString + `(insert Earning { user := (select User filter .username = <str>$earning${i.toString()}name), amount := <int64>$earning${i.toString()}amount }), `;
            parameters[`earning${i.toString()}name`] = keys[i];
            parameters[`earning${i.toString()}amount`] = earnings[keys[i]];
        }
    }

    queryString = queryString + `(insert Earning { user := (select User filter .username = <str>$earning${(keys.length - 1).toString()}name), amount := <int64>$earning${(keys.length - 1).toString()}amount }) } }) }`;
    parameters[`earning${(keys.length - 1).toString()}name`] = keys[keys.length - 1];
    parameters[`earning${(keys.length - 1).toString()}amount`] = earnings[keys[keys.length - 1]];

    await client.execute(queryString, parameters);
}

export async function getCreditedSongs(username = "") {
    if (username == "") {
        let result = await client.query(`
            with 
            songs := (select Song {
                name
            })
            for song in songs union song.name
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
}

export async function getFullRoyalties(song, page) {
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
        `, { name: song, offset: (page - 1) * newLimit, limit: newLimit });
    return result;
}

export async function getUserRoyalties(user, song, page) {
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
        `, { user: user, name: song, offset: (page - 1) * newLimit, limit: newLimit });
    return result;
}

export async function getAccountEarnings() {
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
}

export async function getAccountEarningsBySong(song) {
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
        `, { name: song });
    return result;
}

export async function getAccountPayouts() {
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
}

export async function getUserEarnings(user) {
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
        `, { name: user });
    return result;
}

export async function getUserEarningsBySong(user, song) {
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
        `, { user: user, name: song });
    return result;
}

export async function getUserPayouts(user) {
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
        `, { name: user });
    return result;
}

export async function listUserPayouts(user) {
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
        `, { name: user });
    return result;
}

export async function listAllTransactions() {
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
}

export async function getPrimaryContact(user) {
    let result = await client.querySingle(`
        select User {
            primary_contact
        }
        filter .username = <str>$name
        `, { name: user });
    return result;
}

export async function setPrimaryContact(user, contact) {
    let result = await client.querySingle(`
        update User
        filter .username = <str>$name
        set {
            primary_contact := <str>$contact
        }
        `, { name: user, contact: contact });
    return result;
}

export async function addTransaction(year, month, day, withdrawal, payouts) {
    let queryString = `
        insert Transaction {
            date := <cal::local_date>$date,
            withdrawal := <int64>$withdrawal,
            payouts := {
        `;
    let parameters = { date: new LocalDate(year, month, day), withdrawal: withdrawal };

    if (payouts.length > 1) {
        for (let i = 0; i < payouts.length - 1; i++) {
            queryString = queryString + `(insert Payout { user := (select User filter .username = <str>$name${i.toString()}), amount := <int64>$amount${i.toString()}}), `;
            parameters[`name${i}`] = payouts[i].name;
            parameters[`amount${i}`] = payouts[i].payout;
        }
    }

    queryString = queryString + `(insert Payout { user := (select User filter .username = <str>$name${(payouts.length - 1).toString()}), amount := <int64>$amount${(payouts.length - 1).toString()}}) }}`;
    parameters[`name${payouts.length - 1}`] = payouts[payouts.length - 1].name;
    parameters[`amount${payouts.length - 1}`] = payouts[payouts.length - 1].payout;

    await client.execute(queryString, parameters);
}

export async function deleteRoyaltiesByDate(date) {
    await client.execute(`
        delete Royalty
        filter .date = <cal::local_date>$date
        `, { date: date });
}

export async function addProduct(url, name) {
    await client.execute(`
            insert Product {
                url := <str>$url,
                name := <str>$name
            }
            `, { url: url, name: name });
}

export async function addUserProductSplit(username, product, percentage) {
    await client.execute(`
        update User
        filter .username = <str>$name
            set {
                product_splits += (insert ProductSplit { percentage := <int64>$percentage, product := (select Product filter .url = <str>$url)})
            }
        `, { name: username, percentage: percentage, url: product });
}

export async function getProductSplits(product) {
    let result = await client.query(`
        select ProductSplit { 
            percentage, 
            user := .<product_splits[is User].username 
        } 
        filter .product = (select Product filter .url = <str>$url)
        `, { url: product });
    return result;
}

export async function addSaleToProductDB(year, month, product, amount, count, earnings) {
    let queryString = `
        update Product 
        filter .url = <str>$url
            set { 
                sales += (insert Sale {
                    date := <cal::local_date>$date,
                    count := <int64>$count,
                    amount := <int64>$amount,
                    earnings := {
        `;
    let parameters = { url: product, date: new LocalDate(year, month, 1), count: count, amount: amount };

    let keys = Object.keys(earnings);
    if (keys.length > 1) {
        for (let i = 0; i < keys.length - 1; i++) {
            queryString = queryString + `(insert SaleEarning { user := (select User filter .username = <str>$earning${i.toString()}name), amount := <int64>$earning${i.toString()}amount }), `;
            parameters[`earning${i.toString()}name`] = keys[i];
            parameters[`earning${i.toString()}amount`] = earnings[keys[i]];
        }
    }

    queryString = queryString + `(insert SaleEarning { user := (select User filter .username = <str>$earning${(keys.length - 1).toString()}name), amount := <int64>$earning${(keys.length - 1).toString()}amount }) } }) }`;
    parameters[`earning${(keys.length - 1).toString()}name`] = keys[keys.length - 1];
    parameters[`earning${(keys.length - 1).toString()}amount`] = earnings[keys[keys.length - 1]];

    await client.execute(queryString, parameters);
}

export async function getCreditedProducts(username = "") {
    if (username == "") {
        let result = await client.query(`
            select Product {
                url,
                name
            }
            `);
        return result;
    }
    else {
        let result = await client.query(`
            select ProductSplit {
                url := .product.url,
                name  := .product.name
            } filter .<product_splits[is User].username = <str>$user
            `, { user: username });
        return result;
    }
}

export async function getProductSplits(product) {
    let result = await client.query(`
        select ProductSplit { 
            percentage, 
            user := .<product_splits[is User].username 
        } 
        filter .product = (select Product filter .url = <str>$url)
        `, { url: product });
    return result;
}

export async function getAccountEarningsByProduct(product) {
    let result = await client.querySingle(`
        select sum (
            (with 
            sales := (select Sale {
                amount
            } filter .<sales[is Product].url = <str>$url)
            for sale in sales
            union sale.amount
            )
        )
        `, { url: product });
    return result;
}

export async function getFullSales(product, page) {
    let newLimit = 12;
    let result = await client.query(`
        select Sale {
            date,
            count,
            amount,
            earnings: {
                name := .user.username,
                amount
            }
        }
        filter .<sales[is Product].url = <str>$url
        order by .date desc
        offset <int64>$offset limit <int64>$limit
        `, { url: product, offset: (page - 1) * newLimit, limit: newLimit });
    return result;
}

export async function getUserSales(username, product, page) {
    let newLimit = 12;
    let result = await client.query(`
        select Sale {
            date,
            count,
            amount,
            earnings: {
                name := .user.username,
                amount
            } filter .name = <str>$user
        }
        filter .<sales[is Product].url = <str>$url
        order by .date desc
        offset <int64>$offset limit <int64>$limit
        `, { user: username, url: product, offset: (page - 1) * newLimit, limit: newLimit });
    return result;
}

export async function getUserProductSplit(username, product) {
    let result = await client.query(`
        select ProductSplit {
            percentage
        }
        filter .<product_splits[is User].username = <str>$user and .product.url = <str>$url
        `, { user: username, url: product });
    return result;
}

export async function getUserEarningsByProduct(username, product) {
    let result = await client.querySingle(`
        select sum (
            (with 
            earnings := (select SaleEarning {
                amount
            } filter .user.username = <str>$user and .<earnings[is Sale].<sales[is Product].url = <str>$url)
            for earning in earnings
            union earning.amount
            )
        )
        `, { user: username, url: product });
    return result;
}

export async function addSalePayout(year, month, day, username, amount) {
    await client.execute(`
        insert SalePayout {
            date := <cal::local_date>$date,
            user := (select User filter .username = <str>$user),
            amount := <int64>$amount
        }
        `, { date: new LocalDate(year, month, day), user: username, amount: amount });
}

export async function getFullSalePayouts(page) {
    let newLimit = 12;
    let result = await client.query(`
        select SalePayout {
            date,
            username := .user.username,
            amount,
        }
        order by .date desc
        offset <int64>$offset limit <int64>$limit
        `, { offset: (page - 1) * newLimit, limit: newLimit });
    return result;
}

export async function listUserSalePayouts(username, page) {
    let newLimit = 12;
    let result = await client.query(`
        select SalePayout {
            date,
            amount
        }
        filter .user.username = <str>$name
        order by .date desc
        offset <int64>$offset limit <int64>$limit
        `, { name: username, offset: (page - 1) * newLimit, limit: newLimit });
    return result;
}

export async function getAccountSales() {
    let result = await client.querySingle(`
        select sum (
            (with 
            sales := (select Sale {
                amount
            })
            for sale in sales
            union sale.amount
            )
        )
        `);
    return result;
}

export async function getAccountSalePayouts() {
    let result = await client.querySingle(`
        select sum (
            (with 
            payouts := (select SalePayout {
                amount
            })
            for payout in payouts
            union payout.amount
            )
        )
        `);
    return result;
}

export async function getUserSaleEarnings(user) {
    let result = await client.querySingle(`
        select sum (
            (with 
            earnings := (select SaleEarning {
                amount
            } filter .user.username = <str>$name)
            for earning in earnings
            union earning.amount
            )
        )
        `, { name: user });
    return result;
}

export async function getUserSalePayouts(user) {
    let result = await client.querySingle(`
        select sum (
            (with 
            payouts := (select SalePayout {
                amount
            } filter .user.username = <str>$name)
            for payout in payouts
            union payout.amount
            )
        )
        `, { name: user });
    return result;
}