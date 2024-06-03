userList = []

async function getUsers() {
    let res = await fetch("/admin/getUsers");
    let users = await res.json();

    for (let i = 0; i < users.length; i++) {
        userList.push(users[i].username);
    }
}
getUsers()

async function submitForm(e) {
    e.preventDefault();

    if (datastore.existserror) {
        datastore.existserror = false;
        document.getElementById("existserror").style.display = "none";
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

    let newname = document.getElementById("newname").value;

    if (userList.includes(newname)) {
        datastore.existserror = true;
        document.getElementById("existserror").style.display = "block";
        return;
    }

    let newmode = document.getElementById("newmode").value.replaceAll("|", "");
    let newcontact = document.getElementById("newcontact").value.replaceAll("|", "");

    let data = {username: newname, primary_contact: newmode.toLowerCase() + "|" + newcontact}

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    let response, resdata;
    try {
        response = await fetch('/admin/addUser', options);
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
    document.getElementById("userform").addEventListener("submit", submitForm);
});

function checkHighlight(element) {
    if (element.className == "error") element.className = "";
}
