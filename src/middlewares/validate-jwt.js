const {request, response} = require("express");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const User = require("../models/user.model");

// Funcion para validaciones del token 
// Le decimos que req tendra el valor de la peticion y res el valor de respuetas. Al ser un middleware puede dar errores por no ser la funcion principal del endpoint
    const validateJWT = async(req = request, res = response, next)=>{
    const token = req.header("x-token");

    //if por si no viene el token
    if(!token){
        return res.status(401/*Codigo de estado no autorizado*/).send({
            message: "No hay un token en la peticion."
        });
    }

    // Si el toekn si viene se hara lo siguiente:
    try{

        // Decodificar el token 
        const payLoad = jwt.decode(token, process.env.SECRET_KEY);

        // Buscamos a que usuario le pertenece el token encontrado, esto por el id
        const userFind = await User.findById(payLoad.uId);
        console.log(`El usuario encontrado por el token es: ${userFind}`);

        // Verificar que el token encontrado no haya expirado
        if (payLoad.exp <= moment().unix()) {
            return res.status(500).send({message: `Ha expirado el tiempo del token`})
        }

        // Verificar que el due;o del token todavia exista en la base de datos
        if(!userFind){
            return res.status(401).send({
                message: "El usuario dueño del token, ya no existe en la base de datos"
            })
        }

        // Darle los datos del usuario, due;o del token, al request. Para usarlo luego en el controlador
        req.userLogin = userFind;

        // El next() se usa para decirle que se pase al siguiente middleware
        next();

    }catch(error){
        throw new Error(error);
    }
}

module.exports = {validateJWT}