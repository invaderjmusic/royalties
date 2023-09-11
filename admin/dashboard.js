let earnings = 0;
let balance = 0;
let balancePounds = 0;

async function getData() {
    let res = await fetch("/admin/getAccountBalances");
    let resdata = await res.json();
    earnings = resdata.earnings;
    balance = resdata.balance;
    balancePounds = resdata.balancePounds;

    document.body.dispatchEvent(new Event("dataready"));
}
getData();

window.onload = function (event) {
    document.body.addEventListener("dataready", (e) => {
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
    })
}