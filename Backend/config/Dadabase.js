const mongoose = require('mongoose');
url="mongodb://localhost:27017";


const connectToMongo = async () => {
    try {
      mongoose.connect(url);
      console.log("Connected to Mongo Successfully!");
    } catch (error) {
      console.log(error);
    }
  };
  module.exports = connectToMongo;
