const { GoogleSpreadsheet } = require('google-spreadsheet');
const _ = require('lodash');

async function getRandomGanHua(sheetID) {
  const doc = new GoogleSpreadsheet(
    '1w5VzbMRUPNusATJpgZuRmKO08rOmtNM13Uc-8B37sv4'
  );
  const creds = require('./ganhua-3681aa04365d.json');
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsById[sheetID];
  const rows = await sheet.getRows();
  return (await sheet.getRows())[_.random(0, rows.length - 1)]._rawData[0];
}

module.exports = { getRandomGanHua };
