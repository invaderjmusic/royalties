const express = require('express');
const router = express.Router();
const database = require("../lib/database.js");
const royalties = require("../lib/royalties.js");
const { getExchangeRate } = require("../lib/currency.js");

router.use((req, res, next) => {
    if (req.session.loggedin) {
        if (req.session.admin) {
            next();
        }
        else {
            res.redirect("/dashboard");
        }
    } else {
        res.redirect("/?notloggedin");
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

/**
 * Admin API Routes
 * Generally no data validation here, we're trusting the frontend.
**/

router.get("/getUsers", async (req, res) => {
    let users = await database.getUsersOverview();
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
        res.status(500).send(err);
    }

    for (let i = 0; i < req.body.songs.length; i++) {
        for (let k = 0; k < req.body.songs[i].contributors.length; k++) {
            try {
                await database.addUserSplit(req.body.songs[i].contributors[k].name, req.body.songs[i].name, req.body.songs[i].contributors[k].percentage);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err);
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
            res.status(500).send(err)
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
    res.send({earnings, balance, balancePounds});
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
        res.status(500).send(err);
    }

    res.status(201).send("success");
})

module.exports = router