import Product from '../models/product.js'
import cloudinary from 'cloudinary'

export const addProduct = async (req, res) => {
  try {
    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: 'products' })
      )
    )

    // Extract the URLs of the uploaded images
    const imageUrls = uploadedImages.map((image) => image.secure_url)

    // Create a new product
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      inStock: {
        s: req.body.s,
        m: req.body.m,
        l: req.body.l,
        xl: req.body.xl,
        xxl: req.body.xxl,
      },
      brand: req.body.brand,
      category: req.body.category,
      images: imageUrls,
    })

    // Save the new product to the database
    const savedProduct = await newProduct.save()

    res.status(201).json(savedProduct)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}



export const getSingleProduct=async (req,res)=>{
    try {
        const {productId}=req.params
        const product=await Product.findById(productId)
        if(!product) res.status(404).json({error:"Product not found.."})
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({error:error.message})
    }

}   

export const getAllProduct = async (req, res) => {
  try {
    const {
        category,brand,maxPrice,minPrice
    }=req.query
    const filter={}
    if(category) filter.category=category
    if(brand) filter.category=brand
    if(minPrice || maxPrice){
        filter.price={}
        if(minPrice) filter.price.$gte=parseFloat(minPrice)
        if(maxPrice) filter.price.$lte=parseFloat(maxPrice)
    }
    const products = await Product.find(filter)
    // const result=products.map(product=>{return product._id})
    // res.status(200).json(result)
    res.status(200).json(products)
  } catch (error) {
    req.status(500).json({ error: error.message })
  }
}

