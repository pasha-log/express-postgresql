const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');
const slugify = require('slugify')

// GET /companies
// Returns list of companies, like {companies: [{code, name}, ...]}

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query('SELECT * FROM companies');
		return res.json({ companies: results.rows });
	} catch (e) {
		return next(e);
	}
});

// Before:
// GET /companies/[code]
// Return obj of company: {company: {code, name, description}}
// If the company given cannot be found, this should return a 404 status response.

// After:
// GET /companies/[code]
// Return obj of company: {company: {code, name, description, invoices: [id, ...]}}
// If the company given cannot be found, this should return a 404 status response.

router.get('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const compResults = await db.query('SELECT * FROM companies WHERE code = $1', [ code ]);
		const invoResults = await db.query('SELECT id FROM invoices WHERE comp_code = $1', [ code ]);
		const indusResults = await db.query('SELECT indus_code FROM comp_indus WHERE comp_code = $1', [ code ])

		if (compResults.rows.length === 0) {
			throw new ExpressError(`Can't find company with code of ${code}`, 404);
		}

		let company = compResults.rows[0];
		const invoices = invoResults.rows;
		const industries = indusResults.rows;

		company.invoices = invoices.map((inv) => inv.id);
		company.industries = industries.map((ind) => ind.indus_code)

		return res.json({ company: company });
	} catch (e) {
		return next(e);
	}
});

// POST /companies
// Adds a company.
// Needs to be given JSON like: {code, name, description}
// Returns obj of new company: {company: {code, name, description}}

// Further study:
// It might be difficult for customers to make up a customer code themselves when making 
// new companies (preferably, they should have no spaces or weird punctuation, and should be all lower-case).

// Fortunately, there’s an NPM library that can help out, slugify. 
// Read about this, and then change the POST /companies route so that they don’t provide a code directly, but you make this by using slugify() on the given name.

router.post('/', async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const code = slugify(name, {lower:true, strict:true})
		const results = await db.query(
			'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
			[ code, name, description ]
		);
		return res.status(201).json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// PUT /companies/[code]
// Edit existing company.
// Should return 404 if company cannot be found.
// Needs to be given JSON like: {name, description}
// Returns update company object: {company: {code, name, description}}

router.put('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const results = await db.query(
			'UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description',
			[ name, description, code ]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't update company with code of ${code}`, 404);
		}
		return res.send({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// DELETE /companies/[code]
// Deletes company.
// Should return 404 if company cannot be found.
// Returns {status: "deleted"}

router.delete('/:code', async (req, res, next) => {
	try {
		const results = await db.query('DELETE FROM companies WHERE code = $1', [ req.params.code ]);
		return res.send({ status: 'deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
