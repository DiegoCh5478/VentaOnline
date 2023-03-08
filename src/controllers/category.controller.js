'use strict';

const Category = require('../models/category.model');
const Product = require('../models/product.model');

//********************************************************************************/
// ************************ CRUD PARA CATEGORIA **********************************/
//********************************************************************************/

//>>>>>>>>>>>>>>>>>>>>>>>>> Crear categoria

const cretaeCategory = async(req, res)=>{
    try {
        if(comprobarADMIN(req.userLogin.rol)){
            //Obtener atributos del request
            const {categoryName} = req.body;
            //Comprobar que no exista una categoria con el mismo nombre
            let categoryExists = await Category.findOne({categoryName});
            if(categoryExists){
                return res.status(400).send({ok: false, message: `El nombre de categoria ${categoryName} ya es usado por una categoria`})
            }
            //Pasado el filtro se crea una nueva categoria, se guarda y se envia el mensaje de exito.
            let category = new Category(req.body);
            category = await category.save();
            return res.status(200).send({message: `La categoria ${category.categoryName} fue creada con exito`, category});
        }else{
            return res.status(400).send({message: `El usuario ${req.userLogin.userName} no tiene permitido crear categorias`});
        }
    } catch (error) {
        throw new Error(error)
    }
}


//>>>>>>>>>>>>>>>>>>>>>>>>> Ver categorias
const readCategories= async(req,res) =>{
    try {
        let categories = await Category.find();
        if(!categories){
            return res.status(500).send({message: `No hay categorias existentes`});
        }
        return res.status(200).json({'Categorias encontradas': categories});
    } catch (error) {
        throw new Error(error);
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>> Editar categoria

const updateCategory = async(req, res)=>{
    try {
        if(comprobarADMIN(req.userLogin.rol)){
            //Obtener atributos del request
            const {idCategory,categoryName} = req.body;

            //Ver si la nueva categoria tiene el mismo nombre que la anitgua, si son iguales no entre en la comprobacion
            let categoryOld = await Category.findById(idCategory);

            if(!categoryOld){
                return res.status(400).send({message:`No se encontro la categoria con el id: ${idCategory}`})
            }

            if(!(categoryOld.categoryName == categoryName)){
                let categoryExists = await Category.findOne({categoryName:categoryName});
                if(categoryExists){
                    return res.status(400).send({ok: false, message: `El nombre ${categoryName} ya fue usado por otra categoria`});
                }
            }
            //Pasado el filtro se crea una nueva categoria, se actualiza y se envia el mensaje de exito.
            let category = await Category.findByIdAndUpdate(idCategory, req.body, {new: true})
            return res.status(200).send({message: `La categoria ${category.categoryName} fue editada con exito`, category});
        }else{
            return res.status(400).send({message: `El usuario ${req.userLogin.userName} no tiene permitido editar categorias`});
        }
    } catch (error) {
        throw new Error(error)
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>> Delete categoria

const deleteCategory = async(req,res)=>{
    try {
        if(comprobarADMIN(req.userLogin.rol)){
            let idCategory = req.body.idCategory;
            
            //Ver si la categoria que se quiere eliminar existe en la bse de datos
            const categoryExists = await Category.findById(idCategory);
            if(!categoryExists){
                return res.status(404).send({message: 'No se encontro la categoria que se desea eliminar'});
            }
            //Eliminamos la categoria
            const categoryDelete = await Category.findByIdAndDelete(idCategory);
            //Tratamos de crear una categoria por defecto
            createDefaultCategory();
            //Movemos los productos que hacian referencia a la categoria eliminada.
            moveProducts(idCategory);
            return res.status(200).send({message: `Se eliminio la categoria con el id ${idCategory} `, categoryDelete});
            
        }else{
            return res.status(400).send({message: `El ussuario ${req.userLogin.userName} no tienen un rol ADMIN`});
        }
    } catch (error) {
        throw new Error(error)
    }
}

//********************************************************************************/
// ************************ FUNCIONES EXTRA **************************************/
//********************************************************************************/

const createDefaultCategory = async()=>{
    
    let category = new Category();
    category.categoryName = 'Categoria por defecto';
    category.descriptionCategory = 'Categoria para los productos sin una categoria.';
    //Buscamos si ya se creo la categoria con ese nombre
    let categoryExists = await Category.findOne({categoryName: 'Categoria por defecto'});
    console.log(categoryExists);
    if(categoryExists){
        return console.log(`La categoria por defecto ya fue creada......`);
    }
    console.log(`Creando categoria por defecto...................`);
    category = await category.save();
}

const moveProducts = async(idCategory)=>{
    const products = await Product.find({idProductCategory: idCategory});
    if(products.length == 0){
        return console.log(`No hay productos que sean de la categoria con el id: ${idCategory} `);
    }
    let categoryDefault = await Category.findOne({categoryName: 'Categoria por defecto'});
    let idCategoryDefault = categoryDefault._id;
    console.log(`Id de la categoria por defecto: ${idCategoryDefault}`);
    //Sustituir la categoria que tienen agregada los productos
    for (let index = 0; index < products.length; index++) {
        let idProduct = products[index]._id;
        console.log(`producto encontrado numero #${index}, antes: ${products[index]}`);
        let prodcutAfeter = await Product.findByIdAndUpdate({_id: idProduct}, {idProductCategory: idCategoryDefault}, {new: true});
        console.log(`Mismo producto despues: ${prodcutAfeter}`);
    }
}

const comprobarADMIN = (rol)=>{
    if(rol == 'ADMIN'){
        return true;
    }else{
        return false;
    }
}


// ====================== Exportaciones

module.exports = {cretaeCategory,updateCategory,readCategories, deleteCategory};