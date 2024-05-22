
const path = require('path');

const fs = require('fs');
require('dotenv').config()

let GET_OBJ_ENV = process.env.OBJ || {}
try { GET_OBJ_ENV = JSON.parse(GET_OBJ_ENV); } catch (skip_err) { }


//========================= LOAD JSON
let profile_name = GET_OBJ_ENV.profile_name
let load_db_path = path.join('DOWNLOAD', profile_name, `${profile_name}.json`);
// Read the JSON file synchronously
let json_db = fs.readFileSync(load_db_path, 'utf-8');
// Parse JSON data
let data_db = JSON.parse(json_db);

if (data_db?.done) {

} else {
    data_db.done = []
}

data_db.done.push("ok")

// Menulis kembali ke file
fs.writeFileSync(load_db_path, JSON.stringify(data_db, null, 2), 'utf-8');

console.log('File JSON berhasil diupdate.');

console.log(data_db)
//========================= LOAD JSON
