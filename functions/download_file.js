const axios = require('axios');
let error_detail = require('./error_detail')
const fs = require('fs');
let browser_useragent = require('./browser_useragent')
// Fungsi untuk mengunduh file dengan retry manual
exports.downloadFileWithRetry = async function (url, outputLocationPath, retries = 3, id = null) {
    const writer = fs.createWriteStream(outputLocationPath);
  
    for (let attempt = 1; attempt <= retries; attempt++) {
  
      try {
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
          headers : browser_useragent.setHeaders()
        });
  
        response.data.pipe(writer);
  
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
      } catch (error) {
        error_detail.try_catch_error_detail(error)
        // console.error(`${id} | GET DOWNLOAD FILE | RE-TRY ${attempt} | ${url} | ERROR : ${error}`);
        console.error(`${id} | GET DOWNLOAD FILE | RE-TRY ${attempt} | ERROR : ${error}`);
        if (attempt === retries) {
          throw error;
        }
        // Tunggu sebelum mencoba lagi
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }
  }