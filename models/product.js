import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0
      },
      message: 'Price cannot be negative',
    },
  },
  inStock: {
    type: {
      s: {
        type: Number,
        validate: {
          validator: function (value) {
            return value >= 0
          },
          message: 'Stock cannot be negative',
        },
        default: 0,
      },
      m: {
        type: Number,
        validate: {
          validator: function (value) {
            return value >= 0
          },
          message: 'Stock cannot be negative',
        },
        default: 0,
      },
      l: {
        type: Number,
        validate: {
          validator: function (value) {
            return value >= 0
          },
          message: 'Stock cannot be negative',
        },
        default: 0,
      },
      xl: {
        type: Number,
        validate: {
          validator: function (value) {
            return value >= 0
          },
          message: 'Stock cannot be negative',
        },
        default: 0,
      },
      xxl: {
        type: Number,
        validate: {
          validator: function (value) {
            return value >= 0
          },
          message: 'Stock cannot be negative',
        },
        default: 0,
      },
    },
    default: {
      s: 0,
      m: 0,
      l: 0,
      xl: 0,
      xxl: 0,
    },
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
})

const Product = mongoose.model('Product', productSchema)
export default Product
