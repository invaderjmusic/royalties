const express = require('express')
const router = express.Router()

router.use((req, res, next) => {
    if (req.session.loggedin) next();
    else res.redirect("/?notloggedin");
})

router.get('/', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/index.html");
})
  
router.get("/index.js", (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/index.js");
})

module.exports = router