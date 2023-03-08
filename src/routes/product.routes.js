'use strict'
const {Router} = require('express');
const api = Router();
//Middlewares 
const {check} = require('express-validator');
const {validateParamas} = require('../middlewares/validate-params');
const {validateJWT} = require('../middlewares/validate-jwt');
//Funciones creadas
const {createProduct, readProducts,UpdatProduct,deleteProduct, bestSellers,productsSoldOut,searchProductByCategory,findProductByName} = require('../controllers/product.controller');

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

//********************************************************************************/
//************************** TIPOS DE BUSQUEDAS **********************************/
//********************************************************************************/

// >>>>>>> Productos mas vendidos
/*Cualquiera puede acceder a esta funcion */
api.get('/read-best-sellers', bestSellers);

// >>>>>>> Productos agotados
api.get('/read-sold-out',[
    validateJWT
], productsSoldOut);

// >>>>>>> Productos por nombre 
api.get('/find-product-by-name', [
    check('nameProduct', 'El nameProduct es obligatorio.').not().isEmpty()
], findProductByName);

// >>>>>>> Productos por nombre de la categoria
api.get('/search-product-by-category',[
    check('categoryName', 'El categoryName es obligatorio').not().isEmpty()
],searchProductByCategory);

module.exports = api;