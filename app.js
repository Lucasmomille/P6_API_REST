const express = require('express');

const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const limiter = require('./middleware/limiter');

const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();


var helmet = require('helmet');

app.use(limiter);

app.use(helmet());

app.use(mongoSanitize());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());

app.use('/api/sauces', sauceRoutes);

app.use('/api/auth', userRoutes);



module.exports = app;