process.env.NODE_ENV = "test";
const request = require("supertest"), app = require("../app"), db = require("../db");

let testCompany;
let testInvoices;

beforeEach(async () => {
    let company = await db.query(`INSERT INTO companies VALUES ('test', 'Test Company', 'A company used for testing.') RETURNING code, name, description`);
    let invoices = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test', 258.92), ('test', 999.99) RETURNING id, comp_code, amt, paid, add_date, paid_date`);
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

describe("GET /companies", () => {
    test("Gets a list of all of the companies (which would be one).", async () => {
        const response = await request(app).get(`/companies`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ companies: [testCompany] });
    })
})

describe("GET /companies/:code", () => {
    test("Gets the specified company by codename, including all of its invoices.", async () => {
        const response = await request(app).get(`/companies/test`)
        for (let i = 0; i < testInvoices.length; i++) response.body.company.invoices[i].add_date = testInvoices[i].add_date;
        expect(response.statusCode).toEqual(200);
        testCompany.invoices = testInvoices;
        expect(response.body).toEqual({ company: testCompany })
    })

    test("Returns 404 if company isn't found.", async () => {
        const response = await request(app).get(`/companies/nonexistent`)
        expect(response.statusCode).toEqual(404)
        expect(response.body).toEqual({ error: { message: "Company code nonexistent doesn't exist.", status: 404 } })
    })
})

describe("POST /companies", () => {
    test("Adds a new company.", async () => {
        const response = await request(app).post(`/companies`).send({
            code: "test2",
            name: "Test Company 2",
            description: "A company which is also used for testing."
        })
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({ company: { code: 'test2', name: 'Test Company 2', description: 'A company which is also used for testing.' } });
    })

    test("Returns 400 if one of the parameters are missing.", async () => {
        const response = await request(app).post(`/companies`).send({
            code: "test3",
            name: "Test Company 3"
            //there's no description; it's missing.
        })
        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual({ error: { message: 'Missing parameter(s)', status: 400 } });
    })
})

describe("PUT /companies:code", () => {
    test("Updates an existing company, by codename.", async () => {
        const response = await request(app).put(`/companies/test`).send({
            name: "Tester",
            description: "A company that isn't even real."
        })
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({ company: { name: 'Tester', description: "A company that isn't even real." } })
    })

    test("Returns 404 if company isn't found.", async () => {
        const response = await request(app).get(`/companies/somethingwhichdoesnotexist`).send({
            name: "Please Work",
            description: "This company never existed in the first place."
        })
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({ error: { message: "Company code somethingwhichdoesnotexist doesn't exist.", status: 404 } })
    })
})

describe("DELETE /companies:code", () => {
    test("Deletes an existing company, by codename.", async () => {
        const response = await request(app).delete(`/companies/test`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ status: 'deleted' })
    })

    test("Returns 404 if company isn't found.", async () => {
        const response = await request(app).delete(`/companies/either_something_which_does_not_exist_or_was_already_deleted`);
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({ error: { message: "Company code either_something_which_does_not_exist_or_was_already_deleted doesn't exist.", status: 404 } })
    })
})