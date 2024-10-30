/** Database setup for BizTime. */
const { Client } = require("pg");
let the_DB = process.env.NODE_ENV === "testing" ? "biztime_testing" : "biztime";
db = new Client({ user: 'postgres',
       host: 'localhost',
       database: the_DB,
       password: '9542005',
       port: 5432 });
db.connect();
module.exports = db;

//lesson learned: the default name of the user is postgres, make sure to always try that first.