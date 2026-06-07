/**
 * Module dependencies.
 */
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'BEN-YAKOUB CV',
    metaDescription: 'Online resume in PDF format',
    metaUrl: `${req.protocol}://${req.get('host')}/`,
  });
});

module.exports = router;
