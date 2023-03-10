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

        const user = findUser(idUser);
        const product = findProduct(idProduct);
        
        //Verificar que el usuario exista
        if(!user) return res.status(404).send({message: `El usuario dueño del token no existe en la base de datos.`})
        
        //Verificar que se hayan pedido productos
        if(!quantity || quantity < 1) return res.status(400).send({message: `La cantidad minima para agregar al carrito es la unidad. Verifique `})

        //Verificar que el producto exista.
        if(!product) return res.status(404).send({message: `No se encontro el producto.`});

        
        //Comprobar si el producto ya fue agregado al carrito de compras anterior
        const productInTheShoppingCart = await checkShoppingCartProducts(idUser, idProduct,quantity);

        if(productInTheShoppingCart){

            if(productInTheShoppingCart == 'exceedsTheStock'){

                return res.status(400).send({message: `La cantidad pedida sobrepasa el stock disponible.`})

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

// >>>>>>>>>>>>>>>>>>>>>>>>> Vaciar carrito

const deleteShoppingCart = async(req, res)=>{
    id = req.userLogin._id;
    try {
        
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
module.exports = {addToShoppingCar};