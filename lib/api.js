const express = require('express')
const router = express.Router()

router.use((req, res, next) => {
  if (req.session.loggedin) next();
  else res.status(401).end();
})

router.get('/userInfo', (req, res) => {
  res.send({username: req.session.username, admin: req.session.admin});
})

module.exports = router