const express = require('express')
const router = express.Router()

// Post api/posts
// Register User
// Public

router.post('/', (req, res) => {
    console.log(req.body)
})

module.exports = router