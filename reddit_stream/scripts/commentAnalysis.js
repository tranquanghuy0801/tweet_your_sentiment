const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function sentimentAnalysis(body) {
    let comment = body;
    let subreddit = {};
    return new Promise((resolve) => {
        if(comment != undefined){
            const title = comment.link_title.replace(/[^a-zA-Z ]/g, "")
            const content = comment.body.replace(/[^a-zA-Z ]/g, "")
            const str = title.concat(content);
            const result = sentiment.analyze(str);
            subreddit = {
                "id": 'cab432-' + comment.id,
                "subreddit": comment.subreddit,
                "link": comment.link_permalink,
                "pos_title": comment.link_title,
                "content": comment.body,
                "score": result.score
            };
            resolve(subreddit);
        }
    });
};

module.exports.sentimentAnalysis = sentimentAnalysis;