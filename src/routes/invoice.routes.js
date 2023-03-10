'use strict'
const {Router} = require('express');
const {validateJWT} = require('../middlewares/validate-jwt');
const {validateParamas} = require('../middlewares/validate-params');
const {check} = require('express-validator');
//Importar las funciones
const {addToShoppingCar,readShoppingCart,updateQuantityProduct,deleteShoppingCart,deleteProductInShoppingCart} = require('../controllers/invoice.controller');

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


//>>>>>>>>>>>>>>>>>>>> Ver carrito
api.get('/read-shoppingCart',[
    validateJWT
], readShoppingCart)


//>>>>>>>>>>>>>>>>>>>> Cambiar cantidad de producto en el carrito
api.put('/update-quantity-product',[
    validateJWT, 
    check('idProduct', 'El idProduct es necesario para realizar la funcion.').not().isEmpty(),
    check('quantity', 'El quantity es necesario para realizar la funcion.').not().isEmpty(),
    validateParamas
], updateQuantityProduct)


//>>>>>>>>>>>>>>>>>>>> Vaciar carrito
api.delete('/delete-shoppingCart',[
    validateJWT
], deleteShoppingCart);

//>>>>>>>>>>>>>>>>>>>> Vaciar carrito
api.delete('/delete-product-in-shoppingCart', [
    validateJWT, 
    check('idProduct', 'El idProduct es obligatorio para completar la funcion').not().isEmpty(),
    validateParamas
], deleteProductInShoppingCart)

// ====================== Exportaciones
module.exports = api;