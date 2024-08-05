let accountBalances = []
let usersDetailed = []
let expanded = []

let exchangeRate = 0;

async function getData() {
    let res = await fetch("/admin/getAccountBalances");
    accountBalances = await res.json();

    let res2 = await fetch("/admin/getUsersDetailed");
    usersDetailed = await res2.json();

    if (document.readyState === 'complete') {
        onDataReady()
    }
    else {
        window.addEventListener("load", onDataReady);
    }

    let res3 = await fetch("/admin/getExchangeRate")
    let resdata3 = await res3.json();
    exchangeRate = resdata3.exchangeRate;
}
getData();

function onDataReady () {
    let earningsFixed = (accountBalances.earnings / 10000).toFixed(4);
    document.getElementById("earnings").textContent = "$" + earningsFixed;
    
    let balanceFixed = (accountBalances.balance / 10000).toFixed(4);
    document.getElementById("balance").textContent = "$" + balanceFixed;

    let balancePoundsFixed = (accountBalances.balancePounds / 10000).toFixed(4);
    document.getElementById("balancePounds").textContent = "£" + balancePoundsFixed;

    let salesFixed = (accountBalances.sales / 10000).toFixed(4);
    document.getElementById("sales").textContent = "£" + salesFixed;

    let salePayoutsFixed = (accountBalances.salePayouts / 10000).toFixed(4);
    document.getElementById("salePayouts").textContent = "£" + salePayoutsFixed;

    let holdingFixed = (accountBalances.holding / 10000).toFixed(4);
    document.getElementById("holding").textContent = "£" + holdingFixed;

    if ((balance / 10000) > 3) {
        document.getElementById("over3").style.display = "inline-block";
    }
    else {
        document.getElementById("under3").style.display = "inline-block";
    }

    userList = document.getElementById("userslist");

    for (let i = 0; i < usersDetailed.length; i++) {
        expanded.push(false)

        let variableCellContent = ""
        if (usersDetailed[i].details.signup_key !== null) {
            variableCellContent = `
                <h2 class="fieldheading">Sign-up URL</h2>
                <button class="signup_key" id="copyurl${i}" onclick="copySignupUrl(this)">${usersDetailed[i].details.signup_key.slice(0,14)}...</button>
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
                <h2 class="name">${usersDetailed[i].name}</h2>
                <button class="userexpand" id="userbutton${i}" onclick="toggleUserDetails(this)"><span class="fas" id="usericon${i}"></span>Full Details</button>
            </div>
            <div class="userrectangle">
                <h2 class="fieldheading">Pending Royalties</h2>
                <h2 class="value"><span>£${(usersDetailed[i].balancePounds / 10000).toFixed(4)}</span><span class="spacer"></span>$${(usersDetailed[i].balance / 10000).toFixed(4)}</h2>
            </div>
            <div class="usersquare">
                <h2 class="fieldheading">Pending Sales</h2>
                <h2 class="value">£${(usersDetailed[i].saleBalance / 10000).toFixed(4)}</h2>
            </div>
        </div>
        <div class="hidden" id="fullinfo${i}">
            <div class="squareContainer">
                <div class="userrectangle wordy namebox">
                    <h2 class="fieldheading" id="modeofcontact${i}"></h2>
                    <p id="primarycontact${i}"></p>
                </div>
                <div class="usersquare">
                    <h2 class="fieldheading">Total Royalties</h2>
                    <h2 class="value">$${(usersDetailed[i].earnings / 10000).toFixed(4)}</h2>
                </div>
                <div class="usersquare">
                    <h2 class="fieldheading">Total Sales</h2>
                    <h2 class="value">£${(usersDetailed[i].sales / 10000).toFixed(4)}</h2>
                </div>
            </div>
            <div class="squareContainer">
                <div class="userrectangle namebox">
                    ${variableCellContent}
                </div>
                <div class="usersquare">
                    <h2 class="fieldheading">Royalties Paid Out</h2>
                    <h2 class="value">$${(usersDetailed[i].payouts / 10000).toFixed(4)}</h2>
                </div>
                <div class="usersquare">
                    <h2 class="fieldheading">Sales Paid Out</h2>
                    <h2 class="value">£${(usersDetailed[i].salepayouts / 10000).toFixed(4)}</h2>
                </div>
            </div>
        </div>
        `
        userList.appendChild(div);

        contact = usersDetailed[i].details.primary_contact.split("|")

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
        await navigator.clipboard.writeText(window.location.protocol + "//" + window.location.host + "/signup?key=" + usersDetailed[id].details.signup_key);
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
        body: JSON.stringify({username: usersDetailed[id].name})
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

function convertCurrency() {
    let pounds = document.getElementById("pounds").value;
    if (pounds !== "") {
        let dollars = parseFloat(pounds) / exchangeRate
        document.getElementById("dollars").value = dollars.toFixed(4)
    }
}