'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = Schema({
    categoryName: {type: String, require: true},
    descriptionCategory: {type: String, require: true}
});

module.exports = mongoose.model('categories', Category);