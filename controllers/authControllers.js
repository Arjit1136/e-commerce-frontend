import jwt from 'jsonwebtoken';
import User from '../models/user.js'
import bcrypt from 'bcrypt'

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body
    const user = await User.find({ email: email })

    if (user.length !== 0) {
      res.status(200).json({ isUser: true })
    } else {
      const salt = await bcrypt.genSalt()
      const passwordHash = await bcrypt.hash(password, salt)

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: passwordHash,
        phoneNumber: phoneNumber || '', // Set phoneNumber to empty string if it's not provided
      })

      const savedUser = await newUser.save()
      res.status(201).json(savedUser)
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const login=async (req,res)=>{
    try{
    const {email,password}=req.body
    const user= await User.findOne({email:email})
    if(!user) return res.status(400).json({ msg: 'User does not exist.' })
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch) res.status(400).json({msg:"Invalid Credentials"})
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
    const { password: _, ...newUser } = user.toObject()
    res.status(201).json({ token, newUser })
    }
    catch(error){
        res.status(500).json({ error: err.message })
    }
}