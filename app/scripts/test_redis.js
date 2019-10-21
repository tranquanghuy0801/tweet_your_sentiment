var redis = require("redis"),
	client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
	console.log("Error " + err);
});

client.set("string key", "string val", redis.print);
client.set("harry","annie",redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
const result = {
	"name": "harry",
	"score": 8 
}
const person1 = {
	"name": "annie",
	"score": 10
}
// client.hmset("hash key 5",4,JSON.stringify(person1),redis.print);
client.hgetall("cab432tweets:Christine-Nixon", function (err, result) {
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
	tags = 'Christine-Nixon';
	if(result){
        let values = Object.values(result).map(function (i) {
          let data = JSON.parse(i);
          console.log(data.score);
          if (data.tags === tags) {
            return data.score;
          }
          else {
            return '';
          }
        });
        values = values.filter(Number);
		//resolve(values);
		console.log(values);
    }

});