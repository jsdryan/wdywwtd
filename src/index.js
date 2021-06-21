const { router, route, text } = require('bottender/router');
const axios = require('axios');
const cheerio = require('cheerio');
const parameterize = require('parameterize');
const _ = require('lodash');
const got = require('got');
const httpsUrl = require('https-url');
// const MongoSessionStore = require('bottender');

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

    const preview = await getPreviewURL(id);

    // Get covers.
    const cover = randomVid.next.attribs.src.replace(/ps.jpg/i, 'pl.jpg');
    const conetentID = randomVid.next.attribs.src.split('/').pop().split('ps.jpg')[0];
    console.log(randomVid.next.attribs.src);
    console.log(`https://videos.vpdmm.cc/litevideo/freepv/${conetentID[0]}/${conetentID[0]}${conetentID[1]}${conetentID[2]}/${conetentID}/${conetentID}_dm_w.mp4`);

    await context.sendVideo({
        originalContentUrl: preview,
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

    // Visit website.
    let response = await got(`http://www.javlibrary.com/tw/vl_searchbyid.php`, {
        searchParams: { keyword: inputID },
        headers: { 'Cookie': 'over18=18', 'user-agent': 'Android'  }
    });

    const html = response.body;
    let $ = cheerio.load(html);

    const vidItems = $('.video > a');
    if (vidItems.length > 1) {
        for (let el of vidItems) {
            const code = el.attribs.title.match(/^[A-Z]+\-\d+/g)[0];
            if (code === inputID) {
                console.log('進入二次請求');
                response = await got(`https://www.javlibrary.com/tw${el.attribs.href.split('./')[1]}`, {
                    headers: { 'user-agent': 'Android', 'cookie': 'over18=18' }
                });
                $ = cheerio.load(response.body);
                break;
            }
        }
    }

    // Get ID:
    const id = $('#video_id .text').text();

    // Get covers.
    const cover = `https:${$('#video_jacket_img').attr('src')}`;

    // Get preivew.
    const preview = await getPreviewURL(id);

    console.log(`預覽：${preview}`);
    await context.sendVideo({
        originalContentUrl: preview,
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

async function getPreviewURL(id) {
    try {
        let res = await got(`https://www.dmm.co.jp/search/=/searchstr=${id}`, {
            headers: { 'user-agent': 'Android' }
        });
        const $ = cheerio.load(res.body);
        let src = $('a.play-btn').attr('href');
        if (src === undefined) {
            src = `https://www.prestige-av.com/sample_movie/TKT${id}.mp4`;
            
        }
        return httpsUrl(src);
    } catch (err) {
        console.log(`錯誤訊息：${err}`);
    }
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
