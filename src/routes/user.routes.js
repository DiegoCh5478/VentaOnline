'use strict'
const {createUser} = require('../controllers/user.controller');
const {Router} = require('express');


// Importamos los middlewares
const {validateParamas} = require("../middlewares/validate-params");
const {validateJWT} = require("../middlewares/validate-jwt");
// Modulo check, verifica parametros especificos que utilizara el validateParams
const {check} = require("express-validator");

const api = Router();

//********************************************************************************/
//************************* MANEJO DE USUARIOS ***********************************/
//********************************************************************************/

//Crear un usuario
api.post('/create-user',[
    check("userName", "El userName es obligatorio").not().isEmpty(),
    check("userLastName", "El userLastName es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").not().isEmpty(),
    check("password", "El password es obligatorio").isLength({min: 6})
],createUser);

module.exports = api;