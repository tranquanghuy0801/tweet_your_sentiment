const creds = {
	twitter: {
        consumer_key: '3E9FhZns0AkE24Y7XmsAzC8Uj',
        consumer_secret: 'gBQUk3ZtgCLa7bXlE4wSzMkWvQ0E3DLjWGidGuwp7v6RYsXfX8',
        access_token: '1184609180616814593-Qw27GFNtoTeiogvGw2hBGcwqYEk1LO',
        access_token_secret: 'wnunMa8zI8JBE0dU2ZF2JKsn5TrE9yUHYy0E6BHeW1iEK'
    },
	endpoint: "https://cab432-assignment2.documents.azure.com:443/",
	primaryKey: {
		"id": "t3jacVS6dEwsUk0XQbHGXWAx36X8oOoBy4eQb6eDUj8GNqXSYtZrI62X5JwRQNs8ytRy1x7In50LdSJQEg55rA=="
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