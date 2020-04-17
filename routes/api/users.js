const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');


// @route   GET api/users
// @desc    TEST route
// @access  Public
router.post('/',[
   check('username', 'invalid username')
    .not()
    .isEmpty(),
   check('email', 'please add an email address')
    .isEmail(),
   check('password', 'password must be at least 5 characters').isLength({ min: 5 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array() })
    } 
    res.send('yup')
}
)

module.exports = router