let datastore = {};

async function getData() {
    let res = await fetch("/api/userInfo");
    let data = await res.json();
    
    datastore.username = data.username;
    document.body.dispatchEvent(new Event("nameready"));
}
getData()

function toggleUserDropdown() {
    document.getElementById("userDropdown").classList.toggle("show");
}

window.addEventListener("click", function (e) {
    if (!e.target.matches('.dropbtn')) {
        var myDropdown = document.getElementById("userDropdown");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
})

window.addEventListener("load", function (e) {
    document.body.addEventListener("nameready", (e) => {
        let usernames = document.getElementsByClassName("username")
        for (let element of usernames) {
            element.textContent = datastore.username;
        }
    }) 
})