const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

// listing all industries, which should show the company code(s) for that industry
router.get('/', async (req, res, next) => {
	try {
		const results = await db.query('SELECT * FROM industries');
		return res.json({ industries: results.rows });
	} catch (e) {
		return next(e);
	}
});
// end

// adding an industry
router.post('/', async (req, res, next) => {
	try {
		const { code, industry } = req.body;
		const results = await db.query(
			'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry',
			[ code, industry ]
		);
		return res.status(201).json({ industry: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});
// end

// associating an industry to a company
router.post('/', async (req, res, next) => {
	try {
		const { comp_code, indus_code } = req.body;
		const compResult = await db.query('SELECT code FROM companies WHERE code = $1', [ comp_code ]);
		const indusResult = await db.query('SELECT code FROM industries WHERE code = $1', [ indus_code ]);

		if (compResult.rows.length === 0) {
			throw new ExpressError(`Company with comp_code of ${comp_code} does not exist`, 404);
		}

		if (indusResult.rows.length === 0) {
			throw new ExpressError(`Industry with indus_code of ${indus_code} does not exist`, 404);
		}

		const results = await db.query(
			'INSERT INTO comp_indus VALUES ($1, $2) RETURNING comp_code, indus_code',
			[ comp_code, indus_code ]
		);
		return res.status(201).json({ comp_indus: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
