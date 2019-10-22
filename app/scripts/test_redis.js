var redis = require("redis"),
	client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
	console.log("Error " + err);
});

const result = {
	"name": "harry"
}

client.setex("cab432-trends-james",3600, JSON.stringify(result), redis.print);
client.setex("cab432-trends-harry",3600, JSON.stringify(result), redis.print);
// client.set("harry","annie",redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
const person1 = {
	"name": "annie"
}
// client.hmset("hash key 5",4,JSON.stringify(person1),redis.print);
client.get("cab432-trends-james", function (err, result) {
	// let values = Object.values(replies).map(function(i){
	// 	let json = JSON.parse(i);
	// 	console.log(json.score);
	// 	if(json.name === "annie"){
	// 		return json.score;
	// 	}
	// 	else{
	// 		return '';
	// 	}
	//   });
	// values = values.filter(Number) 
	// console.log(values);
	result = JSON.parse(result);
	console.log(result.name);
	

});

client.keys('cab432trends:*', function (err, keys) {
	if (err) return console.log(err);
	else{
		console.log(keys);
	}
});