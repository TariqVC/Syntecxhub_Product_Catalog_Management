const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones',
    price: 99.99,
    category: 'electronics',
    stock: 50,
    sku: 'ELEC-001',
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight shoes for long distance running',
    price: 59.99,
    category: 'footwear',
    stock: 120,
    sku: 'FOOT-001',
  },
  {
    name: 'Coffee Maker',
    description: '12-cup programmable coffee maker',
    price: 45.00,
    category: 'kitchen',
    stock: 30,
    sku: 'KITCH-001',
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof speaker',
    price: 39.99,
    category: 'electronics',
    stock: 75,
    sku: 'ELEC-002',
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip 6mm thick yoga mat',
    price: 25.00,
    category: 'fitness',
    stock: 200,
    sku: 'FIT-001',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(products);
    console.log('5 products seeded successfully');

    mongoose.connection.close();
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();