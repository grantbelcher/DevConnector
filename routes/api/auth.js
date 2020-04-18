const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')

// bring in User model
const User = require('../../models/User')

// @route GET api/auth
// @desc Test Route
// @access Public


// use auth middleware to protect route
router.get('/', auth, async (req, res) => {
    try {
        // access user from collection,    req.user is defined in middleware function

        const user = await User.findById(req.user.id).select('-password') ;
                                                        // '-password' => excludes password field from user data
        // send the user information when user logs in
        res.json(user);
    } catch(err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});

module.exports = router