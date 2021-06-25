const { router, text } = require('bottender/router');
const cheerio = require('cheerio');
const parameterize = require('parameterize');
const _ = require('lodash');
const got = require('got');
const httpsUrl = require('https-url');

async function getCastsByElem(castElem) {
    let casts = '';
    if (castElem.length > 1) {
        for (var i = 0; i < castElem.length; i++) {
            casts += castElem[i].children
                .find(child => child.type == 'text')
                .data;
            if (i < castElem.length - 1) { casts += '、' }
        }
    }
    return casts　|| castElem.text();
}

async function getSpecificMetaDataById(vidId) {
    const javlibraryTwURL = 'https://www.javlibrary.com/tw';
    
    let response = await got(`${javlibraryTwURL}/vl_searchbyid.php`, {
        searchParams: { keyword: vidId },
        headers: { 'Cookie': 'over18=18', 'user-agent': 'Android' }
    });

    let $ = cheerio.load(response.body);
    const vidItems = $('.video > a');

    if (vidItems.length > 1) {
        for (let el of vidItems) {
            const code = el.attribs.title.match(/^[A-Z]+\-\d+/g)[0];
            if (code === vidId) {
                console.log(`「${vidId}」有${vidItems.length}筆資料，選定 ${javlibraryTwURL}${el.attribs.href.split('./')[1]} 頁面進行解析中…`)
                response = await got(`${javlibraryTwURL}${el.attribs.href.split('./')[1]}`, {
                    headers: { 'user-agent': 'Android', 'cookie': 'over18=18' }
                });
                $ = cheerio.load(response.body);
                break;
            }
        }
    }
    return {
        vidId: vidId,
        cover: `https:${$('#video_jacket_img').attr('src')}`,
        casts: await getCastsByElem($('#video_cast a')),
        releaseDate: $('#video_date .text').text()
    }
}

async function getRandomMetaData() {
    const javlibraryTwURL = 'https://www.javlibrary.com/tw';

    let response;
    let $;

    const randomPageNum = _.random(1, 25);

    // Get randomized video page.
    response = await got(`${javlibraryTwURL}/vl_mostwanted.php`, {
        searchParams: { mode: 1, page: randomPageNum },
        headers: { 'Cookie': 'over18=18', 'user-agent': 'Android' }
    });

    $ = cheerio.load(response.body);
    const vidsElems = $('.video > a > .id');
    const randomVidsNum = _.random(0, 19);
    const randomVid = vidsElems[randomVidsNum];
    const vidId = randomVid.children
        .find(child => child.type == 'text')
        .data
    
    console.log(`正在取得「${vidId}」的資料`);

    // Get specific video page, for fetching meta data sake.
    const specificMetaData = await getSpecificMetaDataById(vidId);
    
    return specificMetaData;
}

async function sendInfoByMetaData(metaData, context) {
    const vidId = metaData.vidId;
    const trailerURL = await getPreviewURLById(vidId);
    const coverURL = metaData.cover;
    const casts = metaData.casts;
    const releaseDate = metaData.releaseDate;

    await context.sendVideo({
        originalContentUrl: trailerURL,
        previewImageUrl: coverURL,
    });
    await context.sendText(`番號：${vidId}`);
    await context.sendText(`演員：${casts}`);
    await context.sendText(`發行日：${releaseDate}`);
    await context.sendText(`片源 1：https://jable.tv/videos/${vidId}/`);
    await context.sendText(`片源 2：https://www2.javhdporn.net/video/${vidId}/`);

    context.setState({ currentVidID: vidId });
}

async function like(context) {
    const { displayName } = await context.getUserProfile();
    if (context.state.currentVidID !== '') {
        const vidId = context.state.currentVidID;
        context.setState({
            currentVidID: vidId,
            collectors: [
                ...context.state.collectors,
                {
                    name: displayName,
                    likes: vidId.trim(),
                }
            ],
        });
        await context.sendText(`你收藏了「${vidId}」`);
        console.log(context.state);
    } else {
        return sendHelp(context);
    }
}

async function likeSpecific(context) {
    const { text } = context.event;
    const { displayName } = await context.getUserProfile();
    const vidId = parameterize(text.match(/[A-Za-z]+[\s\-]?\d+/)[0])
        .toUpperCase();
    context.setState({
        collectors: [
            ...context.state.collectors,
            {
                name: displayName,
                likes: vidId.trim(),
            }
        ]
    });
    await context.sendText(`你收藏了「${vidId}」`);
}

async function myLikes(context) {
    const { displayName } = await context.getUserProfile();
    await context.sendText(`我的收藏：`);
    const data = context.state.collectors;
    const likesArr = _.map(_.mapValues(_.groupBy(data, 'name'), o => o.map(like => _.omit(like, 'name')))[`${displayName}`], 'likes');

    await context.sendText(likesArr.join('\n'));
}

async function sendHelp(context) {
    await context.sendText(`請輸入「抽」或特定番號（例如：SSNI-001）。`);
}

async function getPreviewURLById(vidId) {
    try {
        let res =
            await got(`https://www.dmm.co.jp/search/=/searchstr=${vidId}`, {
                headers: { 'user-agent': 'Android' }
        });
        const $ = cheerio.load(res.body);
        let src = $('a.play-btn').attr('href');
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
}

async function sendRandomVid(context) {
    const metaData = await getRandomMetaData();
    await sendInfoByMetaData(metaData, context);
}

async function sendSpecificVid(context) {
    const vidId = parameterize(context.event.text).toUpperCase();
    const metaData = await getSpecificMetaDataById(vidId);
    await sendInfoByMetaData(metaData, context);
}

module.exports = async function App() {
    return router([
        text(/^抽{1}$/, sendRandomVid),
        text(/^[A-Za-z]+[\s\-]?\d+$/, sendSpecificVid),
        text(/^收藏$/, like),
        text(/^收藏\s?[A-Za-z]+[\s\-]?\d+$/, likeSpecific),
        text(/^我的收藏$/, myLikes),
        // route('*', sendHelp),
    ]);
};
