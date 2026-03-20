const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use('/api/products', require('./src/routes/productRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Product Catalog API is running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));