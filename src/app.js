const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

require('dotenv/config');

const userRoutes = require('../src/app/controllers/user');
const noteRoutes = require('../src/app/controllers/noteController');

var mongoDB = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
}).then(() => {
  console.log('Successfully connected to the MongoDb');
}).catch(err => {
  console.log('Error connecting to the MongoDb');
  process.exit();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Routes wich should handle requests
app.use('/users', userRoutes);
app.use('/notes', noteRoutes);

module.exports = app;