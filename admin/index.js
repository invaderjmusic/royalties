let datastore = {};

async function getData() {
    let res = await fetch("/api/userInfo");
    let data = await res.json();
    
    let usernames = document.getElementsByClassName("username")
    for (let element of usernames) {
        element.textContent = data.username;
    }

    let res2 = await fetch("/admin/getUsers");
    datastore.users = await res2.json();

    document.body.dispatchEvent(new Event("dataready"));
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