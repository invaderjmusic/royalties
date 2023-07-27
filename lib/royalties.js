const { getLatestRoyaltyDate, getEarliestReleaseDate, getReleasesBeforeDate } = require("./database.js");

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
    }
}