const express = require('express')
const router = express.Router();
const {check, validationResult} = require('express-validator')
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

//@route  POST /api/profile 
//@desc   CREATE / UPDATE user profile
//@access  Private

router.post('/', 
    [
        auth, 
        [
            check('status', 'Status is required')
                .not()
                .isEmpty(),
            check('skills', 'Skills is required')
                .not()
                .isEmpty()
        ]
    ], 
    async (req, res) => {
        
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;
       
        // BUILD PROFILE OBJET
        const profileFields = {};
        profileFields.user = req.user.id
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map((skill) => skill.trim())
        }
        // BUILD SOCIAL OBJECT INSIDE profileFields
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;
        

        try {
            let profile = await Profile.findOne( { user: req.user.id } )

            if (profile) {
                // Update PROFILE
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields },
                    { new: true }
                );
            return res.json(profile)
            }
                // CREATE PROFILE
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile)
        } catch (err) {
            console.error(err)
            res.status(500).send('Server Error')
        }
    }
);

//@route  GET /api/profile/ ...... get profile all profiles
//@desc   GET all profile
//@access  Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['username', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

//@route  GET /api/profile/user/:user_id
//@desc   GET profile by user_id
//@access  Public

router.get('/user/:user_id', async (req, res) => {
    try {                                    // populate query results with username and avatar from user collection
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['username', 'avatar'])

        // check that the profile exists
        if (!profile) {
            return res.status(400).json({ msg: "Profile not found" })
        }
        // if profile exists, send profile
        res.json(profile)

    } catch (err) {
        console.error(err.message)
        // if the objectId is invalid
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: "Profile not found" })
        }
        res.status(500).send('Server Error')
    }
})

//@route  DELETE /api/profile/
//@desc   DELETE  profile, user, AND posts
//@access Private

router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users [posts]

        // remove profile
                                        // req.user.id is the private token
        await Profile.findOneAndRemove({ user: req.user.id })

        await Profile.findOneAndRemove({ user: req.user.id })
        
        res.json({ msg: 'User deleted' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


//@route  PUT /api/profile/experience 
//@desc   ADD profile experience
//@access  Private
router.put('/experience', [ auth, [
    check('title', 'Title is required')
        .not()
        .isEmpty(),
    check('company', 'Company is required')
    .not()
    .isEmpty(),
    check('from', 'From date is required')
    .not()
    .isEmpty()
    ]
], 
async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
                                // return array of errors
        return res.status(400).json({errors: errors.array()})
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })
        // add most recent experience to begining of array
        profile.experience.unshift(newExp)
        // save new profile info
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Server Error' })
    }
})
//@route  DELETE /api/profile/experience/:exp_id
//@desc   DELETE a profile experience
//@access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        // find users profile
        const profile = await Profile.findOne({ user: req.user.id })
        console.log(req.params.exp_id)
        // convert experience array to an array of experience ids, find the index of desired id
        const removeIndex = profile.experience.map((item) => (item.id)).indexOf(req.params.exp_id);
        // remove experience from array
        let newExperience = profile.experience
        newExperience.splice(removeIndex, 1)
        profile.experience = newExperience
        
        // save updated profile document
        await profile.save();

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

//@route  PUT /api/profile/experience 
//@desc   ADD profile experience
//@access  Private
router.put('/education', [ auth, [
    check('school', 'School is required')
        .not()
        .isEmpty(),
    check('degree', 'Degree is required')
    .not()
    .isEmpty(),
    check('fieldofstudy', 'Fields of study is required')
    .not()
    .isEmpty(),
    check('from', 'From date is required')
    .not()
    .isEmpty()
    ]
], 
async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
                                // return array of errors
        return res.status(400).json({errors: errors.array()})
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })
        // add most recent experience to begining of array
        profile.education.unshift(newEdu)
        // save new profile info
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Server Error' })
    }
})
//@route  DELETE /api/profile/experience/:exp_id
//@desc   DELETE a profile experience
//@access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        // find users profile
        const profile = await Profile.findOne({ user: req.user.id })
       
        // convert experience array to an array of experience ids, find the index of desired id
        const removeIndex = profile.education.map((item) => (item.id)).indexOf(req.params.edu_id);
        // remove experience from array
        let newEducation = profile.education
        newEducation.splice(removeIndex, 1)
        profile.education = newEducation
        
        // save updated profile document
        await profile.save();

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router