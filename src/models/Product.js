const mongoose = require('mongoose') ;

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            lowercase: true,
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        sku: {
            type: String,
            unique: true,
            trim: true,
            uppercase: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, //adds a createdAt and updatedAt automatically
    }
);

//Index for for search performance
productSchema.index({name: 'text', category: 'text '});
productSchema.index({category: 1});

const Product = mongoose.model('Product', productSchema) ;

module.exports = Product ;