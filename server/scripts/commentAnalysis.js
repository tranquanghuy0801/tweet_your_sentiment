const Sentiment = require('sentiment');
const sentiment = new Sentiment();


function sentimentAnalysis(text,tags,id) {
    let output = {};
    return new Promise((resolve) => {
        if(text !== undefined){
            text = text.replace(/[^a-zA-Z ]/g, "");
            const result = sentiment.analyze(text);
            console.log(result);
            output = {
                "id": 'cab432-tweets-' + id,
                "tags": tags,
                "text": text,
                "score": result.score,
                "pos_words": result.pos_words,
                "neg_word": result.neg_word
            };
            resolve(output);
        }
    });
};

module.exports.sentimentAnalysis = sentimentAnalysis;