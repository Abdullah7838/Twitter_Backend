const mongoose = require('mongoose');

const mongoUrl = 'mongodb://localhost:27017/Tweets'; 

mongoose.connect(mongoUrl, {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  serverSelectionTimeoutMS: 30000, 
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const db = mongoose.connection;

db.on('connected', () => {
  console.log('Mongoose connected to ' + mongoUrl);
});

db.on('disconnected', () => {
  console.log('Mongoose disconnected from ' + mongoUrl);
});

db.on('error', (err) => {
  console.log('Mongoose error: ', err);
});

module.exports = { db };
