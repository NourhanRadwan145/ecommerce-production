// ---------------------------------- All Requires -------------------------------------
const UserModel = require("../Models/UserModel")
const UserValidate = require("../Utils/UserValidate")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")



// ---------------------------------- Get All Users  ------------------------------------
let GetAllUsers = async (req, res)=>{
    // => for testing routes
    // let users = await UserModel.find({})
    // return res.json(users)
}
// ---------------------------------- Get User By ID  -----------------------------------
let GetUserById = async (req, res)=>{}
// ---------------------------------- Add New User  -------------------------------------
let AddNewUser = async (req, res)=>{}
// ---------------------------------- Update User By ID  --------------------------------
let UpdateUser = async (req, res)=>{}
// ---------------------------------- Delete User By ID  ---------------------------------
let DeleteUser = async (req, res)=>{}
// ---------------------------------- Login User  ---------------------------------------
let LoginUser = async (req, res)=>{
    res.send("Login User")
}
// ---------------------------------- Register User  ------------------------------------
let RegisterUser = async (req, res)=>{
    let {error} = UserValidate(req.body)
    if(error) return res.status(400).json({message:error.details[0].message})

    try {
        let name = req.body.username  
        let email = req.body.email
        let password = req.body.password
        let gender = req.body.gender

        let salt = await bcrypt.genSalt(10)  
        let hashedPassword = await bcrypt.hash(password, salt) 

        let checkUser = await UserModel.findOne({email:email})    
        if(checkUser){
            return res.status(400).json({message:"User Already Exists"})
        }
        else{
            let newUser = new UserModel({  
                username:name,
                email:email,
                password:hashedPassword,
                gender: gender
            })
            let savedUser = await newUser.save()  
            const {_id} = savedUser.toJSON() 
            const secretKey = crypto.randomBytes(32).toString("hex") 
            const token = jwt.sign({_id: _id}, secretKey) 
            res.cookie("jwt", token, { 
                httpOnly:true,
                maxAge: 24*30*60*60*1000 
            })  
            console.log(token)
            return res.status(201).json({message:"User Created Successfully", user:savedUser})  
        }
    } 
    catch (error) {
        return res.status(500).json({message:error.message})
    }
}


// ---------------------------------- Export All Functions  ------------------------------
module.exports = {GetAllUsers, GetUserById, AddNewUser, UpdateUser, DeleteUser, LoginUser, RegisterUser}
// ---------------------------------- End Of Controller ----------------------------------