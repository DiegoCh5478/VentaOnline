'use strict'
const {loginUser,createUserAdmin,createUserClient,readUsers,UpdateUser,deleteUser} = require('../controllers/user.controller');
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

//>>>Crear un usuario de tipo administrador
api.post('/create-user-admin',[
    check("userName", "El userName es obligatorio").not().isEmpty(),
    check("userLastName", "El userLastName es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").not().isEmpty(),
    check("password", "El password debe tener mas de 6 caracteres").isLength({min: 6}),
    validateParamas
],createUserAdmin);

//>>>Crear un usuario de tipo cliente
api.post('/create-user-client',[
    check("userName", "El userName es obligatorio").not().isEmpty(),
    check("userLastName", "El userLastName es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").not().isEmpty(),
    check("password", "El password debe tener mas de 6 caracteres").isLength({min: 6}),
    validateParamas
],createUserClient);

//>>>Ver usuarios
api.get('/read-users', readUsers);

//>>>Editar usuario
/*Un usuario solo puede editar sus propios datos. Si un ADMIN quiere editar los datos de un CLIENT
debe dar en los parametrso el id del usuario que quiere editar, el parametro se debe llamar "idUserEdit", pero
este no debe ser un id de un admin*/
api.put('/update-user',[
    validateJWT,
    check("userName", "El userName es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").not().isEmpty(),
    check("password", "La contraseña debe tener mas de 5 caracteres").isLength({min: 6,}),
    validateParamas 
],UpdateUser)


//>>> Eliminar usuario
/*Si un administrado quiere eliminar un usuario debe enviar el parametro como "idUserDelete"*/
api.delete('/delete-user',[
    validateJWT
],deleteUser)


//********************************************************************************/
// ******************************** Login  ***************************************/
//********************************************************************************/

api.post('/login', [
    check("email", "El email es obligatorio").not().isEmpty(),
    check("password", "El password es obligatorio").not().isEmpty(),
    validateParamas
], loginUser);

module.exports = api;