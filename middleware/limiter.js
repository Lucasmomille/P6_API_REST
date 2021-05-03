const mongoose = require('mongoose');
const { RateLimiterMongo } = require('rate-limiter-flexible');
require('dotenv').config();

mongoose.connect(process.env.MONGODB,

    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
const mongoConn = mongoose.connection;


const opts = {
    storeClient: mongoConn,
    keyPrefix: 'middleware',
    points: 10, // Number of points
    duration: 1, // Per second(s)
};

const rateLimiterMongo = new RateLimiterMongo(opts);

const rateLimiterMiddleware = (req, res, next) => {
    rateLimiterMongo.consume(req.ip, 2)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send('Too Many Requests');
        });
};

module.exports = rateLimiterMiddleware;