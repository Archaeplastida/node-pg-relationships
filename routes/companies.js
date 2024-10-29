const db = require("../db");

const express = require("express"), router = new express.Router();


//**GETS a list of all the companies in the db. */

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name, description FROM companies`);
        return res.json(results.rows);
    } catch (err) {
        return next(err);
    }
})

module.exports = { companyRoutes: router };