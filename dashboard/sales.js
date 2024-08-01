let currentPage = 0;
let productSelectString = `<option value="" disabled selected>Select a product</option>`;

async function getData() {
    let res = await fetch("/api/getProductList");
    let productList = await res.json();
    
    for (let i = 0; i < productList.length; i++) {
        productSelectString = productSelectString + `<option value="${productList[i].url}">${productList[i].name}</option>`
    }
    
    if (document.readyState === 'complete') {
        onDataReady()
    }
    else {
        window.addEventListener("load", onDataReady);
    }
}
getData();

function onDataReady() {
    document.getElementById("productselect").innerHTML = productSelectString;
    document.getElementById("status").textContent = "";
}

async function loadSales(pageNumber, loadSplit) {
    document.getElementById("status").textContent = "";
    document.getElementById("productTable").style.display = "none";

    if (datastore.servererror) {
        datastore.servererror = false;
        document.getElementById("servererror").style.display = "none";
    }
    if (datastore.nosales) {
        datastore.nosales = false;
        document.getElementById("nosales").style.display = "none";
    }
    if (datastore.nomore) {
        datastore.nomore = false;
        document.getElementById("nomore").style.display = "none";
    }

    let select = document.getElementById("productselect");
    select.disabled = true;

    if (loadSplit) {
        let response, resdata;
        try {
            response = await fetch(`/api/getProductInfo?product=${select.value}`);
            resdata = await response.json();
        }
        catch (err) {
            console.log("An error occurred.")
            datastore.servererror = true;
            document.getElementById("servererror").style.display = "block";
            document.getElementById("status").textContent = "";
            select.disabled = false;
            return;
        }

        document.getElementById("split").textContent = resdata.split[0].percentage.toString() + "%"
        document.getElementById("totalEarning").textContent = "£" + (resdata.totalEarning / 10000).toFixed(4)

        document.getElementById("infosection").style.display = "block";
    }

    let response2, resdata2;
    try {
        response2 = await fetch(`/api/getProductSales?product=${select.value}&page=${pageNumber.toString()}`);
        resdata2 = await response2.json();
    }
    catch (err) {
        console.log("An error occurred." + err)
        datastore.servererror = true;
        document.getElementById("servererror").style.display = "block";
        document.getElementById("status").textContent = "";
        select.disabled = false;
        return;
    }

    if (resdata2 == "") {
        if (pageNumber == 1) {
            datastore.nosales = true;
            document.getElementById("nosales").style.display = "block";
            document.getElementById("timecontrols").style.display = "none";
            document.getElementById("status").textContent = "";
        }
        else {
            datastore.nomore = true;
            document.getElementById("nomore").style.display = "block";
            document.getElementById("productTable").style.display = "table";
            document.getElementById("status").textContent = "";
        }
    }
    else {
        let tbody = document.getElementById("productBody");
        tbody.innerHTML = "";

        let sorted = resdata2//.sort(function (a,b) {
        //    let adate = new Date(a.date);
        //    let bdate = new Date(b.date);
        //    if (adate == bdate) return 0;
        //    else if (adate > bdate) return -1;
        //    else return 1;
        //});

        for (let i = 0; i < sorted.length; i++) {
            let tr = document.createElement("tr");

            let date = new Date(sorted[i].date);
            let month = date.toLocaleDateString("en-GB", {month: "long"});
            let year = sorted[i].date.split("-")[0];
            let td1 = document.createElement("td");
            td1.textContent = month + " " + year;
            tr.appendChild(td1);

            let td2 = document.createElement("td");
            td2.textContent = sorted[i].count;
            tr.appendChild(td2);

            let poundRoyalty = (sorted[i].amount / 10000).toFixed(4);
            let td3 = document.createElement("td");
            td3.textContent = "£" + poundRoyalty;
            tr.appendChild(td3);

            let dollarEarning = (sorted[i].earnings[0].amount / 10000).toFixed(4);
            let td4 = document.createElement("td");
            td4.textContent = "£" + dollarEarning;
            tr.appendChild(td4);

            tbody.appendChild(tr);
        }

        let startdate = new Date(sorted[sorted.length - 1].date);
        let startmonth = startdate.toLocaleDateString("en-GB", {month: "long"});
        let startyear = sorted[sorted.length - 1].date.split("-")[0];

        let enddate = new Date(sorted[0].date);
        let endmonth = enddate.toLocaleDateString("en-GB", {month: "long"});
        let endyear = sorted[0].date.split("-")[0];

        document.getElementById("durationtext").innerHTML = `From ${startmonth} ${startyear}<br />to ${endmonth} ${endyear}`;
        document.getElementById("timecontrols").style.display = "block";

        currentPage = pageNumber;

        document.getElementById("forwardbutton").disabled = sorted.length == 12 ? false : true;
        document.getElementById("backbutton").disabled = currentPage > 1 ? false : true;

        document.getElementById("productTable").style.display = "table";
        document.getElementById("status").textContent = "";
    }

    select.disabled = false;
}

function pageForward() {
    loadRoyalties(currentPage + 1, false)
}

function pageBackward() {
    loadRoyalties(currentPage - 1, false)
}
