let resdata;

async function getData() {
    let response;
    let error = false;
    try {
        response = await fetch(`/api/listUserPayouts`);
        resdata = await response.json();
    }
    catch (err) {
        console.log("An error occurred." + err)
        error = true;
    }

    if (document.readyState === 'complete') {
        error == false ? parseResdata() : showServerError()
    }
    else {
        window.addEventListener("load", error == false ? parseResdata : showServerError);
    }
}

getData();

function parseResdata() {
    let tbody = document.getElementById("transactionBody");

    for (let i = 0; i < resdata.length; i++) {
        let tr = document.createElement("tr");

        let date = new Date(resdata[i].date);
        let monthyear = date.toLocaleDateString("en-GB", {month: "long", year: "numeric"});
        let day = "";
        switch (date.getDate()) {
            case 1:
                day = "1st "
                break;
            case 2:
                day = "2nd "
                break;
            case 3:
                day = "3rd "
                break;  
            default:
                day = date.getDate().toString()  + "th "
        }
        let td1 = document.createElement("td");
        td1.textContent = day + monthyear;
        tr.appendChild(td1);

        let dollarWithdrawal = (resdata[i].withdrawal / 10000).toFixed(4);
        let td2 = document.createElement("td");
        td2.textContent = "$" + dollarWithdrawal;
        tr.appendChild(td2);

        let td3 = document.createElement("td");
        if (resdata[i].myPayout[0]) {
            let dollarPayout = (resdata[i].myPayout[0].amount / 10000).toFixed(4);
            td3.textContent = "$" + dollarPayout;
        }
        else {
            td3.textContent = "$0"
        }
        tr.appendChild(td3);

        tbody.appendChild(tr);
    }

    document.getElementById("transactionTable").style.display = "table";
}

function showServerError() {
    document.getElementById("servererror").style.display = "block";
}