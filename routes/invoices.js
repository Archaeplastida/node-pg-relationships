const db = require("../db"), ExpressError = require("../expressError"), express = require("express"), router = new express.Router();

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices`);
        return res.json({ invoices: results.rows })
    } catch (err) {
        return next(err);
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id = $1`, [req.params.id]);
        if (!!results.rows.length) return res.json({ invoice: results.rows[0] });
        else throw new ExpressError(`Invoice ${req.params.id} doesn't exist.`, 404);
    } catch (err) {
        return next(err);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const data = req.body;
        if (data.comp_code && data.amt) {
            result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [data.comp_code, data.amt]);
            return res.status(201).json({ invoice: result.rows[0] });
        } else throw new ExpressError("Missing parameter(s).", 400);
    } catch (err) {
        return next(err);
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        const data = req.body, check = await db.query(`SELECT id, paid FROM invoices WHERE id=$1`, [req.params.id]);
        let result;
        if (!check.rows.length) throw new ExpressError(`Invoice ${req.params.id} doesn't exist.`, 404);
        if (data.amt) {
            data.paid = !data.paid ? false : true;
            let paid_date = data.paid ? `CURRENT_DATE` : null;
            if (check.rows[0].paid && data.paid) result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [data.amt, req.params.id]);
            else result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=${paid_date} WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [data.amt, data.paid, req.params.id]);
            return res.status(201).json({ invoice: result.rows[0] });
        } else throw new ExpressError("Missing parameter.", 400);
    } catch (err) {
        return next(err);
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id FROM invoices WHERE id=$1`, [req.params.id]);
        if (!!results.rows.length) {
            await db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id]);
            return res.status(200).json({ status: "deleted" });
        } else throw new ExpressError(`Invoice ${req.params.id} doesn't exist.`, 404);
    } catch (err) {
        return next(err);
    }
})

module.exports = { invoiceRoutes: router };