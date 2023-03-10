"use strict";
const { Router } = require("express");
const {
  cretaeCategory,
  updateCategory,
  readCategories,
  deleteCategory,
  searchCategoryByName,
  categoryWithProduct,
} = require("../controllers/category.controller");

// Importamos los middlewares
const { validateParamas } = require("../middlewares/validate-params");
const { validateJWT } = require("../middlewares/validate-jwt");
// Modulo check, verifica parametros especificos que utilizara el validateParams
const { check } = require("express-validator");

const api = Router();

//********************************************************************************/
//************************* MANEJO DE CATEGORIAS *********************************/
//********************************************************************************/

// >>> Crear categoria
api.post(
  "/create-category",
  [
    validateJWT,
    check(
      "categoryName",
      "El categoryName es obligatorio para crear la cateogria"
    )
      .not()
      .isEmpty(),
    validateParamas,
  ],
  cretaeCategory
);

// >>> Ver categorias
api.get("/read-categories", readCategories);

// >>> Actualizar categoria
api.put(
  "/update-category",
  [
    validateJWT,
    check("idCategory", "El idCategory es obligatorio para editar la cateogria")
      .not()
      .isEmpty(),
    check(
      "descriptionCategory",
      "El descriptionCategory es obligatorio para editar la cateogria"
    )
      .not()
      .isEmpty(),
    validateParamas,
  ],
  updateCategory
);

// >>> Eliminar una categoria
api.delete(
  "/delete-category",
  [
    validateJWT,
    check(
      "idCategory",
      "El idCategory es obligatorio para eliminar la cateogria"
    )
      .not()
      .isEmpty(),
  ],
  deleteCategory
);

// >>> Buscar una categoria por nombre
api.get(
  "/search-category-by-name",
  [
    check(
      "categoryName",
      "El categoryName es obligatorio para buscar la categoria."
    )
      .not()
      .isEmpty(),
  ],
  searchCategoryByName
);

// >>> Buscar una categoria por nombre
api.get("/category-with-product", categoryWithProduct);

module.exports = api;
