const express = require('express');
const router = express.Router();
const database = require("../lib/database.js");
const royalties = require("../lib/royalties.js");
const users = require("../lib/users.js");
const { getExchangeRate } = require("../lib/currency.js");

router.use((req, res, next) => {
    if (req.session.loggedin) {
        if (req.session.admin) {
            next();
        }
        else {
            res.status(401).redirect("/dashboard");
        }
    } else {
        res.status(401).redirect("/?notloggedin");
    }
})

// Serving files
router.get('/', (req, res) => {
    res.sendFile(process.cwd() + "/admin/dashboard.html");
})
  
router.get("/index.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/index.js");
})

router.get('/dashboard.js', (req, res) => {
    res.sendFile(process.cwd() + "/admin/dashboard.js");
})

router.get("/royalties", (req, res) => {
    res.sendFile(process.cwd() + "/admin/royalties.html");
})

router.get("/royalties.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/royalties.js");
})

router.get("/report", (req, res) => {
    res.sendFile(process.cwd() + "/admin/report.html");
})

router.get("/report.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/report.js");
})

router.get("/newrelease", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newrelease.html");
})

router.get("/newrelease.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newrelease.js");
})

router.get("/transactions", (req, res) => {
    res.sendFile(process.cwd() + "/admin/transactions.html");
})

router.get("/transactions.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/transactions.js");
})

router.get("/newtransaction", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newtransaction.html");
})

router.get("/newtransaction.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newtransaction.js");
})

router.get("/newuser", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newuser.html");
})

router.get("/newuser.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newuser.js");
})

router.get("/newproduct", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newproduct.html");
})

router.get("/newproduct.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newproduct.js");
})

router.get("/sales", (req, res) => {
    res.sendFile(process.cwd() + "/admin/sales.html");
})

router.get("/sales.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/sales.js");
})

router.get("/reportsales", (req, res) => {
    res.sendFile(process.cwd() + "/admin/reportsales.html");
})

router.get("/reportsales.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/reportsales.js");
})

router.get("/salepayouts", (req, res) => {
    res.sendFile(process.cwd() + "/admin/salepayouts.html");
})

router.get("/salepayouts.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/salepayouts.js");
})

router.get("/newpayout", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newpayout.html");
})

router.get("/newpayout.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newpayout.js");
})

/**
 * Admin API Routes
 * Generally no data validation here, we're trusting the frontend.
**/

router.get("/getUsers", async (req, res) => {
    let users = await database.getUsersOverview();
    res.send(users);
})

router.get("/getUsersDetailed", async (req, res) => {
    let users = await database.getDetailedUsersInfo();
    for (let i = 0; i < users.length; i++) {
        balance =  users[i].earnings - users[i].payouts;
        users[i].balance = balance;
        users[i].balancePounds = balance * getExchangeRate();
        users[i].saleBalance = users[i].sales - users[i].salepayouts
    }
    res.send(users);
})

router.post("/addRelease", async (req, res) => {
    let date = req.body.release_date.split("-");
    let songnames = []
    for (let i = 0; i < req.body.songs.length; i++) {
        songnames[i] = req.body.songs[i].name;
    }

    try {
        await database.addRelease(req.body.name, parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), songnames);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }

    for (let i = 0; i < req.body.songs.length; i++) {
        for (let k = 0; k < req.body.songs[i].contributors.length; k++) {
            try {
                await database.addUserSplit(req.body.songs[i].contributors[k].name, req.body.songs[i].name, req.body.songs[i].contributors[k].percentage);
            }
            catch (err) {
                console.error(err);
                return res.status(500).send(err);
            }
        }
    }

    res.status(201).send("success");
})

router.get("/getPendingRoyalties", async (req, res) => {
    let releases = await royalties.getReleasesWithPendingRoyalties();
    res.send(releases);
})

router.post("/addRoyalties", async (req, res) => {
    for (let i = 0; i < req.body.royalties.length; i++) {
        try {
            await royalties.addRoyaltyToSong(req.body.date[0], req.body.date[1], req.body.royalties[i].name, req.body.royalties[i].royalty);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send(err)
        }
    }
    res.status(201).send("success");
})

router.get("/getSongList", async (req, res) => {
    let list = await database.getCreditedSongs();
    res.send(list);
})

router.get("/getFullRoyalties", async (req, res) => {
    if (req.query.song && parseInt(req.query.page) > 0) {
        let royalties = await database.getFullRoyalties(req.query.song, parseInt(req.query.page));
        res.send(royalties);
    }
    else res.status(400).end();
})

router.get("/getSongInfo", async (req, res) => {
    if (req.query.song) {
        let splits = await database.getSongSplits(req.query.song);
        let totalRoyalties = await database.getAccountEarningsBySong(req.query.song);
        res.send({splits, totalRoyalties});
    }
    else res.status(400).end();
})

router.get("/getAccountBalances", async (req, res) => {
    let earnings = await database.getAccountEarnings();
    let withdrawals = await database.getAccountPayouts();
    let balance = earnings - withdrawals;
    let balancePounds = (balance * getExchangeRate()) - 12500;
    let sales = await database.getAccountSales();
    let salePayouts = await database.getAccountSalePayouts();
    let holding = sales - salePayouts;
    res.send({earnings, balance, balancePounds, sales, salePayouts, holding});
})

router.get("/getExchangeRate", (req, res) => {
    res.send({exchangeRate: getExchangeRate()});
})

router.get("/listAllTransactions", async (req, res) => {
    let payouts = await database.listAllTransactions(req.session.username);
    res.send(payouts);
})

router.post("/addTransaction", async (req, res) => {
    let date = req.body.date.split("-");
    try {
        await database.addTransaction(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), req.body.withdrawal, req.body.payouts);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }

    res.status(201).send("success");
})

router.get("/deletePreviousMonth", async (req, res) => {
    let op;
    try {
        op = await royalties.deleteLatestMonthOfRoyalties()
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }
    if (op.result == "success") {
        res.redirect("/admin/report");
    }
    else {
        res.status(400).send(op)
    }
})

router.post("/resetUserPassword", async (req, res) => {
    if (req.body.username !== req.session.username) {
        await database.deleteUserPassword(req.body.username)
        key = await users.generateSignupKey(req.body.username)
        res.send(key)
    }
    else {
        res.status(400).end()
    }
})

router.post("/addUser", async (req, res) => {
    try {
        await database.addUser(req.body.username, req.body.primary_contact);
        await users.generateSignupKey(req.body.username);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }

    res.status(201).send("success");
})

router.post("/addProduct", async (req, res) => {
    try {
        await database.addProduct(req.body.url, req.body.name);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }

    for (let i = 0; i < req.body.contributors.length; i++) {
        try {
            await database.addUserProductSplit(req.body.contributors[i].name, req.body.url, req.body.contributors[i].percentage);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send(err);
        }
    }

    res.status(201).send("success");
})

router.post("/addSales", async (req, res) => {
    let date = req.body.date.split("-");
    for (let i = 0; i < req.body.sales.length; i++) {
        try {
            await royalties.addSaleToProduct(parseInt(date[0]), parseInt(date[1]), req.body.sales[i].url, req.body.sales[i].count, req.body.sales[i].amount);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send(err)
        }
    }
    res.status(201).send("success");
})

router.get("/getProductList", async (req, res) => {
    let list = await database.getCreditedProducts();
    res.send(list);
})

router.get("/getProductInfo", async (req, res) => {
    if (req.query.product) {
        let splits = await database.getProductSplits(req.query.product);
        let totalRoyalties = await database.getAccountEarningsByProduct(req.query.product);
        res.send({splits, totalRoyalties});
    }
    else res.status(400).end();
})

router.get("/getFullSales", async (req, res) => {
    if (req.query.product && parseInt(req.query.page) > 0) {
        let sales = await database.getFullSales(req.query.product, parseInt(req.query.page));
        res.send(sales);
    }
    else res.status(400).end();
})

router.post("/addSalePayouts", async (req, res) => {
    let date = req.body.date.split("-");
    for (let i = 0; i < req.body.payouts.length; i++) {
        try {
            await database.addSalePayout(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), req.body.payouts[i].name, req.body.payouts[i].amount);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send(err)
        }
    }
    res.status(201).send("success");
})

router.get("/listSalePayouts", async (req, res) => {
    if (parseInt(req.query.page) > 0) {
        let payouts = await database.getFullSalePayouts(parseInt(req.query.page));
        res.send(payouts);
    }
    else res.status(400).end();
})

module.exports = router