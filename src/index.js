const { router, text } = require('bottender/router');
const cheerio = require('cheerio');
const parameterize = require('parameterize');
const _ = require('lodash');
const got = require('got');
const fs = require('fs');
const httpsUrl = require('https-url');
const logger = require('heroku-logger');
const {
  getCastInfoFlexMessageObject,
  getVideoInfoFlexMessageObject,
  getCastsNameFlexMessageObject,
  getUserLikesListFlexMessageObject,
  getUserLikedItemsFlexMessageObject,
  getHighRatedVideoListFlexMessageObject,
  getHighRatedItemsFlexMessageObject,
} = require('./flex-message-templates.js');

async function loggingProcess(context, actionName, target) {
  const { displayName, pictureUrl } = await context.getUserProfile();
  logger.info(actionName, {
    displayName: displayName,
    pictureUrl: pictureUrl,
    target: target,
  });
}

async function getLocalDate() {
  if (!Date.prototype.toISODate) {
    Date.prototype.toISODate = function () {
      return (
        this.getFullYear() +
        '-' +
        ('0' + (this.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + this.getDate()).slice(-2)
      );
    };
  }
  return new Date().toISODate();
}

async function getSpecificMetaDataByVidId(vidId) {
  console.log(vidId);

  const apiUrl = 'https://dmm-api-for-wdywwyd.herokuapp.com/lf_video_metadata';
  const response = await got(apiUrl, {
    searchParams: { vid_id: vidId },
  });
  const metadata = JSON.parse(response.body);
  const videoTitle = metadata.video_title;
  const coverUrl = metadata.video_cover_url;
  const casts = metadata.casts_name;
  const releaseDate = metadata.released_at;
  const trailerVideoUrl = metadata.trailer_video_url;
  return {
    vidId,
    videoTitle,
    coverUrl,
    casts,
    releaseDate,
    trailerVideoUrl,
  };
}

async function getRandomMetaData() {
  const getRandomVidIdFromTextFileByStream = (stream) => {
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
  const stream = fs.createReadStream('./src/javlibrary-best-rated.txt', {
    encoding: 'utf8',
  });
  const randomizedVidId = await getRandomVidIdFromTextFileByStream(stream);
  const specificMetaData = await getSpecificMetaDataByVidId(randomizedVidId);
  return specificMetaData;
}

async function sendVideoInfoByMetaData(videoInfoMetaData, context) {
  const videoSourceUrl = [
    `https://jable.tv/videos/${videoInfoMetaData.vidId}/`,
    `https://www2.javhdporn.net/video/${videoInfoMetaData.vidId}/`,
  ];

  await context.sendFlex(
    `「${videoInfoMetaData.vidId}」影片資訊。`,
    getVideoInfoFlexMessageObject(
      videoInfoMetaData,
      getCastsNameFlexMessageObject(videoInfoMetaData.casts),
      videoSourceUrl
    )
  );

  context.setState({ currentVidID: videoInfoMetaData.vidId });
  context.setState({ currentLikeVidID: '' });
}

async function disLike(context) {
  const { displayName } = await context.getUserProfile();
  const { text } = context.event;
  const data = context.state.collectors;
  const vidId = parameterize(
    text.match(/[A-Za-z]+[\s\-]?\d+/)[0]
  ).toUpperCase();
  await loggingProcess(context, 'disLike', vidId);

  if (data.length !== 0) {
    const index = data.findIndex(
      (person) => person.name === displayName && person.likes === vidId
    );
    if (index > -1) {
      data.splice(index, 1);
      context.setState({
        currentVidID: vidId,
        collectors: data,
      });
      await context.sendText(`您移除了「${vidId}」`);
      await sendUserLikesList(context);
    } else {
      return sendHelp(`您不是${displayName}本人，無法移除唷！`, context);
    }
  } else {
    return sendHelp(
      `${displayName}，您目前沒有收藏任何片子，沒有東西可讓您移除喔。`,
      context
    );
  }
}

async function like(context) {
  const { text } = context.event;
  const vidId = parameterize(
    text.match(/[A-Za-z]+[\s\-]?\d+/)[0]
  ).toUpperCase();
  await loggingProcess(context, 'like', vidId);

  context.setState({ currentLikeVidID: vidId });
  const { displayName } = await context.getUserProfile();
  const data = context.state.collectors;
  const index = data.findIndex(
    (person) => person.name === displayName && person.likes === vidId
  );
  if (index > -1) {
    await context.sendText(`您已收藏過「${vidId}」囉！`);
    await sendUserLikesList(context);
  } else {
    // 如果頻道目前所抽的番號與準備要收藏的相同，不須驗證番號是否存在即可收藏。
    if (context.state.currentVidID !== vidId) {
      try {
        await getSpecificMetaDataByVidId(vidId);
        context.setState({
          collectors: [
            ...context.state.collectors,
            {
              date: await getLocalDate(),
              name: displayName,
              likes: vidId.trim(),
            },
          ],
        });
        await context.sendText(`您收藏了「${vidId}」`);
        await sendUserLikesList(context);
      } catch (error) {
        return sendHelp(error, context);
      }
    } else {
      context.setState({
        collectors: [
          ...context.state.collectors,
          {
            date: await getLocalDate(),
            name: displayName,
            likes: vidId.trim(),
          },
        ],
      });
      await context.sendText(`您收藏了「${vidId}」`);
      await sendUserLikesList(context);
    }
  }
}

async function sendUserLikesList(context) {
  await loggingProcess(context, 'sendUserLikesList', 'self');

  const { displayName } = await context.getUserProfile();
  const data = context.state.collectors;
  const index = data.findIndex((person) => person.name === displayName);
  if (index === -1) {
    return sendHelp(`${displayName}，您目前沒有收藏任何片子喔。`, context);
  } else {
    const currentLikeVidID = context.state.currentLikeVidID;
    await context.sendFlex(
      `${displayName}的收藏清單`,
      getUserLikesListFlexMessageObject(
        displayName,
        getUserLikedItemsFlexMessageObject(data, displayName, currentLikeVidID)
      )
    );
  }
  context.setState({ currentLikeVidID: '' });
}

async function sendHelp(msg, context) {
  await context.sendText(`${msg}`);
}

async function getTrailerUrlById(vidId) {
  const isTrailerUrlExists = async (trailerUrl) => {
    try {
      const res = await got.head(trailerUrl);
      return res.statusCode === 200;
    } catch (error) {
      return false;
    }
  };

  const getHqByOriginalVideoTrailerSrcUrl = async (videoTrailerSrcUrl) => {
    const hqVersionSrc = videoTrailerSrcUrl.replace(/_(dmb|dm|sm)_/, '_dmb_');
    if (await isTrailerUrlExists(hqVersionSrc)) {
      return hqVersionSrc;
    } else {
      return videoTrailerSrcUrl;
    }
  };

  const getTrailerUrlFromDmmByVidId = async (vidId) => {
    const dmmUrl = 'https://www.dmm.co.jp';
    let src = '';
    try {
      let res = await got(`${dmmUrl}/search/=/searchstr=${vidId}`, {
        headers: { 'user-agent': 'Android' },
      });
      let $ = cheerio.load(res.body);
      const pageText = $('.count-page').text().split('／')[2] || 1;
      if (typeof pageText === 'string') {
        const totalPage = Number(pageText[0]);
        const lowerVidsId = `${vidId.split('-')[0]}${
          vidId.split('-')[1]
        }`.toLowerCase();
        const formattedVid = `^${lowerVidsId}{1}$`;
        const cidRegex = new RegExp(formattedVid);
        for (let i = 1; i <= totalPage; i++) {
          const url = `${dmmUrl}/search/=/searchstr=${vidId}/page=${i}/`;
          console.log(`DMM page: ${url}`);
          res = await got(url, { headers: { 'user-agent': 'Android' } });
          $ = cheerio.load(res.body);
          _.forEach($('a.play-btn'), async (value) => {
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
        return '';
      }
    } catch (_) {}
    return src;
  };

  const trailerUrl = (await getSpecificMetaDataByVidId(vidId)).trailerVideoUrl;

  if (await isTrailerUrlExists(trailerUrl)) {
    return await getHqByOriginalVideoTrailerSrcUrl(trailerUrl);
  } else {
    const dmmTrailerUrl = await getTrailerUrlFromDmmByVidId(vidId);
    if (await isTrailerUrlExists(dmmTrailerUrl)) {
      return await getHqByOriginalVideoTrailerSrcUrl(dmmTrailerUrl);
    } else if (
      await isTrailerUrlExists(
        `https://www.prestige-av.com/sample_movie/TKT${vidId}.mp4`
      )
    ) {
      return `https://www.prestige-av.com/sample_movie/TKT${vidId}.mp4`;
    } else {
      return `https://www.prestige-av.com/sample_movie/${vidId}.mp4`;
    }
  }
}

async function sendRandomVideo(context) {
  const metaData = await getRandomMetaData();
  await loggingProcess(context, 'sendRandomVideo', metaData.vidId);
  await sendVideoInfoByMetaData(metaData, context);
}

async function sendSpecificVideo(context) {
  try {
    const vidId = parameterize(context.event.text).toUpperCase();
    await loggingProcess(context, 'sendRandomVideo', vidId);

    const metaData = await getSpecificMetaDataByVidId(vidId);
    await sendVideoInfoByMetaData(metaData, context);
  } catch (error) {
    // return sendHelp('沒有這部片子喔！', context);
    console.log(error);
  }
}

async function sendCastInfo(context) {
  const getCastInfoMetaDataByName = async (cast) => {
    const apiUrl = 'https://dmm-api-for-wdywwyd.herokuapp.com';
    const response = await got(`${apiUrl}/casts_info?cast=${cast}`);
    const castMetaData = JSON.parse(response.body);
    const profilePicURL = castMetaData.img_url;
    const birthDate = castMetaData.birth_date;
    const height = `${castMetaData.height} 公分`;
    const bust = `${castMetaData.bust} 公分`;
    const cup = castMetaData.cup;
    const waist = `${castMetaData.waist} 公分`;
    const hips = `${castMetaData.hip} 公分`;
    return {
      profilePicURL,
      birthDate,
      height,
      bust,
      cup,
      waist,
      hips,
    };
  };

  const castName = context.event.text.split('「')[1].split('」')[0];
  await loggingProcess(context, 'sendCastInfo', castName);

  const castInfoMetaData = await getCastInfoMetaDataByName(castName);
  await context.sendFlex(
    `「${castName}」資訊`,
    getCastInfoFlexMessageObject(castName, castInfoMetaData)
  );
}

async function sendTrailer(context) {
  const vidId = context.event.text.split('「')[1].split('」')[0];
  await loggingProcess(context, 'sendTrailer', vidId);

  const coverUrl = await (await getSpecificMetaDataByVidId(vidId)).coverUrl;
  const videoTrailerUrl = await getTrailerUrlById(vidId);
  await context.sendVideo({
    originalContentUrl: httpsUrl(videoTrailerUrl),
    previewImageUrl: httpsUrl(coverUrl),
  });
}

async function sendHighRatedVideos(context) {
  const getDvdMetaDataByFanzaCode = async (fanzaCode) => {
    const response = await got(
      `https://www.libredmm.com/search?q=${fanzaCode}`
    );
    const $ = cheerio.load(response.body);
    return {
      releaseDate: $(
        'body > main > div > div.col-md-4 > dl > dd:nth-child(4)'
      )[0].children.find((child) => child.type == 'text').data,
      vidId: $('body > main > h1 > span:nth-child(1)')[0].children.find(
        (child) => child.type == 'text'
      ).data,
    };
  };

  const getFanzaCastIdByCastName = async (castName) => {
    const response = await got(
      `https://dmm-api-for-wdywwyd.herokuapp.com/casts_info?cast=${castName}`
    );
    const metaData = JSON.parse(response.body);
    return metaData.fanza_cast_code;
  };

  const getHighRatedVideosArrayByCastName = async (castName) => {
    const apiUrl =
      'https://www.dmm.co.jp/digital/videoa/-/list/=/article=actress/device=video';
    const fanzaCastId = await getFanzaCastIdByCastName(castName);
    const response = await got(`${apiUrl}/id=${fanzaCastId}/sort=ranking/`, {
      headers: { 'User-Agent': 'Android', Cookie: 'age_check_done=1' },
    });
    const $ = cheerio.load(response.body);
    const castTopVidsItems = $('.flb-works > a').slice(0, 10);
    const arr = [];
    await Promise.all(
      castTopVidsItems.map(async (_, castItem) => {
        const fanzaCode = castItem.attribs.href.split('cid=')[1].split('/')[0];
        const dvdMetaData = await getDvdMetaDataByFanzaCode(fanzaCode);
        arr.push(dvdMetaData);
      })
    );
    return _.reverse(_.sortBy(arr, ['user', 'releaseDate']));
  };

  const castName = context.event.text.split('「')[1].split('」')[0];
  await loggingProcess(context, 'sendHighRatedVideos', castName);

  const highRatedVideosArray = await getHighRatedVideosArrayByCastName(
    castName
  );

  await context.sendFlex(
    `「${castName}」的高評價作品`,
    getHighRatedVideoListFlexMessageObject(
      castName,
      getHighRatedItemsFlexMessageObject(highRatedVideosArray)
    )
  );
}

const test = async (context) => {
  await context.sendText('Test function.');
};

module.exports = async function App() {
  return router([
    text(/^[A-Za-z]+[\s\-]?\d+$/, sendSpecificVideo),
    text(/^抽{1}$/, sendRandomVideo),
    text(/^收藏\s?[A-Za-z]+[\s\-]?\d+$/, like),
    text(/^移除\s?[A-Za-z]+[\s\-]?\d+$/, disLike),
    text(/^演員資訊「.+」$/, sendCastInfo),
    text(/^預告片「\s?[A-Za-z]+[\s\-]?\d+」$/, sendTrailer),
    text(/^高評價作品「.+」$/, sendHighRatedVideos),
    text(/^我的收藏$/, sendUserLikesList),
    text(/^test$/, test),
    // route('*', sendHelp),
  ]);
};
