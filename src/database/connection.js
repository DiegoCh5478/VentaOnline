'use strict'
const mongoose = require('mongoose');
require('dotenv').config();
const database = process.env.DATA_BASE;
mongoose.set('strictQuery',true);

const connection = async() =>{
    try{

        await mongoose.connect(database);
        console.log("Conectado a la base de datos correctamente.");
    }catch(error){
        throw new Error(error);
    }
}

module.exports = {connection};