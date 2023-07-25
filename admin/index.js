let datastore = {};

async function getData() {
    let res = await fetch("/api/userInfo");
    let data = await res.json();
    
    let usernames = document.getElementsByClassName("username")
    for (let element of usernames) {
        element.textContent = data.username;
    }
    datastore.username = data.username;
}
getData()

function toggleUserDropdown() {
    document.getElementById("userDropdown").classList.toggle("show");
}

window.onclick = function (e) {
    if (!e.target.matches('.dropbtn')) {
        var myDropdown = document.getElementById("userDropdown");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
}