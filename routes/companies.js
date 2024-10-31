const db = require("../db"), ExpressError = require("../expressError"), express = require("express"), router = new express.Router(), slugify = require("slugify");

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
        const results = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [req.params.code]),
            results2 = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE comp_code=$1`, [req.params.code]),
            results3 = await db.query(`SELECT industries.code, industries.industry FROM industries JOIN industries_companies ON industries.code = industries_companies.industry_code JOIN companies ON industries_companies.company_code = companies.code WHERE companies.code=$1`, [req.params.code]);
        if (!!results.rows.length) return res.json({ company: { code: results.rows[0].code, name: results.rows[0].name, description: results.rows[0].description, invoices: results2.rows, industries: results3.rows } });
        else throw new ExpressError(`Company code ${req.params.code} doesn't exist.`, 404);
    } catch (err) {
        return next(err);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const data = req.body;
        if (data.name && data.description) {
            await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)`, [slugify(data.name, { lower: true }), data.name, data.description]);
            return res.status(201).json({ company: { code: slugify(data.name, { lower: true }), name: data.name, description: data.description } });
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