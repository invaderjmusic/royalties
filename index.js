require("dotenv").config();

// Third-party modules
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const app = express();
const http = require('http').Server(app);

// Libs
const users = require("./lib/users.js");
const api = require("./routes/api.js");
const dashboard = require("./routes/dashboard.js");
const admin = require("./routes/admin.js");
const signup = require("./routes/signup.js");
require("./lib/currency.js").setStartupExchangeRate();

let sessionOptions = {
    secret: process.env.COOKIESECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {}
}

http.listen(process.env.PORT || 80, () => {
    console.log("[HTTP] Listening on port " + (process.env.PORT || 80));
});

let https;

if (process.env.HTTPS == "TRUE") {
    const privateKey = fs.readFileSync(process.env.SSL_PRIVATEKEY_PATH, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
    };

    https = require('https').Server(credentials, app);
    https.listen(process.env.SSLPORT || 443, () => {
        console.log("[HTTPS] Listening on port " + (process.env.SSLPORT || 443));
    });

    sessionOptions.cookie.secure = true;
}


app.use(session(sessionOptions));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(function (req, res, next) {
    if (!req.secure && process.env.HTTPS == "TRUE") {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});

app.get("/", function(req, res) {
    if (req.session.loggedin) res.redirect("/dashboard");
    else res.sendFile(process.cwd() + "/public/index.html");
});

app.use("/fonts", express.static(process.cwd() + "/public/fonts"));
app.use("/.well-known", express.static(process.cwd() + "/public/.well-known"));
app.use("/favicon", express.static(process.cwd() + "/public/favicon"));
app.use("/assets", express.static(process.cwd() + "/public/assets"));

app.use("/api", api);
app.use("/dashboard", dashboard);
app.use("/admin", admin);
app.use("/signup", signup)

app.post("/login", async function (req, res) {
    if (req.body.username && req.body.password) {
        switch (await users.getUserRole(req.body.username, req.body.password)) {
            case "none":
                res.redirect("/?wrongdetails");
                break;
            case "admin":
                req.session.admin = true;
                req.session.loggedin = true;
                req.session.username = req.body.username;
                res.redirect("/dashboard")
                break;
            case "user":
                req.session.loggedin = true;
                req.session.username = req.body.username;
                res.redirect("/dashboard")
                break;
            default:
                res.status(500).end()
                console.error("[LOGIN] Error: reached the impossible default case on login.");
        }
    }
    else res.status(400).end();
});

app.get("/logout", function (req, res) {
    if (req.session.loggedin) {
		req.session.destroy(function() {
            res.redirect("/?loggedout");
        });
	}
    else res.redirect("/")
});

// 404 function, keep last
app.get('*', function(req, res){
    if (req.session.loggedin) {
        res.status(404).redirect("/dashboard?404")
    }
    else res.status(404).redirect("/");
});