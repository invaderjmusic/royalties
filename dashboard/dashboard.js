let earnings = 0;
let payouts = 0;
let balance = 0;
let balancePounds = 0;
let saleEarnings = 0;
let salePayouts =  0;
let saleBalance =  0;
let primaryContactArr = [];
let driveLink = "#"

async function getData() {
    let res = await fetch("/api/getUserBalances");
    let resdata = await res.json();
    earnings = resdata.earnings;
    payouts = resdata.payouts;
    balance = resdata.balance;
    balancePounds = resdata.balancePounds;
    saleEarnings = resdata.saleEarnings;
    salePayouts = resdata.salePayouts;
    saleBalance = resdata.saleBalance;

    let res2 = await fetch("/api/getPrimaryContact");
    let resdata2 = await res2.json();
    primaryContactArr = resdata2.primary_contact.split("|");

    let res3 = await fetch("/api/getDriveLink");
    let resdata3 = await res3.json();
    driveLink = resdata3.driveLink;

    if (document.readyState === 'complete') {
        onDataReady()
    }
    else {
        window.addEventListener("load", onDataReady);
    }
}
getData();

window.addEventListener("load", function (e) {
    if (window.location.search == "?404") {
        document.getElementById("404").style.display = "block";
    }

    // tooltip handling
    document.getElementById("eyecon").addEventListener("click", (e) => {
        document.getElementById("eyeconTooltip").style.visibility = "visible";
        document.getElementById("eyecon").style.color = "#ffcc00"
    })

    document.getElementById("eyecon").addEventListener("mouseenter", (e) => {
        document.getElementById("eyeconTooltip").style.visibility = "visible";
        document.getElementById("eyecon").style.color = "#ffcc00"
    })

    document.addEventListener("click", function (e) {
        if (!(e.target.id == "eyecon" || e.target.id == "eyeconTooltip")) {
            document.getElementById("eyeconTooltip").style.visibility = "hidden";
            document.getElementById("eyecon").style.color = "#ff6a00";
        }
    })

    document.getElementById("contactForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        document.getElementById("saveContact").disabled = true;

        if (datastore.servererror) {
            datastore.servererror = false;
            document.getElementById("servererror").style.display = "none";
        }
        if (datastore.serveroffline) {
            datastore.serveroffline = false;
            document.getElementById("serveroffline").style.display = "none";
        }

        let data = {mode: document.getElementById("newModeOfContact").value, id: document.getElementById("newContactId").value}

        if (JSON.stringify([data.mode, data.id]) !== JSON.stringify(primaryContactArr)) {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };

            let response, resdata;
            try {
                response = await fetch('/api/setPrimaryContact', options);
                resdata = await response.text();
            }
            catch (err) {
                console.log("A Network Error occurred.")
                datastore.serveroffline = true;
                document.getElementById("serveroffline").style.display = "block";
                return;
            }
            console.log(resdata);
            if (resdata == "success") {
                primaryContactArr = [data.mode, data.id];
                document.getElementById("modeOfContact").textContent = primaryContactArr[0]
                document.getElementById("contactId").textContent = primaryContactArr[1]
            }
            else {
                datastore.servererror = true;
                document.getElementById("servererror").style.display = "block";
            }
        }

        document.getElementById("saveContact").style.display = "none";

        document.getElementById("newModeOfContact").style.display = "none";
        document.getElementById("modeOfContact").style.display = "inline";
        
        document.getElementById("newContactId").style.display = "none";
        document.getElementById("contactId").style.display = "inline";

        document.getElementById("changeContact").style.display = "block";
        document.getElementById("saveContact").disabled = false;
    })

    document.getElementById("passwordForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        document.getElementById("submitPassword").disabled = true;

        if (datastore.servererror) {
            datastore.servererror = false;
            document.getElementById("servererror").style.display = "none";
        }
        if (datastore.serveroffline) {
            datastore.serveroffline = false;
            document.getElementById("serveroffline").style.display = "none";
        }

        document.getElementById("status").style.display = "none";

        let data = {oldPassword: document.getElementById("oldPassword").value, newPassword: document.getElementById("newPassword").value}

        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        let response, resdata;
        try {
            response = await fetch('/api/changePassword', options);
            resdata = await response.text();
        }
        catch (err) {

            console.log("A Network Error occurred.")
            datastore.serveroffline = true;
            document.getElementById("serveroffline").style.display = "block";
            return;
        }
        console.log(resdata);
        if (resdata == "success") {
            let status = document.getElementById("status");
            status.innerHTML = '<span class="fas" style="color: #00915c"></span>Password updated.';
            status.style.display = "block";
        }
        else if (resdata == "badlogin") {
            let status = document.getElementById("status");
            status.innerHTML = '<span class="fas" style="color: red"></span>Your Old Password (current password) is incorrect.'
            status.style.display = "block";
        }
        else {
            datastore.servererror = true;
            document.getElementById("servererror").style.display = "block";
        }

        document.getElementById("submitPassword").disabled = false;
    })

    document.getElementById("passwordForm").addEventListener("reset", (e) => {
        document.getElementById("passwordForm").style.display = "none";
        document.getElementById("changePassword").style.display = "block";
    })
});

function onDataReady() {
    let earningsFixed = (earnings / 10000).toFixed(4);
    document.getElementById("earnings").textContent = "$" + earningsFixed;
    let payoutsFixed = (payouts / 10000).toFixed(4);
    document.getElementById("payouts").textContent = "$" + payoutsFixed;
    let balanceFixed = (balance / 10000).toFixed(4);
    document.getElementById("balance").textContent = "$" + balanceFixed;
    let balancePoundsFixed = (balancePounds / 10000).toFixed(4);
    document.getElementById("balancePounds").textContent = "£" + balancePoundsFixed;

    let saleEarningsFixed = (saleEarnings / 10000).toFixed(4);
    document.getElementById("saleEarnings").textContent = "£" + saleEarningsFixed;
    let salePayoutsFixed = (salePayouts / 10000).toFixed(4);
    document.getElementById("salePayouts").textContent = "£" + salePayoutsFixed;
    let saleBalanceFixed = (saleBalance / 10000).toFixed(4);
    document.getElementById("saleBalance").textContent = "£" + saleBalanceFixed;

    document.getElementById("modeOfContact").textContent = primaryContactArr[0]
    document.getElementById("contactId").textContent = primaryContactArr[1]
    document.getElementById("driveLink").href = driveLink;
}

function changeContact() {
    document.getElementById("changeContact").style.display = "none";
    document.getElementById("saveContact").style.display = "block";

    document.getElementById("modeOfContact").style.display = "none";
    let mode = document.getElementById("newModeOfContact");
    mode.value = primaryContactArr[0];
    mode.style.display = "inline-block";

    document.getElementById("contactId").style.display = "none";
    let id = document.getElementById("newContactId");
    id.value = primaryContactArr[1];
    id.style.display = "inline-block";
}

function changePassword() {
    document.getElementById("changePassword").style.display = "none";
    document.getElementById("passwordForm").style.display = "block";
}