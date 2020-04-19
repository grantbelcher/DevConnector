const express = require('express')
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const config = require('config')
const { check, validationResult } = require('express-validator');

// import user model
const User = require('../../models/User')

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
], async (req, res) => {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array() })
    } 
    
    const {username, email, password} = req.body

    try {
        // check if user exists
        let user = await User.findOne({email})
        if (user) {
            // status 400 => bad request, user exists
           return res.status(400).json({ errors: [ { msg: 'User already exists' } ]})
        }
        // Get users gravatar
        const avatar = gravatar.url(email, {
            // size of 200
            s: '200',
            // rating = pg-13
            r: 'pg',
            // gives default user icon
            d: 'mm'
        })

        // create new instance of a user
        user = new User ({
            username,
            email,
            avatar,
            password
        })

        //  Encrypt password
        // asyncronosly generate a 'salt'
        const salt = await bcrypt.genSalt(10)
        // create a hash of the new users email with salt
        user.password = await bcrypt.hash(password, salt)
        // save user to database
        await user.save()

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