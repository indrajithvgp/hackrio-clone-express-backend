const { check } = require('express-validator');

exports.userRegisterValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email')
        .isEmail()
        .withMessage('Must be valid email address'),
    check('password')
        .isLength({min:6, max:20})
        .withMessage('Password must be at least 6 characters long'),
    check('categories')
            .not()
            .isEmpty()
        .withMessage('atleast one category must be provided')
]


// check('categories')
//         not()
//         .isEmpty()
//         .withMessage('atleast one category must be provided')



exports.userLoginValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be valid email address'),
    check('password')
        .isLength({min:6, max:20})
        .withMessage('Password must be at least 6 characters long')
]

exports.forgetPasswordValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be valid email address')
]

exports.resetPasswordValidator = [

    check('newPassword')
        .isLength({min:6, max:20})
        .withMessage('Password must be at least 6 characters long'),
    check('resetPasswordLink')
        .not()
        .isEmpty()
        .withMessage('Token is required')
]

exports.userUpdateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
]
