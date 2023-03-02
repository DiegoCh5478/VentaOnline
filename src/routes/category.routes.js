'use strict'
const {Router} = require('express');
const {cretaeCategory,updateCategory,readCategories, deleteCategory} = require('../controllers/category.controller');

// Importamos los middlewares
const {validateParamas} = require("../middlewares/validate-params");
const {validateJWT} = require("../middlewares/validate-jwt");
// Modulo check, verifica parametros especificos que utilizara el validateParams
const {check} = require("express-validator");

const api = Router();

//********************************************************************************/
//************************* MANEJO DE CATEGORIAS *********************************/
//********************************************************************************/

// >>> Crear categoria
api.post('/create-category',[
    validateJWT,
    check("categoryName", "El categoryName es obligatorio para crear la cateogria").not().isEmpty(),
    validateParamas
], cretaeCategory);


// >>> Actualizar categoria
api.get('/read-categories', readCategories);

// >>> Actualizar categoria
api.put('/update-category',[
    validateJWT,
    check("idCategory", "El idCategory es obligatorio para crear la cateogria").not().isEmpty(),
    check("descriptionCategory", "El descriptionCategory es obligatorio para crear la cateogria").not().isEmpty(),
    validateParamas
], updateCategory);

// >>> Eliminar una categoria
api.delete('/delete-category',[
    validateJWT,
    check("idCategory", "El idCategory es obligatorio para eliminar la cateogria").not().isEmpty(),
], deleteCategory);

module.exports = api;