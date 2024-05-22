const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
let error_detail = require('./functions/error_detail')
let axios_page = require('./functions/axios_page')
let download_file = require('./functions/download_file')
const fs = require('fs');
require('dotenv').config()
let set_re_try = 10

let GET_OBJ_ENV = process.env.OBJ || {}
try { GET_OBJ_ENV = JSON.parse(GET_OBJ_ENV); } catch (skip_err) { }

// Fungsi utama untuk melakukan scraping dan unduh file

// async function scrapeAndDownload(set_url = `${process.env.SET_URL}`) {
exports.scrapeAndDownload = async function (set_url = `${process.env.SET_URL}`) {



  const urlToScrape = `${set_url} `; // Ganti dengan URL yang ingin di-scrape

  // let remove_query_string = String(set_url).split("?")
  // let profile_name_arr = String(remove_query_string[0]).split("/")
  // let profile_name = `${profile_name_arr[profile_name_arr.length - 1]}`

  let profile_name = GET_OBJ_ENV.profile_name

  let generate_id = `${Date.now()} `
  try {

    const response = await axios_page.axiosGetWithRetry(urlToScrape, set_re_try, generate_id);



    const $ = cheerio.load(response.data);

    const filesToDownload = [];

    // Mengambil semua tag img dan video
    // $('img').each((index, element) => {



    $('.post__files .post__thumbnail a.fileThumb').each((index, element) => {
      // let src = $(element).attr('src');
      // let src = $(element).attr('data-src');
      let src = $(element).attr('href')

      if (src && !src.startsWith('http')) {
        // Menangani URL relatif
        // src = new URL(src, urlToScrape).href;
        //new URL(src, urlToScrape)
        src = $(element).attr('href')
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
      fs.mkdirSync(videoDir, { recursive: true });
    }


    // Mengunduh semua file yang ditemukan
    for (const file of filesToDownload) {

      const outputDir = file.type === 'image' ? imgDir : videoDir;

      if (String(file.filename).includes(`?f=`) == true) {
        let filename_arr = String(file.filename).split(`?f=`)
        file.filename = filename_arr[1]
      }

      const outputPath = path.resolve(outputDir, file.filename);

      //========================= LOAD JSON

      // let profile_name = GET_OBJ_ENV.profile_name
      let load_db_path = path.join('DOWNLOAD', profile_name, `${profile_name}.json`);
      // Read the JSON file synchronously
      let json_db = fs.readFileSync(load_db_path, 'utf-8');
      // Parse JSON data
      let data_db = JSON.parse(json_db);

      if (data_db?.done) {

      } else {
        data_db.done = []
      }

      if (data_db?.error) {

      } else {
        data_db.error = []
      }

      let continue_process = 1
      for (let i_a = 0; i_a < data_db?.done?.length; i_a++) {
        if (data_db.done[i_a] == file.filename) {
          continue_process = 0
        }
      }

      //========================= LOAD JSON

      if (continue_process == 1) {

        if (outputDir && file.type === 'image') {
          try {
            await download_file.downloadFileWithRetry(file.url, outputPath, set_re_try, generate_id);
            // console.error(`${ generate_id } | GET PAGE DOWNLOAD FILE | ${ file.url } | ${ file.filename } | SUCCESS`);
            console.error(`${generate_id} | GET PAGE DOWNLOAD FILE | ${file.filename} | SUCCESS`);

            try {
              data_db.done.push(`${file.filename}`)
              // Menulis kembali ke file
              fs.writeFileSync(load_db_path, JSON.stringify(data_db, null, 2), 'utf-8');
            } catch (skip_err) { }

          } catch (error) {
            error_detail.try_catch_error_detail(error)
            // console.error(`${ generate_id } | GET PAGE DOWNLOAD FILE | ${ file.url } | null | ERROR #1 : ${ error } `);
            console.error(`${generate_id} | GET PAGE DOWNLOAD FILE | null | ERROR #1 : ${error} `);

            try {
              data_db.error.push(`${file.filename}`)
              // Menulis kembali ke file
              fs.writeFileSync(load_db_path, JSON.stringify(data_db, null, 2), 'utf-8');
            } catch (skip_err) { }

          }
        } else {
          console.log(`${generate_id} | VIDEO SKIP`)
        }

      } //end if continue_process

    }
  } catch (error) {
    error_detail.try_catch_error_detail(error)
    // console.error(`${ generate_id } | GET PAGE DOWNLOAD FILE | ${ urlToScrape } | null | ERROR #2 : ${ error } `);
    console.error(`${generate_id} | GET PAGE DOWNLOAD FILE | null | ERROR #2 : ${error} `);
  }
}



// Mulai scraping dan unduh file
// scrapeAndDownload();

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.run = async function () {




  for (let i_a = 1; i_a <= GET_OBJ_ENV.total_page; i_a++) {

    const jsonDir = path.resolve(__dirname, path.join('DOWNLOAD', GET_OBJ_ENV.profile_name));

    let load_json = path.join(`${jsonDir}`, `${GET_OBJ_ENV.profile_name}_${i_a}.json`)



    try {
      let data = fs.readFileSync(load_json, 'utf8');
      let jsonData = JSON.parse(data);


      for (let i_b = 1; i_b <= jsonData.postUrls.length; i_b++) {

        await delay(1200)

        console.log(`${jsonData.postUrls[i_b]}`)

        await exports.scrapeAndDownload(`${jsonData.postUrls[i_b]}`)

      }
    } catch (err) {
      console.error('Error reading or parsing file:', err);
    }



  }


}


exports.run()