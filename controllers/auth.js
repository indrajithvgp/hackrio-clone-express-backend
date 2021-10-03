const _ = require('lodash')
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { registerEmailParams, forgotPasswordEmailParams } = require('../helpers/email');
const expressJwt = require('express-jwt')
const shortId = require('shortid')
const Link = require('../models/link')
// const AWS_MAIL = require('../helpers/misc')
const User = require('../models/user')

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({apiVersion:'2010-12-01'})

exports.register = (req, res, next) => {
    const {name, email, password, categories} = req.body
    let token
    User.findOne({email}).exec((err, user)=>{
        if(user){
            return res.status(400).json({
                error:'Email is Taken'
            })
        }
        const token =jwt.sign({name, email, password, categories}, process.env.JWT_ACCOUNT_ACTIVATION,{
            expiresIn: '5m'
        })
        const params = registerEmailParams(email, token)
        const sendEmailOnRegister = ses.sendEmail(params).promise()
        sendEmailOnRegister
            .then((data)=>{ 
                console.log('Email submitted to SES', data)
                res.json({
                    message: `Email has been sent to ${email}, Please follow the instructions to complete your registration`
                })
            })
            .catch(err =>{
                console.log('ses email on register failed',err)
                res.json({
                    message: `We could not able to verify your email: ${email}..Please try again`
                })
            })
    })


    // console.log(req.body)
    // res.json({
    //     data:'You hit register endpoint '
    // })

}

// exports.signUp = async (req, res) => {
//     const {name, email, password} = req.body
//     const aws_email = new AWS_MAIL()
//     const aws_i = await aws_email.registerEmailParams(email, name)
//     res.send(aws_i)
// }

exports.registerActivate = async (req, res) => {
    const {token} = req.body
    try{
        const decoded = await jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION)
        const {name, email, password, categories} = jwt.decode(token)
        const username = shortId.generate()
        User.findOne({email}).exec((err, user) => {
            if(user){
                return res.status(401).json({
                    error:"Email is taken"
                })
            }
        })
        const user = new User({username, name, email, password, categories})
        user.save((err, user) => {
            if(err){
                return res.status(401).json({
                    message: 'Error saving in Database.. Try again later'
                })
            }
            return res.json({
                message: 'Registration success..Please log in'
            })
        })
    }catch(err){
        return res.status(401).json({
            error: 'Expired Link, Try again'
        })
    }
}

exports.login = async(req, res) => {
    const {email, password} = req.body
    User.findOne({ email: email}).exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                error:"User with the email does not exist. Please register"
            })
        }
        if(!user.authenticate(password)){
            return res.status(400).json({
                error: 'Email and password do not match' 
            })
        }
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
            expiresIn:'7d'
        })
        const {_id, name, email, role} = user
        return res.json({
            token, user: {_id, name, email, role}
        })
    })
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['sha1', 'RS256', 'HS256']
})

exports.authMiddleware = async (req, res, next) => {
    const authUserId = req.user._id
    User.findOne({_id: authUserId}).exec(function (err, user) {
        if(err || !user){
            return res.status(400).json({
                error: "User not found"
            })
        }
        req.profile = user 
        next()
    })
}

exports.adminMiddleware = async (req, res, next) => {
    const adminUserId = req.user._id
    User.findOne({_id: adminUserId}).exec(function (err, user) {
        if(err || !user){
            return res.status(400).json({
                error: "User not found"
            })
        }
        if(user.role !== "admin"){
            return res.status(400).json({
                error: "Admin resource.. Access Denied"
            })
        }
        req.profile = user 
        next()
    })
}

exports.forgotPassword = async(req, res, next) => {
    const {email} = req.body
    User.findOne({email: email}).exec(async (err, user) => {
        if(err || !user){
            return res.status(400).json({
                error:'User with that email not found'
            })
        }
        const token = jwt.sign({name: user.name}, process.env.JWT_RESET_PASSWORD, {
            expiresIn: '10m'
        })
        const params = forgotPasswordEmailParams(email, token)
        const findUser = await User.findOne({email: email})
        try{
            const user = await User.findByIdAndUpdate(findUser.id, {resetPasswordLink: token},{
                new:true,
                runValidators:true
            })
            const sendEmail = ses.sendEmail(params).promise()
            sendEmail
                .then(data => {
                    console.log('ses reset pw success', data)
                    return res.json({
                        message: `Email has been sent to ${email}. Click on the link to reset your password`
                    })
                })
                .catch(e => {
                    console.log('ses reset pw failed', e)
                    return res.json({
                        message: `We could not verify your email. Please try again later..`
                    })
                })
        }catch(err){
            console.log(err)
            return res.status(400).json({
                error:'Password reset failed'
            })
        }
    })
}

exports.resetPassword = async(req, res, next) => {
    const {resetPasswordLink, newPassword} = req.body
    if(resetPasswordLink){ 
        return jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, success) => {
            if(err){
                return res.status(400).json({
                    error: 'Expired Link. Try again'
                })
            }
            User.findOne({resetPasswordLink}).exec((err, user)=>{
                if(err || !user){
                    return json.status(400).json({
                        error: 'Invalid token. Try again'
                    })
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }
                user = _.extend(user, updatedFields)
                user.save((err, result)=>{
                    if(err){
                        return res.status(400).json({
                            error: 'Password reset failed. Try again'
                        }) 
                    }
                    return res.json({
                        message: 'Great! Now you can login with your new password'
                    })
                })
            })
        })
    }
}

exports.canUpdateDeleteLink = async (req, res, next) => {
    const {id} = req.params
    Link.findOne({_id: id}).exec((err, data) => {
        if(err){
            return res.status(400).json({
                error: 'could not find Link'
            })
        }
        let authorizedUser = data.postedBy._id.toString() === req.user._id
        // console.log(typeof req.user._id)
        // console.log(typeof data.postedBy._id)
        if(!authorizedUser){
            return res.status(400).json({
                error: 'You are not authorized'
            })
        }
        next()
    })
}

exports.adminCanUpdateDeleteLink = async (req, res, next) => {
    const {id} = req.params
    Link.findOne({_id: id}).exec((err, data) => {
        if(err){
            return res.status(400).json({
                error: 'could not find Link'
            })
        }        
        // console.log(typeof req.user._id)
        // console.log(typeof data.postedBy._id)
        next()
    })
}

