nomatch = false;
username = ""
bad = false;

let query = new URLSearchParams(window.location.search);
if (query.has("nomatch")) nomatch = true

async function getData() {
    if (query.get("key")) {
        let res = await fetch("/signup/getUsername?key=" + query.get("key"))
        let resdata = await res.json();
        if (resdata[0] == "success") {
            username = resdata[1]
        }
        else if (resdata[0] == "badkey") {
            bad = true;
        }
    }
    else {
        bad = true;
    }
    if (document.readyState === 'complete') {
        onQueryReady()
    }
    else {
        window.addEventListener("load", onQueryReady);
    }
}
getData()

function onQueryReady() {
    if (bad == true) {
        document.getElementById("formdiv").style.display = "none";
        document.getElementById("errordiv").style.display = "block";
        return;
    };
    if (nomatch) {
        document.getElementById("nomatch").style.display = "block";
    }
    document.querySelectorAll('.username').forEach(function(span) {
        span.textContent = username;
    });
    document.getElementById("username_input").value = username
    document.getElementById("signup_key").value = query.get("key")
    document.getElementById("formdiv").style.opacity = "100"

    document.getElementById("password").addEventListener("input", checkPasswordsSame)
    document.getElementById("confirm_password").addEventListener("input", checkPasswordsSame)
}

function checkPasswordsSame() {
    if (document.getElementById("password").value == document.getElementById("confirm_password").value) {
        document.getElementById("signup").disabled = false;
    }
    else {
        document.getElementById("signup").disabled = true;
    }
}