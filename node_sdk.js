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
  return nonce
}

// Function to Generate SHA1 Hash

hmacHash = function(secret, string_to_sign){
    crypto = require('crypto');
    hash = crypto.createHmac('sha1', secret).update(string_to_sign).digest('base64');
    return hash;
}

// Function to Send GET Request

httpGet = function httpGet(url, authorization, today, nonce) {
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', url, true);
    xmlHttp.setRequestHeader( 'Authorization' , authorization );
    xmlHttp.setRequestHeader( 'x-llooker-date' , today );
    xmlHttp.setRequestHeader( 'x-llooker-nonce' , nonce );
    xmlHttp.setRequestHeader( 'Accept' , 'application/json' );
    xmlHttp.setRequestHeader( 'x-llooker-api-version' , 1 );
    xmlHttp.setRequestHeader( 'Content-Type' , 'application/x-www-form-urlencoded' );
    xmlHttp.send();
    return xmlHttp;
}

// Query Parameters

dictionary = 'thelook';
query = 'orders';
fields = 'fields=orders.count,orders.created_month';

// This script is set up to support at least one filter.
// If your query contains no filters, then you must comment out var filters,
// and remove any reference to it throughout the script.
filters = new Object();
filters = {'orders.created_date':'24 months', 'users.created_date':'24 months'};
filters = filtersClean(filters)

filtersClean = function filtersClean(filters){Object.keys(filters).map(function(value, index){
      return encodeURIComponent('filters[' + value + ']').toLowerCase() +
        '=' + filters[value].replace(' ', '+');
      }).join('&')
};

// Query Build

token = 'Mkz9GRYoIhyuJ898YG89Ig';
secret = 'v1+MNxMg1vdmljYbtBhEDFEQSlAUEZd4xWd';
host = 'https://demo.looker.com';
http_verb = 'GET';
uri = '/api/dictionaries/' + dictionary + '/queries/' + query + '.json';
nonce = makeNonce();
today = dateFormat(new Date(), "ddd, dd mmm yyyy HH:MM:ss o")
string_to_sign = http_verb + '\n' +
    uri + '\n' +
    today + '\n' +
    nonce + '\n' +
    fields + '\n' +
    filters.split('&').join('\n') + '\n';
signature = hmacHash(secret, string_to_sign).toString('base64');
authorization = token + ':' + signature;
url = host + uri + '?' + fields + '&' + filters;


// Send GET Request
request = httpGet(url, authorization, today, nonce);
request.responseText

