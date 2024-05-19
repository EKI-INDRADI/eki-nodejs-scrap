const axios = require('axios');
let error_detail = require('./error_detail')
let browser_useragent = require('./browser_useragent')
// Fungsi untuk melakukan permintaan HTTP dengan retry manual
exports.axiosGetWithRetry = async function (url, retries = 3, id = null) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            
            return await axios.get(url, { headers : browser_useragent.setHeaders() })

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


