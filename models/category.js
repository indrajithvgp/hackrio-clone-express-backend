const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true, 
        max: 32
    },
    slug:{
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        max: 32      
    },
    image:{
        url: String,
        key: String,
    },
    content:{
        type: {},
        min: 20,
        max: 2000000
    },
    postedBy:{
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
    } 
}, {timestamps: true})

module.exports = mongoose.model('Category', categorySchema)