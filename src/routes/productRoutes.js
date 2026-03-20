//Each route now runs protect first, then the relevant validation rules, then the controller. 
//If any step fails the request stops there and never reaches the database.
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoryStats,
  getPriceStats,
} = require('../controllers/productController');
const protect = require('../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
} = require('../middleware/validate');

// Stats routes
router.get('/stats/category', protect, getCategoryStats);
router.get('/stats/price',    protect, getPriceStats);

// CRUD routes
router.get('/',       protect, validateProductQuery,   getProducts);
router.get('/:id',    protect,                         getProductById);
router.post('/',      protect, validateCreateProduct,  createProduct);
router.put('/:id',    protect, validateUpdateProduct,  updateProduct);
router.delete('/:id', protect,                         deleteProduct);

module.exports = router;