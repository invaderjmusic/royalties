const CronJob = require('cron').CronJob;
const axios = require('axios');
let exchangeRate = 0;

module.exports = {
    setStartupExchangeRate: () => {
        axios.get(`https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCYAPIKEY}&currencies=GBP`)
            .then(function (response) {
                exchangeRate = response.data.data.GBP.value;
                console.log("[CURRENCY] Got the exchange rate on startup. $1 = £" + exchangeRate.toString())
            })
            .catch(function (error) {
                console.log("[CURRENCY] Error getting the exchange rate on startup: " + error);
            })
    },
    getExchangeRate: () => {
        return exchangeRate;
    }
}

let job = new CronJob(
    '0 0 8 * * *',
    function() {
        axios.get(`https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCYAPIKEY}&currencies=GBP`)
            .then(function (response) {
                exchangeRate = response.data.data.GBP.value;
                console.log("[CURRENCY] Got the daily exchange rate. $1 = £" + exchangeRate.toString())
            })
            .catch(function (error) {
                console.log("[CURRENCY] Error getting the daily exchange rate: " + error);
            })
    },
    null,
    true,
    'Europe/London'
);