const express = require('express');
const router = express.Router();
const database = require("../lib/database.js");
const royalties = require("../lib/royalties.js");

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

// Admin API routes
router.get("/getUsers", async (req, res) => {
    let users = await database.getUsersOverview();
    res.send(users);
})

// No data validation here, I'm relying on the frontend (probably bad practice but oh well, it is a protected API route)
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

module.exports = router