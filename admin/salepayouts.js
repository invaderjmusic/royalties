let resdata;
let page = 1;

async function getData() {
    let error = false;
    try {
        let response = await fetch(`/admin/listSalePayouts?page=1`);
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
    if (resdata.length == 0) {
        document.getElementById("nomore").style.display = "block";
        document.getElementById("forwardbutton").disabled = true;
        datastore.nomore = true;
        return;
    }

    let t = document.getElementById("payoutsTable");
    t.style.display = "none";
    let tbody = document.getElementById("payoutsBody");
    tbody.innerHTML = "";

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

        let td2 = document.createElement("td");
        td2.textContent = resdata[i].username;
        tr.appendChild(td2);

        let poundPayout = (resdata[i].amount / 10000).toFixed(4);
        let td3 = document.createElement("td");
        td3.textContent = "£" + poundPayout;
        tr.appendChild(td3);

        tbody.appendChild(tr);
    }

    document.getElementById("payoutsTable").style.display = "table";

    let startdate = new Date(resdata[resdata.length - 1].date);
    let startmonth = startdate.toLocaleDateString("en-GB", {month: "long"});
    let startyear = resdata[resdata.length - 1].date.split("-")[0];

    let enddate = new Date(resdata[0].date);
    let endmonth = enddate.toLocaleDateString("en-GB", {month: "long"});
    let endyear = resdata[0].date.split("-")[0];

    document.getElementById("durationtext").innerHTML = `From ${startmonth} ${startyear}<br />to ${endmonth} ${endyear}`;

    document.getElementById("forwardbutton").disabled = resdata.length == 12 ? false : true;
    document.getElementById("backbutton").disabled = page > 1 ? false : true;
}

function showServerError() {
    document.getElementById("servererror").style.display = "block";
}

async function pageForward() {
    page++; 
    loadNewData()
}

async function pageBackward() {
    if (page > 1) {
        page--;
        loadNewData()
    }
}

async function loadNewData() {
    if (datastore.nomore) {
        datastore.nomore = false;
        document.getElementById("nomore").style.display = "none";
    }
    try {
        let response = await fetch(`/admin/listSalePayouts?page=${page.toString()}`);
        resdata = await response.json();
        parseResdata();
    }
    catch (err) {
        console.log("An error occurred." + err)
        showServerError()
    }
}