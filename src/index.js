const { router, route, text } = require('bottender/router');
const axios = require('axios');
const cheerio = require('cheerio');
const parameterize = require('parameterize');
const _ = require('lodash');
const MongoSessionStore = require('bottender');



async function sendRandomVid(context) {
    const client = axios.create({
        baseURL: 'http://www.javlibrary.com/tw',
        withCredentials: true,
    });

    // Generate a random page number for Javlibrary Most Wanted Page.
    const randomPageNum = 1 + Math.floor(Math.random() * 25);

    // Visit website.
    const response = await client.get(`/vl_mostwanted.php`, {
        params: { mode: '1', page: randomPageNum },
        headers: { Cookie: 'over18=18' }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const vidsElems = $('.video > a > .id');
    const vidsLength = vidsElems.length;
    const randomVidsNum = Math.floor(Math.random() * vidsLength);
    const randomVid = vidsElems[randomVidsNum];

    // console.log(`Page: ${randomPageNum}, Item: ${randomVidsNum + 1}`);

    // Get ID:
    const id = randomVid.children.find(child => child.type == 'text').data;

    // Get covers.
    const cover = randomVid.next.attribs.src.replace(/ps.jpg/i, 'pl.jpg');

    await context.sendImage({
        originalContentUrl: `https:${cover}`,
        previewImageUrl: `https:${cover}`,
    });
    await context.sendText(id);
    await context.sendText(`https://jable.tv/videos/${id}/`);
    await context.sendText(`https://www2.javhdporn.net/video/${id}/`);
    context.setState({
        currentVidID: id
    });
}

async function sendSingleVid(context) {
    const inputID = parameterize(context.event.text).toUpperCase();

    const client = axios.create({
        baseURL: `https://www.javbus.com/${inputID}`,
    });

    // Visit website.
    const response = await client.get(`/`);

    const html = response.data;
    const $ = cheerio.load(html);

    // Get ID:
    const id = $(`span[style='color:#CC0000;']`).text();

    // Get covers.
    const cover = `https://www.javbus.com${$('.bigImage > img').attr('src')}`;

    await context.sendImage({
        originalContentUrl: cover,
        previewImageUrl: cover,
    });
    await context.sendText(id);
    await context.sendText(`https://jable.tv/videos/${id}/`);
    await context.sendText(`https://www2.javhdporn.net/video/${id}/`);
    context.setState({
        currentVidID: id
    });
}

async function like(context) {
    const { displayName } = await context.getUserProfile();
    if (context.state.currentVidID !== '') {
        const id = context.state.currentVidID;
        context.setState({
            currentVidID: id,
            collectors: [
                ...context.state.collectors,
                {
                    name: displayName,
                    likes: id.trim(),
                }
            ],
        });
        await context.sendText(`你收藏了「${id}」`);
        console.log(context.state);
    } else {
        return sendHelp(context);
    }
}

async function likeSpecific(context) {
    const { text } = context.event;
    const { displayName } = await context.getUserProfile();
    const id = parameterize(text.match(/[A-Za-z]+[\s\-]?\d+/)[0]).toUpperCase();
    context.setState({
        collectors: [
            ...context.state.collectors,
            {
                name: displayName,
                likes: id.trim(),
            }
        ]
    });
    await context.sendText(`你收藏了「${id}」`);
}

async function myLikes(context) {
    const { displayName } = await context.getUserProfile();
    await context.sendText(`${displayName}的收藏：`);
    const data = context.state.collectors;
    const likesArr = _.map(_.mapValues(_.groupBy(data, 'name'), o => o.map(like => _.omit(like, 'name')))[`${displayName}`], 'likes');

    // _.forEach(likesArr, async function(like) {
    //     await context.sendText(like);
    // })
    await context.sendText(likesArr.join('\n'));
}

async function sendHelp(context) {
    await context.sendText(`請輸入「抽」或特定番號（例如：SSNI-001）。`);
}

module.exports = async function App() {
    return router([
        text(/^抽{1}$/, sendRandomVid),
        text(/^[A-Za-z]+[\s\-]?\d+$/, sendSingleVid),
        text(/^收藏$/, like),
        text(/^收藏\s?[A-Za-z]+[\s\-]?\d+$/, likeSpecific),
        text(/^我的收藏$/, myLikes),
        // route('*', sendHelp),
    ]);
};
