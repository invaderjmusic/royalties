let songs = []
let songSelectString = `<option value="" disabled selected>Select a song</option>`;

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

async function loadRoyalties() {
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

    let select = document.getElementById("songselect");
    select.disabled = true;

    let response, resdata;
    try {
        response = await fetch(`/admin/getFullRoyalties?song=${select.value}&page=1`);
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

    if (resdata == "") {
        datastore.noroyalties = true;
        document.getElementById("noroyalties").style.display = "block";
        document.getElementById("status").textContent = "";
    }
    else {
        let tbody = document.getElementById("royaltyBody");
        tbody.innerHTML = "";

        let nameList = document.getElementById("nameList");
        nameList.innerHTML = "";

        let sorted = resdata//.sort(function (a,b) {
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
        document.getElementById("royaltyTable").style.display = "table";
        document.getElementById("status").textContent = "";
    }

    select.disabled = false;
}