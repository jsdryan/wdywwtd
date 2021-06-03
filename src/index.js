const axios = require('axios');
const cheerio = require('cheerio');
const parameterize = require('parameterize');

module.exports = async function App(context) {
    if (context.event.text === '抽') {

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

        console.log(`Page: ${randomPageNum}, Item: ${randomVidsNum + 1}`);

        // Get ID:
        const id = randomVid.children.find(child => child.type == 'text').data;
        
        // Get covers.
        const previewCover = randomVid.next.attribs.src;
        const cover = previewCover.replace(/ps.jpg/i, 'pl.jpg');

        await context.sendImage({
            originalContentUrl: `https:${cover}`,
            previewImageUrl: `https:${previewCover}`,
        });
        await context.sendText(id);
        await context.sendText(`https://jable.tv/videos/${id}/`);
        await context.sendText(`https://www2.javhdporn.net/video/${id}/`);
    } else if (context.event.text.match(/^[A-Za-z]+[\s\-]?\d+$/i)) {
        const inputID = parameterize(context.event.text);
        console.log(inputID);

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
    }
};

