const express = require('express')
const {register, signUp, registerActivate, login, requireSignin, resetPassword, forgotPassword} = require('../controllers/auth')

const {userRegisterValidator, userLoginValidator, forgetPasswordValidator, resetPasswordValidator} = require('../validators/auth')
const {runValidation} = require('../validators')

const router = express.Router()

router.post('/register', userRegisterValidator, runValidation, register) 
// router.post('/api/signup', signUp) 
router.post('/register/activate', registerActivate)
router.post('/login', userLoginValidator, runValidation, login)
router.put('/forgot-password', forgetPasswordValidator, runValidation, forgotPassword) 
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword)

router.get('/secret', requireSignin, (req, res) => {
    res.json({
        data: 'This is secret page for logged in users'
    })
})


module.exports = router

// router.use('/api/register').get(register)
