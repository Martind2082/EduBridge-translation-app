const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
app.use(cors());
const puppeteer = require('puppeteer');



const port = 8000;
app.listen(port, () => console.log(port));

let quizletinfo;
app.get('/results', (req, res) => {
    let link = req.query.link;
    action(link)
        .then(() => {
            res.send({quizletinfo: quizletinfo});
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
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setUserAgent(
        // agents[Math.floor(Math.random() * agents.length - 1)]
        agents[6]
      );
    await page.goto(link.toString())
        .catch((err) => {
            console.log('THERE IS AN ERROR: ' + err);
            browser.close();
            return;
        })
    const getinfo = await page.evaluate(() => {
        const info = document.querySelectorAll('.TermText');
        let arr = [];
        for (let i = 0; i < info.length; i++) {
            arr.push(info[i].innerText);
        }
        return arr;
    })
    quizletinfo = getinfo;
    console.log('info', quizletinfo);
    browser.close();
    return quizletinfo;
}