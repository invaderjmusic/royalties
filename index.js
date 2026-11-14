// Third-party modules
import fs from "node:fs";
import { createServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import express from "express";
import session from "express-session";

const app = express();
const http = createServer(app);

// Libs
import * as currency from "./server/lib/currency.js";
import * as users from "./server/lib/users.js";
import admin from "./server/routes/admin.js";
import api from "./server/routes/api.js";
import dashboard from "./server/routes/dashboard.js";
import signup from "./server/routes/signup.js";

currency.setStartupExchangeRate();

let sessionOptions = {
    secret: import.meta.env.COOKIESECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {}
}

http.listen(import.meta.env.PORT || 80, () => {
    console.log("[HTTP] Listening on port " + (import.meta.env.PORT || 80));
});

let https;

if (import.meta.env.HTTPS === "TRUE") {
    const privateKey = fs.readFileSync(import.meta.env.SSL_PRIVATEKEY_PATH, 'utf8');
    const certificate = fs.readFileSync(import.meta.env.SSL_CERTIFICATE_PATH, 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
    };

    https = createHttpsServer(credentials, app);
    https.listen(import.meta.env.SSLPORT || 443, () => {
        console.log("[HTTPS] Listening on port " + (import.meta.env.SSLPORT || 443));
    });

    sessionOptions.cookie.secure = true;
}


app.use(session(sessionOptions));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(function (req, res, next) {
    if (!req.secure && import.meta.env.HTTPS === "TRUE") {
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