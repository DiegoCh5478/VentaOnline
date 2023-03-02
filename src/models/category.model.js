'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = Schema({
    categoryName: {type: String, require: true},
<<<<<<< HEAD
    descriptionCategory: {type: String, require: true},
    productsOfCategory: [{
        product: {type: Schema.Types.ObjectId, ref: 'product'}
    }]
=======
    descriptionCategory: {type: String, require: true}
>>>>>>> 05c15239d0b75052ee3bba5707e7743f1a5b57fc
});

module.exports = mongoose.model('categories', Category);