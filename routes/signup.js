const express = require('express')
const router = express.Router()
const users = require("../lib/users.js");

router.get('/', (req, res) => {
    res.sendFile(process.cwd() + "/public/signup.html");
})

router.get("/getUsername", async (req, res) => {
    if (req.query.key) {
        let name = await users.validateSignupKey(req.query.key)
        res.send(name)
    }
    else res.status(400).end();
})

module.exports = router