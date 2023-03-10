'use strict'
const {Router} = require('express');
const {validateJWT} = require('../middlewares/validate-jwt');
const {validateParamas} = require('../middlewares/validate-params');
const {check} = require('express-validator');
//Importar las funciones
const {addToShoppingCar,readShoppingCart,updateQuantityProduct,deleteShoppingCart,deleteProductInShoppingCart, 
        /*Funciones de comprar*/
        buyEntireCart
        } = require('../controllers/invoice.controller');

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

//>>>>>>>>>>>>>>>>>>>> Eliminar un producto del carrito
api.delete('/delete-product-in-shoppingCart', [
    validateJWT, 
    check('idProduct', 'El idProduct es obligatorio para completar la funcion').not().isEmpty(),
    validateParamas
], deleteProductInShoppingCart)


//********************************************************************************/
//**************************** MANEJO DEL FACTURA ********************************/
//********************************************************************************/

//>>>>>>>>>>>>>>>>>>>> Comprar todo el carrito
api.post('/buy-entire-cart', [
    validateJWT
], buyEntireCart)

// ====================== Exportaciones
module.exports = api;