'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Invoice = Schema({
    date: {type: Date, require: true},
    totalPrice: {type: Number, require: true},
    // Usuario al que le pertenece la factura
    ownerUser: {type: Schema.Types.ObjectId, ref: 'users'},
    //Productos de la factura
    invoiceProducts: [{
        product: {type: Schema.Types.ObjectId, ref: 'products'},
        amount: {type: Number, require: true}
    }]
});

module.exports = mongoose.model('invoices', Invoice);