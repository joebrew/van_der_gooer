var dbscan_org = require('./dbscan.js');
var fs = require('fs');

var file = __dirname + '/data/testing_data_sets/data_set_1.js';

var data = JSON.parse(fs.readFileSync(file, 'utf-8'));
console.log(data);