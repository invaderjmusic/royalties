const express = require('express')
const router = express.Router()
const users = require("../lib/users.js");

router.get('/', (req, res) => {
    res.sendFile(process.cwd() + "/public/signup.html");
})

router.get("/reset", (req, res) => {
    res.sendFile(process.cwd() + "/public/reset.html");
})

router.get("/getUsername", async (req, res) => {
    if (req.query.key) {
        let name = await users.validateSignupKey(req.query.key);
        res.send(name);
    }
    else res.status(400).end();
})

router.post("/setPassword", async (req, res) => {
    if (req.body.signup_key && req.body.username && req.body.password && req.body.confirm_password) {
        let check = await users.validateSignupKey(req.body.signup_key);
        if (check[0] == "badkey" || check[1] !== req.body.username) {
            res.status(401).end();
        }
        else if (req.body.password !== req.body.confirm_password) {
            res.redirect("/signup?nomatch&key=" + req.body.signup_key);
        }
        else {
            await users.addUserPassword(check[1], req.body.password);
            res.redirect(307, "/login");
        }
    }
    else res.status(400).end();
})

module.exports = router