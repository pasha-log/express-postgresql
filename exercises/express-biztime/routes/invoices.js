const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

// GET /invoices
// Return info on invoices: like {invoices: [{id, comp_code}, ...]}

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query('SELECT * FROM invoices');
		return res.json({ invoices: results.rows });
	} catch (e) {
		return next(e);
	}
});

// GET /invoices/[id]
// Returns obj on given invoice.
// If invoice cannot be found, returns 404.
// Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

router.get('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query(
			'SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description FROM invoices AS i JOIN companies AS c ON (i.comp_code = c.code) WHERE id = $1',
			[ id ]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
		}
		const data = results.rows[0];
		const invoice = {
			id: data.id,
			amt: data.amt,
			paid: data.paid,
			add_date: data.add_date,
			paid_date: data.paid_date,
			company: {
				code: data.comp_code,
				name: data.name,
				description: data.description
			}
		};
		return res.json({ invoice: invoice });
	} catch (e) {
		return next(e);
	}
});

// POST /invoices
// Adds an invoice.
// Needs to be passed in JSON body of: {comp_code, amt}
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post('/', async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(
			'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',
			[ comp_code, amt ]
		);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// PUT /invoices/[id]
// Updates an invoice.
// If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of {amt}
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

// Further study:
// PUT /invoices/[id]
// Updates an invoice.

// If invoice cannot be found, returns a 404.

// Needs to be passed in a JSON body of {amt, paid}

// If paying unpaid invoice: sets paid_date to today
// If un-paying: sets paid_date to null
// Else: keep current paid_date
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.put('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt, paid } = req.body;
		let paid_date = null;

		let currentResult = await db.query('SELECT paid FROM invoices WHERE id=$1', [ id ]);

		if (currentResult.rows.length === 0) {
			throw new ExpressError(`Invoice with id of ${id} does not exist`, 404);
		}

		let currentPaidDate = currentResult.rows[0].paid_date;

		if (!currentPaidDate && paid) {
			paid_date = new Date();
		} else if (!paid) {
			paid_date = null;
		} else {
			paid_date = currentPaidDate;
		}

		const results = await db.query(
			'UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date',
			[ amt, paid, paid_date, id ]
		);
		return res.send({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// DELETE /invoices/[id]
// Deletes an invoice.
// If invoice cannot be found, returns a 404.
// Returns: {status: "deleted"}
// Also, one route from the previous part should be updated:
// GET /companies/[code]
// Return obj of company: {company: {code, name, description, invoices: [id, ...]}}
// If the company given cannot be found, this should return a 404 status response.

router.delete('/:id', async (req, res, next) => {
	try {
		const result = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [ req.params.id ]);
		if (result.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
		}
		return res.json({ status: 'deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
