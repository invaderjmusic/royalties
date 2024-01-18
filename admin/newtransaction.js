let users = []
let success = false;

async function getUsers() {
    let res = await fetch("/admin/getUsers");
    let resdata = await res.json();

    for (let i = 0; i < resdata.length; i++) {
        users.push(resdata[i].username)
    }
    
    if (document.readyState === 'complete') {
        onDataReady()
    }
    else {
        window.addEventListener("load", onDataReady);
    }
}
getUsers()

window.addEventListener("load", function (event) {
    document.getElementById("transactionform").addEventListener("submit", submitForm);
});

function onDataReady() {
    list = document.getElementById("payoutslist")
    for (let i = 0; i < users.length; i++) {
        div = document.createElement("div")
        div.className = "contributor"
        div.innerHTML = `
        <div class="fiftybox">
            <p class="contribname">${users[i]}</p>
        </div>
        <div class="fiftybox">
            <input type="number" name="contributor${i}" id="contributor${i}" step=".0001" required>
        </div>
        `
        list.appendChild(div);
    }
    list.style.display = "block"
}

async function submitForm(e) {
    e.preventDefault();
    if (success == true) return;

    if (datastore.totalerror) {
        datastore.totalerror = false;
        document.getElementById("totalerror").style.display = "none";
    }
    if (datastore.servererror) {
        datastore.servererror = false;
        document.getElementById("servererror").style.display = "none";
    }
    if (datastore.serveroffline) {
        datastore.serveroffline = false;
        document.getElementById("serveroffline").style.display = "none";
    }

    let withdrawal = Math.round(parseFloat(document.getElementById("withdrawal").value) * 10000);
    let data = { "date": document.getElementById("transactiondate").value, "withdrawal": withdrawal, "payouts": [] };
    let errors = []
    let cumulative_total = 0

    for (let i = 0; i < users.length; i++) {
            let username = users[i];
            let field = document.getElementById(`contributor${i.toString()}`);
            let payout = Math.round(parseFloat(field.value) * 10000);
            if (payout !== 0) {
                data.payouts.push({"name": username, "payout": payout});
                cumulative_total += payout
            }
    }

    if (withdrawal !== cumulative_total) {
        console.log(withdrawal, cumulative_total)
        errors.push("total")
    }


    if (errors.length > 0) {
        if (errors.includes("total")) {
            datastore.totalerror = true;
            document.getElementById("totalerror").style.display = "block";
        }
        return;
    }

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    console.log(data)

    let response, resdata;
    try {
        response = await fetch('/admin/addTransaction', options);
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
        success = true;
        document.getElementById("success").style.display = "block";
    }
    else {
        datastore.servererror = true;
        document.getElementById("servererror").style.display = "block";
    }
}