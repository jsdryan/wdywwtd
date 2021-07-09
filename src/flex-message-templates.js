const _ = require('lodash');
const httpsUrl = require('https-url');

const getCastInfoFlexMessageObject = (castName, castInfoMetaData) => {
  return {
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
      url: httpsUrl(castInfoMetaData.profilePicURL),
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
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: '列出她的高評價作品',
            text: `高評價作品「${castName}」`,
          },
        },
        {
          type: 'spacer',
          size: 'sm',
        },
      ],
      flex: 0,
    },
  };
};

const getVideoInfoFlexMessageObject = (
  videoInfoMetaData,
  castsNameFlexMessageObject,
  videoSourceUrl
) => {
  return {
    type: 'bubble',
    size: 'kilo',
    hero: {
      type: 'image',
      url: httpsUrl(videoInfoMetaData.coverUrl),
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
      action: {
        type: 'uri',
        uri: httpsUrl(videoInfoMetaData.coverUrl),
      },
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: videoInfoMetaData.vidId,
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
            ...castsNameFlexMessageObject,
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
                  text: videoInfoMetaData.releaseDate,
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
            text: `預告片「${videoInfoMetaData.vidId}」`,
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'uri',
            label: '片源 1',
            uri: videoSourceUrl[0],
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'uri',
            label: '片源 2',
            uri: videoSourceUrl[1],
          },
        },
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: `收藏 ${videoInfoMetaData.vidId}`,
            text: `收藏 ${videoInfoMetaData.vidId}`,
          },
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: '列出我的收藏',
            text: '我的收藏',
          },
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: '再抽一個！',
            text: '抽',
          },
        },
        {
          type: 'spacer',
          size: 'sm',
        },
      ],
      flex: 0,
    },
  };
};

const getCastsNameFlexMessageObject = (casts) => {
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
};

const getUserLikesListFlexMessageObject = (displayName, likedItems) => {
  return {
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
          contents: [...likedItems],
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
  };
};

const getUserLikedItemsFlexMessageObject = (
  data,
  displayName,
  currentLikeVidID
) => {
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
  return flexContent;
};

const getHighRatedVideoListFlexMessageObject = (castName, highRatedItems) => {
  return {
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
              contents: [...highRatedItems],
            },
          ],
        },
      ],
    },
  };
};

const getHighRatedItemsFlexMessageObject = (highRatedVideoIdArray) => {
  const highRatedVideoIdFlexContent = [];
  for (const video of highRatedVideoIdArray) {
    const obj = {
      type: 'box',
      layout: 'baseline',
      margin: 'xxl',
      contents: [
        {
          type: 'text',
          text: video.releaseDate,
          size: 'sm',
          color: '#999999',
          margin: 'none',
          flex: 5,
          align: 'center',
          decoration: 'none',
        },
        {
          type: 'text',
          text: video.vidId,
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
            text: video.vidId,
          },
        },
      ],
    };
    highRatedVideoIdFlexContent.push(obj);
  }
  return highRatedVideoIdFlexContent;
};

module.exports = {
  getCastInfoFlexMessageObject,
  getVideoInfoFlexMessageObject,
  getCastsNameFlexMessageObject,
  getUserLikesListFlexMessageObject,
  getUserLikedItemsFlexMessageObject,
  getHighRatedVideoListFlexMessageObject,
  getHighRatedItemsFlexMessageObject,
};
