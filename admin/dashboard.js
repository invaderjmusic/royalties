let earnings = 0;

async function getData() {
    let res = await fetch("/admin/getAccountBalances");
    let resdata = await res.json();
    earnings = resdata.earnings;

    document.body.dispatchEvent(new Event("dataready"));
}
getData();

window.onload = function (event) {
    document.body.addEventListener("dataready", (e) => {
        let earningsFixed = (earnings / 10000).toFixed(4);
        document.getElementById("earnings").textContent = "$" + earningsFixed;
    })
}