'use strict'
const {Router} = require('express');
const {validateJWT} = require('../middlewares/validate-jwt');
const {validateParamas} = require('../middlewares/validate-params');
const {check} = require('express-validator');
//Importar las funciones
const {addToShoppingCar} = require('../controllers/invoice.controller');

const api = Router();

//********************************************************************************/
//******************** MANEJO DEL CARRITO DE COMPRAS *****************************/
//********************************************************************************/

//>>>>>>>>>>>>>>>>>>>> Agregar al carrito
api.post('/add-to-shoppingCar',[
    validateJWT,
    check('idProduct', 'El idProduct es obligatorio.').not().isEmpty(),
    check('quantity', 'El quantity es obligatorio.').not().isEmpty(),
    validateParamas
], addToShoppingCar)

// ====================== Exportaciones
module.exports = api;