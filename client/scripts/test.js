const common = "poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall"
const d3 = require("d3")
const createCSVWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCSVWriter( {
    path: 'wordCount.csv',
    header: [
      {id: 'word', title:'Word'},
      {id: 'frequency', title: 'Frequency'}
    ]
});
// This JS file is a placeholder to gather the data and process them into a CSV file
commentsJSON = [{"body": "IF YOU DON'T LIKE THAT, YOU DON'T LIKE PRE-SEASON BASKETBALL! Lebron Lebron Lebron!", "score": 3},
{"body": "Crowd wanted that so bad", "score":-1},
{"body": "Hard to imagine jokic getting injured. Looks like he's moving in slow motion and barely gets off the floor when he jumps", "score":-1},
{"body": "Crazy how we consider Jokic fat at 280 lbs, but Shaq at one point got up to 380 lbs. He truly couldn't put the fork down.", "score":-1},
{"body": "He is the most unathletic NBA superstar I have ever seen. He gets by on pure skill lmao.", "score": -1},
{"body": "I seem to remember an interview that Shaq did during the threepeat years where he said that his pregame meal was something like three club sandwiches and three large Sprites.", "score":-1},
{"body": `Of course that’s your contention. You’re a first year grad student. You just got finished readin’ some Marxian historian, Pete Garrison probably. You’re gonna be convinced of that ’til next month when you get to James Lemon and then you’re gonna be talkin’ about how the economies of Virginia and Pennsylvania were entrepreneurial and capitalist way back in 1740. That’s gonna last until next year. You’re gonna be in here regurgitating Gordon Wood, talkin’ about, you know, the Pre-Revolutionary utopia and the capital-forming effects of military mobilization… ‘Wood drastically underestimates the impact of social distinctions predicated upon wealth, especially inherited wealth.’ You got that from Vickers, Work in Essex County, page 98, right? Yeah, I read that, too. Were you gonna plagiarize the whole thing for us? Do you have any thoughts of your own on this matter? Or do you, is that your thing? You come into a bar. You read some obscure passage and then pretend,  you pawn it off as your own, as your own idea just to impress some girls and embarrass my friend? See, the sad thing about a guy like you is in  50 years, you’re gonna start doin’ some thinkin’ on your own and you’re gonna come up with the fact that there are two certainties in life. One: don’t do that. And two: you dropped a hundred and fifty grand on a fuckin’ education you coulda got for a dollar fifty in late charges at the public library.`, "score":-1}];

// Parse Data will take in all the reddit comments stored as a JSON file and then JSONify those comments into a JSON
// array saved to be used by D3.js
function parseData(rawData) {
  let word_count = {};
  // Parse the Data
  for (let i = 0; i < rawData.length; i++) {
    let textString = rawData[i].body;
    //console.log(textString)
    let words = textString.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
    //console.log(words)
    words.forEach(function (word) {
      var word = word.toLowerCase();
      if (word != "" && common.indexOf(word) == -1 && word.length > 1) {
        if (word_count[word]) {
          word_count[word]++;
        } else {
          word_count[word] = 1;
        }
      }
    })
  }    
  //console.log(word_count);  
  return word_count;
};

// This function will turn the list into a JSON object
function saveCSV(word_count) {
  data = [];
  for (let key in word_count) {
      let str = "{ word: " + "'"+ key + "'" + "," + " frequency:" + "'" + word_count[key] +"'" + "}";
      eval('var obj='+str);
      //console.log(obj)
      data.push(obj);
      
  }

  console.log(data);
  csvWriter
    .writeRecords(data)
    .then( ()=> console.log('The CSV file was written Successfully'));
}

let hello = parseData(commentsJSON);
hey = toString(hello);
//console.log(hey);
//saveCSV(hello);
//console.log();