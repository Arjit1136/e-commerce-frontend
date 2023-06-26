import express from 'express'
import {
  addCartItem,
  removeCartItem,
  placeOrder,
  addRemoveWishlist,
  getUser,
  addAddress,
  getCart,
  removeAddress
} from '../controllers/userControllers.js'
const router = express.Router()
router.get('/:id', getUser)
router.route('/wishlist/:id/:productId').patch(addRemoveWishlist)
router.route('/cart/:id').get(getCart)
router.route('/cart/add/:id/:productId/').patch(addCartItem)
router.route('/cart/remove/:id/:productId').patch(removeCartItem)
router.route('/order/:id').patch(placeOrder)
router.route('/address/:id').patch(addAddress)
router.route('/address/remove/:id').patch(removeAddress)
export default router
