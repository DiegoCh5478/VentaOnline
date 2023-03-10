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

        
        //Comprobar si el producto ya fue agregado al carrito de compras anterior
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
        console.log(userShoppingCart);
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
//*************************** FUNCIONES EXTRA ************************************/
//********************************************************************************/

const findProduct = async(idProduct)=>{
    const product = await Product.findById(idProduct);
    return product;
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

// ====================== Exportaciones
module.exports = {addToShoppingCar,deleteShoppingCart,readShoppingCart,updateQuantityProduct, deleteProductInShoppingCart};