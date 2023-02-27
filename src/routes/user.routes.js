'use strict'
const {loginUser,createUser,readUsers,UpdateUser,deleteUser} = require('../controllers/user.controller');
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

//>>>Crear un usuario
api.post('/create-user',[
    check("userName", "El userName es obligatorio").not().isEmpty(),
    check("userLastName", "El userLastName es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").not().isEmpty(),
    check("password", "El password es obligatorio").isLength({min: 6})
],createUser);

//>>>Ver usuarios
api.get('/read-users', readUsers);

//>>>Editar usuario
/*Un usuario solo puede editar sus propios datos. Si un ADMIN quiere editar los datos de CLIENT
debe dar en los parametrso el id del usuario que quiere editar, el parametro se debe llamar "idUserEdit", pero
este no debe ser un id de un admin*/
api.put('/edit-user',[
    validateJWT,
    check("userName", "El userName es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").not().isEmpty(),
    check("password", "La contraseña debe tener mas de 5 caracteres").isLength({min: 6,}), 
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
], loginUser);

module.exports = api;