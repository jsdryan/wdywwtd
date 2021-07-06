const { router, text } = require('bottender/router');
const cheerio = require('cheerio');
const parameterize = require('parameterize');
const _ = require('lodash');
const got = require('got');
const fs = require('fs');

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

async function sendInfoByMetaData(metaData, context) {
  const vidId = metaData.vidId;
  const coverUrl = metaData.coverUrl;
  const casts = metaData.casts;
  const releaseDate = metaData.releaseDate;
  const source1 = `https://jable.tv/videos/${vidId}/`;
  const source2 = `https://www2.javhdporn.net/video/${vidId}/`;

  async function getCastsFlexContent() {
    const castsArray = casts.split('、');
    const castFlexContents = [];
    for (let i = 0; i < castsArray.length; i++) {
      const castObj = {
        type: 'box',
        layout: 'baseline',
        spacing: 'sm',
        margin: 'lg',
        contents: [
          {
            type: 'text',
            text: '演員',
            color: i === 0 ? '#aaaaaa' : '#FFFFFF',
            size: 'md',
            flex: 5,
            align: 'center',
          },
          {
            type: 'text',
            text: castsArray[i],
            color: '#007bff',
            size: 'md',
            flex: 5,
            align: 'center',
            wrap: true,
            action: {
              type: 'message',
              label: 'action',
              text: `演員資訊「${castsArray[i]}」`,
            },
          },
        ],
      };
      castFlexContents.push(castObj);
    }
    return castFlexContents;
  }

  await context.sendFlex(`「${vidId}」影片資訊。`, {
    type: 'bubble',
    size: 'kilo',
    hero: {
      type: 'image',
      url: coverUrl,
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
      action: {
        type: 'uri',
        uri: coverUrl,
      },
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: vidId,
          weight: 'bold',
          size: 'xl',
          align: 'center',
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'sm',
          contents: [
            ...(await getCastsFlexContent()),
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              margin: 'lg',
              contents: [
                {
                  type: 'text',
                  text: '發行日',
                  color: '#aaaaaa',
                  size: 'md',
                  flex: 5,
                  align: 'center',
                },
                {
                  type: 'text',
                  text: releaseDate,
                  color: '#666666',
                  size: 'md',
                  flex: 5,
                  align: 'center',
                  wrap: true,
                },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'message',
            label: '預告片',
            text: `預告片「${vidId}」`,
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'uri',
            label: '片源 1',
            uri: source1,
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'uri',
            label: '片源 2',
            uri: source2,
          },
        },
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'message',
            label: '👍 我喜歡，收藏！',
            text: `收藏 ${vidId}`,
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'message',
            label: '👎 不喜歡，再抽！',
            text: '抽',
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'message',
            label: '😍 列出我的收藏！',
            text: '我的收藏',
          },
        },
        {
          type: 'spacer',
          size: 'sm',
        },
      ],
      flex: 0,
    },
  });
  context.setState({ currentVidID: vidId });
  context.setState({ currentLikeVidID: '' });
}

async function disLike(context) {
  const { displayName } = await context.getUserProfile();
  const { text } = context.event;
  const data = context.state.collectors;
  const vidId = parameterize(
    text.match(/[A-Za-z]+[\s\-]?\d+/)[0]
  ).toUpperCase();
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
      await myLikes(context);
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
  if (context.state.currentVidID !== '') {
    const { displayName } = await context.getUserProfile();
    const vidId = context.state.currentVidID;
    context.setState({ currentLikeVidID: vidId });
    const data = context.state.collectors;
    const index = data.findIndex(
      (person) => person.name === displayName && person.likes === vidId
    );

    // 已收藏
    if (index > -1) {
      await context.sendText(`您已收藏過「${vidId}」囉！`);
      await myLikes(context);
    } else {
      context.setState({
        currentVidID: vidId,
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
      await myLikes(context);
    }
  } else {
    context.setState({ currentLikeVidID: '' });
    return sendHelp('請輸入「抽」或特定番號（例如：SSNI-001）。', context);
  }
}

async function likeSpecific(context) {
  const { text } = context.event;
  const vidId = parameterize(
    text.match(/[A-Za-z]+[\s\-]?\d+/)[0]
  ).toUpperCase();
  context.setState({ currentLikeVidID: vidId });
  const { displayName } = await context.getUserProfile();
  const data = context.state.collectors;
  const index = data.findIndex(
    (person) => person.name === displayName && person.likes === vidId
  );
  if (index > -1) {
    await context.sendText(`您已收藏過「${vidId}」囉！`);
    await myLikes(context);
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
        await myLikes(context);
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
      await myLikes(context);
    }
  }
}

async function myLikes(context) {
  const { displayName } = await context.getUserProfile();
  const data = context.state.collectors;
  const index = data.findIndex((person) => person.name === displayName);
  if (index === -1) {
    return sendHelp(`${displayName}，您目前沒有收藏任何片子喔。`, context);
  } else {
    const currentLikeVidID = context.state.currentLikeVidID;
    const flexContent = [];
    _.forEach(_.groupBy(data, 'name')[displayName], (value) => {
      flexContent.unshift({
        type: 'box',
        layout: 'baseline',
        margin: 'xxl',
        contents: [
          {
            type: 'text',
            text: value.likes,
            size: 'sm',
            color: '#007bff',
            margin: 'none',
            flex: 5,
            align: 'center',
            decoration: currentLikeVidID === value.likes ? 'underline' : 'none',
            action: {
              type: 'message',
              label: 'action',
              text: value.likes,
            },
          },
          {
            type: 'text',
            text: '移除',
            size: 'sm',
            color: '#dc3545',
            margin: 'none',
            flex: 5,
            align: 'center',
            offsetStart: 'md',
            decoration: 'none',
            action: {
              type: 'message',
              label: 'action',
              text: `移除 ${value.likes}`,
            },
          },
        ],
      });
    });
    await context.sendFlex(`${displayName}的收藏清單`, {
      type: 'bubble',
      size: 'kilo',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${displayName}的收藏清單`,
            align: 'center',
            size: 'lg',
            weight: 'bold',
          },
          {
            type: 'box',
            layout: 'baseline',
            margin: 'xxl',
            contents: [
              {
                type: 'text',
                text: '番號',
                size: 'md',
                margin: 'none',
                flex: 5,
                weight: 'bold',
                align: 'center',
                decoration: 'none',
              },
              {
                type: 'text',
                text: '移除',
                size: 'md',
                margin: 'none',
                flex: 5,
                align: 'center',
                offsetStart: 'md',
                weight: 'bold',
                decoration: 'none',
              },
            ],
          },
          {
            type: 'separator',
            margin: 'none',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'none',
            spacing: 'md',
            contents: [...flexContent],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'separator',
          },
          {
            type: 'text',
            text: '😜 抽更多片片！',
            align: 'center',
            margin: 'lg',
            action: {
              type: 'message',
              label: 'action',
              text: '抽',
            },
          },
        ],
      },
    });
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

async function sendRandomVid(context) {
  const metaData = await getRandomMetaData();
  await sendInfoByMetaData(metaData, context);
}

async function sendSpecificVid(context) {
  try {
    const vidId = parameterize(context.event.text).toUpperCase();
    const metaData = await getSpecificMetaDataByVidId(vidId);
    await sendInfoByMetaData(metaData, context);
  } catch (error) {
    return sendHelp('沒有這部片子喔！', context);
  }
}

async function castInfo(context) {
  async function getCastInfoMetaDataByName(cast) {
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
  }

  const castName = context.event.text.split('「')[1].split('」')[0];
  const castInfoMetaData = await getCastInfoMetaDataByName(castName);
  await context.sendFlex(`「${castName}」資訊`, {
    type: 'bubble',
    size: 'kilo',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: castName,
          align: 'center',
          size: 'lg',
          weight: 'bold',
          margin: 'none',
          style: 'normal',
          offsetTop: 'none',
          offsetBottom: 'none',
        },
      ],
    },
    hero: {
      type: 'image',
      size: 'full',
      url: castInfoMetaData.profilePicURL,
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '基本資料',
              align: 'center',
              size: 'lg',
              weight: 'bold',
              margin: 'xxl',
              style: 'normal',
              offsetTop: 'none',
              offsetBottom: 'none',
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  margin: 'lg',
                  contents: [
                    {
                      type: 'text',
                      text: '生日',
                      size: 'sm',
                      color: '#999999',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      decoration: 'none',
                    },
                    {
                      type: 'text',
                      text: castInfoMetaData.birthDate,
                      size: 'sm',
                      color: '#AAAAAA',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      offsetStart: 'md',
                      decoration: 'none',
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  margin: 'lg',
                  contents: [
                    {
                      type: 'text',
                      text: '身高',
                      size: 'sm',
                      color: '#999999',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      decoration: 'none',
                    },
                    {
                      type: 'text',
                      text: `${castInfoMetaData.height}`,
                      size: 'sm',
                      color: '#AAAAAA',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      offsetStart: 'md',
                      decoration: 'none',
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  margin: 'lg',
                  contents: [
                    {
                      type: 'text',
                      text: '胸圍',
                      size: 'sm',
                      color: '#999999',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      decoration: 'none',
                    },
                    {
                      type: 'text',
                      text: `${castInfoMetaData.bust}`,
                      size: 'sm',
                      color: '#AAAAAA',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      offsetStart: 'md',
                      decoration: 'none',
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  margin: 'lg',
                  contents: [
                    {
                      type: 'text',
                      text: '罩杯',
                      size: 'sm',
                      color: '#999999',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      decoration: 'none',
                    },
                    {
                      type: 'text',
                      text: `${castInfoMetaData.cup}`,
                      size: 'sm',
                      color: '#AAAAAA',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      offsetStart: 'md',
                      decoration: 'none',
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  margin: 'lg',
                  contents: [
                    {
                      type: 'text',
                      text: '腰圍',
                      size: 'sm',
                      color: '#999999',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      decoration: 'none',
                    },
                    {
                      type: 'text',
                      text: `${castInfoMetaData.waist}`,
                      size: 'sm',
                      color: '#AAAAAA',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      offsetStart: 'md',
                      decoration: 'none',
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  margin: 'lg',
                  contents: [
                    {
                      type: 'text',
                      text: '臀圍',
                      size: 'sm',
                      color: '#999999',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      decoration: 'none',
                    },
                    {
                      type: 'text',
                      text: `${castInfoMetaData.hips}`,
                      size: 'sm',
                      color: '#AAAAAA',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      offsetStart: 'md',
                      decoration: 'none',
                    },
                  ],
                },
              ],
              margin: 'none',
              offsetEnd: 'none',
              offsetBottom: 'none',
            },
          ],
          offsetBottom: 'xxl',
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'message',
            label: '列出前 10 高評價作品',
            text: `前 10 高評價作品「${castName}」`,
          },
        },
        {
          type: 'spacer',
          size: 'sm',
        },
      ],
      flex: 0,
    },
  });
}

const sendTrailer = async (context) => {
  const vidId = context.event.text.split('「')[1].split('」')[0];
  const videoTrailerUrl = await getTrailerUrlById(vidId);
  await context.sendVideo({
    originalContentUrl: videoTrailerUrl,
    previewImageUrl: videoTrailerUrl,
  });
};

const top10Vids = async (context) => {
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

  const get10VidsIdByCastName = async (castName) => {
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
  const topRated10 = await get10VidsIdByCastName(castName);
  const topRated10FlexContent = [];
  for (const vid of topRated10) {
    const obj = {
      type: 'box',
      layout: 'baseline',
      margin: 'xxl',
      contents: [
        {
          type: 'text',
          text: vid.releaseDate,
          size: 'sm',
          color: '#999999',
          margin: 'none',
          flex: 5,
          align: 'center',
          decoration: 'none',
        },
        {
          type: 'text',
          text: vid.vidId,
          size: 'sm',
          color: '#007bff',
          margin: 'none',
          flex: 5,
          align: 'center',
          offsetStart: 'md',
          decoration: 'none',
          action: {
            type: 'message',
            label: 'action',
            text: vid.vidId,
          },
        },
      ],
    };
    topRated10FlexContent.push(obj);
  }

  await context.sendFlex(`「${castName}」的高評價作品`, {
    type: 'bubble',
    size: 'kilo',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `「${castName}」作品`,
              align: 'center',
              size: 'lg',
              wrap: true,
              weight: 'bold',
              margin: 'xxl',
              style: 'normal',
              offsetTop: 'none',
              offsetBottom: 'xxl',
            },
            {
              type: 'box',
              layout: 'baseline',
              margin: 'xxl',
              contents: [
                {
                  type: 'text',
                  text: '發售日',
                  size: 'md',
                  margin: 'none',
                  flex: 5,
                  weight: 'bold',
                  align: 'center',
                  decoration: 'none',
                },
                {
                  type: 'text',
                  text: '番號',
                  size: 'md',
                  margin: 'none',
                  flex: 5,
                  align: 'center',
                  offsetStart: 'md',
                  weight: 'bold',
                  decoration: 'none',
                },
              ],
              offsetBottom: 'none',
              offsetTop: 'none',
            },
            {
              type: 'separator',
              margin: 'none',
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'none',
              spacing: 'md',
              contents: [...topRated10FlexContent],
            },
          ],
        },
      ],
    },
  });
};

const test = async (context) => {
  await context.sendText('Test function.');
};

module.exports = async function App() {
  return router([
    text(/^抽{1}$/, sendRandomVid),
    text(/^[A-Za-z]+[\s\-]?\d+$/, sendSpecificVid),
    text(/^收藏$/, like),
    text(/^test$/, test),
    text(/^收藏\s?[A-Za-z]+[\s\-]?\d+$/, likeSpecific),
    text(/^移除\s?[A-Za-z]+[\s\-]?\d+$/, disLike),
    text(/^演員資訊「.+」$/, castInfo),
    text(/^預告片「\s?[A-Za-z]+[\s\-]?\d+」$/, sendTrailer),
    text(/^前 10 高評價作品「.+」$/, top10Vids),
    text(/^我的收藏$/, myLikes),
    // route('*', sendHelp),
  ]);
};
