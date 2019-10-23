"use strict";

const documentClient = require("documentdb").DocumentClient;
const uriFactory = require('documentdb').UriFactory;
const config = require("./config/config");

const client = new documentClient(config.creds.endpoint, { "masterKey": config.creds.primaryKey.id });

const HttpStatusCodes = { NOTFOUND: 404 };
const databaseId = config.creds.database.id;

/**
 * Get the database by ID, or create if it doesn't exist.
 * @param {string} database - The database to get or create
 */
function getDatabase() {
	console.log(`Getting database:\n${databaseId}\n`);
	let databaseUrl = uriFactory.createDatabaseUri(databaseId);
	return new Promise((resolve, reject) => {
		client.readDatabase(databaseUrl, (err, result) => {
			if (err) {
				if (err.code == HttpStatusCodes.NOTFOUND) {
					client.createDatabase({ id: databaseId }, (err, created) => {
						if (err) reject(err)
						else resolve(created);
					});
				} else {
					reject(err);
				}
			} else {
				resolve(result);
			}
		});
	});
}

/**
 * Get the collection by ID, or create if it doesn't exist.
 */
function getCollection(collectionId) {
	console.log(`Getting collection:\n${collectionId}\n`);
	let collectionUrl = uriFactory.createDocumentCollectionUri(databaseId, collectionId);
	return new Promise((resolve, reject) => {
		client.readCollection(collectionUrl, (err, result) => {
			if (err) {
				if (err.code == HttpStatusCodes.NOTFOUND) {
					let databaseUrl = uriFactory.createDatabaseUri(databaseId);
					client.createCollection(databaseUrl, { id: collectionId }, { offerThroughput: 400 }, (err, created) => {
						if (err) reject(err)
						else resolve(created);
					});
				} else {
					reject(err);
				}
			} else {
				resolve(result);
			}
		});
	});
}

/**
 * Get the document by ID, or create if it doesn't exist.
 * @param {function} callback - The callback function on completion
 */
function getDocument(collectionId,document) {
	console.log(`Getting document:\n${document.id}\n`);
	let documentUrl = uriFactory.createDocumentUri(databaseId, collectionId, document.id);
	return new Promise((resolve, reject) => {
		client.readDocument(documentUrl, (err, result) => {
			if (err) {
				if (err.code == HttpStatusCodes.NOTFOUND) {
					let collectionUrl = uriFactory.createDocumentCollectionUri(databaseId, collectionId);
					client.createDocument(collectionUrl, document, (err, created) => {
						if (err) reject(err)
						else resolve(created);
					});
				} else {
					reject(err);
				}
			} else {
				resolve(result);
			}
		});
	});
};

/**
 * Query the collection using SQL
 */
function queryCollection(collectionId,column,condition) {
	let query;
	if(condition === ''){
		query = 'SELECT VALUE r.' + column + ' FROM root r';
	}
	else if(condition.includes('cab432-trends-') || condition.includes('cab432-tweets-')){
		query = 'SELECT VALUE r.' + column + ' FROM root r' + ' WHERE r.id = "' + condition + '"';
	}
	else if(column === 'all'){
		query = 'SELECT * FROM roor r '+ 'WHERE r.tags = "' + condition + '"';
	}
	else{
		query = 'SELECT VALUE r.' + column + ' FROM root r' + ' WHERE r.tags = "' + condition + '"';
	}
	console.log(`Querying collection through index:\n${collectionId}`);
	let collectionUrl = uriFactory.createDocumentCollectionUri(databaseId, collectionId);
	return new Promise((resolve, reject) => {
		client.queryDocuments(
			collectionUrl, query 
		).toArray((err, results) => {
			if (err) reject(err)
			else {
				for (var queryResult of results) {
					let resultString = JSON.stringify(queryResult);
					console.log(`\tQuery returned ${resultString}`);
				}
				console.log();
				resolve(results);
			}
		});
	});
};

function doesDocumentExist(collectionId, documentid){
	let collectionUrl = uriFactory.createDocumentCollectionUri(databaseId, collectionId);
	return new Promise(function(fulfill, reject) {
		client.queryDocuments(collectionUrl, 'SELECT * FROM root r WHERE r.id="' + documentid + '"').toArray(function (err, results) {
			if (err) {
				console.log("error", err);
				reject(err);
			} else {
				//console.log("results", results);
				fulfill(results);
			}
		});
	});
};

module.exports.getDatabase = getDatabase;
module.exports.getCollection = getCollection;
module.exports.getDocument = getDocument;
module.exports.queryCollection = queryCollection;
module.exports.doesDocumentExist = doesDocumentExist;
