let sales = {}

function readFile(e) {
    e.preventDefault()
    const reader = new FileReader()

    reader.onload = () => {
        document.getElementById("out").innerHTML = "";
        document.getElementById("submitbutton").disabled = true;
        
        sales = {}
        total_count = 0;
        total_revenue = 0;

        let resultArr = reader.result.split("\n")
        resultArr.shift()
        resultArr.pop()
        for (let i = 0; i < resultArr.length; i++) {
            let recordArr = resultArr[i].split(",")
            let price = Math.round(parseFloat(recordArr[19]) * 10000)
            let url = recordArr[20]
            if (sales[url]) {
                sales[url].count += 1;
                sales[url].revenue += price;
            }
            else {
                sales[url] = { count: 1, revenue: price }
            }
            total_count += 1;
            total_revenue += price;
        }
        let table = document.createElement("table");
        let headElement = document.createElement("thead")
        let head = document.createElement("tr");
        head.innerHTML = "<td>URL</td><td>Count</td><td>Revenue</td>"
        headElement.appendChild(head)
        table.appendChild(headElement);

        let body = document.createElement("tbody");

        for (let o in sales) {
            let row = document.createElement("tr");

            let url = document.createElement("td");
            url.textContent = o;
            row.appendChild(url);

            let count = document.createElement("td");
            count.textContent = sales[o].count;
            row.appendChild(count);

            let rev = document.createElement("td");
            rev.textContent = (sales[o].revenue / 10000).toFixed(4);
            row.appendChild(rev);

            body.appendChild(row)
        }

        table.appendChild(body)

        // total row
        let foot = document.createElement("tfoot");
        let row = document.createElement("tr");

        let url = document.createElement("td");
        url.textContent = "Total";
        row.appendChild(url);

        let count = document.createElement("td");
        count.textContent = total_count;
        row.appendChild(count);

        let rev = document.createElement("td");
        rev.textContent = (total_revenue / 10000).toFixed(4);
        row.appendChild(rev);

        foot.appendChild(row)
        table.appendChild(foot)

        document.getElementById("out").appendChild(table);
        document.getElementById("submitbutton").disabled = false;
    }

    let fileInput = document.getElementById('csv')
    reader.readAsText(fileInput.files[0])
}

async function submitForm(e) {
    e.preventDefault();

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

    let data = { "date": document.getElementById("saledate").value };

    let salesArr = []
    for (let o in sales) {
        salesArr.push({"url": o, "count": sales[o].count, "amount": sales[o].revenue})
    }

    data.sales = salesArr;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    let response, resdata;
    try {
        response = await fetch('/admin/addSales', options);
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
    document.getElementById("salesform").addEventListener("submit", submitForm);
    document.getElementById("submitbutton").disabled = true;
});