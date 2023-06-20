const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Category', Category);