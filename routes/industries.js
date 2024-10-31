const db = require("../db"), ExpressError = require("../expressError"), express = require("express"), router = new express.Router();

router.post("/", async (req, res, next) => {
    try {
        const data = req.body
        if (data.code && data.industry) {
            await db.query(`INSERT INTO industries VALUES ($1, $2)`, [data.code, data.industry]);
            return res.status(201).json({ added: { code: data.code, industry: data.industry } });
        } else throw new ExpressError("Missing parameters(s)", 400);
    } catch (err) {
        return next(err);
    }
})

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT industries.code, industries.industry, ARRAY_AGG(companies.code) as companies FROM industries LEFT JOIN industries_companies ON industries.code = industries_companies.industry_code LEFT JOIN companies ON industries_companies.company_code = companies.code GROUP BY industries.code, industries.industry;`);
        return res.json({ industries: results.rows })
    } catch (err) {
        return next(err);
    }
})

router.post("/:industry_code", async (req, res, next) => {
    try {
        const data = req.body
        const check = await db.query(`SELECT code FROM companies WHERE code=$1`, [data.company_code]);
        if (!check.rows.length) throw new ExpressError(`Company code ${data.company_code} doesn't exist.`, 404);
        if (data.company_code) {
            await db.query(`INSERT INTO industries_companies VALUES ($1, $2)`, [req.params.industry_code, data.company_code]);
            return res.status(201).json({ status: `${req.params.industry_code} and ${data.company_code} successfully associated with each other.` })
        } else throw new ExpressError("Missing parameters(s)", 400);
    } catch (err) {
        return next(err);
    }
})

module.exports = { industryRoutes: router };