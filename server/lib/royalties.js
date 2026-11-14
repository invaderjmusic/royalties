const { getLatestRoyaltyDate, getEarliestReleaseDate, getReleasesBeforeDate, getSongSplits, addRoyaltyToSongDB, deleteRoyaltiesByDate, getProductSplits, addSaleToProductDB } = require("./database.js");

module.exports = {
    getReleasesWithPendingRoyalties: async () => {
        let maxdate = await getLatestRoyaltyDate();
        if (!maxdate) {
            let mindate = await getEarliestReleaseDate();
            let month = mindate.month;
            let year = mindate.year;
            let lastYear;
            if (month == 12) {
                month = 1;
                year++;
                lastYear = true;
            }
            else {
                month++;
            }

            let firstReleases = await getReleasesBeforeDate(year, month, 1);
            return {type: "loading", date: [lastYear ? year - 1 : year, lastYear ? 12 : month - 1], releases: firstReleases}
        }
        else {
            let now = new Date();

            let maxRoyaltyDate = new Date(maxdate.year, maxdate.month - 1, maxdate.day);
            let maxEligibleMonth = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            let oneMonthEarlier = new Date(maxEligibleMonth.getFullYear(), maxEligibleMonth.getMonth() - 2, 1);

            if (maxRoyaltyDate < maxEligibleMonth) {
                let month = maxdate.month;
                let year = maxdate.year;
                let lastYear = false;

                if (month == 11) {
                    month = 1;
                    year++;
                    lastYear = true;
                }
                else if (month == 12) {
                    month = 2;
                    year++;
                }
                else {
                    month = month + 2;
                }

                let nextReleases = await getReleasesBeforeDate(year, month, 1);
                let type = maxRoyaltyDate < oneMonthEarlier ? "loading" : "latest";
                return {type: type, date: [lastYear ? year - 1: year, lastYear ? 12 : month - 1], releases: nextReleases}
            }
            else return {type: "none"}
        }
    },
    addRoyaltyToSong: async(year, month, song, amount) => {
        let splits = await getSongSplits(song);
        let earnings = {}
        for (let i = 0; i < splits.length; i++) {
            earnings[splits[i].user[0]] = (amount * splits[i].percentage) / 100
        }

        let sum = 0;
        for (let key in earnings) {
            sum += earnings[key];
        }

        if (sum == amount) {
            await addRoyaltyToSongDB(year, month, song, amount, earnings);
        }
        else {
            console.log(earnings);
            throw("Split calculation failed: Earnings do not add up to the total amount.");
        }
    },
    addSaleToProduct: async(year, month, product, count, amount) => {
        let splits = await getProductSplits(product);
        let earnings = {}
        for (let i = 0; i < splits.length; i++) {
            earnings[splits[i].user[0]] = (amount * splits[i].percentage) / 100
        }

        let sum = 0;
        for (let key in earnings) {
            sum += earnings[key];
        }

        if (sum == amount) {
            await addSaleToProductDB(year, month, product, amount, count, earnings);
        }
        else {
            console.log(earnings);
            throw("Split calculation failed: Earnings do not add up to the total amount.");
        }
    },
    deleteLatestMonthOfRoyalties: async() => {
        let maxdate = await getLatestRoyaltyDate();
        if (!maxdate) {
            return {result: "error", message: "There are no royalties to delete!"}
        }
        else {
            await deleteRoyaltiesByDate(maxdate);
            return {result: "success"}
        }
    }
}