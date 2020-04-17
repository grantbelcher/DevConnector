const express = require('express')
const router = express.Router();

// GET api/posts
// Test Route
// Public

router.get('/', (req, res) => res.send('auth appears here'))

module.exports = router