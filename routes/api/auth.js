const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator');


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


// @route POST api/auth
// @desc  Authenticate user & Get token
//        Public

router.post('/', [

    check('email', 'please include a valid email address')
     .isEmail(),
                                       // check that password exists
    check('password', 'password is required').exists()
 ], async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(422).json({errors: errors.array() })
     } 
     
     const {email, password} = req.body
 
     try {
         // check if user exists
         let user = await User.findOne({email})
         if (!user) {
             // status 400 => bad request, credentials are invalid
            return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' } ]})
         }
                    // compare entered password \/ to the hashed password stored in DB \/
         const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' } ]})
        }
         // return jsonwebtoken
         const payload = {
             user: {
                 // id is from the current user being saved, automatically generated
                 id: user.id
             }
         }
         // sign the token
         jwt.sign(
             payload, 
             // get secret from config
             config.get("jwtSecret"),
             { expiresIn: 360000 },
             (err, token) => {
                 if (err) throw err;
                 // take this token and paste it into jwt.io, which will show all data encoded in the token, 
                 // this will contain the userId stored in Mongo
                 res.json({ token })
             }
         );
     } catch(err) {
         console.error(err.message)
         // send response code
         res.status(500).send('Server Error')
     }
   }
 )

module.exports = router