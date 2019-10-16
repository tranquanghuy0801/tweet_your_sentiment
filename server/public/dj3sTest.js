// //const d3 = require("d3");
// const commonWords = "poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall"

// // This JS file is a placeholder to gather the data and process them into a CSV file
// commentsJSON = [{"body": "IF YOU DON'T LIKE THAT, YOU DON'T LIKE PRE-SEASON BASKETBALL!", "score": 3},
// {"body": "Crowd wanted that so bad", "score":-1},
// {"body": "Hard to imagine jokic getting injured. Looks like he's moving in slow motion and barely gets off the floor when he jumps", "score":-1},
// {"body": "Crazy how we consider Jokic fat at 280 lbs, but Shaq at one point got up to 380 lbs. He truly couldn't put the fork down.", "score":-1},
// {"body": "He is the most unathletic NBA superstar I have ever seen. He gets by on pure skill lmao.", "score": -1},
// {"body": "I seem to remember an interview that Shaq did during the threepeat years where he said that his pregame meal was something like three club sandwiches and three large Sprites.", "score":-1},
// {"body": `Of course that’s your contention. You’re a first year grad student. You just got finished readin’ some Marxian historian, 
// Pete Garrison probably. You’re gonna be convinced of that ’til next month when you get to James Lemon and then you’re gonna be talkin’ about 
// how the economies of Virginia and Pennsylvania were entrepreneurial and capitalist way back in 1740. That’s gonna last until next year. 
// You’re gonna be in here regurgitating Gordon Wood, talkin’ about, you know, the Pre-Revolutionary utopia and the capital-forming effects 
// of military mobilization… ‘Wood drastically underestimates the impact of social distinctions predicated upon wealth, especially inherited wealth.’ 
// You got that from Vickers, Work in Essex County, page 98, right? Yeah, I read that, too. Were you gonna plagiarize the whole thing for us? Do you
//  have any thoughts of your own on this matter? Or do you, is that your thing? You come into a bar. You read some obscure passage and then pretend, 
//  you pawn it off as your own, as your own idea just to impress some girls and embarrass my friend? See, the sad thing about a guy like you is in 
//  50 years, you’re gonna start doin’ some thinkin’ on your own and you’re gonna come up with the fact that there are two certainties in life. 
//  One: don’t do that. And two: you dropped a hundred and fifty grand on a fuckin’ education you coulda got for a dollar fifty in late charges 
//  at the public library.`, "score":-1}];

// function createBarGraphs(rawData) {
//     // set the dimensions and margins of the graph
//     let margin = {top: 10, right: 30, bottom: 40, left: 100},
//     width = 460 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

//     // append the svg object to the "body" of the page
//     let svg = d3.select("#my_dataviz")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform",
//             "translate(" + margin.left + "," + margin.top + ")");
    
//     // append the svg object to the "body" of the page
//     let svg = d3.select("#my_dataviz")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform",
//             "translate(" + margin.left + "," + margin.top + ")");


//     let word_count = {};
//     let words = [];
    
//     // Parse the Data
//     for (let i = 0; i < rawData; i++) {

//         let wordstemp = rawData[i].body
//         if (wordstemp.length == 1) {}
//     }
    
    
// };


// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 40, left: 100},
    width = 460 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.json("data.json", function(data) {

// sort data
data.sort(function(b, a) {
  return a.Frequency - b.Frequency;
});

// Add X axis
var x = d3.scaleLinear()
  .domain([0, 55])
  .range([ 0, width]);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Y axis
var y = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.Word; }))
  .padding(1);
svg.append("g")
  .call(d3.axisLeft(y))

// Lines
svg.selectAll("myline")
  .data(data)
  .enter()
  .append("line")
    .attr("x1", function(d) { return x(d.Frequency); })
    .attr("x2", x(0))
    .attr("y1", function(d) { return y(d.Word); })
    .attr("y2", function(d) { return y(d.Word); })
    .attr("stroke", "grey")

// Circles
svg.selectAll("mycircle")
  .data(data)
  .enter()
  .append("circle")
    .attr("cx", function(d) { return x(d.Frequency); })
    .attr("cy", function(d) { return y(d.Word); })
    .attr("r", "7")
    .style("fill", "#69b3a2")
    .attr("stroke", "black")
})