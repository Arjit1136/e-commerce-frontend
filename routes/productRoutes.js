import express from 'express'
import {
    getAllProduct,
    getSingleProduct,
} from '../controllers/productControllers.js'
const router=express.Router()
router.get('/',getAllProduct)
router.get('/:productId',getSingleProduct)
export default router