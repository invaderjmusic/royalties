const express = require('express')
const router = express.Router()

router.use((req, res, next) => {
    if (req.session.loggedin) next();
    else res.status(401).redirect("/?notloggedin");
})

router.get('/', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/dashboard.html");
})
  
router.get("/index.js", (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/index.js");
})

router.get('/dashboard.js', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/dashboard.js");
})

router.get('/royalties', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/royalties.html");
})

router.get('/royalties.js', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/royalties.js");
})

router.get('/payouts', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/payouts.html");
})

router.get('/payouts.js', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/payouts.js");
})

router.get('/sales', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/sales.html");
})

router.get('/sales.js', (req, res) => {
    res.sendFile(process.cwd() + "/dashboard/sales.js");
})

module.exports = router