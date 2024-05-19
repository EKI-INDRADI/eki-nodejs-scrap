const axios = require('axios');
let error_detail = require('./error_detail')
// Fungsi untuk melakukan permintaan HTTP dengan retry manual
exports.axiosGetWithRetry = async function (url, retries = 3, id = null) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await axios.get(url);
        } catch (error) {
            error_detail.try_catch_error_detail(error)
            // console.error(`${id} | GET PAGE HTML | RE-TRY ${attempt} | ${url} | ERROR : ${error}`);
            console.error(`${id} | GET PAGE HTML | RE-TRY ${attempt} | ERROR : ${error}`);
            if (attempt === retries) {
                throw error;
            }
            // Tunggu sebelum mencoba lagi
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
    }
}


