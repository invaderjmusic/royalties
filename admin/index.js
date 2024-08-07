let datastore = {};

async function getData() {
    let name = sessionStorage.getItem("name");
    if (name) {
        datastore.username = name;
    }
    else {
        let res = await fetch("/api/userInfo");
        let data = await res.json();
        sessionStorage.setItem("name", data.username);
        datastore.username = data.username;
        
    }
    
    if (document.readyState === 'complete') {
        onNameReady()
    }
    else {
        window.addEventListener("load", onNameReady);
    }
}   
getData()

function toggleUserDropdown() {
    document.getElementById("userDropdown").classList.toggle("show");
}

function toggleStreamingDropdown() {
    document.getElementById("streamingDropdown").classList.toggle("show");
}

function toggleBandcampDropdown() {
    document.getElementById("bandcampDropdown").classList.toggle("show");
}

window.addEventListener("click", function (e) {
    if (!e.target.matches('#userDropdownLabel')) {
        let myDropdown = document.getElementById("userDropdown");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
    if (!e.target.matches('#streamingDropdownLabel')) {
        let myDropdown = document.getElementById("streamingDropdown");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
    if (!e.target.matches('#bandcampDropdownLabel')) {
        let myDropdown = document.getElementById("bandcampDropdown");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
})

function onNameReady() {
    let usernames = document.getElementsByClassName("username")
    for (let element of usernames) {
        element.textContent = datastore.username;
    }
}