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

module.exports = router