'use strict'
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const {generateJWT} = require('../helpers/create-jwt');

//********************************************************************************/
// ************************ CRUD PARA USUARIOS ***********************************/
//********************************************************************************/

const createUser = async(req, res)=>{
    const {email, password} = req.body;
    try {
        //Comprobar que el email no se este usando ya
        let user = await User.findOne({email});
        if(user){
            console.log('Se encontro un usuario con el mismo email');
            return res.status(400).send({message:`El correo ${email} ya esta en uso.`, ok: false});
        }
        // Hacer que solo haya un ADMIN, si todavia no hay usuario registrados el primero sera ADMNIN
        const usersFind = await User.findOne();
        console.log(`Usuarios encontrados** ${usersFind}`);
        console.log(usersFind === null || usersFind === undefined);
        if(usersFind === null || usersFind === undefined){
            console.log(`>>>>No se encontraron usuarios<<<`);
            req.body.rol = 'ADMIN';
        }else{
            console.log(`>>>>Se encontraron usuarios<<<`);
            req.body.rol = 'CLIENT';
        }
        //Si encuetra usuarios registrados se le dara automaticamente el rol de CLIENT
        //Creamos el nuevo usuario
        user = new User(req.body);

        //Encriptamos la contrasena
        user.password = bcrypt.hashSync(password, bcrypt.genSaltSync());
        //Guardamos el nuevo usuario y le mandamos un mensaje de respusta con exito
        user = await user.save();
        res.status(200).send({message: `El usuario ${user.userName} fue creado con exito.`,user});

    } catch (error) {
        throw new Error(error);
    }
}


//********************************************************************************/
// ************************ FUNCIONES EXTRA **************************************/
//********************************************************************************/

const comprobarADMIN = (rol)=>{
    if(rol == 'ADMIN'){
        return true;
    }else{
        return false;
    }
}

module.exports = {createUser};