'use strict';

const express = require('express');
//Hacemos una instancia de express
const app = express();
//Importamos la conexion a la base de datos
const {connection} = require('./src/database/connection')
// Traemos la constante del puerto
require('dotenv').config();
//Importar el usuario por defecto
const {userDefault} = require('./src/controllers/user.controller');
const port = process.env.PORT;
//Importamos las rutas de user
const routesProduct = require('./src/routes/product.routes');
const routesUser = require('./src/routes/user.routes');
const routesCategory = require('./src/routes/category.routes');
const routesInvoice = require('./src/routes/invoice.routes');

connection();

//Middlewares para express
app.use(express.urlencoded({extended: false}));
app.use(express.json());
//Crear usuario

userDefault();

app.use('/api', routesUser);
app.use('/api', routesCategory);
app.use('/api', routesProduct);
app.use('/api', routesInvoice);

app.listen(port, () =>{
    console.log(`Servidor corriendo en el puerto ${port}`);
});