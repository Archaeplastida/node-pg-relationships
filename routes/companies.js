const db = require("../db");
const ExpressError = require("../expressError");

const express = require("express"), router = new express.Router();


//**GETS a list of all the companies in the db. */

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name, description FROM companies`);
        return res.json({ companies: results.rows });
    } catch (err) {
        return next(err);
    }
})

router.get("/:code", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [req.params.code]);
        if (!!results.rows.length) return res.json({ company: results.rows });
        else throw new ExpressError(req.params.code + " doesn't exist.", 404);
    } catch (err) {
        return next(err);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const data = req.body;
        if(data.code && data.name && data.description){
            await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)`, [data.code, data.name, data.description]);
            return res.json({company: {code: data.code, name: data.name, description: data.description}});
        } else throw new ExpressError("Missing parameter(s)", 400);
    } catch (err) {
        return next(err);
    }
})

router.put("/:code", async (req, res, next) => {
    try {
        const data = req.body;
        if(data.code && data.name && data.description){
            await db.query(`UPDATE companies SET code=$1, name=$2, description=$3 WHERE code=$4`, [data.code, data.name, data.description, req.params.code]);
            return res.json({company: {code: data.code, name: data.name, description: data.description}});
        } else throw new ExpressError("Missing parameter(s)", 400);
    } catch (err) {
        return next(err);
    }
})

router.delete("/:code", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [req.params.code]);
        if (!!results.rows.length){
            await db.query(`DELETE FROM companies WHERE code=$1`, [req.params.code]);
            return res.json({status: "deleted"});
        } else throw new ExpressError(req.params.code + " doesn't exist.", 404);
    } catch (err) {
        return next(err);
    }
})

module.exports = { companyRoutes: router };