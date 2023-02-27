'use strict'

const express = require('express');
//Hacemos una instancia de express
const app = express();
//Importamos la conexion a la base de datos
const {connection} = require('./src/database/connection')
// Traemos la constante del puerto
require('dotenv').config();
const port = process.env.PORT;

connection();

//Middlewares para express
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.listen(port, () =>{
    console.log(`Servidor corriendo en el puerto ${port}`);
});