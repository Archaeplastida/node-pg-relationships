const db = require("../db");
const ExpressError = require("../expressError");
const invoices = require("./invoices");

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
        const results2 = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE comp_code=$1`, [req.params.code]);
        if (!!results.rows.length) return res.json({ company: { code: results.rows[0].code, name: results.rows[0].name, description: results.rows[0].description, invoices: results2.rows } });
        else throw new ExpressError(`Company code ${req.params.code} doesn't exist.`, 404);
    } catch (err) {
        return next(err);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const data = req.body;
        if (data.code && data.name && data.description) {
            await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)`, [data.code, data.name, data.description]);
            return res.status(201).json({ company: { code: data.code, name: data.name, description: data.description } });
        } else throw new ExpressError("Missing parameter(s)", 400);
    } catch (err) {
        return next(err);
    }
})

router.put("/:code", async (req, res, next) => {
    try {
        const data = req.body;
        const check = await db.query(`SELECT code FROM companies WHERE code=$1`, [req.params.code]);
        if (!check.rows.length) throw new ExpressError(`Company code ${req.params.code} doesn't exist.`, 404);
        if (data.name && data.description) {
            await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3`, [data.name, data.description, req.params.code]);
            return res.status(201).json({ company: { code: data.code, name: data.name, description: data.description } });
        } else throw new ExpressError("Missing parameter(s)", 404);
    } catch (err) {
        return next(err);
    }
})

router.delete("/:code", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [req.params.code]);
        if (!!results.rows.length) {
            await db.query(`DELETE FROM companies WHERE code=$1`, [req.params.code]);
            return res.status(200).json({ status: "deleted" });
        } else throw new ExpressError(`Company code ${req.params.code} doesn't exist.`, 404);
    } catch (err) {
        return next(err);
    }
})

module.exports = { companyRoutes: router };