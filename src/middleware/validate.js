const { body, query, validationResult } = require('express-validator');

// Reusable handler — returns 400 if any validation rule failed
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({
        field:   e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// Rules for creating a product
const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('SKU cannot exceed 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  handleValidation,
];

// Rules for updating a product (all fields optional)
const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  handleValidation,
];

// Rules for query parameters on GET /api/products
const validateProductQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),

  query('sort')
    .optional()
    .isIn(['price_asc', 'price_desc', 'newest', 'oldest', 'name'])
    .withMessage('Invalid sort option'),

  handleValidation,
];

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
};