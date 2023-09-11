let earnings = 0;
let payouts = 0;
let balance = 0;

async function getData() {
    let res = await fetch("/api/getUserBalances");
    let resdata = await res.json();
    earnings = resdata.earnings;
    payouts = resdata.payouts;
    balance = resdata.balance;

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
