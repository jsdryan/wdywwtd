const { log } = require('console');
const fs = require('fs');
const _ = require('lodash');

const getVidIdFromJavlibraryTextFileByStream = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      const lines = chunk.split('\n');
      chunks.push(Buffer.from(lines[_.random(1, 500)]));
    });
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

const test = async () => {
  const stream = fs.createReadStream('./src/javlibrary-best-rated.txt', {
    encoding: 'utf8',
  });
  const result = await getVidIdFromJavlibraryTextFileByStream(stream);
  console.log(result);
};

test();
