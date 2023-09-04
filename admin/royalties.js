let songs = [];
let currentPage = 0;
let songSelectString = `<option value="" disabled selected>Select a song</option>`;
let splitPie = null;

async function getData() {
    let res = await fetch("/admin/getSongList");
    let songList = await res.json();
    
    for (let i = 0; i < songList.length; i++) {
        songs.push({"name": songList[i]});
        songSelectString = songSelectString + `<option value="${songList[i]}">${songList[i]}</option>`
    }
    
    document.body.dispatchEvent(new Event("dataready"));
}
getData();

window.onload = function (event) {
    document.body.addEventListener("dataready", (e) => {
        document.getElementById("songselect").innerHTML = songSelectString;
        document.getElementById("status").textContent = "";
    })
}

async function loadRoyalties(pageNumber, loadSplits) {
    document.getElementById("status").textContent = "";
    document.getElementById("royaltyTable").style.display = "none";

    if (datastore.servererror) {
        datastore.servererror = false;
        document.getElementById("servererror").style.display = "none";
    }
    if (datastore.noroyalties) {
        datastore.noroyalties = false;
        document.getElementById("noroyalties").style.display = "none";
    }
    if (datastore.nomore) {
        datastore.nomore = false;
        document.getElementById("nomore").style.display = "none";
    }

    let select = document.getElementById("songselect");
    select.disabled = true;

    if (loadSplits) {
        let response, resdata;
        try {
            response = await fetch(`/admin/getSongSplits?song=${select.value}`);
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

        let piedata = []
        for (let i = 0; i < resdata.length; i++) {
            piedata.push({value: resdata[i].percentage, name: resdata[i].user[0] + ": " + resdata[i].percentage.toString() + "%", label: {show: false}});
        }

        let pieOption = {
            legend: {
                orient: 'vertical',
                left: 0,
                type: 'scroll',
                textStyle: {
                    color: '#fff'
                  }
              },
            series: [
                {
                    type: 'pie',
                    data: piedata,
                }
            ]
        };
        
        document.getElementById("infosection").style.display = "block";

        if (splitPie == null) splitPie = echarts.init(document.getElementById('piecontainer'));
        splitPie.setOption(pieOption);
    }

    let response2, resdata2;
    try {
        response2 = await fetch(`/admin/getFullRoyalties?song=${select.value}&page=${pageNumber.toString()}`);
        resdata2 = await response2.json();
    }
    catch (err) {
        console.log("An error occurred.")
        datastore.servererror = true;
        document.getElementById("servererror").style.display = "block";
        document.getElementById("status").textContent = "";
        select.disabled = false;
        return;
    }

    if (resdata2 == "") {
        if (pageNumber == 1) {
            datastore.noroyalties = true;
            document.getElementById("noroyalties").style.display = "block";
            document.getElementById("timecontrols").style.display = "none";
            document.getElementById("status").textContent = "";
        }
        else {
            datastore.nomore = true;
            document.getElementById("nomore").style.display = "block";
            document.getElementById("royaltyTable").style.display = "table";
            document.getElementById("status").textContent = "";
        }
    }
    else {
        let tbody = document.getElementById("royaltyBody");
        tbody.innerHTML = "";

        let nameList = document.getElementById("nameList");
        nameList.innerHTML = "";

        let sorted = resdata2//.sort(function (a,b) {
        //    let adate = new Date(a.date);
        //    let bdate = new Date(b.date);
        //    if (adate == bdate) return 0;
        //    else if (adate > bdate) return -1;
        //    else return 1;
        //});

        let orderNames = [];
        for (let i = 0; i < sorted[0].earnings.length; i++) {
            let td = document.createElement("td");
            td.textContent = sorted[0].earnings[i].name;
            nameList.appendChild(td);
            orderNames.push(sorted[0].earnings[i].name);
        }
        document.getElementById("earningsHeading").colSpan = orderNames.length;

        for (let i = 0; i < sorted.length; i++) {
            let tr = document.createElement("tr");

            let date = new Date(sorted[i].date);
            let month = date.toLocaleDateString("en-GB", {month: "long"});
            let year = sorted[i].date.split("-")[0];
            let td1 = document.createElement("td");
            td1.textContent = month + " " + year;
            tr.appendChild(td1);

            let dollarRoyalty = (sorted[i].amount / 10000).toFixed(4);
            let td2 = document.createElement("td");
            td2.textContent = "$" + dollarRoyalty;
            tr.appendChild(td2);

            for (let k = 0; k < orderNames.length; k++) {
                let earning = sorted[i].earnings.find(o => o.name == orderNames[k]);
                let dollarRoyalty = (earning.amount / 10000).toFixed(4);
                let td = document.createElement("td");
                td.textContent = "$" + dollarRoyalty;
                tr.appendChild(td);
            }

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

        document.getElementById("royaltyTable").style.display = "table";
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
