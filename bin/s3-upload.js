'use strict';

require('dotenv').config();

const fs = require('fs');
const crypto = require('crypto');

const fileType = require('file-type');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const mimeType = (data) => {
  // thing on the right gets added, or rather overwrites, the thing on the left
  // Object.assign({}, {}) ~ hash.merge in Ruby
  return Object.assign({
    ext: 'bin',
    mime: 'application/octet-stream'
  }, fileType(data));
};

const randomHexString = (length) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (error, buffer) => {
      if (error) {
        reject(error);
      }
      resolve(buffer.toString('hex'));
    });
  });
};

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

const awsUpload = (file) => {
  return randomHexString(16)
  .then((filename) => {
    let dir = new Date().toISOString().split('T')[0];
    return {
      ACL: "public-read",
      Body: file.data,
      Bucket: 'roobsbucket',
      ContentType: file.mime,
      Key: `${dir}/${filename}.${file.ext}`
    };
  })
  .then((options) => {
    return new Promise((resolve, reject) => {
      s3.upload(options, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  });
};

// place .then and .catch outside of the function, so we can see promise or error that is returned
readFile(filename)
// Need to build a custom file object bc it is something that AWS expects
// Aso needs to include an extension and a mime
.then((data) => {
  let file = mimeType(data);
  // attach the buffer to a key named data
  file.data = data;
  return file;
})
.then(awsUpload)
.then(console.log)
.catch(console.error);
