let earnings = 0;
let payouts = 0;
let balance = 0;
let balancePounds = 0;
let primaryContact = "|";

async function getData() {
    let res = await fetch("/api/getUserBalances");
    let resdata = await res.json();
    earnings = resdata.earnings;
    payouts = resdata.payouts;
    balance = resdata.balance;
    balancePounds = resdata.balancePounds;

    let res2 = await fetch("/api/getPrimaryContact");
    let resdata2 = await res2.json();
    primaryContact = resdata2.primary_contact;

    document.body.dispatchEvent(new Event("dataready"));
}
getData();

window.onload = function (event) {
    if (window.location.search == "?404") {
        document.getElementById("404").style.display = "block";
    }

    document.body.addEventListener("dataready", (e) => {
        let earningsFixed = (earnings / 10000).toFixed(4);
        document.getElementById("earnings").textContent = "$" + earningsFixed;

        let payoutsFixed = (payouts / 10000).toFixed(4);
        document.getElementById("payouts").textContent = "$" + payoutsFixed;

        let balanceFixed = (balance / 10000).toFixed(4);
        document.getElementById("balance").textContent = "$" + balanceFixed;

        let balancePoundsFixed = (balancePounds / 10000).toFixed(4);
        document.getElementById("balancePounds").textContent = "£" + balancePoundsFixed;

        let contactArr = primaryContact.split("|");
        document.getElementById("modeOfContact").textContent = contactArr[0]
        document.getElementById("contactId").textContent = contactArr[1]
    })

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
}
