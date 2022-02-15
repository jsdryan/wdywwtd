const _ = require('lodash');

function randomGanHua() {
  const ganHuaArray = [
    '只要對象換得快，沒有悲傷只有愛。',
    '世界上有幾十億人口，你卻沒人口。',
    '知音難尋，一砲就行。',
  ];
  const ganHuaArrayLength = ganHuaArray.length;
  return ganHuaArray[_.random(0, ganHuaArrayLength - 1)];
}

module.exports = { randomGanHua };
