const got = require('got');
const cheerio = require('cheerio');
const arrayToTxtFile = require('array-to-txt-file');

const getAllVideoId = async () => {
  const data = [];
  for (let pageNum = 1; pageNum <= 25; pageNum++) {
    console.log(`Page ${pageNum}`);
    const res = await got(`https://www.javlibrary.com/tw/vl_mostwanted.php`, {
      searchParams: { mode: 1, page: pageNum },
      headers: { Cookie: 'over18=18', 'user-agent': 'Android' },
    });
    const $ = cheerio.load(res.body);
    const videoItems = $('.video > a > .id');
    console.log(`Video items QTY: ${videoItems.length}`);
    for (let videoIndex = 0; videoIndex < videoItems.length; videoIndex++) {
      const videoId = videoItems[videoIndex].children.find(
        (child) => child.type == 'text'
      ).data;
      data.push(videoId);
    }
  }
  return data;
};

getAllVideoId().then((data) => {
  arrayToTxtFile(data, './src/javlibrary-best-rated.txt', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Successfully wrote to txt file, data qty is ${data.length}`);
  });
});
