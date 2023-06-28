import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import morgan from 'morgan'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import {verifyToken} from './middlewares/auth.js'
import cloudinary from 'cloudinary'
import cors from 'cors'
import multer from 'multer'
import { addProduct } from './controllers/productControllers.js'
import path from 'path'
import { fileURLToPath } from 'url'
// const __filename = fileURLToPath(import.meta.url)
// const __direname = path.dirname(__filename)
// console.log(import.meta.url , __filename , __direname)
//middleware
dotenv.config()
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(morgan('common'))

//cloudinary
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
})
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') //uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //original name
  },
})
// const storage = multer.memoryStorage()
const upload = multer({ storage: storage }).array('files', 10)

app.post('/products', upload, addProduct)
//routes

app.use('/auth',authRoutes)
app.use('/user',verifyToken,userRoutes)
app.use('/product',productRoutes)

//listen
const PORT =process.env.PORT || 6001

mongoose.connect(`${process.env.MONGO_URL}`,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(
    ()=>{
        app.listen(PORT,()=>console.log(`Server port : ${PORT}`))
    }
).catch((error)=>{
    console.log(`${error} did not connect...`)
})
