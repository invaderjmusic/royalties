const express = require('express')
const router = express.Router()

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

router.get('/', (req, res) => {
    res.sendFile(process.cwd() + "/admin/index.html");
})
  
router.get("/index.js", (req, res) => {
    res.sendFile(process.cwd() + "/admin/index.js");
})

module.exports = router