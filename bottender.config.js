module.exports = {
  session: {
    driver: 'mongo',
    stores: {
      memory: {
        maxSize: 500,
      },
      file: {
        dirname: '.sessions',
      },
      redis: {
        port: 6379,
        host: '127.0.0.1',
        password: 'auth',
        db: 0,
      },
      mongo: {
        // url: 'mongodb+srv://fap:Xu5x884HIP5vLzBe@cluster0.pdny9.mongodb.net/wdywwtd?retryWrites=true&w=majority',
        url: process.env.MONGODB_URI,
        collectionName: 'sessions',
      },
    },
  },
  initialState: {
    currentOperationItem: '',
    collectors: [],
  },
  channels: {
    messenger: {
      enabled: false,
      path: '/webhooks/messenger',
      pageId: process.env.MESSENGER_PAGE_ID,
      accessToken: process.env.MESSENGER_ACCESS_TOKEN,
      appId: process.env.MESSENGER_APP_ID,
      appSecret: process.env.MESSENGER_APP_SECRET,
      verifyToken: process.env.MESSENGER_VERIFY_TOKEN,
    },
    whatsapp: {
      enabled: false,
      path: '/webhooks/whatsapp',
      accountSid: process.env.WHATSAPP_ACCOUNT_SID,
      authToken: process.env.WHATSAPP_AUTH_TOKEN,
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
    },
    line: {
      enabled: true,
      path: '/webhooks/line',
      // accessToken: 'ryravMGgKM0PaRu9LK4z04WFcH0yPPYsVlLY52P6ivzFQjnaX9cBMka7Rbg6kC0PlL65MVg8m/eoFdj5QbJFQRlVvXACdwbHBLPtvzyzPy5lERQ2URnbp5cEFeJjRF0+BiLsda2YXfR4DfXjpYwAigdB04t89/1O/w1cDnyilFU=',
      // channelSecret: '5db59f62c6d5c92e4cb50852da5a51ac',
      accessToken: process.env.LINE_ACCESS_TOKEN,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
    },
    telegram: {
      enabled: false,
      path: '/webhooks/telegram',
      accessToken: process.env.TELEGRAM_ACCESS_TOKEN,
    },
    slack: {
      enabled: false,
      path: '/webhooks/slack',
      accessToken: process.env.SLACK_ACCESS_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
    },
    viber: {
      enabled: false,
      path: '/webhooks/viber',
      accessToken: process.env.VIBER_ACCESS_TOKEN,
      sender: {
        name: 'xxxx',
      },
    },
  },
};
