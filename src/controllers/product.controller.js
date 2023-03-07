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
            //Obtenemos los atributos enviados
            const {nameProduct,idProductCategory} = req.body;
            //Comprobar que el nombre del producto no se haya registrado ya
            let product = await Product.findOne({nameProduct});
            if(product){
                return res.status(400).send({message: `El producto con el nombre ${nameProduct} ya existe en la base de datos`});
            }
            //Comprobar que si exista la categoria del producto
            let categoryExists = await comprobarCategoriaExistaId(idProductCategory);
            if(!categoryExists){
                return res.status(400).send({message: `La categoria con el id ${idProductCategory} no existe.`});
            }
            if(req.body.sold == null || req.body.sold == undefined) req.body.sold = 0;
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

//>>>>>>>>>>>>>>>>>>>>>>>>> Ver productos en general
const readProducts = async (req, res) => {
    if(comprobarADMIN(req.userLogin.rol)){
        const products = await Product.find();
        if(products.length == 0){
            return res.status(500).send({message: `No se han agredado productos`});
        }
        return res.status(200).send({'Productos': products})
    }else{
        return res.status(400).send({message: `El usuario ${req.userLogin.userName} no es un administrador`});
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>> Actualizar producto

const UpdatProduct = async(req, res)=>{
    if(comprobarADMIN(req.userLogin.rol)){
        const {idProduct,nameProduct,idProductCategory} = req.body;
        //Obtener valores antiguos del producto
        const oldProduct = await Product.findById(idProduct);
        if(!oldProduct){
            return res.status(404).send({message: `El producto qeu trata de editar no existe en la base de datos.`})
        }
        //Comprobar que el nombre del producto no se haya registrado ya o saber si sigue siendo el mismo
        if(nameProduct){
            if(!(oldProduct.nameProduct == nameProduct)){
                let product = await Product.findOne({nameProduct});
                if(product){
                    return res.status(400).send({message: `El producto con el nombre ${nameProduct} ya existe en la base de datos`});
                }
            }
        }
        //Comprobar que si exista la categoria del producto
        if(idProductCategory){
            let categoryExists = await comprobarCategoriaExistaId(idProductCategory);
            if(!categoryExists){
                return res.status(400).send({message: `La categoria con el id ${idProductCategory} no existe.`});
            }
        }
        //Pasado los filtros puede actualizarce el producto
        let newProduct = req.body; 
        newProduct = await Product.findByIdAndUpdate(idProduct, newProduct, {new: true} );
        return res.status(200).send({message: `Se actualizo exitosamente el producto`, newProduct});
    }else{
        return res.status(400).send({message: `El usuario ${req.userLogin.userName} no es un administrador`});
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>> Eliminar producto

const deleteProduct = async(req, res)=>{
    if(comprobarADMIN(req.userLogin.rol)){
        const {idProduct} = req.body;
        const productDelete = await Product.findByIdAndDelete(idProduct);
        if(!productDelete){
            return res.status(400).send({message: `El producto no existe en la base de datos`})
        }
        return res.status(200).send({message: `Se elimino exisitosamente el producto. Datos del producto eliminado:`, productDelete})
        
    }else{
        return res.status(400).send({message: `El usuario ${req.userLogin.userName} no es un administrador`});
    }
}


//********************************************************************************/
//************************** TIPOS DE BUSQUEDAS **********************************/
//********************************************************************************/

//>>>>>>>>>>>>>>>>>>>>>>>>> Productos mas vendidos
const bestSellers = async(req, res)=>{
    if(comprobarADMIN(req.userLogin.rol)){
        const bestSellers = await Product.find({}, {sort: {'sold': -1}});
        if(bestSellers.length == 0){
            return res.status(400).send({message: `No se encontraron productos.`});
        }
        let products = [];
        let product;
        for (let index = 0; index < bestSellers.length; index++) {
             product = await Product.findById(bestSellers[index]);
            console.log(`*****Product encontrado: ${product}`);
            products[index] = product;
        }
        return res.status(200).send({message: 'Productos mas vendidos: ', products});
    }else{
        return res.status(400).send({message: `El usuario ${req.userLogin.userName} no es un administrador`});
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>> Productos agotados

const productsSoldOut = async(req, res)=>{
    if(comprobarADMIN(req.userLogin.rol)){
        const productsSoldOut = await Product.find({'stock': {$lt: 1}});
        if(productsSoldOut.length == 0){
            return res.status(400).send({message: `No hay productos agotados.`});
        }
        return res.status(200).send({message: `Productos agotados:`, productsSoldOut});
    }else{
        return res.status(400).send({message: `El usuario ${req.userLogin.userName} no es un administrador`});
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
    let categoriaExists = await Category.findById(id);
    return categoriaExists;
}

// ====================== Exportaciones

module.exports = {createProduct,readProducts,UpdatProduct, deleteProduct,bestSellers, productsSoldOut};