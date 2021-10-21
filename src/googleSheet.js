const { GoogleSpreadsheet } = require('google-spreadsheet');

async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet(
    '1yCwmynf98-OSs9iwR1GCd7NpuWbS0beOIPyPssxETeM'
  );
  const creds = require('./spreadsheet_secret.json');
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsById[0];
  const profilePicURL = undefined;
  const row = {
    大頭貼: `=image("${
      profilePicURL ||
      'https://images.squarespace-cdn.com/content/v1/58f7904703596ef4c4bdb2e1/1502724353318-778JDBZN2K70W5HRRGIY/no+avatar.png?format=500w'
    }")`,
    色色主角: 'justin',
    日期: '2021-09-21',
    時間: '23:03',
    做了什麼: '收藏',
    針對番號: 'ABW-098',
  };

  await sheet.addRow(row);
}

accessSpreadsheet();
