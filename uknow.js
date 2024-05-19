const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
let error_detail = require('./functions/error_detail')
let axios_page = require('./functions/axios_page')
let download_file = require('./functions/download_file')
const fs = require('fs');
let set_url = `https://coomer.su/onlyfans/user/belledelphine`
let set_re_try = 10

let profile_name_arr = String(set_url).split("/")

let profile_name = `${profile_name_arr[profile_name_arr.length - 1]}`


// Fungsi utama untuk melakukan scraping dan unduh file
async function scrapeAndDownload() {
  const urlToScrape = `${set_url} `; // Ganti dengan URL yang ingin di-scrape


  let generate_id = `${Date.now()} `
  try {
    const response = await axios_page.axiosGetWithRetry(urlToScrape, set_re_try, generate_id);
    const $ = cheerio.load(response.data);

    const filesToDownload = [];

    // Mengambil semua tag img dan video
    $('img').each((index, element) => {
      let src = $(element).attr('src');
      if (src && !src.startsWith('http')) {
        // Menangani URL relatif
        src = new URL(src, urlToScrape).href;
      }
      if (src) {

        if (String(src).toLowerCase().includes("/onlyfans.png")) {
          console.error(`${generate_id} | SKIP FILE: [onlyfans.png]`);
        } else if (String(src).toLowerCase().includes(".svg")) {
          // console.error(`${ id } | SKIP FILE | ${ url } : [SVG]`);
          console.error(`${generate_id} | SKIP FILE: [SVG]`);
        } else if (String(src).toLowerCase().includes(".gif")) {
          // console.error(`${ id } | SKIP FILE | ${ url } : [GIF]`);
          console.error(`${generate_id} | SKIP FILE: [GIF]`);
        } else {
          filesToDownload.push({ type: 'image', url: src, filename: path.basename(src) });
        }

      } //end if
    });

    $('video source').each((index, element) => {
      let src = $(element).attr('src');
      if (src && !src.startsWith('http')) {
        // Menangani URL relatif
        src = new URL(src, urlToScrape).href;
      }
      if (src) {
        filesToDownload.push({ type: 'video', url: src, filename: path.basename(src) });
      }
    });




    // Membuat direktori jika belum ada
    const imgDir = path.resolve(__dirname, path.join('DOWNLOAD', profile_name, 'IMG'));
    const videoDir = path.resolve(__dirname, path.join('DOWNLOAD', profile_name, 'VIDEO'));
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
    }
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir , { recursive: true });
    }


    // Mengunduh semua file yang ditemukan
    for (const file of filesToDownload) {

      const outputDir = file.type === 'image' ? imgDir : videoDir;
      const outputPath = path.resolve(outputDir, file.filename);

      try {
        await download_file.downloadFileWithRetry(file.url, outputPath, set_re_try, generate_id);
        // console.error(`${ generate_id } | GET PAGE DOWNLOAD FILE | ${ file.url } | ${ file.filename } | SUCCESS`);
        console.error(`${generate_id} | GET PAGE DOWNLOAD FILE | ${file.filename} | SUCCESS`);
      } catch (error) {
        error_detail.try_catch_error_detail(error)
        // console.error(`${ generate_id } | GET PAGE DOWNLOAD FILE | ${ file.url } | null | ERROR #1 : ${ error } `);
        console.error(`${generate_id} | GET PAGE DOWNLOAD FILE | null | ERROR #1 : ${error} `);
      }
    }
  } catch (error) {
    error_detail.try_catch_error_detail(error)
    // console.error(`${ generate_id } | GET PAGE DOWNLOAD FILE | ${ urlToScrape } | null | ERROR #2 : ${ error } `);
    console.error(`${generate_id} | GET PAGE DOWNLOAD FILE | null | ERROR #2 : ${error} `);
  }
}



// Mulai scraping dan unduh file
scrapeAndDownload();