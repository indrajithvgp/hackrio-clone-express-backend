const { check } = require('express-validator');

exports.categoryCreateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('image')
        .not()
        .isEmpty()
        .withMessage('Image must be provided'),
    check('content')
        .isLength({min: 20})
        .withMessage('Content is required')
]

exports.categoryUpdateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('content')
        .isLength({min: 20})
        .withMessage('Content is required')
]
