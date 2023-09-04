const express = require('express');
const router = express.Router();
const database = require("../lib/database.js");

router.use((req, res, next) => {
    if (req.session.loggedin) next();
    else res.status(401).end();
})

router.get('/userInfo', (req, res) => {
    res.send({ username: req.session.username, admin: req.session.admin });
})

router.get('/getUserBalances', async (req, res) => {
    let earnings = await database.getUserEarnings(req.session.username);
    res.send({earnings})
})

router.get("/getSongList", async (req, res) => {
    let list = await database.getCreditedSongs(req.session.username);
    res.send(list);
})

router.get("/getSongRoyalties", async (req, res) => {
    if (req.query.song && parseInt(req.query.page) > 0) {
        let royalties = await database.getUserRoyalties(req.session.username, req.query.song, parseInt(req.query.page));
        res.send(royalties);
    }
    else res.status(400).end();
})

router.get("/getSongInfo", async (req, res) => {
    if (req.query.song) {
        let split = await database.getUserSplit(req.session.username, req.query.song);
        let totalEarning = await database.getUserEarningsBySong(req.session.username, req.query.song);
        res.send({split, totalEarning});
    }
    else res.status(400).end();
})

module.exports = router