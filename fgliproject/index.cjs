const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
app.use(cors());
const puppeteer = require('puppeteer');



const port = 8000;
app.listen(port, () => console.log(port));

let infoandtitle;
app.get('/results', (req, res) => {
    let link = req.query.link;
    action(link)
        .then(() => {
            res.send({
                quizletinfo: infoandtitle[0],
                title: infoandtitle[1]
            });
        })
})

app.get('/youtube', (req, res) => {
    let link = req.query.link;
    getyoutube(link)
        .then((arraylinks) => {
            res.send({arraylinks: arraylinks})
        })
})

const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
]

async function action(link) {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent(
        // agents[Math.floor(Math.random() * agents.length - 1)]
        agents[2]
      );
    await page.goto(link.toString())
        .catch((err) => {
            console.log('THERE IS AN ERROR: ' + err);
            browser.close();
            return;
        })
    const getinfo = await page.evaluate(() => {
        const info = document.querySelectorAll('.TermText');
        const title = document.querySelectorAll('h1')[0];
        let arr = [];
        for (let i = 0; i < info.length; i++) {
            arr.push(info[i].innerText);
        }
        return [arr, title.textContent];
    })
    infoandtitle = getinfo;
    console.log('info', getinfo[0]);
    console.log(getinfo[1])
    browser.close();
    return getinfo;
}


async function getyoutube(link) {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent(
        agents[2]
      );
    await page.goto(link.toString())
    .catch((err) => {
        console.log('THERE IS AN ERROR: ' + err);
        browser.close();
        return;
    })
    const getinfo = await page.evaluate(() => {
        let arr = [];
        const info = document.querySelectorAll('ytd-video-renderer');
        arr.push(info[0].children[0].children[0].children[0].href);
        arr.push(info[1].children[0].children[0].children[0].href);
        arr.push(info[2].children[0].children[0].children[0].href);
        arr.push(info[3].children[0].children[0].children[0].href);
        return arr;
    })
    browser.close();
    return getinfo;
}
