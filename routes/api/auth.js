const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')


// @route GET api/auth
// @desc Test Route
// @access Public


// use auth middleware to protect route
router.get('/', auth, (req, res) => res.send('auth appears here'))

module.exports = router