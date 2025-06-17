const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        token = token.replace('Bearer ', '');

        const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET);

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            res.status(400).send({ Error: 'Bad Request' });
        }

        req.token = token;
        req.user = user;

        next();

    } catch (error) {
        res.status(401).send({ error: 'Unauthorized' });
    }
};

module.exports = auth;