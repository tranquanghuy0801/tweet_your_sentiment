const creds = {
    trendBucket: "trends-keyword",
	tweetBucket: "cab432-tweet-trends",
	endpoint: "https://harry-cab432.documents.azure.com:443/",
	primaryKey: {
		"id": "CJjrU7mWcspjbRz6fTxDSKmSoc2NIcgIK0q3kkn2Ikjtn5zzSJJfxi6Lwuq0STwyVrCEUwRt1771M8KNfMMThA=="
	},
	database: {
		"id" : "cab432-assignment-cloud"
	},
	tweetCollection: { 
		"id": "cab432Tweets"
	},
	trendCollection: {
		"id": "cab432Trends"
	}
};

function getFormattedDate(date) {
	var year = date.getFullYear();
  
	var month = (1 + date.getMonth()).toString();
	month = month.length > 1 ? month : '0' + month;
  
	var day = date.getDate().toString();
	day = day.length > 1 ? day : '0' + day;
	
	return month + '-' + day + '-' + year;
}

module.exports.getFormattedDate = getFormattedDate;
module.exports.creds = creds;