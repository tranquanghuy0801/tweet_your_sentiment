const Sentiment = require('sentiment');
const sentiment = new Sentiment();
 
function sentimentAnalysis(comment){
    let subreddit = {};
    return new Promise((resolve, reject) => {
            const title = comment.link_title.replace(/[^a-zA-Z ]/g, "")
            const content = comment.body.replace(/[^a-zA-Z ]/g, "")
            const str = title.concat(content);
            const response = sentiment.analyze(str,(err,result)=>{
                if(err){
                    reject(err);
                }
                else{
                    subreddit = {
                        "id": comment.id,
                        "link": comment.link_permalink,
                        "pos_title": comment.link_title,
                        "content": comment.body, 
                        "score": result.score,
                        "pos_words": result.positive,
                        "neg_words": result.negative
                    }
                    //console.log(result);
                    resolve(subreddit);
                }
            });
    });
};

module.exports.sentimentAnalysis = sentimentAnalysis;