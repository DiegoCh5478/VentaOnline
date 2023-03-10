'use strict'
const User = require('../models/user.model');
const Invoice = require('../models/invoice.model');
const Product = require('../models/product.model');

//********************************************************************************/
//************************* MANEJO DEL CARRITO ***********************************/
//********************************************************************************/

// >>>>>>>>>>>>>>>>>>>>>>>>> Agregar al carrito
const addToShoppingCar = async(req, res)=>{
    const idUser = req.userLogin._id;
    try {
        const {idProduct, quantity} = req.body;

        const user = await findUser(idUser);
        const product = await findProduct(idProduct);
        
        //Verificar que el usuario exista
        if(!user) return res.status(404).send({message: `El usuario dueño del token no existe en la base de datos.`})
        
        //Verificar que se hayan pedido productos
        if(!quantity || quantity < 1) return res.status(400).send({message: `La cantidad minima para agregar al carrito es la unidad.`})

        //Verificar que el producto exista.
        if(!product) return res.status(404).send({message: `No se encontro el producto.`});

        
        //Comprobar si el producto ya fue agregado al carrito de compras anterior, si es asi entonces se edita el producto en el carrito
        const productInTheShoppingCart = await checkShoppingCartProducts(idUser, idProduct,quantity);

        if(productInTheShoppingCart){

            if(productInTheShoppingCart == 'exceedsTheStock'){

                return res.status(400).send({message: `La cantidad pedida sobrepasa el stock disponible. El producto ya estaba agregado al carrito.`})

            }

            let productsOnShoppingCart = await User.findOne({_id: idUser , 'shoppingCar.product': idProduct}, {'shoppingCar.$': 1});
            return res.status(200).send({message: `El producto ya estaba en el carrito de compras, se actualizo la cantidad del pedido.`, productsOnShoppingCart })
        }
        
        //Verificar que el producto tenga suficiente stock
        if( ! ( await checkStockProduct ( idProduct, quantity ) ) ) return res.status(400).send({message: `La cantidad pedida sobrepasa el stock disponible.`})
        
        const addToShoppingCar = await User.findByIdAndUpdate(

            {_id: idUser},

            {
                $push: {
                    shoppingCar: {
                        product: idProduct,
                        quantity: quantity,
                    }
                }
            },

            {new: true}

        );

        return res.status(400).send({message: `Se agrego al carrito`,addToShoppingCar});

    } catch (error) {
        throw new Error(error);
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>> Ver carrito

const readShoppingCart = async(req, res)=>{
    const id = req.userLogin._id; 
    try {
        const shoppingCart = await findUser(id);

        const userShoppingCart = shoppingCart.shoppingCar;

        if(userShoppingCart.length == 0) return res.status(400).send({message: `No hay productos agregados al carrito.`});

        return res.status(200).json({'Productos del carrito: ': userShoppingCart});

    } catch (error) {
        throw new Error(error);
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>> Cambiar la cantidad del pedido en el carrito

const updateQuantityProduct = async(req, res) => {
    const id = req.userLogin._id;
    try {

        const {idProduct, quantity} = req.body;

        const updateProduct = await User.updateOne(

            {_id: id, 'shoppingCar.product': idProduct},

            {
                $set:{
                    'shoppingCar.$.quantity': quantity
                }
            },

            {new: true}
        );

        if(!updateProduct) return res.status(400).send({message: `El usuario no existe en la base de datos.`});

        const user = await findUser(id);
        const shoppingCar = user.shoppingCar;

        return res.status(200).json({'Estado actual del carrito del usuario: ': shoppingCar});
    } catch (error) {
        throw new Error(error);
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>> Eliminar un producto del carrito de compras 

const deleteProductInShoppingCart = async(req, res)=>{
    const id = req.userLogin._id;
    try {
        const {idProduct} = req.body;

        const updateShoppingCart = await User.updateOne(
            {_id: id},

            {
                $pull: {

                    shoppingCar: {
                        product: idProduct
                    }

                }
            },
            {new: true}
        );

        if(!updateShoppingCart) return res.status(400).send({message: `El usuario no existe en la base de datos.`});

        const user = await User.findById(id);
        const shoppingCar = user.shoppingCar;

        return res.status(200).json({'Estado actual del carrito del usuario: ': shoppingCar});

    } catch (error) {
        console.error(error)
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>> Vaciar carrito

const deleteShoppingCart = async(req, res)=>{
    const id = req.userLogin._id;
    try {
        const shoppingCart = await User.findByIdAndUpdate(
            {_id: id},
            {
                $pull: {
                    shoppingCar: {}
                }
            },
            {new: true, multi: true}
        );

        if(!shoppingCart) return res.status(400).send({message: `No se encontro el usuario en la base datos.`});
        const user = await findUser(id);
        console.log(user);
        return res.status(200).send({message: `Se vacío correctamente el carrito de compras. Datos del usuario: `, user});

    } catch (error) {
        throw new Error(error);
    }
}


//********************************************************************************/
//************************* MANEJO DE LA COMPRA ***********************************/
//********************************************************************************/

// >>>>>>>>>>>>>>>>>>>>>>>>> Realizar la compra
const buyEntireCart = async(req, res)=>{
    const idUser = req.userLogin._id;
    try {
        
        const user = await findUser(idUser);
        let userShoppingCart = user.shoppingCar;

        //Si el carrito esta vacio
        if(userShoppingCart.length == 0) return res.status(400).send({message: `No hay productos en el carrito de compras.`});

        const {productsApproved,deprecatedproducts} = await existingProducts(userShoppingCart);
        const {productsWithStock, productsWithoutStock} = await checkStockShoppingCart(productsApproved);

        if(productsWithStock.length != 0){
            //Creacion de la factura
            const invoice = new Invoice();
            invoice.date = new Date();
            invoice.user = idUser;
            for (let index = 0; index < productsWithStock.length; index++) {
                
                let price = await findPriceProduct(productsWithStock[index].product);
                invoice.products.push(productsWithStock[index]);
                invoice.products[index].amount = price;
                invoice.products[index].quantity = productsWithStock[index].quantity;
            }
            invoice.totalPrice = await totalPrice(productsWithStock);
            await invoice.save();

            if(deprecatedproducts.length != 0) return res.status(200).json({'Productos en el carrito que ya no existen en la base de datos: ': deprecatedproducts}, {'Se genero la fatura correctamente': invoice})
            if(productsWithoutStock.length != 0) return res.status(200).json({'Productos en el carrito que no tenian suficiente stock: ': productsWithoutStock}, {'Se genero la fatura correctamente': invoice})
            if(productsWithoutStock.length != 0 && deprecatedproducts.length != 0 ) return res.status(200).json({'Productos en el carrito que no tenian suficiente stock: ': productsWithoutStock},{'Productos en el carrito que ya no existen en la base de datos: ': deprecatedproducts}, {'Se genero la fatura correctamente': invoice})

            //Vaciar el carrtio 
            await deleteShoppingCartUser(idUser)
            
            return res.status(200).send({message: `Se genero la factura correctamente`, invoice})
        }

    } catch (error) {
        throw new Error(error);
    }
}

//********************************************************************************/
//*************************** FUNCIONES EXTRA ************************************/
//********************************************************************************/

const findProduct = async(idProduct)=>{
    const product = await Product.findById(idProduct);
    return product;
}

const findPriceProduct = async(idProduct)=>{
    const product = await Product.findById(idProduct);
    const price = product.price;
    return price;
}

const findUser = async(idUser)=>{
    const user = await User.findById(idUser);
    return user;
}

//Retorna verdadero si la cantidad de stock es igual o mayor a la cantidad pedida
const checkStockProduct = async(idProduct,quantity)=>{
    const product = await Product.findById(idProduct);
    const stockProduct = product.stock;
    return stockProduct >= quantity;
}

const totalPrice = async(shoppingCart)=>{
    let _totalPrice = 0;
    try {

        
        for (let index = 0; index < shoppingCart.length; index++) {
            
            let quantity = shoppingCart[index].quantity;
            
            let product = await findProduct(shoppingCart[index].product);
            
            let total = parseInt(product.price) * parseInt(quantity);
            
            _totalPrice = parseInt(total) + parseInt(_totalPrice);
            
        }

    } catch (error) {
        throw new Error(error);
    }
    console.log(`Precio total ${_totalPrice}`);
    return parseInt(_totalPrice);
}

// Ver si ya se tiene el producto en el carito de compras
const checkShoppingCartProducts = async(idUser,idProduct,_quantity)=>{
    let productsOnShoppingCart = await User.findOne({_id: idUser , 'shoppingCar.product': idProduct}, {'shoppingCar.$': 1});

    if(productsOnShoppingCart){

        //Acceder a la cantidad que se tiene agregado en el carrito
        const shoppingCart = productsOnShoppingCart.shoppingCar;
        let oldQuantity = shoppingCart[0].quantity;

        //La nueva cantidad va tener el valor del mismo mas la antigua
        _quantity = parseInt(_quantity) + parseInt(oldQuantity);

        //Verificar que el producto tenga suficiente stock
        if( ! ( await checkStockProduct(idProduct, _quantity) ) ) return 'exceedsTheStock';

        //Actualizamos 
        productsOnShoppingCart =await User.updateOne(

            {_id: idUser, 'shoppingCar.product': idProduct},
            
            {
                $set: {
                    'shoppingCar.$.quantity': _quantity
                }
            },
            
            {new: true}
        );
    }
    return productsOnShoppingCart;
}

// ******************************** Funciones para la compra

// Comprobar el stock de un arreglo de objetos
const checkStockShoppingCart = async(shoppingCart)=>{
    try {

        //Arreglo donde se van a guardar los productos que pasen lo filtros
        let productsWithStock = [];
        let productsWithoutStock = [];

        //Recorrer el arreglo enviado
        for (let index = 0; index < shoppingCart.length; index++) {
            
            let needyStock = shoppingCart[index].quantity;
            const stock = await checkStockProduct(shoppingCart[index].product, needyStock);

            if(stock){
                productsWithStock.push(shoppingCart[index]);

                //Actualizamos el stock del producto
                await updateStockProduct(shoppingCart[index].product, needyStock);

            }else{
                productsWithoutStock.push(shoppingCart[index]);
            }

        }

        return {productsWithStock, productsWithoutStock};

    } catch (error) {
        throw new Error(error);
    }
}

// Crear un arreglos con los productos que existan y uno con los que no
const existingProducts = async(shoppingCart)=>{
    try {

        //Arreglo donde se guardan los productos existentes
        let productsApproved = [];
        let deprecatedproducts = [];
        
        for (let index = 0; index < shoppingCart.length; index++) {
            
            let idProduct = shoppingCart[index].idProduct;
            
            idProduct = await findProduct(shoppingCart[index].product);
            
            if(idProduct){
                
                productsApproved.push(shoppingCart[index]);
            }else{
                
                idProduct = shoppingCart[index].idProduct;
                
                deprecatedproducts.push(idProduct);
            }

        }
        //Retornamos el objeto con los dos arreglos
        return {productsApproved, deprecatedproducts};

    } catch (error) {
        throw new Error(error);
    }
}

//Editar el stock que hay de cada producto
const updateStockProduct = async(idProduct,_stock)=>{
    const product = await findProduct(idProduct);
    const oldStock = product.stock;
    const newStock = parseInt(oldStock) - parseInt(_stock);

    const newProduct = await Product.findByIdAndUpdate(
        {_id: idProduct},
        {stock: newStock},
        {new: true, multi: false}
    );
    
}

//Vaciar el carrito
const deleteShoppingCartUser = async(idUser)=>{
    try {
        const shoppingCart = await User.findByIdAndUpdate(
            {_id: idUser},
            {
                $pull: {
                    shoppingCar: {}
                }
            },
            {new: true, multi: true}
        );

        if(!shoppingCart) return `No se encontro el usuario en la base datos.`;
        return `Se vacio el carrito de compras`

    } catch (error) {
        throw new Error(error);
    }
}

// ====================== Exportaciones
module.exports = {addToShoppingCar,deleteShoppingCart,readShoppingCart,updateQuantityProduct, deleteProductInShoppingCart,
                  /*Funciones de compra*/
                  buyEntireCart};