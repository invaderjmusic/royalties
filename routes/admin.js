const express = require('express')
const router = express.Router()
const database = require("../lib/database.js")

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
    res.sendFile(process.cwd() + "/admin/index.html");
})
  
router.get("/index.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/index.js");
})

router.get("/newrelease", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newrelease.html");
})

router.get("/newrelease.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/newrelease.js");
})

// Admin API routes
router.post("/addRelease", (req, res) => {
    console.log(req.body)
    res.status(201).send("success");
})

router.get("/getUsers", async (req, res) => {
    let users = await database.getUsersOverview();
    res.send(users);
})

module.exports = router