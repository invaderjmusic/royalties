let earnings = 0;
let balance = 0;
let balancePounds = 0;

let users_detailed = []
let expanded = []

async function getData() {
    let res = await fetch("/admin/getAccountBalances");
    let resdata = await res.json();
    earnings = resdata.earnings;
    balance = resdata.balance;
    balancePounds = resdata.balancePounds;

    let res2 = await fetch("/admin/getUsersDetailed");
    users_detailed = await res2.json();

    if (document.readyState === 'complete') {
        onDataReady()
    }
    else {
        window.addEventListener("load", onDataReady);
    }
}
getData();

function onDataReady () {
    let earningsFixed = (earnings / 10000).toFixed(4);
    document.getElementById("earnings").textContent = "$" + earningsFixed;
    
    let balanceFixed = (balance / 10000).toFixed(4);
    document.getElementById("balance").textContent = "$" + balanceFixed;

    let balancePoundsFixed = (balancePounds / 10000).toFixed(4);
    document.getElementById("balancePounds").textContent = "£" + balancePoundsFixed;

    if ((balance / 10000) > 3) {
        document.getElementById("over3").style.display = "inline-block";
    }
    else {
        document.getElementById("under3").style.display = "inline-block";
    }

    userList = document.getElementById("userslist");

    for (let i = 0; i < users_detailed.length; i++) {
        expanded.push(false)

        let variableCellContent = ""
        if (users_detailed[i].details.signup_key !== null) {
            variableCellContent = `
                <h2 class="fieldheading">Sign-up URL</h2>
                <button class="signup_key" id="copyurl${i}" onclick="copySignupUrl(this)">${users_detailed[i].details.signup_key.slice(0,14)}...</button>
                <p class="copied" id="copiedlabel${i}">Copied <span class="fas"></span></p>
            `
        }
        else {
            variableCellContent = `
            <button class="resetbutton" id="resetpass${i}" onclick="resetPassword(this)">Reset Password</button>
            <p class="copied" id="copiedlabel${i}"></p>
            `
        }

        div = document.createElement("div")
        div.className = "userbox"
        div.innerHTML = `
        <div class="squareContainer">
            <div class="usersquare namebox">
                <h2 class="name">${users_detailed[i].name}</h2>
                <button class="userexpand" id="userbutton${i}" onclick="toggleUserDetails(this)"><span class="fas" id="usericon${i}"></span>Full Details</button>
            </div>
            <div class="usersquare">
                <h2 class="fieldheading">Lifetime Earnings</h2>
                <h2 class="value">$${(users_detailed[i].earnings / 10000).toFixed(4)}</h2>
            </div>
            <div class="userrectangle">
                <h2 class="fieldheading">Pending Balance</h2>
                <h2 class="value"><span>$${(users_detailed[i].balance / 10000).toFixed(4)}</span><span class="spacer"></span>£${(users_detailed[i].balancePounds / 10000).toFixed(4)}</h2>
            </div>
        </div>
            <div class="hidden squareContainer" id="fullinfo${i}">
                <div class="usersquare namebox">
                    ${variableCellContent}
                </div>
                <div class="usersquare">
                    <h2 class="fieldheading">Total Paid Out</h2>
                    <h2 class="value">$${(users_detailed[i].payouts / 10000).toFixed(4)}</h2>
                </div>
                <div class="userrectangle wordy">
                    <h2 class="fieldheading" id="modeofcontact${i}"></h2>
                    <p id="primarycontact${i}"></p>
                </div>
            </div>
        `
        userList.appendChild(div);

        contact = users_detailed[i].details.primary_contact.split("|")

        document.getElementById(`modeofcontact${i}`).textContent = contact[0].slice(0, 1).toUpperCase() + contact[0].slice(1) + ":"
        document.getElementById(`primarycontact${i}`).textContent = contact[1]
    }
    userList.style.display = "block"
}

function toggleUserDetails(caller) {
    id = parseInt(caller.id.split("userbutton")[1])
    if (expanded[id] == false) {
        document.getElementById("fullinfo" + id.toString()).style.display = "block"
        caller.innerHTML = '<span class="fas" id="usericon0"></span>Collapse'
        expanded[id] = true;
    }
    else {
        document.getElementById("fullinfo" + id.toString()).style.display = "none"
        caller.innerHTML = '<span class="fas" id="usericon0"></span>Full Details'
        expanded[id] = false;
    }
}

async function copySignupUrl(caller) {
    id = parseInt(caller.id.split("copyurl")[1])
    try {
        await navigator.clipboard.writeText(window.location.protocol + "//" + window.location.host + "/signup?key=" + users_detailed[id].details.signup_key);
        document.getElementById("copiedlabel" + id.toString()).style.display = "block"
      } catch (err) {
        console.error('Failed to copy URL: ', err);
      }
}

async function resetPassword(caller) {
    id = parseInt(caller.id.split("resetpass")[1])
    label = document.getElementById("copiedlabel" + id.toString())
    label.innerHTML = '<span class="fas"></span>'
    label.style.display = "block"

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: users_detailed[id].name})
    };

    let response, resdata;
    try {
        response = await fetch('/admin/resetUserPassword', options);
        resdata = await response.text();
        await navigator.clipboard.writeText(window.location.protocol + "//" + window.location.host + "/signup/reset?key=" + resdata);
        label.innerHTML = 'Reset URL Copied <span class="fas"></span>'
    }
    catch (err) {
        console.log(err);
        label.innerHTML = "An error occurred."
    }
}