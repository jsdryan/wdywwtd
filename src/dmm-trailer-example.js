const got = require('got');
const $ = require('cheerio');
const _ = require('lodash');

const getTrailerUrlFromDmmByVidId = async (vidId) => {
  const dmmUrl = 'https://www.dmm.co.jp';
  try {
    let res = await got(`${dmmUrl}/search/=/searchstr=${vidId}`, {
      headers: { 'user-agent': 'Android' },
    });
    let src = '';
    let $ = cheerio.load(res.body);
    const pageText = $('.count-page').text().split('／')[2] || 1;
    if (typeof pageText === 'string') {
      console.log('Cid 解析');
      const totalPage = Number(pageText[0]);
      const lowerVidsId = `${vidId.split('-')[0]}${
        vidId.split('-')[1]
      }`.toLowerCase();
      const formattedVid = `^${lowerVidsId}{1}$`;
      const cidRegex = new RegExp(formattedVid);
      for (let i = 1; i <= totalPage; i++) {
        const url = `${dmmUrl}/search/=/searchstr=${vidId}/page=${i}/`;
        console.log(url);
        res = await got(url, { headers: { 'user-agent': 'Android' } });
        let $ = cheerio.load(res.body);
        _.forEach($('a.play-btn'), function (value, key) {
          const cid = value.attribs.cid;
          if (cidRegex.test(cid)) {
            src = value.attribs.href;
            return false;
          }
        });
      }
    } else {
      src = $('a.play-btn').attr('href');
    }
    if (src === undefined) {
      src = `https://www.prestige-av.com/sample_movie/TKT${vidId}.mp4`;
      await got(src);
    }
    return httpsUrl(src);
  } catch (err) {
    if (err.response.statusCode === 404) {
      src = `https://www.prestige-av.com/sample_movie/${vidId}.mp4`;
      console.log('404');
      return httpsUrl(src);
    }
  }
};

(async () => {
  const videoTrailerUrl = await getTrailerUrlFromDmmByVidId('DLDSS-014');
  console.log(videoTrailerUrl);
})();
