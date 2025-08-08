const mongoose = require('mongoose');

const mongoUrl = 'mongodb://Abdullah101:Abdullah1122@cluster0-shard-00-00.gfv6k.mongodb.net:27017,cluster0-shard-00-01.gfv6k.mongodb.net:27017,cluster0-shard-00-02.gfv6k.mongodb.net:27017/?ssl=true&replicaSet=atlas-8btzqg-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0/DrinkCommunity'; 
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
