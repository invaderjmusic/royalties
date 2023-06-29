let form;
let songs = { 0: [true] };
let counter = 0;
let artistSelectString = `<option value="" disabled selected>Select a contributor</option>`;
let numContributors = 0

async function submitForm(e) {
    e.preventDefault();

    if (datastore.percenterror) {
        datastore.percenterror = false;
        document.getElementById("percenterror").style.display = "none";
    }
    if (datastore.dupeusererror) {
        datastore.dupeusererror = false;
        document.getElementById("dupeusererror").style.display = "none";
    }
    let erroritems = document.getElementsByClassName("error");
    for (let i = 0; i < erroritems.length; i++) {
        erroritems[i].className = "";
    }

    let data = { "name": document.getElementById("releasename").value, "release_date": document.getElementById("releasedate").value };

    let songdata = [];
    let errors = [];

    for (let index in songs) {
        let indexString = index.toString()
        let songName = document.getElementById(`songname${indexString}`).value;
        let contributors = [];
        let names = []
        let splits = [];
        for (let k = 0; k < songs[index].length; k++) {
            if (songs[index][k] == true) {
                let artistName = document.getElementById(`song${indexString}artistname${k.toString()}`).value;
                let split = parseInt(document.getElementById(`song${indexString}split${k.toString()}`).value);
                if (artistName != "") {
                    if (names.includes(artistName)) {
                        errors.push("dupeuser");
                        document.getElementById(`song${indexString}artistname${k.toString()}`).className = "error";
                    }
                    names.push(artistName);
                    splits.push(split);
                    contributors.push({ "name": artistName, "percentage": split });
                }
            }
        }

        let sum = splits.reduce((partialSum, a) => partialSum + a);
        if (sum != 100) {
            errors.push("percent")
            for (let k = 0; k < songs[index].length; k++) {
                if (songs[index][k] == true) {
                    document.getElementById(`song${indexString}split${k.toString()}`).className = "error";
                }
            }
        }

        songdata.push({ "name": songName, "contributors": contributors });
    }

    if (errors.length > 0) {
        if (errors.includes("percent")) {
            datastore.percenterror = true;
            document.getElementById("percenterror").style.display = "block";
        }
        if (errors.includes("dupeuser")) {
            datastore.dupeusererror = true;
            document.getElementById("dupeusererror").style.display = "block";
        }
        return;
    }

    data.songs = songdata;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    let response = await fetch('/admin/addRelease', options);
    let resdata = await response.text();
    console.log(resdata)
};

window.onload = function (event) {
    form = document.getElementById("releaseform")
    form.addEventListener("submit", submitForm);

    document.body.addEventListener("dataready", (e) => {
        for (let i = 0; i < datastore.users.length; i++) {
            artistSelectString = artistSelectString + `<option value="${datastore.users[i].username}">${datastore.users[i].username}</option>`
        }
        document.getElementById("song0artistname0").innerHTML = artistSelectString;
        numContributors = datastore.users.length;
    })
};

function addSong() {
    counter++;
    let songIndex = counter;
    songs[songIndex] = [true];
    songIndexString = songIndex.toString();

    let song = document.createElement("div");
    song.className = "song";
    song.id = "song" + songIndexString;

    song.innerHTML = `
    <div class="vertical">
        <button class="deletebtn fas" id="deletesong${songIndexString}" onclick="deleteSong(event)"></button>
    </div>
    <div class="songinputs" id="songinputs${songIndexString}">
        <label for="songname${songIndexString}">Song Name</label><br />
        <input type="text" name="songname${songIndexString}" id="songname${songIndexString}" required>
        <br />
        <div class="contributor" id="song${songIndexString}artist0">
            <div class="fourtyfivebox">
                <label for="song${songIndexString}artistname0">Contributor</label><br />
                <select name="song${songIndexString}artistname0" id="song${songIndexString}artistname0" onchange="addArtist(event)" required>
                    ${artistSelectString}
                </select>
            </div>
            <div class="fourtyfivebox">
                <label for="song${songIndexString}split0">Split (%)</label><br />
                <input type="number" name="song${songIndexString}split0" id="song${songIndexString}split0" min="1" max="100" onchange="checkHighlight(this)" required>
            </div>
            <div class="tenbox">
                <br />
                <button class="deletebtn fas" id="deletesong${songIndexString}artist0" onclick="deleteArtist(event)"></button>
            </div>
        </div>
    </div>
    `;

    document.getElementById("songs").appendChild(song);
}

function deleteSong(event) {
    event.preventDefault()
    if (Object.keys(songs).length > 1) {
        let songIndex = event.target.id.split("deletesong")[1]
        document.getElementById("song" + songIndex).remove()
        delete songs[parseInt(songIndex)];
    }
}

function addArtist(event) {
    if (event.target.className == "error") event.target.className = "";
    let songid = event.target.id.split("song")[1].split("artist")[0];
    let songint = parseInt(songid);
    if (songs[parseInt(songint)].filter(item => item == true).length < numContributors) {
        let artistid = songs[songint].length.toString();
        songs[songint].push(true);

        let contributor = document.createElement("div");
        contributor.className = "contributor";
        contributor.id = `song${songid}artist${artistid}`
        contributor.innerHTML = `
        <div class="fourtyfivebox">
            <label for="song${songid}artistname${artistid}">Contributor</label><br />
            <select name="song${songid}artistname${artistid}" id="song${songid}artistname${artistid}" onchange="addArtist(event)" required>
                ${artistSelectString}
            </select>
        </div>
        <div class="fourtyfivebox">
            <label for="song${songid}split${artistid}">Split (%)</label><br />
            <input type="number" name="song${songid}split${artistid}" id="song${songid}split${artistid}" min="1" max="100" onchange="checkHighlight(this)" required>
        </div>
        <div class="tenbox">
            <br />
            <button class="deletebtn fas" id="deletesong${songid}artist${artistid}" onclick="deleteArtist(event)"></button>
        </div>
        `

        document.getElementById("songinputs" + songid).appendChild(contributor);
    }
}

function deleteArtist(event) {
    event.preventDefault()
    let array = event.target.id.split("deletesong")[1].split("artist");
    let songIndex = array[0];
    let artistIndex = array[1];
    if (songs[parseInt(songIndex)].filter(item => item == true).length > 1) {
        document.getElementById(`song${songIndex}artist${artistIndex}`).remove();
        songs[parseInt(songIndex)][parseInt(artistIndex)] = false;
    }
}

function checkHighlight(element) {
    if (element.className == "error") element.className = "";
}
