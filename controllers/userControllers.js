import User from '../models/user.js'
import Product from '../models/product.js'
export const getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    res.status(200).json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

//address 

export const addAddress=async (req, res) => {
  const { id } = req.params;
  const { street, city, state, country, zipCode } = req.body;

  try {

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newAddress = {
      street,
      city,
      state,
      country,
      zipCode,
    };

    // Add the new address to the user's shippingAddress array
    user.shippingAddress.push(newAddress);
    await user.save();

    res.status(200).json(user.shippingAddress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
export const removeAddress=async(req,res)=>{
  try {
    const { id } = req.params
    const { addressId } = req.body
    console.log(id, addressId)
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'No user found!' })
    }
    user.shippingAddress = user.shippingAddress.filter(
      (address) => address._id.toString() !== addressId
    )
    await user.save()
    return res.status(201).json({shippingAddress:user.shippingAddress})
    
  } catch (error) {
    res.status(500).json({error:error})
  }
  
}
//Wishlist


export const addRemoveWishlist = async (req, res) => {
  try {
    const { id, productId } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'No user found!' })
    }
    if (user.wishList.includes(productId)) {
      user.wishList = user.wishList.filter(
        (p_id) => p_id.toString() !== productId
      )
    } else {
      user.wishList.push(productId)
    }
    await user.save()
    return res.status(201).json(user.wishList)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// Cart

export const addCartItem = async (req, res) => {
  try {
    const { id, productId } = req.params
    const { quantity, size } = req.body
    // console.log(quantity , size)
    const user = await User.findById(id)
    const product = await Product.findById(productId)

    if (!user || !product) {
      return res.status(404).json({ message: 'User or product not found' })
    }
    // Check if the requested size is available in the product's inStock
    if (product.inStock[size] < quantity) {
      return res.status(400).json({
        message: 'Requested quantity not available in the specified size',
      })
    }
    const newCartItem = {
      productId: productId,
      quantity: quantity,
      size: size,
    }

    const existingCartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    )

    if (existingCartItemIndex !== -1) {
      // Update the quantity of the existing product in the cart
      user.cart[existingCartItemIndex].quantity = quantity
      user.cart[existingCartItemIndex].size = size
    } else {
      // Add the new product to the cart
      user.cart.push(newCartItem)
    }

    // Save the updated user document
    await user.save()
    return res.status(200).json(user.cart)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

export const removeCartItem = async (req, res) => {
  try {
    const { id, productId } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Find the index of the product in the cart array
    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    )

    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' })
    }

    // Remove the product from the cart
    user.cart.splice(cartItemIndex, 1)
    await user.save()

    return res.status(200).json(user.cart)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

//Order

export const placeOrder = async (req, res) => {
  try {
    const { id} = req.params
    const {addressId}=req.body
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Find the address by ID
    const address = user.shippingAddress.id(addressId)
    if (!address) {
      return res.status(404).json({ message: 'Address not found' })
    }

    const orderItems = await Promise.all(
      user.cart.map(async (item) => {
        const { productId, quantity, size } = item

        const product = await Product.findById(productId)
        if (!product) {
          throw new Error(`Product not found: ${productId}`)
        }

        const availableStock = product.inStock[size]
        if (!availableStock || availableStock < quantity || quantity === 0) {
          return item // Keep the item in the cart
        }

        // Reduce the available quantity in the specified size
        product.inStock[size] -= quantity
        await product.save()

        return {
          productId: productId,
          quantity: quantity,
          size: size,
          price: product.price,
          availableStock: availableStock, // Include the available stock in the order item
        }
      })
    )

    const validOrderItems = orderItems.filter(
      (item) => item.quantity <= item.availableStock
    )

    if (validOrderItems.length === 0) {
      return res.status(400).json({ message: 'No items available for order' })
    }

    const totalPrice = validOrderItems.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    const newOrder = {
      products: validOrderItems,
      totalPrice: totalPrice,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        zipCode: address.zipCode,
      },
      date: new Date(),
    }

    user.orders.push(newOrder)
    user.cart = user.cart.filter((item) => {
      const product = validOrderItems.find((orderItem) =>
        orderItem.productId.equals(item.productId)
      )
      return !product || item.quantity > product.quantity
    })
    await user.save()

    res
      .status(201)
      .json({ message: 'Order placed successfully', orders: user.orders.reverse(), cart:user.cart })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


export const getCart = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).populate('cart.productId')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Calculate total price
    let totalPrice = 0
    user.cart.forEach((item) => {
      const { productId, quantity, size } = item
      const inStock = productId.inStock[size.toLowerCase()]
      
      if (quantity <= inStock) {
        totalPrice += productId.price * quantity
      }
    })

    res.status(200).json({ cart: user.cart, totalPrice })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
