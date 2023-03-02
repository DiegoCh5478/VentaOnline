'use strict';

const Product = require('../models/product.model');
const Category = require('../models/category.model');

//********************************************************************************/
// ************************ CRUD PARA PRODUCTOS **********************************/
//********************************************************************************/

//>>>>>>>>>>>>>>>>>>>>>>>>> Crear producto

const createProduct = async(req, res)=>{
    try {
        if(comprobarADMIN(req.userLogin.rol)){
            //Obtenemos todos los atributos enviados
            const {nameProduct,idProductCategory} = req.body;
            //Comprobar que el nombre del producto no se haya registrado ya
            let product = await Product.findOne({nameProduct});
            if(product){
                return res.status(400).send({message: `El producto con el nombre ${nameProduct} ya existe en la base de datos`});
            }
            //Comprobar que si exista la categoria del producto
            if(!comprobarCategoriaExistaId(idProductCategory)){
                return res.status(400).send({message: `La categoria con el id ${idProductCategory} no existe.`});
            }
            product = new Product(req.body);
            product = await product.save();
            //Regresamos el mensaje de exito
            return res.status(200).send({message: `El producto ${nameProduct} fue creado con exito`, product});
        }else{
            return res.status(400).send({message: `Solo un administrados puede agregar productos`})
        }
    } catch (error) {
        throw new Error(error)
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

const comprobarCategoriaExistaId = async(id)=>{
    let categoriaExiste = await Category.findById(id);
    if(categoriaExiste){
        return true;
    }else{
        return false;
    }
}

// ====================== Exportaciones

module.exports = {createProduct};