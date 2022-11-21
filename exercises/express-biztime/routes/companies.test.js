process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
let db = require('../db');

let testCompany;
beforeEach(async () => {
	const result = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ('google', 'Google LLC', 'Maker of worlds most popular search engine.') RETURNING  code, name, description`
	);
	testCompany = result.rows[0];
});

afterEach(async () => {
	await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
	await db.end();
});

// end afterEach

// GET /companies
// Returns list of companies, like {companies: [{code, name}, ...]}

describe('GET /companies', () => {
	test('Gets a list of only company', async () => {
		const res = await request(app).get('/companies');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ companies: [ testCompany ] });
	});
});
// end

// GET /companies/[code]
// Return obj of company: {company: {code, name, description, invoices: [id, ...]}}
// If the company given cannot be found, this should return a 404 status response.

describe('GET /companies/:code', () => {
	test('Gets a single company', async () => {
		const res = await request(app).get(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);
        expect(res.body.company.code).toEqual(testCompany.code);
        expect(res.body.company.name).toEqual(testCompany.name);
        expect(res.body.company.description).toEqual(testCompany.description);
	});
	test('Responds with 404 for invalid code', async () => {
		const res = await request(app).get(`/companies/reddit`);
		expect(res.statusCode).toBe(404);
	});
});
// end

// POST /companies
// Adds a company.
// Needs to be given JSON like: {code, name, description}
// Returns obj of new company: {company: {code, name, description}}

describe('POST /companies', () => {
	test('Adds a new company', async () => {
		const res = await request(app).post('/companies').send({
			name: 'Twitter, Inc.',
			description: "The world's most popular blog."
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			company: { code: 'twitter-inc', name: 'Twitter, Inc.', description: "The world's most popular blog." }
		});
	});
});
// end

// PUT /companies/[code]
// Edit existing company.
// Should return 404 if company cannot be found.
// Needs to be given JSON like: {name, description}
// Returns update company object: {company: {code, name, description}}

describe('PUT /companies/:code', () => {
	test('Updates a single company', async () => {
		const res = await request(app).put(`/companies/${testCompany.code}`).send({
			name: 'Troll',
			description: 'They are a company run by trolls.'
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company : {
			code: `${testCompany.code}`,
			name: 'Troll',
			description: 'They are a company run by trolls.'
			}
		});
	});
	test("Responds with 404 if can't find valid code", async () => {
		const res = await request(app).put(`/companies/jafkljsl`).send({
			name: 'Troll',
			description: 'They are a company run by trolls.'
		});
		expect(res.statusCode).toBe(404);
	});
});
// end

// DELETE /companies/[code]
// Deletes company.
// Should return 404 if company cannot be found.
// Returns {status: "deleted"}

describe('DELETE /companies/:code', () => {
	test('Deletes a single company', async () => {
		const res = await request(app).delete(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: 'deleted' });
	});
});
// end
