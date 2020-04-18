const jwt = require('jsonwebtoken');
const config = require('config')

// middleware function that has access to req and res object, next is a callback that moves on to the next piece of middleware
module.exports = function(req, res, next) {
    // GET token from header, when we send a request to a protected route, token will be sent in the header
    const token = req.header('x-auth-token');
    // ^header key that token is being sent in^

    // check if token exists, and route is protected => DENIED
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    // Verify token
    try {
        // Valid token is decoded
        const decoded = jwt.verify(token, config.get('jwtSecret'))

        //set req.user to user stored in decoded token
        req.user = decoded.user
        next()
    } catch(err) {
        // IF TOKEN IS NOT VALID (expired?)
        res.status(401).json({ msg: 'Token is not valid' })
    }
}