import mongoose, { Schema } from 'mongoose'
import validator from 'validator'

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
})
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    min: 2,
    max: 50,
  },
  lastName: {
    type: String,
    required: true,
    min: 2,
    max: 50,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
    validate: validator.isEmail,
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^\d{10}$/.test(value)
      },
      message: 'Invalid phone number format',
    },
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 16,
  },
  shippingAddress: [addressSchema],
  wishList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],

  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        default: 1,
      },
      size: {
        type: String,
      },
    },
  ],
  orders: [
    {
      products: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
            required: true,
          },
          size: {
            type: String,
            required: true,
          },
        },
      ],
      totalPrice: {
        type: Number,
        required: true,
      },
      address: {
        type: addressSchema,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
  ],
})

const User = mongoose.model('User', UserSchema)
export default User
