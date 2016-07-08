'use strict';

require('dotenv').config();

const fs = require('fs');

const uploader = require('../lib/aws-s3-upload');

let filename = process.argv[2] || ''; // <-- '' Adds a default (empty strings) if no argument is passed

// wrap promise function that includes readFile operation in a new function defined as readFile
const readFile = (filename) => {
  return new Promise((resolve,reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
};


readFile(filename)
.then(uploader.prepareFile)
.then(uploader.awsUpload)
.then(console.log)
.catch(console.error);
