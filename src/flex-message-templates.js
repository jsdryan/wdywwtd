const _ = require('lodash');
const httpsUrl = require('https-url');

const getGanHuaFlexMessageObject = () => {
  return {
    type: 'bubble',
    hero: {
      type: 'image',
      url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png',
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
      action: {
        type: 'uri',
        uri: 'http://linecorp.com/',
      },
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'Brown Cafe',
          weight: 'bold',
          size: 'xl',
        },
        {
          type: 'box',
          layout: 'baseline',
          margin: 'md',
          contents: [
            {
              type: 'icon',
              size: 'sm',
              url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png',
            },
            {
              type: 'icon',
              size: 'sm',
              url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png',
            },
            {
              type: 'icon',
              size: 'sm',
              url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png',
            },
            {
              type: 'icon',
              size: 'sm',
              url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png',
            },
            {
              type: 'icon',
              size: 'sm',
              url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png',
            },
            {
              type: 'text',
              text: '4.0',
              size: 'sm',
              color: '#999999',
              margin: 'md',
              flex: 0,
            },
          ],
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: 'Place',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1,
                },
                {
                  type: 'text',
                  text: 'Miraina Tower, 4-1-6 Shinjuku, Tokyo',
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 5,
                },
              ],
            },
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: 'Time',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1,
                },
                {
                  type: 'text',
                  text: '10:00 - 23:00',
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 5,
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
            type: 'uri',
            label: 'CALL',
            uri: 'https://linecorp.com',
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'uri',
            label: 'WEBSITE',
            uri: 'https://linecorp.com',
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

const getActressRankingFlexMessageObject = (actressRankMetaData) => {
  return {
    type: 'bubble',
    size: 'micro',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: `第 ${actressRankMetaData.rank} 名`,
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
      size: '3xl',
      url: actressRankMetaData.img,
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
              text: actressRankMetaData.name,
              align: 'center',
              size: 'md',
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
                      text: '作品數量',
                      size: 'sm',
                      color: '#999999',
                      margin: 'none',
                      flex: 5,
                      align: 'center',
                      decoration: 'none',
                    },
                    {
                      type: 'text',
                      text: actressRankMetaData.works,
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
          margin: 'none',
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: '女優資訊',
            text: `女優資訊「${actressRankMetaData.name}」`,
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

const getActressInfoFlexMessageObject = (actressName, actressInfoMetaData) => {
  return {
    type: 'bubble',
    size: 'kilo',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: actressName,
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
      url: httpsUrl(actressInfoMetaData.profilePicURL),
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
                      text: actressInfoMetaData.birthDate,
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
                      text: `${actressInfoMetaData.height}`,
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
                      text: `${actressInfoMetaData.bust}`,
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
                      text: `${actressInfoMetaData.cup}`,
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
                      text: `${actressInfoMetaData.waist}`,
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
                      text: `${actressInfoMetaData.hips}`,
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
            label: `追蹤「${actressName}」`,
            text: `追蹤「${actressName}」`,
          },
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: '列出我的追蹤清單',
            text: '我的追蹤',
          },
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: '列出她的高評價作品',
            text: `高評價作品「${actressName}」`,
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
  actressesNameFlexMessageObject,
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
            ...actressesNameFlexMessageObject,
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
            label: '點我看預告',
            text: `預告片「${videoInfoMetaData.vidId}」`,
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'uri',
            label: '點我看片（片源 1）',
            uri: videoSourceUrl[0],
          },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'uri',
            label: '點我看片（片源 2）',
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
            text: `收藏「${videoInfoMetaData.vidId}」`,
          },
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: '列出我的收藏清單',
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

const getActressNameFlexMessageObject = (actresses) => {
  const actressesArray = actresses.split('、');
  const actressFlexContents = [];
  for (let i = 0; i < actressesArray.length; i++) {
    const actressObj = {
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      margin: 'lg',
      contents: [
        {
          type: 'text',
          text: '女優',
          color: i === 0 ? '#aaaaaa' : '#FFFFFF',
          size: 'md',
          flex: 5,
          align: 'center',
        },
        {
          type: 'text',
          text: actressesArray[i],
          color: '#007bff',
          size: 'md',
          flex: 5,
          align: 'center',
          wrap: true,
          action: {
            type: 'message',
            label: 'action',
            text: `女優資訊「${actressesArray[i]}」`,
          },
        },
      ],
    };
    actressFlexContents.push(actressObj);
  }
  return actressFlexContents;
};

const getUserLikesListFlexMessageObject = (
  displayName,
  likedItems,
  collectOrFollow,
  removeOrUnFollow,
  vidIdOrActress
) => {
  return {
    type: 'bubble',
    size: 'kilo',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: `${displayName}的${collectOrFollow}清單`,
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
              text: `${vidIdOrActress}`,
              size: 'md',
              margin: 'none',
              flex: 5,
              weight: 'bold',
              align: 'center',
              decoration: 'none',
            },
            {
              type: 'text',
              text: removeOrUnFollow,
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
  currentOperationItem,
  removeOrUnFollow
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
          decoration:
            currentOperationItem === value.likes ? 'underline' : 'none',
          action: {
            type: 'message',
            label: 'action',
            text: /[A-Za-z]+[\s\-]?\d+/.test(value.likes)
              ? value.likes
              : `女優資訊「${value.likes}」`,
          },
        },
        {
          type: 'text',
          text: `${removeOrUnFollow}`,
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
            text: `${removeOrUnFollow}「${value.likes}」`,
          },
        },
      ],
    });
  });
  return flexContent;
};

const getHighRatedVideoListFlexMessageObject = (
  actressName,
  highRatedItems
) => {
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
              text: `「${actressName}」作品`,
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

const getNewFacesFlexMessageObject = (newFaceMetaData) => {
  return {
    type: 'bubble',
    size: 'micro',
    hero: {
      type: 'image',
      size: '3xl',
      url: httpsUrl(newFaceMetaData.img),
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
              text: newFaceMetaData.name,
              align: 'center',
              size: 'md',
              weight: 'bold',
              margin: 'xxl',
              style: 'normal',
              offsetTop: 'none',
              offsetBottom: 'none',
            },
          ],
          offsetBottom: 'xxl',
        },
      ],
      offsetTop: 'lg',
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'separator',
          margin: 'none',
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'message',
            label: '女優資訊',
            text: `女優資訊「${newFaceMetaData.name}」`,
          },
        },
        {
          type: 'spacer',
          size: 'sm',
        },
      ],
      flex: 0,
      margin: 'none',
    },
  };
};

module.exports = {
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
};
