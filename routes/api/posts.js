const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const Profile = require('../../models/Profile')
const Post = require('../../models/Post')
const User = require('../../models/User')
// @route   POST api/posts
// @desc    CREATE a post
// @access  PRIVATE

router.post('/',
    [
        auth,
        [
            check('text', 'Text is required')
                .not()
                .isEmpty()
        ]
        
    ], async(req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const user = await User.findById(req.user.id).select('-password'); // -password excludes pass from query result
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }
)
            const post = await newPost.save()

            res.json(post)

        } catch (err) {
        // User is logged already logged in => token w/ userId is in req.user.id
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    }
)

// @route   GET api/posts
// @desc    get all posts
// @access  private

router.get('/', auth, async (req, res) => {
    try {                                  // sort by most recent date
        const posts = await Post.find().sort({ date: -1 })
        res.json(posts)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route   GET api/posts
// @desc    get all posts
// @access  private

router.get('/', auth, async (req, res) => {
    try {                                  // sort by most recent date
        const posts = await Post.find().sort({ date: -1 })
        res.json(posts)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route   GET api/posts/:id
// @desc    get post by id posts
// @access  private

router.get('/:id', auth, async (req, res) => {
    try {                  
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json( { msg: 'Post not found' } )
        }

        res.json(post)
    } catch (err) {
        console.error(err.message);
        // check if the ObjectId was formatted improperly
        console.log(err.kind, 'look here')
        if (err.kind === 'ObjectId') {
            return res.status(404).json( { msg: 'Post not found' } )
        }

        res.status(500).send('Server Error');
    }
})


// @route   DELETE api/posts/:id
// @desc    delete a post
// @access  private

router.delete('/:id', auth, async (req, res) => {
    try {             // find post by id    
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json( { msg: 'Post does not exist' })
        }

        // check that current user matches post author
        if (post.user.toString() !== req.user.id) {
            //  ^ id stored in db is not a string, must change to a string to check for a match
            return res.status(401).json({ msg: 'User not authorized' })
        }
        // delete post
        await post.remove()

        res.json({ msg: 'Post removed' })
    } catch (err) {
        console.error(err.message);

        if (err.kind === 'ObjectId') {
            return res.status(404).json( { msg: 'Post not found' } )
        }

        res.status(500).send('Server Error');
    }
})

module.exports = router