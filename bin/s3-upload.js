'use strict';

const fs = require('fs');

let filename = process.argv[2] || ''; // <-- '' Adds a default (empty strings) if no argument is passed

// signature for file system readfile
fs.readFile(filename, (error, data) => {
  if (error) {
    return console.error(error);
  }

  console.log(`${filename} is ${data.length} is bytes long`);
})
