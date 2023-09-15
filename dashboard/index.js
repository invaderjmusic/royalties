let datastore = {};

async function getData() {
    let name = sessionStorage.getItem("name");
    let admin = sessionStorage.getItem("admin");
    if (name) {
        datastore.username = name;
        datastore.admin = admin;
        window.addEventListener("load", onNameReady);
    }
    else {
        let res = await fetch("/api/userInfo");
        let data = await res.json();
        sessionStorage.setItem("name", data.username);
        sessionStorage.setItem("admin", data.admin);
        datastore.username = data.username;
        datastore.admin = data.admin;
        document.body.dispatchEvent(new Event("nameready"));
    }
}   
getData()

function toggleUserDropdown() {
    document.getElementById("userDropdown").classList.toggle("show");
}

window.addEventListener("click", function (e) {
    if (!e.target.matches('.dropbtn')) {
        let myDropdown = document.getElementById("userDropdown");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
})

window.addEventListener("load", function (e) {
    document.body.addEventListener("nameready", onNameReady) 
});

function onNameReady() {
    let usernames = document.getElementsByClassName("username")
    for (let element of usernames) {
        element.textContent = datastore.username;
    }

    if (datastore.admin == true || datastore.admin == "true") {
        document.getElementById("adminLink").style.display = "block";
    }
    else {
        let number = document.getElementById("userDropdownLabel").offsetWidth - parseFloat(getComputedStyle(document.getElementById("userDropdownLabel"))["padding-right"]) + 14;
        if (number < 170) number = 170;
        document.getElementById("userDropdown").style.width = number.toString() + "px"
    }
}