let releases = [];
let mode = "";
let dateArr = [];
let dateString = "";
let success = false;

async function getReleases() {
    let res = await fetch("/admin/getPendingRoyalties");
    let resdata = await res.json();
    mode = resdata.type;
    if (mode == "none") return document.body.dispatchEvent(new Event("dataready"));

    releases = resdata.releases;
    dateArr = resdata.date;
    let dateObj = new Date(dateArr[0], dateArr[1] - 1);
    dateString = dateObj.toLocaleString('en-GB', {month: "long"}) + " " + dateArr[0].toString();
    
    document.body.dispatchEvent(new Event("dataready"));
}
getReleases();

async function submitForm(e) {
    e.preventDefault();
    if (success == true) return;

    if (datastore.zeroerror) {
        datastore.zeroerror = false;
        document.getElementById("zeroerror").style.display = "none";
    }
    if (datastore.servererror) {
        datastore.servererror = false;
        document.getElementById("servererror").style.display = "none";
    }
    if (datastore.serveroffline) {
        datastore.serveroffline = false;
        document.getElementById("serveroffline").style.display = "none";
    }

    let data = { "date": dateArr, "royalties": [] };
    let errors = []

    for (let i = 0; i < releases.length; i++) {
        for (let k = 0; k < releases[i].songs.length; k++) {
            let songName = releases[i].songs[k].name;
            let field = document.getElementById(`release${i.toString()}song${k.toString()}`);
            let royalty = Math.round(parseFloat(field.value) * 10000);
            if (royalty == 0) {
                errors.push("zero");
                field.className = "error"
            }
            else {
                data.royalties.push({"name": songName, "royalty": royalty});
            }
        }
    }

    if (errors.length > 0) {
        if (errors.includes("zero")) {
            datastore.zeroerror = true;
            document.getElementById("zeroerror").style.display = "block";
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

    let response, resdata;
    try {
        response = await fetch('/admin/addRoyalties', options);
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

window.onload = function (event) {
    document.getElementById("royaltyform").addEventListener("submit", submitForm);

    document.body.addEventListener("dataready", (e) => {
        document.getElementById("loading").style.display = "none";
        if (mode == "none") {
            document.getElementById("noroyalties").style.display = "block";
            document.getElementById("submitbtn").style.display = "none";
            return;
        }
        else if (mode == "loading") {
            let message = document.getElementById("doroyalties");
            message.textContent = "Database Loading Mode. Input the royalties from " + dateString;
            message.style.display = "block";
        }
        else if (mode == "latest") {
            let message = document.getElementById("doroyalties");
            message.textContent = "Input the royalties for " + dateString;
            message.style.display = "block";
        }

        for (let i = 0; i < releases.length; i++) {
            let songString = ""
            for (let k = 0; k < releases[i].songs.length; k++) {
                songString = songString + `
                <div class="song">
                    <div class="fiftybox">
                        <p class="songname">${releases[i].songs[k].name}</p>
                    </div>
                    <div class="fiftybox">
                        <label for="release${i.toString()}song${k.toString()}">Royalty ($)</label><br />
                        <input type="number" name="release${i.toString()}song${k.toString()}" id="release${i.toString()}song${k.toString()}" onchange="checkHighlight(this)" step=".01" required>
                    </div>
                </div>
                `
            }
            let release = document.createElement("div");
            release.className = "release";
            release.innerHTML = `
            <h2 class="releasename">${releases[i].name}</h2>
                ${songString}
            </div>
            `
            document.getElementById("releases").appendChild(release);
        }
    })
};

function checkHighlight(element) {
    if (element.className == "error") element.className = "";
}
