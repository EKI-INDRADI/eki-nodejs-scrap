const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
let error_detail = require('./functions/error_detail')
let axios_page = require('./functions/axios_page')
let run_scrap_page = require('./run_scrap_page')

const fs = require('fs');
const process = require('process');
require('dotenv').config()
let set_re_try = 10





async function main(set_url = `${process.env.SET_URL}`) {


  try {
    let remove_query_string = String(set_url).split("?")
    let profile_name_arr = String(remove_query_string[0]).split("/")
    let get_domain = `${profile_name_arr[0]}/${profile_name_arr[1]}/${profile_name_arr[2]}`
    let profile_name = `${profile_name_arr[profile_name_arr.length - 1]}`



    let process = await main_process({
      set_url: set_url,
      remove_query_string: remove_query_string,
      get_domain: get_domain,
      profile_name: profile_name
    })

    return process
  } catch (error) {
    error_detail.try_catch_error_detail(error)
  }

}



async function main_process(obj = {}) {

  if (obj == {}) {
    console.log('invalid parameter')
    return obj
  }
  // const urlToScrape = `${set_url} `; // Ganti dengan URL yang ingin di-scrape
  let urlToScrape = obj.set_url
  let set_url = obj.set_url
  let remove_query_string = obj.remove_query_string
  let profile_name_arr = obj.profile_name_arr
  let get_domain = obj.get_domain
  let profile_name = obj.profile_name




  let generate_id = `${Date.now()} `
  try {

    const response = await axios_page.axiosGetWithRetry(urlToScrape, set_re_try, generate_id);
    const $ = cheerio.load(response.data);

    //===============================POST

    let post_start, page_active, page_size, total_page;

    const smallText = $('section.site-section small').text().trim();
    const matches = smallText.match(/Showing (\d+) - (\d+) of (\d+)/);
    if (matches) {
      post_start = parseInt(matches[1], 10);
      page_size = parseInt(matches[2], 10) - parseInt(matches[1], 10) + 1;
      total_page = parseInt(matches[3], 10);

      page_active = Math.ceil(post_start / page_size)
    }


    // Mendapatkan array URL post
    const postUrls = [];
    $('article.post-card.post-card--preview').each((index, element) => {
      const dataId = $(element).attr('data-id') || null
      let generate_url_post = null

      if (String(set_url).toLocaleLowerCase().includes("onlyfans")) {
        generate_url_post = `/onlyfans/user/${profile_name}/post/${dataId}`
      } else if (String(set_url).toLocaleLowerCase().includes("fansly")) {
        generate_url_post = `/fansly/user/${profile_name}/post/${dataId}`
      } else if (String(set_url).toLocaleLowerCase().includes("candfans")) {
        generate_url_post = `/candfans/user/${profile_name}/post/${dataId}`
      }

      postUrls.push(`${get_domain}${generate_url_post}`);
      // postUrlsStatus.push({ 
      //   url : `${get_domain}${generate_url_post}`,
      //   status : 0
      // });
    });

    // console.log('post_start', post_start)
    // console.log('page_active:', page_active);
    // console.log('page_size:', page_size);
    // console.log('total_page:', total_page);
    // console.log('postUrls:', postUrls);



    console.log({
      profile_name,
      post_start,
      page_active,
      page_size,
      total_page,
      postUrls
      // postUrlsStatus
    })


    console.log(`=== GENERATE PAGE ${profile_name}_1`)

    await generate_json({
      profile_name,
      post_start,
      page_active,
      page_size,
      total_page,
      postUrls
      // postUrlsStatus
    })

    // for (let i_a; i_a < postUrls.length; i_a++) {
    //   await run_scrap_page.scrapeAndDownload(postUrls[i_a])
    // }




  } catch (error) {
    error_detail.try_catch_error_detail(error)
    console.error(`${generate_id} | GENERATE ALL PAGE | ERROR: ${error} `);
  }

}


async function generate_json(obj = {}) {

  
  const jsonDir = path.resolve(__dirname, path.join('DOWNLOAD', obj.profile_name));
  if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
  }



  // Mengubah objek JavaScript menjadi string JSON
  const jsonString = JSON.stringify(obj, null, 2); // null dan 2 untuk membuat JSON lebih terformat

  // Menulis string JSON ke dalam file, menggantikan file jika sudah ada
  try {
    fs.writeFileSync(`${jsonDir}/${obj.profile_name}_${obj.page_active}.json`, jsonString, 'utf8');
    console.log('File berhasil disimpan!');
  } catch (err) {
    error_detail.try_catch_error_detail(err)
    console.error('Gagal menyimpan file', err);
  }

}





// Mulai scraping dan unduh file
main();



