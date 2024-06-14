const axios = require('axios');
let error_detail = require('./error_detail')
let browser_useragent = require('./browser_useragent')
// Fungsi untuk melakukan permintaan HTTP dengan retry manual
exports.axiosGetWithRetry = async function (url, retries = 3, id = null) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {

            return await axios.get(url, {
                headers: {
                    ...browser_useragent.setHeaders(),
                    'authority': `${String(url).split('/')[2]}`,
                    'method': `GET`,
                    'path': String(url).replace(`${String(url).split('/')[0]}/${String(url).split('/')[1]}/${String(url).split('/')[2]}`, ``),
                    'scheme': `https`,
                    Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
                    'Accept-Encoding': `gzip, deflate, br, zstd`,
                    'Accept-Language': `en-US,en;q=0.9,id;q=0.8`,
                    'Cookie': `${Date.now()}/${Math.random()}.${Math.random()}.${Math.random()}.${Math.random()}`,
                    'Priority':`u=0, i`,
                    'Sec-Ch-Ua' : `"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"`,
                    'Sec-Ch-Ua-Mobile' : `?0`,
                    'Sec-Ch-Ua-Platform': `"Windows"`,
                    'Sec-Fetch-Dest' : `document`,
                    'Sec-Fetch-Mode' :`navigate`,
                    'Sec-Fetch-Site' : `same-origin`,
                    'Sec-Fetch-User' : `?1`,
                    'Upgrade-Insecure-Requests' : 1,
                    Referer: `${String(url).split('/')[0]}/${String(url).split('/')[1]}/${String(url).split('/')[2]}`
                }
            })

        } catch (error) {
    
            // console.error(`${id} | GET PAGE HTML | RE-TRY ${attempt} | ${url} | ERROR : ${error}`);
            //  console.error(`${id} | GET PAGE HTML | RE-TRY ${attempt} | ERROR : ${error}`);
            if (error.response.status >= 403 || error?.status) {
                console.error(`${id} | GET PAGE HTML | RE-TRY ${attempt} | ERROR 403 OR ABOVE: ${url}`);
            } else {
                console.error(`${id} | GET PAGE HTML | RE-TRY ${attempt} | ERROR: ${error}`);
            }

            error_detail.try_catch_error_detail(error)


            if (attempt === retries) {
                throw error;
            }
            // Tunggu sebelum mencoba lagi
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
    }
}


