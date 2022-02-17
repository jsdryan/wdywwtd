const { router, text } = require('bottender/router');
const cheerio = require('cheerio');
const parameterize = require('parameterize');
const _ = require('lodash');
const got = require('got');
const httpsUrl = require('https-url');
const { javLibraryDataArray } = require('./javlibrary-data.js');
const {
  getActressInfoFlexMessageObject,
  getVideoInfoFlexMessageObject,
  getActressNameFlexMessageObject,
  getUserLikesListFlexMessageObject,
  getUserLikedItemsFlexMessageObject,
  getHighRatedVideoListFlexMessageObject,
  getHighRatedItemsFlexMessageObject,
  getActressRankingFlexMessageObject,
  getNewFacesFlexMessageObject,
  getGanHuaFlexMessageObject,
} = require('./flex-message-templates.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dateTime = require('node-datetime');
const { getRandomGanHua } = require('./googleSheet');

async function loggingProcess(context, actionName, target) {
  const getDateTime = async (format) => {
    const dt = dateTime.create();
    return dt.format(format);
  };

  const { displayName, pictureUrl } = await context.getUserProfile();
  const doc = new GoogleSpreadsheet(
    '1yCwmynf98-OSs9iwR1GCd7NpuWbS0beOIPyPssxETeM'
  );
  const creds = require('./spreadsheet_secret.json');
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsById[0];

  const row = {
    大頭貼: `=image("${
      pictureUrl ||
      'https://images.squarespace-cdn.com/content/v1/58f7904703596ef4c4bdb2e1/1502724353318-778JDBZN2K70W5HRRGIY/no+avatar.png?format=500w'
    }")`,
    色色主角: displayName,
    日期: await getDateTime('Y-m-d'),
    時間: await getDateTime('H:M:S'),
    做了什麼: actionName,
    針對番號: target,
  };

  await sheet.addRow(row);
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
  const apiUrl = 'https://dmm-api-for-wdywwyd.herokuapp.com/video_metadata';
  const response = await got(apiUrl, {
    searchParams: { vid_id: vidId },
  });
  const metadata = JSON.parse(response.body);
  const videoTitle = metadata.video_title;
  const coverUrl = metadata.video_cover_url;
  const actresses = metadata.actresses_name;
  const releaseDate = metadata.released_at;
  const trailerVideoUrl = metadata.trailer_video_url;
  return {
    vidId,
    videoTitle,
    coverUrl,
    actresses,
    releaseDate,
    trailerVideoUrl,
  };
}

async function getRandomMetaData() {
  const getRandomVideoId = async () => {
    const videoLength = javLibraryDataArray.length;
    return javLibraryDataArray[_.random(0, videoLength - 1)];
  };

  const randomizedVidId = await getRandomVideoId();
  const randomMetaData = await getSpecificMetaDataByVidId(randomizedVidId);
  return randomMetaData;
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
      getActressNameFlexMessageObject(videoInfoMetaData.actresses),
      videoSourceUrl
    )
  );

  context.setState({ currentOperationItem: '' });
}

async function isItemExists(data, displayName, item, itemType) {
  const index = data.findIndex(
    (user) =>
      user.name === displayName && user.likes === item && user.type === itemType
  );
  return index > -1;
}

async function disLike(context) {
  const { displayName } = await context.getUserProfile();
  const item = context.event.text.split('「')[1].split('」')[0];
  const isItemTypeVideo = /[A-Za-z]+[\s\-]?\d+/.test(item);
  const removeOrUnfollow = isItemTypeVideo ? '移除' : '取消追蹤';
  const itemType = isItemTypeVideo ? 'video' : 'actress';

  await loggingProcess(context, 'disLike', item);
  context.setState({ currentOperationItem: item });

  const data = context.state.collectors;
  const index = data.findIndex(
    (user) =>
      user.name === displayName && user.likes === item && user.type === itemType
  );
  if (index > -1) {
    data.splice(index, 1);
    context.setState({
      collectors: data,
    });
    await context.sendText(`您${removeOrUnfollow}了「${item}」`);
    await sendUserLikesList(context);
  } else {
    return sendHelp(
      `您不是${displayName}本人，無法${removeOrUnfollow}唷！`,
      context
    );
  }
}

async function like(context) {
  const { displayName } = await context.getUserProfile();
  const item = context.event.text.split('「')[1].split('」')[0];
  const isItemTypeVideo = /[A-Za-z]+[\s\-]?\d+/.test(item);
  const collectOrFollow = isItemTypeVideo ? '收藏' : '追蹤';
  const itemType = isItemTypeVideo ? 'video' : 'actress';

  await loggingProcess(context, 'like', item);
  context.setState({ currentOperationItem: item });

  const data = context.state.collectors;

  if (await isItemExists(data, displayName, item, itemType)) {
    await context.sendText(`您已${collectOrFollow}過「${item}」囉！`);
  } else {
    context.setState({
      collectors: [
        ...context.state.collectors,
        {
          date: await getLocalDate(),
          name: displayName,
          likes: item.trim(),
          type: itemType,
        },
      ],
    });
    await context.sendText(`您${collectOrFollow}了「${item}」`);
  }
  await sendUserLikesList(context);
}

async function sendUserLikesList(context) {
  const { displayName } = await context.getUserProfile();
  const isCurrentItemTypeVideo = /[A-Za-z]+[\s\-]?\d+/.test(
    context.state.currentOperationItem
  );
  const command = context.event.text.split('我的')[1];
  const itemType =
    command === '收藏' || isCurrentItemTypeVideo ? 'video' : 'actress';
  const collectOrFollow = itemType === 'video' ? '收藏' : '追蹤';
  const vidIdOrActress = itemType === 'video' ? '番號' : '女優';
  const removeOrUnFollow = itemType === 'video' ? '移除' : '取消追蹤';

  const hasItems = async (data, itemType) => {
    const index = data.findIndex(
      (user) => user.name === displayName && user.type === itemType
    );
    return index > -1;
  };

  await loggingProcess(context, 'sendUserLikesList', 'Self');
  const data = context.state.collectors;
  if (await hasItems(data, itemType)) {
    const currentOperationItem = context.state.currentOperationItem;
    const itemData = _.filter(data, ['type', itemType]);
    await context.sendFlex(
      `${displayName}的${collectOrFollow}清單`,
      getUserLikesListFlexMessageObject(
        displayName,
        getUserLikedItemsFlexMessageObject(
          itemData,
          displayName,
          currentOperationItem,
          removeOrUnFollow
        ),
        collectOrFollow,
        removeOrUnFollow,
        vidIdOrActress
      )
    );
  } else {
    return sendHelp(
      `${displayName}，您目前沒有${collectOrFollow}任何${vidIdOrActress}喔。`,
      context
    );
  }
  context.setState({ currentOperationItem: '' });
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

async function sendTenContPop(context) {
  let bubbles = [];
  for (let index = 1; index <= 10; index++) {
    const metaData = await getRandomMetaData();
    const videoSourceUrl = [
      `https://jable.tv/videos/${metaData.vidId}/`,
      `https://www2.javhdporn.net/video/${metaData.vidId}/`,
    ];
    const bubble = getVideoInfoFlexMessageObject(
      metaData,
      getActressNameFlexMessageObject(metaData.actresses),
      videoSourceUrl
    );
    bubbles.push(bubble);
  }

  await context.sendFlex('十連抽', {
    type: 'carousel',
    contents: bubbles,
  });
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
    return sendHelp('沒有這部片子喔！', context);
    // console.log(error);
  }
}

async function sendActressInfo(context) {
  const getActressInfoMetaDataByName = async (actressName) => {
    const apiUrl = 'https://dmm-api-for-wdywwyd.herokuapp.com';
    const response = await got(
      `${apiUrl}/actresses_info?actress=${actressName}`
    );
    const actressMetaData = JSON.parse(response.body);
    const profilePicURL = actressMetaData.img_url;
    const birthDate = actressMetaData.birth_date;
    const height = `${actressMetaData.height} 公分`;
    const bust = `${actressMetaData.bust} 公分`;
    const cup = actressMetaData.cup;
    const waist = `${actressMetaData.waist} 公分`;
    const hips = `${actressMetaData.hip} 公分`;
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

  const actressName = context.event.text.split('「')[1].split('」')[0];
  await loggingProcess(context, 'sendActressInfo', actressName);

  const actressInfoMetaData = await getActressInfoMetaDataByName(actressName);
  await context.sendFlex(
    `「${actressName}」資訊`,
    getActressInfoFlexMessageObject(actressName, actressInfoMetaData)
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

  const getFanzaActressIdByActressName = async (actressName) => {
    const response = await got(
      `https://dmm-api-for-wdywwyd.herokuapp.com/actresses_info?actress=${actressName}`
    );
    const metaData = JSON.parse(response.body);
    return metaData.fanza_actress_code;
  };

  const getHighRatedVideosArrayByActressName = async (actressName) => {
    const apiUrl =
      'https://www.dmm.co.jp/digital/videoa/-/list/=/article=actress/device=video';
    const fanzaActressId = await getFanzaActressIdByActressName(actressName);
    const response = await got(`${apiUrl}/id=${fanzaActressId}/sort=ranking/`, {
      headers: { 'User-Agent': 'Android', Cookie: 'age_check_done=1' },
    });
    const $ = cheerio.load(response.body);
    const actressTopVidsItems = $('.flb-works > a').slice(0, 10);
    const arr = [];
    await Promise.all(
      actressTopVidsItems.map(async (_, actressItem) => {
        const fanzaCode = actressItem.attribs.href
          .split('cid=')[1]
          .split('/')[0];
        const dvdMetaData = await getDvdMetaDataByFanzaCode(fanzaCode);
        arr.push(dvdMetaData);
      })
    );
    return _.reverse(_.sortBy(arr, ['user', 'releaseDate']));
  };

  const actressName = context.event.text.split('「')[1].split('」')[0];
  await loggingProcess(context, 'sendHighRatedVideos', actressName);

  const highRatedVideosArray = await getHighRatedVideosArrayByActressName(
    actressName
  );

  await context.sendFlex(
    `「${actressName}」的高評價作品`,
    getHighRatedVideoListFlexMessageObject(
      actressName,
      getHighRatedItemsFlexMessageObject(highRatedVideosArray)
    )
  );
}

async function fanzaMonthly(context) {
  let bubbles = [];
  const apiUrl =
    'https://dmm-api-for-wdywwyd.herokuapp.com/fanza_monthly_actress';
  const response = await got(apiUrl);
  const fanzaMonthlyArray = JSON.parse(response.body).results;
  fanzaMonthlyArray.length = 10;
  for (const actressRankMetaData of fanzaMonthlyArray) {
    const bubble = getActressRankingFlexMessageObject(actressRankMetaData);
    bubbles.push(bubble);
  }

  await context.sendFlex('本月女優排行榜', {
    type: 'carousel',
    contents: bubbles,
  });
}

async function newfaces(context) {
  const apiURL = 'https://dmm-api-for-wdywwyd.herokuapp.com/newfaces';
  let bubbles = [];
  const response = await got(apiURL);
  const newFacesArray = JSON.parse(response.body).results;
  newFacesArray.length = 10;
  for (const newFaceMetaData of newFacesArray) {
    const bubble = getNewFacesFlexMessageObject(newFaceMetaData);
    bubbles.push(bubble);
  }

  await context.sendFlex('新人女優', {
    type: 'carousel',
    contents: bubbles,
  });
}

async function sendGanHua(context) {
  let sheetID;
  let iconUrl;
  const name = context.event.text.split('幹話')[0];
  switch (name) {
    case '尚哲':
      sheetID = '1486435340';
      iconUrl = 'https://i.imgur.com/cSs2UN6.jpg';
      break;
    case '展隆':
      sheetID = '0';
      iconUrl = 'https://i.imgur.com/hgdoXUG.jpg';
      break;
    case '思齊':
      sheetID = '455738423';
      iconUrl = 'https://i.imgur.com/JKMfDVE.jpg';
      break;
    case '伯瑋':
      sheetID = '577079059';
      iconUrl = 'https://i.imgur.com/Cwf0k3j.png';
      break;
  }

  await context.sendText(await getRandomGanHua(sheetID), {
    sender: { name, iconUrl },
  });

  // await context.sendFlex('幹話王', getGanHuaFlexMessageObject);
  await context.sendFlex('This is a hello world flex', {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '展隆幹話',
            text: '展隆幹話',
          },
          style: 'primary',
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '伯瑋幹話',
            text: '伯瑋幹話',
          },
          style: 'primary',
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '思齊幹話',
            text: '思齊幹話',
          },
          style: 'primary',
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '尚哲幹話',
            text: '尚哲幹話',
          },
          style: 'primary',
        },
      ],
      flex: 0,
    },
  });
}

module.exports = async function App() {
  return router([
    text(/^[A-Za-z]+[\s\-]?\d+$/, sendSpecificVideo),
    text(/^抽{1}$/, sendRandomVideo),
    text(/^十連抽{1}$/, sendTenContPop),
    text(/^女優排行榜{1}$/, fanzaMonthly),
    text(/^新人{1}$/, newfaces),
    text(/^(收藏|追蹤)「.+」$/, like),
    text(/^(移除|取消追蹤)「.+」$/, disLike),
    text(/^女優資訊「.+」$/, sendActressInfo),
    text(/^預告片「\s?[A-Za-z]+[\s\-]?\d+」$/, sendTrailer),
    text(/^高評價作品「.+」$/, sendHighRatedVideos),
    text(/^我的(收藏|追蹤)$/, sendUserLikesList),
    text(/^(尚哲|展隆|思齊|伯瑋)幹話$/, sendGanHua),
  ]);
};
