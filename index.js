require("dotenv").config();

const fs = require("fs");
const express = require("express");
const session = require("express-session");
const app = express();
const http = require('http').Server(app);

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
    const ca = fs.readFileSync(process.env.SSL_CA_PATH, 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    https = require('https').Server(credentials, app);
    https.listen(443, () => {
        console.log("[HTTPS] Listening on port 443");
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
    res.sendFile(process.cwd() + "/public/index.html")
});

app.use("/fonts", express.static(process.cwd() + "/public/fonts"));

app.post("/login", function (req, res) {
    if (req.body.username && req.body.password) {
        switch (getUserRole(req.body.username, req.body.password)) {
            case "none":
                res.redirect("/?wrongdetails");
                break;
            case "admin":
                req.session.admin = true;
            case "user":
                req.session.loggedin = true;
                req.session.username = req.body.username;
                res.redirect("/dashboard")
                break;
            default:
                res.status(500).end()
                console.error("[LOGIN] Error: reached the impossible default case on login.")
        }
    }
    else res.status(400).end()
});

app.get("/logout", function (req, res) {
    if (req.session.loggedin) {
		req.session.destroy(function() {
            res.redirect("/?loggedout");
        });
	}
    else res.redirect("/")
});

app.get("/dashboard", function (req, res) {
    if (req.session.loggedin) {
        let role = req.session.admin ? "admin " : "user "
		res.send('Welcome back, ' + role + req.session.username + '!');
	} else {
		res.redirect("/?notloggedin")
	}
})

// 404 function, keep last
app.get('*', function(req, res){
    res.status(404).redirect("/dashboard")
 });


// dummy login checker for testing purposes
function getUserRole(username, password) {
    if (username == "mousedroid" && password == "testing") {
        return "user";
    }
    else return "none";
}