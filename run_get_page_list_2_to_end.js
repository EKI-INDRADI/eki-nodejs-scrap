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


let run_get_page_list_1 = require('./run_get_page_list_1')

async function generate_page_1_to_end(obj = {}) {

    try {
        // Read the JSON file synchronously
        const data = fs.readFileSync(`${path.join("DOWNLOAD", obj.profile_name)}/${obj.profile_name}.json`, 'utf8');

        // Parse the JSON data
        const jsonArray = JSON.parse(data);



        for (let i_a = 0; i_a < jsonArray?.page?.length; i_a++) {
            if (i_a == 0) {

            } else if (i_a == (jsonArray.page.length - 1)) {
                await main(jsonArray.page[i_a], jsonArray.page.length)
            } else {
                // console.log(jsonArray.page[i_a])
                await main(jsonArray.page[i_a])

            }
        }


    } catch (err) {
        console.error('generate_page_1_to_end file:', err);
    }

}





let GET_OBJ_ENV = process.env.OBJ || {}

try { GET_OBJ_ENV = JSON.parse(GET_OBJ_ENV); } catch (skip_err) { }

console.log(GET_OBJ_ENV)

generate_page_1_to_end(GET_OBJ_ENV);











// ============= run_page_1








async function main(set_url = `${process.env.SET_URL}`, last_number = null) {


    try {
        let remove_query_string = String(set_url).split("?")
        let profile_name_arr = String(remove_query_string[0]).split("/")
        let get_domain = `${profile_name_arr[0]}/${profile_name_arr[1]}/${profile_name_arr[2]}`
        let profile_name = `${profile_name_arr[profile_name_arr.length - 1]}`



        let process = await main_process({
            set_url: set_url,
            remove_query_string: remove_query_string,
            get_domain: get_domain,
            profile_name: profile_name,
            last_number: last_number
        })

        return process
    } catch (error) {
        error_detail.try_catch_error_detail(error)
    }

}


async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function main_process(obj = {}, last_number = null) {

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

        let post_start, page_active, page_size, total_post, total_page;

        const smallText = $('section.site-section small').text().trim();
        const matches = smallText.match(/Showing (\d+) - (\d+) of (\d+)/);
        if (matches) {
            post_start = parseInt(matches[1], 10);
            page_size = parseInt(matches[2], 10) - parseInt(matches[1], 10) + 1;
            total_post = parseInt(matches[3], 10);

            if (last_number) {
                total_page = last_number
                page_active = last_number
            } else {
                total_page = Math.ceil(total_post / page_size)
                page_active = Math.ceil(post_start / page_size)
            }

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

        });



        if (String(set_url).toLowerCase().includes("?")) {

            console.log(`=== GENERATE PAGE ${profile_name}_${page_active}`)

            await generate_json({
                profile_name,
                post_start,
                page_active,
                page_size,
                total_post,
                total_page,
                postUrls
                // postUrlsStatus
            })

        } else {

            //===============================GENERATE_URL
            console.log(`=== GENERATE PAGE ${profile_name}`)


            let generate_array = []


            for (let i_a = 0; i_a < total_page; i_a++) {

                if (i_a == 0) {
                    generate_array.push(`${set_url}`)
                } else {
                    generate_array.push(`${set_url}?o=${Number(page_size * i_a)}`)
                }
            }

            let jsonDir = path.resolve(__dirname, path.join('DOWNLOAD', obj.profile_name));
            if (!fs.existsSync(jsonDir)) {
                fs.mkdirSync(jsonDir, { recursive: true });
            }

            // Mengubah objek JavaScript menjadi string JSON
            let jsonString = JSON.stringify({ page: generate_array }, null, 2); // null dan 2 untuk membuat JSON lebih terformat

            // Menulis string JSON ke dalam file, menggantikan file jika sudah ada
            try {
                fs.writeFileSync(`${jsonDir}/${profile_name}.json`, jsonString, 'utf8');
                console.log('File berhasil disimpan!');
            } catch (err) {
                error_detail.try_catch_error_detail(err)
                console.error('Gagal menyimpan file', err);
            }
            //===============================/GENERATE_URL


            console.log(`=== GENERATE PAGE ${profile_name}_1`)

            await generate_json({
                profile_name,
                post_start,
                page_active,
                page_size,
                total_post,
                total_page,
                postUrls
                // postUrlsStatus
            })

        }


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