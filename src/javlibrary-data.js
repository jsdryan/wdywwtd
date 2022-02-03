const fs = require('fs');
const text = fs.readFileSync('src/javlibrary-best-rated.txt', 'utf-8');
const javLibraryDataArray = text.split('\n');

module.exports = {
  javLibraryDataArray,
};
