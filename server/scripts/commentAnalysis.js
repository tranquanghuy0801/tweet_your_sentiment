const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function createID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

function sentimentAnalysis(text,tags) {
    let output = {};
    return new Promise((resolve) => {
        if(text !== undefined){
            text = text.replace(/[^a-zA-Z ]/g, "");
            const result = sentiment.analyze(text);
            output = {
                "id": createID() ,
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