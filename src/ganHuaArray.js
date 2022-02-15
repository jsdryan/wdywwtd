const _ = require('lodash');

function randomGanHua() {
  const ganHuaArray = [
    '只要對象換得快，沒有悲傷只有愛。',
    '世界上有幾十億人口，但你卻沒人口。',
    '知音難尋，一砲就行。',
    '不是對你沒感覺，是你沒開保時捷。',
    '不是不跟你回家，是你沒有開瑪莎。',
    '不是緣分輕易流逝，而是你沒有開賓士。',
    '我不是渣，我只是想讓女孩都有個家。',
    '妳問我這張照片像不像網美，我覺得有妳的風景就是完美。',
    '睡前山盟海誓，醒來請問妳是？',
    '我覺得我們可以浪漫一點，妳浪一點，我慢一點',
  ];
  const ganHuaArrayLength = ganHuaArray.length;
  return ganHuaArray[_.random(0, ganHuaArrayLength - 1)];
}

module.exports = { randomGanHua };
