/**
 * Admin Creation Wizard
 * Run this file to create an admin user with your specified username and password from the CLI
 * Run this after configuring the Gel database in .env and installing dependencies from NPM
**/
import { green, yellow, red } from "chalk";
import { question } from 'readline-sync';

console.log("\n\r" + green("Royalties") + " - Admin Creation Wizard\n\r");
let username = question("Enter your new " + green("username") + ": ");

import { createClient } from "gel";
const client = createClient();
import { randomBytes } from "crypto";

let newKey = randomBytes(16).toString('hex');

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

        console.log("\n\rYour new " + yellow("admin account") + " is ready!\n\rTo enable it, run the site and visit " + red("/signup?key=" + newKey) + " to set your password\n\rYou may wish to set your contact information on the dashboard.");
    }
    catch (err) {
        console.log(red("An error occurred."))
        console.log(err)
    }
}

createAdmin();