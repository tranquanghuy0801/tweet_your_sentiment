const creds = {
    trendBucket: "trends-keyword",
    tweetBucket: "cab432-tweet-trends"
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