process.env.NODE_ENV = "test";
const request = require("supertest"), app = require("../app"), db = require("../db");

let testCompany;
let testInvoices;

beforeEach(async () => {
    let company = await db.query(`INSERT INTO companies VALUES ('test2', 'Another Test Company', 'Also a company used for testing.') RETURNING code, name, description`);
    let invoices = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test2', 258.92), ('test2', 999.99) RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    testCompany = company.rows[0];
    testInvoices = invoices.rows;
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
})

afterAll(async () => {
    await db.end();
})

describe("GET /invoices", () => {
    test("Gets a list of all of the invoices.", async () => {
        const response = await request(app).get(`/invoices`);
        for (let i = 0; i < testInvoices.length; i++) response.body.invoices[i].add_date = testInvoices[i].add_date; //This is quite tedious, since add_date shows the exact same value, but they become a different type from each other.
        expect(response.statusCode).toEqual(200);
        expect(response.body.invoices).toEqual(testInvoices)
    })
})

describe("GET /invoices:id", () => {
    test("Gets an invoice based on id.", async () => {
        const response = await request(app).get(`/invoices/${testInvoices[0].id}`);
        response.body.invoice.add_date = testInvoices[0].add_date;
        expect(response.statusCode).toEqual(200);
        expect(response.body.invoice).toEqual(testInvoices[0]);
    })

    test("Returns 404 if invoice isn't found.", async () => {
        const response = await request(app).get(`/invoices/0`);
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({ error: { message: "Invoice 0 doesn't exist.", status: 404 } });
    })
})

describe("POST /invoices", () => {
    test("Adds a new invoice", async () => {
        const response = await request(app).post(`/invoices`).send({
            comp_code: "test2",
            amt: 1999.99
        })
        expect(response.statusCode).toEqual(201);
        expect(typeof response.body).toBe("object");
    })

    test("Returns 400 if a parameter is missing.", async () => {
        const response = await request(app).post(`/invoices`).send({
            comp_code: "test2"
            //there's no amt; it's missing.
        })
        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual({ error: { message: 'Missing parameter(s).', status: 400 } });
    })
})

describe("PUT /invoices:id", () => {
    test("Updates an existing invoice, by id.", async () => {
        const response = await request(app).put(`/invoices/${testInvoices[0].id}`).send({ amt: 9001 });
        testInvoices[0].amt = 9001;
        response.body.invoice.add_date = testInvoices[0].add_date;
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({ invoice: testInvoices[0] });
    })

    test("Returns 404 if invoice isn't found.", async () => {
        const response = await request(app).put(`/invoices/-1`).send({ amt: 999999 });
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({ error: { message: "Invoice -1 doesn't exist.", status: 404 } });
    })
})

describe("DELETE /invoices:id", () => {
    test("Deletes an existing invoice, by id.", async () => {
        const response = await request(app).delete(`/invoices/${testInvoices[0].id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ status: 'deleted' });
    })

    test("Returns 404 if invoice isn't found.", async () => {
        const response = await request(app).delete(`/invoices/-0`);
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({ error: { message: "Invoice -0 doesn't exist.", status: 404 } });
    })
})