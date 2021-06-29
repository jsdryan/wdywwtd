const { router, text } = require('bottender/router');
const cheerio = require('cheerio');
const parameterize = require('parameterize');
const _ = require('lodash');
const got = require('got');
const httpsUrl = require('https-url');

async function getLocalDate() {
    if (!Date.prototype.toISODate) {
        Date.prototype.toISODate = function() {
          return this.getFullYear() + '-' +
                 ('0'+ (this.getMonth()+1)).slice(-2) + '-' +
                 ('0'+ this.getDate()).slice(-2);
        }
    }
    return new Date().toISODate();
}

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
    if ($('em').text() === '搜尋沒有結果。') {
        throw `沒有「${vidId}」這部片子。`;
    }
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
    const source1 = `https://jable.tv/videos/${vidId}/`;
    const source2 = `https://www2.javhdporn.net/video/${vidId}/`;

    await context.sendFlex(`「${vidId}」影片資訊。`, {
        "type": "bubble",
        "size": "kilo",
        "hero": {
            "type": "image",
            "url": coverURL,
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover",
            "action": {
                "type": "uri",
                "uri": coverURL
            }
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": vidId,
                    "weight": "bold",
                    "size": "xl",
                    "align": "center"
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "lg",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "baseline",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "演員",
                                    "color": "#aaaaaa",
                                    "size": "md",
                                    "flex": 5,
                                    "align": "center"
                                },
                                {
                                    "type": "text",
                                    "text": casts,
                                    "color": "#666666",
                                    "size": "md",
                                    "flex": 5,
                                    "align": "center",
                                    "wrap": true
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "baseline",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "發行日",
                                    "color": "#aaaaaa",
                                    "size": "md",
                                    "flex": 5,
                                    "align": "center"
                                },
                                {
                                    "type": "text",
                                    "text": releaseDate,
                                    "color": "#666666",
                                    "size": "md",
                                    "flex": 5,
                                    "align": "center",
                                    "wrap": true
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "預告片",
                        "uri": trailerURL
                    }
                },
                {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "片源 1",
                        "uri": source1
                    }
                },
                {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "片源 2",
                        "uri": source2
                    }
                },
                {
                    "type": "separator",
                    "margin": "md"
                },
                {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                        "type": "message",
                        "label": "❤ 我喜歡，收藏！",
                        "text": "收藏"
                    }
                },
                {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                        "type": "message",
                        "label": "👎 不喜歡，再抽！",
                        "text": "抽"
                    }
                },
                {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                        "type": "message",
                        "label": "😍 列出我的收藏！",
                        "text": "我的收藏"
                    }
                },
                {
                    "type": "spacer",
                    "size": "sm"
                }
            ],
            "flex": 0
        }
    });
    context.setState({ currentVidID: vidId });
}

async function disLike(context) {
    const { displayName } = await context.getUserProfile();
    const { text } = context.event;
    const data = context.state.collectors;
    const vidId = parameterize(text.match(/[A-Za-z]+[\s\-]?\d+/)[0])
        .toUpperCase();
    if (data.length !== 0) {
        const index = data.findIndex(person => person.name === displayName && person.likes === vidId);
        if (index > -1) {
            data.splice(index, 1);
            context.setState({
                currentVidID: vidId,
                collectors: data
            });
            await context.sendText(`您移除了「${vidId}」`);
            await myLikes(context);
        } else {
            return sendHelp(`您不是${displayName}本人，無法移除唷！`, context);
        }
    } else {
        return sendHelp(`${displayName}，您目前沒有收藏任何片子，沒有東西可讓您移除喔。`, context);
    }
}

async function like(context) {
    if (context.state.currentVidID !== '') {
        const { displayName } = await context.getUserProfile();
        const vidId = context.state.currentVidID;
        const data = context.state.collectors;
        const index = data.findIndex(person => person.name === displayName && person.likes === vidId);
        // 已收藏
        if (index > -1) {
            return sendHelp(`您已收藏過「${vidId}」囉！`, context);
        } else {
            context.setState({
                currentVidID: vidId,
                collectors: [
                    ...context.state.collectors,
                    {
                        date: await getLocalDate(),
                        name: displayName,
                        likes: vidId.trim(),
                    }
                ],
            });
            await context.sendText(`您收藏了「${vidId}」`);
            await myLikes(context);
        }
    } else {
        return sendHelp('請輸入「抽」或特定番號（例如：SSNI-001）。', context);
    }
}

async function likeSpecific(context) {
    const { text } = context.event;
    const vidId = parameterize(text.match(/[A-Za-z]+[\s\-]?\d+/)[0])
            .toUpperCase();
    const { displayName } = await context.getUserProfile();
    // 如果頻道目前所抽的番號與準備要收藏的相同，不須驗證番號是否存在即可收藏。
    if (context.state.currentVidID !== vidId) {
        try {
            await getSpecificMetaDataById(vidId);
            context.setState({
                collectors: [
                    ...context.state.collectors,
                    {
                        date: await getLocalDate(),
                        name: displayName,
                        likes: vidId.trim(),
                    }
                ]
            });
            await context.sendText(`您收藏了「${vidId}」`);
            await myLikes(context);
        } catch (error) {
            return sendHelp(error, context);
        }
    } else {
        await context.sendText(`您收藏了「${vidId}」`);
        await myLikes(context);
    }
}

async function myLikes(context) {
    const { displayName } = await context.getUserProfile();
    const data = context.state.collectors;
    const index = data.findIndex(person => person.name === displayName);
    if (index === -1) {
        return sendHelp(`${displayName}，您目前沒有收藏任何片子喔。`, context);
    } else {
        context.setState({ myLikesMode: true });
        const flexContent = [];
        _.forEach(_.groupBy(data, 'name')[displayName], (value) => {
            flexContent.unshift(
                {
                    "type": "box",
                    "layout": "baseline",
                    "margin": "xxl",
                    "contents": [
                        {
                            "type": "text",
                            "text": value.likes,
                            "size": "sm",
                            "color": "#999999",
                            "margin": "none",
                            "flex": 5,
                            "align": "center",
                            "decoration": "none"
                        },
                        {
                            "type": "text",
                            "text": "查看",
                            "size": "sm",
                            "color": "#007bff",
                            "margin": "none",
                            "flex": 5,
                            "align": "center",
                            "offsetStart": "md",
                            "decoration": "none",
                            "action": {
                                "type": "message",
                                "label": "action",
                                "text": value.likes
                            }
                        },
                        {
                            "type": "text",
                            "size": "sm",
                            "color": "#dc3545",
                            "margin": "none",
                            "flex": 5,
                            "align": "center",
                            "offsetStart": "md",
                            "decoration": "none",
                            "text": "移除",
                            "action": {
                                "type": "message",
                                "label": "action",
                                "text": `移除 ${value.likes}`
                            }
                        }
                    ],
                    "action": {
                        "type": "message",
                        "label": "action",
                        "text": "et"
                    }
                }
            );
        });
        await context.sendFlex('我的收藏', {
            "type": "bubble",
            "size": "kilo",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": `${displayName}的收藏清單`,
                        "align": "center",
                        "size": "lg",
                        "weight": "bold"
                    },
                    {
                        "type": "separator",
                        "margin": "md"
                    },
                    {
                        "type": "box",
                        "layout": "baseline",
                        "margin": "md",
                        "contents": [
                            {
                                "type": "text",
                                "text": "番號",
                                "size": "md",
                                "margin": "none",
                                "flex": 5,
                                "weight": "bold",
                                "align": "center",
                                "decoration": "none"
                            },
                            {
                                "type": "text",
                                "text": "查看",
                                "size": "md",
                                "margin": "none",
                                "flex": 5,
                                "align": "center",
                                "offsetStart": "md",
                                "weight": "bold",
                                "decoration": "none"
                            },
                            {
                                "type": "text",
                                "text": "移除",
                                "size": "md",
                                "margin": "none",
                                "flex": 5,
                                "align": "center",
                                "offsetStart": "md",
                                "weight": "bold",
                                "decoration": "none"
                            }
                        ]
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "xxl",
                        "spacing": "md",
                        "contents": [...flexContent]
                    }
                ]
            }
        });
    }
}

async function sendHelp(msg, context) {
    await context.sendText(`${msg}`);
}

async function getPreviewURLById(vidId) {
    const DMMURL = 'https://www.dmm.co.jp';
    try {
        let res =
            await got(`${DMMURL}/search/=/searchstr=${vidId}`, {
                headers: { 'user-agent': 'Android' }
        });
        let src = '';
        let $ = cheerio.load(res.body);
        const pageText = $('.count-page').text().split('／')[2] || 1;
        if (typeof(pageText) === 'string') {
            console.log('Cid 解析');
            const totalPage = Number(pageText[0]);
            const lowerVidsId = `${vidId.split('-')[0]}${vidId.split('-')[1]}`.toLowerCase();
            const formattedVid = `^${lowerVidsId}{1}$`;
            const cidRegex = new RegExp(formattedVid);
            for ( var i = 1; i <= totalPage; i++ ) {
                const url = `${DMMURL}/search/=/searchstr=${vidId}/page=${i}/`;
                console.log(url);
                res = await got(url, { headers: { 'user-agent': 'Android' } });
                let $ = cheerio.load(res.body);
                _.forEach($('a.play-btn'), function (value, key) {
                    const cid = value.attribs.cid;
                    if (cidRegex.test(cid)) {
                        src = value.attribs.href
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
}

async function sendRandomVid(context) {
    const metaData = await getRandomMetaData();
    await sendInfoByMetaData(metaData, context);
    context.setState({ myLikesMode: false });
}

async function sendSpecificVid(context) {
    try {
        const vidId = parameterize(context.event.text).toUpperCase();
        const metaData = await getSpecificMetaDataById(vidId);
        const myLikesMode = context.state.myLikesMode;
        await sendInfoByMetaData(metaData, context);
        if (myLikesMode) {
            await myLikes(context);
        }
    } catch (error) {
        return sendHelp(error, context);
    }
}

async function test(context) {
    try {
        got(`https://www.javlibrary.com/tw/vl_searchbyid.php?keyword=iii-555`);
    } catch(err) {
        console.log(err);
    }
}

module.exports = async function App() {
    return router([
        text(/^抽{1}$/, sendRandomVid),
        text(/^[A-Za-z]+[\s\-]?\d+$/, sendSpecificVid),
        text(/^收藏$/, like),
        text(/^測試$/, test),
        text(/^收藏\s?[A-Za-z]+[\s\-]?\d+$/, likeSpecific),
        text(/^移除\s?[A-Za-z]+[\s\-]?\d+$/, disLike),
        text(/^我的收藏$/, myLikes),
        // route('*', sendHelp),
    ]);
};
