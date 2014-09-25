//////////////////////////////////////////////////////////////////
//           Test query for Looker API using Node.js            //
//////////////////////////////////////////////////////////////////

// With hotswap installed, you can run this script
// interactively. Do to so, run node, require("./node_sdk"),
// then you can update node_sdk.js, rerun require("./node_sdk"),
// and see your changes during the same session. You can also
// reference any variables or functions in this script.

require('hotswap')
module.change_code = 1;

// Preliminaries

base64 = require('base64');
dateFormat = require('dateformat');

// Function to Generate Nonce

makeNonce = function makeNonce() {
  nonce = Math.random().toString(31).substring(2, 34)
  console.log(nonce);
  return nonce
}

// Function to Generate SHA1 Hash

hmacHash = function(secret, string_to_sign){
    crypto = require('crypto');
    hash = crypto.createHmac('sha1', secret).update(string_to_sign).digest('base64');
    console.log(hash);
    return hash;
}

// Function to Send GET Request

httpGet = function httpGet(url, authorization, today, nonce) {
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
        console.log("State: " + this.readyState);
	
	if (this.readyState == 4) {
		console.log("Complete.\nBody length: " + this.responseText.length);
		console.log("Body:\n" + this.responseText);
	}
   }
    xmlHttp.open('GET', url, true);
    xmlHttp.setRequestHeader( 'Authorization' , authorization );
    xmlHttp.setRequestHeader( 'x-llooker-date' , today );
    xmlHttp.setRequestHeader( 'x-llooker-nonce' , nonce );
    xmlHttp.setRequestHeader( 'Accept' , 'application/json' );
    xmlHttp.setRequestHeader( 'x-llooker-api-version' , 1 );
    xmlHttp.setRequestHeader( 'Content-Type' , 'application/x-www-form-urlencoded' );
    xmlHttp.send();
    console.log(xmlHttp);
    return xmlHttp;
}

// Query Parameters

dictionary = 'model';
query = 'base_view';
fields = 'fields=base_view.dimension';
limit = 'limit=5000';

// This script is set up to support at least one filter.
// If your query contains no filters, then you must comment out var filters,
// and remove any reference to it throughout the script.
filters = new Object();
filters = {'base_view.dimension':'filter value'};

filtersClean = function filtersClean(fil) {
    var fs = Object.keys(fil).map(function(value, index) {
        var uri = encodeURIComponent('filters[' + value + ']').toLowerCase() + '=' + fil[value].replace(' ', '+');
        console.log(value);
        console.log(index);
        console.log(uri);
        return uri;
      }).join('&');
    console.log(fs);
    return fs;
};

f = filtersClean(filters);
// Query Build

token = 'your token';
secret = 'your secret';
host = 'https://domain.looker.com';
http_verb = 'GET';
uri = '/api/dictionaries/' + dictionary + '/queries/' + query + '.json';
nonce = makeNonce();
today = dateFormat(new Date(), "ddd, dd mmm yyyy HH:MM:ss o")
string_to_sign = http_verb + '\n' +
    uri + '\n' +
    today + '\n' +
    nonce + '\n' +
    fields + '\n' +
    f.split('&').join('\n') + '\n' +
    limit + '\n';
signature = hmacHash(secret, string_to_sign).toString('base64');
authorization = token + ':' + signature;
url = host + uri + '?' + fields + '&' + f + '&' + limit;
console.log(url);


// Send GET Request
request = httpGet(url, authorization, today, nonce);

