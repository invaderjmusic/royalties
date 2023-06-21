// Test of the password storage process. 
// Usage: node dummysignup.js <username> <password>

let username = process.argv[2]
let password = process.argv[3]

require("dotenv").config()
const crypto = require("crypto");
const { addUserPassword } = require("./lib/database.js");

let salt = crypto.randomBytes(32).toString('hex');
let hash = crypto.createHash("sha512").update(salt + password).digest('hex');
addUserPassword(username, salt, hash);
