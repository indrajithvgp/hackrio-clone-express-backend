const { check } = require('express-validator');

exports.linkCreateValidator = [
    check('title')
        .not()
        .isEmpty()
        .withMessage('Link is required'),
    check('url')
        .not()
        .isEmpty()
        .withMessage('URL must be provided'),
    check('categories')
        .not()
        .isEmpty()
        .withMessage('Pick a Category'),
    check('type')
        .not()
        .isEmpty()
        .withMessage('Pick a type Free/Paid'),
    check('medium')
        .not()
        .isEmpty()
        .withMessage('Pick a Medium Video/Book')            
]

exports.linkUpdateValidator = [
    check('title')
        .not()
        .isEmpty()
        .withMessage('Link is required'),
    check('url')
        .not()
        .isEmpty()
        .withMessage('URL must be provided'),
    check('categories')
        .not()
        .isEmpty()
        .withMessage('Pick a Category'),
    check('type')
        .not()
        .isEmpty()
        .withMessage('Pick a type Free/Paid'),
    check('medium')
        .not()
        .isEmpty()
        .withMessage('Pick a Medium Video/Book')            
]
