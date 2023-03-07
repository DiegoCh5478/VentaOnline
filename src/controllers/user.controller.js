'use strict'
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const {generateJWT} = require('../helpers/create-jwt');

//********************************************************************************/
// ************************ CRUD PARA USUARIOS ***********************************/
//********************************************************************************/

//>>>>>>>>>>>>>>>>>>>>>>>>> Crear usuario

const createUserAdmin = async(req, res)=>{
    const {email, password} = req.body;
    try {
        //Comprobar que el email no se este usando ya
        let user = await User.findOne({email});
        if(user){
            console.log('Se encontro un usuario con el mismo email');
            return res.status(400).send({message:`El correo ${email} ya esta en uso.`, ok: false});
        }
        //Creamos el nuevo usuario
        user = new User(req.body);
        user.rol = 'ADMIN';
        //Encriptamos la contrasena
        user.password = bcrypt.hashSync(password, bcrypt.genSaltSync());
        //Guardamos el nuevo usuario y le mandamos un mensaje de respusta con exito
        user = await user.save();
        res.status(200).send({message: `El usuario ${user.userName} fue creado con exito.`,user});

    } catch (error) {
        throw new Error(error);
    }
}
const createUserClient = async(req, res)=>{
    const {email, password} = req.body;
    try {
        //Comprobar que el email no se este usando ya
        let user = await User.findOne({email});
        if(user){
            console.log('Se encontro un usuario con el mismo email');
            return res.status(400).send({message:`El correo ${email} ya esta en uso.`, ok: false});
        }
        //Creamos el nuevo usuario
        user = new User(req.body);
        user.rol = 'CLIENT';
        //Encriptamos la contrasena
        user.password = bcrypt.hashSync(password, bcrypt.genSaltSync());
        //Guardamos el nuevo usuario y le mandamos un mensaje de respusta con exito
        user = await user.save();
        res.status(200).send({message: `El usuario ${user.userName} fue creado con exito.`,user});

    } catch (error) {
        throw new Error(error);
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>> Ver usuarios
const readUsers = async(req, res)=>{
    try{
        // Buscar todos los usuarios
        const users = await User.find();
        if(!users){
            return res.status(404).send({message: `No se han creado usuarios`});
        }else{
            return res.status(200).json({'Usuaios encontrados': users});
        }
    }catch(error){
        throw new Error(error);
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>> Actualizar usuarios

const UpdateUser = async (req, res) => {
    try {
        let id;
        // el id va ser el id del token, lo obtenemos del middleware de validate-jwt

        //Comprobar el rol de admin
        if(comprobarADMIN(req.userLogin.rol)){
            console.log(`El usuario ${req.userLogin.userName} es un ADMIN`);
            id = req.body.idUserEdit;
            //Comprobar que el idUserEdit si se haya mandado como parametro
            if(id == null || id == undefined){
                //Si no se envio
                return res.status(400).send({message:`Su usuario es ADMIN, debe proporiconar el id del usuario que desea modificar. El parametro debe ser llamado "idUserEdit"`})
            }
            let userRolEdit = await User.findById(id);
            //Comprobar que el usuario que se quiere editar exista
            if(!userRolEdit){
                return res.status(404).send({message: `El usuario con el id ${id} no existe en la base de datos.`})
            }
            //Comprobar que el usuario que se quiere editar no sea un admnistrador
            if(userRolEdit.rol == 'ADMIN'){
                return res.status(400).send({ok: false, message: `El usuario que trata de modificar es un admin, esta funcion solo esta habilitada para editar usuarios client. `, userRolEdit});
            }
        }else{
            //Si el usuario logueado no se un admin, solo puede editar su propio perfil
            console.log(`El usuario ${req.userLogin.userName} es un CLIENT`);
            console.log(`Se actualizara su propio usuario.............................`);
            id = req.userLogin._id;
        }
        const userEdit = { ...req.body };
        //Encriptar contrasena si es que viene
        if(userEdit.password){
            userEdit.password = bcrypt.hashSync(userEdit.password, bcrypt.genSaltSync());
        }else{
            userEdit.password = userEdit.password;
        }
        
        //Comprobar que el correo no este en uso o bien sea el mismo que ya se tenia registrado
        /* Para eso primero buscamos el usuario que se quiere editar, y saber si existe o no */
        const oldUser = await User.findById({_id: id});
        if(!oldUser){
            return res.status(404).send({message: `El usuario que trata de actualizar no existe en la base de datos.`})
        }
        if(!(oldUser.email == req.body.email)){
            let emailNew = req.body.email;
            console.log(`Email ingresado: ${emailNew}`);
            const emailUsed = await User.findOne({emailNew});
            if(emailUsed){
                return res.status(400).send({message: `El nuevo correo que trata de registrar ya esta en uso.`})
            }
        }
        //Buscamos el usuario con el id que tenemos 
        const userComplete = await User.findByIdAndUpdate(id, userEdit, {
          new: true,
        });
        //De encontrarlo lo actualizamos
        if (userComplete) {
          const token = await generateJWT(userComplete.id,userComplete.userName,userComplete.email);
          return res.status(200).send({
            message: "El usuario fue actualizado correctamente",
            userComplete,
            token,
          });
        } else {
          res.status(404).send({
            message:
              "El usuario no se encontro en la base de datos, revisar el token del login ",
          });
        }
      } catch (error) {
        throw new Error(error);
      }
};


//>>>>>>>>>>>>>>>>>>>>>>>>> Eliminar usuarios

const deleteUser = async(req,res)=>{
    let id;
    try{
        if(comprobarADMIN(req.userLogin.rol)){
            console.log(`El usuario ${req.userLogin.userName} es un ADMIN`);
            id = req.body.idUserDelete;
            //Comprobar que el idUserEdit si se haya mandado como parametro
            if(id == null || id == undefined || id == ''){
                //Si no se envio
                return res.status(400).send({message:`Su usuario es ADMIN, debe proporiconar el id del usuario que desea eliminar. El parametro debe ser llamado "idUserDelete"`})
            }
            let userRolDelete = await User.findById(id);
            //Comproba que el usuario que se quiere eleiminar exista
            if(!userRolDelete){
                return res.status(404).send({message: `El usuario con el id ${id} no existe en la base de datos.`})
            }
            //Comprobar que el usuario que se quiere elininar no sea un admnistrador
            if(userRolDelete.rol == 'ADMIN'){
                return res.status(400).send({ok: false, message: `El usuario que trata de eliminar es un admin, esta funcion solo esta habilitada para eliminar usuarios client.`});
            }
        }else{
            // Si no es un admin entonces se borrara el propio usuario
            console.log(`Se borro su propio usuario................`);
            id = req.userLogin._id;
        }

        const userDelete = await User.findByIdAndDelete(id);
        return res.status(200).send({message: `Usuario elimnario correctamente, datos del usuario eliminado: `, userDelete});
    }catch(error){
        throw new Error(error);
    }
}


//********************************************************************************/
// ******************************** Login  ***************************************/
//********************************************************************************/

const loginUser = async(req,res)=>{
    const {email, password} = req.body;
    try{
        //Buscar el emial
        const user = await User.findOne({email: email});
        //No encuetra el usuario 
        if(!user){
            return res.status(400).send({ok: false, message: `No se encontro un usuario con el email: ${email}`});
        }
        // La contasena dada la comparamos con la contrasena del usuario encontrado
        const correctParams = bcrypt.compareSync(password, user.password);

        //Si el password que mandamos no coincide con el que se econtro con el del email
        if(!correctParams){
            return res.status(400).send({ok: false, message: `La contraseña no es correcta`});
        }

        // Luego de verificar que el email y el password sean correctos creamos su token
        const token = await generateJWT(user.id, user.userName, user.email);
        res.status(200).json({
        ok: true,
        uid: user.id,
        name: user.userName,
        email: user.email,
        rol: user.rol,
        token,
        });

    }catch(error){
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


//********************************************************************************/
// ******************************** USUARIO POR DEFECTO  *************************/
//********************************************************************************/

const userDefault = async() =>{
    //Comprobar que no hayan usuario ragistrados
    const users = await User.find();
    if(users.length == 0){
        let  user = new User();
        user.userName = 'ADMIN';
        user.lastName = 'Administrador';
        user.password = '123456';
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync());
        user.email = 'admin@gmail.com';
        user.rol = 'ADMIN';
        //Comprobar que el correo no este en uso
        let email = user.email;
        const userEmail = await User.findOne({email});
        if(userEmail){
            return console.log(`El correo ${email} ya esta en uso.`);
        }
        // Si no esta en uso
        user = await user.save();
        return console.log(`Usuario creado correctamente, datos del usuario: ${user}`);
    }
}

// ====================== Exportaciones

module.exports = {loginUser, createUserAdmin,createUserClient,readUsers,UpdateUser,deleteUser,userDefault};