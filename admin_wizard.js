/**
 * Admin Creation Wizard
 * Run this file to create an admin user with your specified username and password from the CLI
 * Run this after configuring the EdgeDB database in .env and installing dependencies from NPM
**/
require("dotenv").config()
const chalk = require("chalk");
const readline = require('readline-sync');

console.log("\n\r" + chalk.green("Royalties") + " - Admin Creation Wizard\n\r");
let username = readline.question("Enter your new " + chalk.green("username") + ": ");

const edgedb = require("edgedb");
const client = edgedb.createClient();
const crypto = require("crypto");

let newKey = crypto.randomBytes(16).toString('hex');

async function createAdmin() {
    try {
        await client.execute(`
        insert User {
            username := <str>$name,
            primary_contact := "email|unset",
            is_admin := true,
            password_salt := <str>"",
            password_hash := <str>"",
            signup_key := <str>$key
        }
        `, { name: username, key: newKey });

        console.log("\n\rYour new " + chalk.yellow("admin account") + " is ready!\n\rTo enable it, run the site and visit " + chalk.red("/signup?key=" + newKey) + " to set your password\n\rYou may wish to set your contact information on the dashboard.");
    }
    catch (err) {
        console.log(chalk.red("An error occurred."))
        console.log(err)
    }
}

createAdmin();