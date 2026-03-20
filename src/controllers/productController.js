const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @desc    Get all products with search + pagination
// @route   GET /api/products?search=shoes&category=footwear&page=1&limit=10&sort=price
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build the filter object
    const filter = { isActive: true };

    // Full-text search on name and category
    if (search) {
      filter.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      filter.category = category.toLowerCase();
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    const sortOptions = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      newest:     { createdAt: -1 },
      oldest:     { createdAt: 1 },
      name:       { name: 1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    // Pagination
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // cap at 50
    const skip     = (pageNum - 1) * limitNum;

    // Run query + count in parallel
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortBy).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success:    true,
      count:      products.length,
      total:      total,
      page:       pageNum,
      totalPages: Math.ceil(total / limitNum),
      data:       products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'SKU already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a product (soft delete)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get product stats grouped by category
// @route   GET /api/products/stats/category
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      // Stage 1: only active products
      { $match: { isActive: true } },

      // Stage 2: group by category
      {
        $group: {
          _id:          '$category',
          totalProducts: { $sum: 1 },
          avgPrice:      { $avg: '$price' },
          minPrice:      { $min: '$price' },
          maxPrice:      { $max: '$price' },
          totalStock:    { $sum: '$stock' },
        },
      },

      // Stage 3: shape the output
      {
        $project: {
          _id:           0,
          category:      '$_id',
          totalProducts: 1,
          avgPrice:      { $round: ['$avgPrice', 2] },
          minPrice:      1,
          maxPrice:      1,
          totalStock:    1,
        },
      },

      // Stage 4: sort by most products
      { $sort: { totalProducts: -1 } },
    ]);

    res.json({ success: true, count: stats.length, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get price distribution across all products
// @route   GET /api/products/stats/price
const getPriceStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 25, 50, 100, 250, 500],
          default: '500+',
          output: {
            count:    { $sum: 1 },
            products: { $push: '$name' },
            avgPrice: { $avg: '$price' },
          },
        },
      },
      {
        $project: {
          _id:       0,
          priceRange: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0]   }, then: '$0 - $25'    },
                { case: { $eq: ['$_id', 25]  }, then: '$25 - $50'   },
                { case: { $eq: ['$_id', 50]  }, then: '$50 - $100'  },
                { case: { $eq: ['$_id', 100] }, then: '$100 - $250' },
                { case: { $eq: ['$_id', 250] }, then: '$250 - $500' },
              ],
              default: '$500+',
            },
          },
          count:    1,
          avgPrice: { $round: ['$avgPrice', 2] },
          products: 1,
        },
      },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoryStats,
  getPriceStats,
};