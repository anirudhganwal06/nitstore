// importing mongoose
const mongoose = require('mongoose');

// creating a schema constant from mongoose.Schema
const Schema = mongoose.Schema;

// creating a product schema 
const productSchema = new Schema({
    shortdesc: {
        type: String,
        required: true
    },
    sellerName: {
        type: String,
        required: true
    },
    sellerRollNo: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    imagePublicId: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdOn: {
        type: Number,
        required: true
    }
});

// exporting product schema
module.exports = mongoose.model('Product', productSchema);