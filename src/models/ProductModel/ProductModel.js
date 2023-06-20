const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
    name: {
        type: String,
        required: true,
        // minLength: 1
    },
    supplierID: { // house san xuat
        type: Schema.Types.ObjectId,
        ref: 'Supplier', // Name of the relevant Supplier model
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    // categoryID: { // category ID
    // type: Schema.Types.ObjectId,
    // ref: 'Category', // Name of the relevant Supplier model
    // required: true,
    // },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        required: true,
    },
    img: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Product', Product);