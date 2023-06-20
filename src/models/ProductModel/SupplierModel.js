const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Supplier = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    }
})

module.exports = mongoose.model('Supplier', Supplier);
