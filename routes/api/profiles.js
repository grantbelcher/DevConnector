const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

//@route  GET /api/profile/me ...... get profile of whoever is logging in
//@desc   GET current users profile
//@access  Private

// add auth middleware to protect route
router.get('/me', auth, async (req, res) => {
    try {
        // we have access to user in req body because of auth middleware
         // user id is the foreign ref we are looking for
        const profile = await Profile.findOne({ user: req.user.id }).populate('users', ['name', 'avatar']);
        if (!profile) {
            res.status(400).json({ msg: 'There is no profile for this user' })
        }
        // send profile info
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router