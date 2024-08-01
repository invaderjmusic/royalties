let numArtists = 1;
let validArtists = [true];
let artistSelectString = `<option value="" disabled selected>Select a contributor</option>`;

async function getUsers() {
    let res = await fetch("/admin/getUsers");
    datastore.users = await res.json();

    for (let i = 0; i < datastore.users.length; i++) {
        artistSelectString = artistSelectString + `<option value="${datastore.users[i].username}">${datastore.users[i].username}</option>`
    }

    if (document.readyState === 'complete') {
        onDataReady()
    }
    else {
        window.addEventListener("load", onDataReady);
    }
}
getUsers()

async function submitForm(e) {
    e.preventDefault();

    if (datastore.dupeusererror) {
        datastore.dupeusererror = false;
        document.getElementById("dupeusererror").style.display = "none";
    }
    if (datastore.success) {
        datastore.success = false;
        document.getElementById("success").style.display = "none";
    }
    if (datastore.servererror) {
        datastore.servererror = false;
        document.getElementById("servererror").style.display = "none";
    }
    if (datastore.serveroffline) {
        datastore.serveroffline = false;
        document.getElementById("serveroffline").style.display = "none";
    }
    let erroritems = document.getElementsByClassName("error");
    for (let i = 0; i < erroritems.length; i++) {
        erroritems[i].className = "";
    }

    let data = { "date": document.getElementById("payoutdate").value };


    let payouts = [];
    let errors = [];

    let validIds = [];
    let names = [];

    for (let i = 0; i < validArtists.length; i++) {
        if (validArtists[i] == true) {
            validIds.push(i);
        }
    }

    for (let k = 0; k < validIds.length; k++) {
            let artistName = document.getElementById(`artistname${validIds[k].toString()}`).value;
            let payout = Math.round(parseFloat(document.getElementById(`payout${validIds[k].toString()}`).value) * 10000);
            if (artistName != "") {
                if (names.includes(artistName)) {
                    errors.push("dupeuser");
                    document.getElementById(`artistname${validIds[k].toString()}`).className = "error";
                }
                names.push(artistName);
                payouts.push({ "name": artistName, "amount": payout });
            }
    }


    if (errors.length > 0) {
        if (errors.includes("dupeuser")) {
            datastore.dupeusererror = true;
            document.getElementById("dupeusererror").style.display = "block";
        }
        return;
    }

    data.payouts = payouts;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    let response, resdata;
    try {
        response = await fetch('/admin/addSalePayouts', options);
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
        datastore.success = true;
        document.getElementById("success").style.display = "block";
    }
    else {
        datastore.servererror = true;
        document.getElementById("servererror").style.display = "block";
    }
};

window.addEventListener("load", function (event) {
    document.getElementById("payoutForm").addEventListener("submit", submitForm);
});

function onDataReady() {
    document.getElementById("artistname0").innerHTML = artistSelectString;
}

function addArtist(event) {
    if (event.target.className == "error") event.target.className = "";

    if (numArtists < datastore.users.length) {
        numArtists += 1;
        artistId = validArtists.length;
        validArtists.push(true);

        let contributor = document.createElement("div");
        contributor.className = "contributor";
        contributor.id = `artist${artistId}`
        contributor.innerHTML = `
        <div class="fourtyfivebox">
            <label for="artistname${artistId}">Contributor</label><br />
            <select name="artistname${artistId}" id="artistname${artistId}" onchange="addArtist(event)" required>
                ${artistSelectString}
            </select>
        </div>
        <div class="fourtyfivebox">
            <label for="payout${artistId}">Payout (£)</label><br />
            <input type="number" name="payout${artistId}" id="payout${artistId}" step=".01" required>
        </div>
        <div class="tenbox">
            <br />
            <button class="deletebtn fas" id="artist${artistId}" onclick="deleteArtist(event)"></button>
        </div>
        `

        document.getElementById("payouts").appendChild(contributor);
    }
}

function deleteArtist(event) {
    event.preventDefault()
    let artistId = event.target.id.split("artist")[1];
    if (numArtists > 1) {
        document.getElementById(`artist${artistId}`).remove();
        numArtists -= 1;
        validArtists[artistId] = false;
    }
}

function checkHighlight(element) {
    if (element.className == "error") element.className = "";
}
