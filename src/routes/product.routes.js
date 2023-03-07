'use strict'
const {Router} = require('express');
const api = Router();
//Middlewares 
const {check} = require('express-validator');
const {validateParamas} = require('../middlewares/validate-params');
const {validateJWT} = require('../middlewares/validate-jwt');
//Funciones creadas
const {createProduct, readProducts,UpdatProduct,deleteProduct} = require('../controllers/product.controller');

//********************************************************************************/
//************************* MANEJO DE PRODUCTOS **********************************/
//********************************************************************************/

// >>>>>>>> Crear productos
api.post('/create-product', [
    validateJWT,
    check('nameProduct', 'El nameProduct es un parametro obligatorio.').not().notEmpty(),
    check('description', 'El description es un parametro obligatorio.').not().notEmpty(),
    check('price', 'El price es un parametro obligatorio.').not().notEmpty(),
    check('stock', 'El stock es un parametro obligatorio.').not().notEmpty(),
    check('idProductCategory', 'El idProductCategory es un parametro obligatorio.').not().notEmpty(),
    validateParamas
], createProduct);

// >>>>>>> Ver todos los productos
api.get('/read-products', [
    validateJWT
], readProducts)

// >>>>>>> Actualizar producto
api.put('/update-product', [
    validateJWT,
    check('idProduct', 'El idProduct es un parametro obligatorio.').not().notEmpty(),
    validateParamas
], UpdatProduct)

// >>>>>>> Eliminar producto
api.delete('/delete-product',[
    validateJWT,
    check('idProduct', 'El idProduct es un parametro obligatorio.').not().notEmpty(),
    validateParamas
], deleteProduct)

module.exports = api;