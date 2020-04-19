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

// @route   PUT api/posts/like/:id
// @desc    PUT a post
// @access  private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // CHECK IF POST HAS ALREADY BEEN LIKED
        if (post.likes.filter(like => like.user.toString() === req.user.id).length)  {
            // ^^^ IF LENGTH OF FILTERED ARRAY IS GREATER THAN ZERO => already liked
            return res.status(400).json({ msg: 'Post already liked' });
        }
        // add user to beginning of 'likes' list
        post.likes.unshift({ user: req.user.id })

        // save updated post document
        await post.save()
        //respond with all likes, this will be used on Front END!!!!
        res.json({liked: post.likes})

    } catch (err) {
        console.error(err)
        res.status(500).send('SERVER ERROR')
    }
})

// @route   PUT api/posts/like/:id
// @desc    PUT a post
// @access  private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // CHECK IF POST HAS ALREADY BEEN LIKED
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0)  {
            // ^^^ IF LENGTH OF FILTERED ARRAY IS ZERO => has not yet been liked
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }
        // GET index of like to be removed
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        // save updated post document
        await post.save()
        //respond with all likes, this will be used on Front END!!!!
        res.json({liked: post.likes})

    } catch (err) {
        console.error(err)
        res.status(500).send('SERVER ERROR')
    }
})

// @route   PUT api/posts/comment/:id
// @desc    add comment to a post
// @access  private

router.put('/comment/:id', [auth, 
    [
        check('text', 'text is required')
            .not()
            .isEmpty()
    ]
    ], 
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            // find user by id
            const user = await User.findById(req.user.id).select('-password')

            // find post by id
            const post = await Post.findById(req.params.id)
            if (!post) {
                return res.status(404).json({ msg: 'Post not found' })
            }
            
            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }
            post.comments.unshift(newComment)
            await post.save()
            res.json(post.comments)
        } catch (err) {
            console.error(err)
            res.status(500).json({ msg: 'Server Error' })
        }
    })

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a comment on a post
// @access  private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const commentIndex = post.comments.map(comment => comment.id).indexOf(req.params.comment_id)
        const comment = (post.comments[commentIndex])
    
        if (!comment) {
            return res.status(404).json({msg: 'comment not found'})
        }


        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: "Bad request"})
        }
        post.comments.splice(commentIndex, 1)
        await post.save()
        res.json(post.comments)

    } catch (error) {
        console.error(error)
        res.status(500).json({msg: 'Server Error'})
    }
})

module.exports = router