const Link = require('../models/link')
const slugify = require('slugify')
const User = require('../models/user')
const Category = require('../models/category')
const AWS = require('aws-sdk');
const {linkPublishedParams} = require('../helpers/email')


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({apiVersion:'2010-12-01'})


exports.create = async (req, res, next) => {
    const {title, url, categories, type, medium} = req.body

    const slug = url
    const link = new Link({title, url, categories, medium, slug, type})
    link.postedBy = req.user._id

    // let arrayOfCategories = categories && categories.split(',')
    // link.categories = arrayOfCategories
    link.save((err, data)=>{
        if(err) return res.status(400).json({error: 'Link already exists'})

        res.json(data)

        User.find({categories: {$in: categories}}).exec((err,users)=>{
            if(err) throw new Error(err)        
            Category.find({_id: {$in: categories}})
                .exec((err, result)=>{
                    data.categories = result
                    for(let i = 0; i < users.length; i++){
                        const params = linkPublishedParams(users[i].email, data)
                        const sendEmail = ses.sendEmail(params).promise()
                        sendEmail.then(success=>{
                            console.log("success", success)
                            return
                        }).catch(error=>{
                            console.log("error", error)
                            return
                        })
                    }
                })
        })
    })
}

exports.list = async (req, res, next) => {

    let {limit, skip} = req.body
    limit = limit ? parseInt(limit) : 10

    skip = skip ? parseInt(skip) : 10
    await Link.find({})
    .populate('postedBy', 'name')
    .populate('categories', 'name')
    .sort({createdAt: -1})
    // .skip(skip)
    // // .limit(limit)
    .exec((err, data) => {
        if(err) return res.status(400).json({error: 'Could not list links', msg: err.message})
        return res.json(data)
    })
}

exports.clickCount = async (req, res, next) => {
    const {linkId} = req.body

    Link.findByIdAndUpdate(linkId, {$inc:{clicks:1}}, {
        new: true,
        upsert: true
    }).exec((err, result)=>{
        if(err){
            return res.status(400).json({
                error: 'Could not update view count'
            })
        }
        res.json(result)
    })
}

exports.remove = async(req, res, next) => {
    const {id} = req.params
    Link.findOneAndRemove({_id: id}).exec((err, data)=>{
        if(err){
            if(err){
                return res.status(400).json({
                    error: 'Error removing Link'
                })
            }
        }
        return res.json({
            message: "Link removed successfully"
        })
    })
}

exports.update = async(req, res, next) => {
    const {id} = req.params
    const {title, url, categories, type, medium} = req.body
    Link.findOneAndUpdate({_id: id}, {
        title, url, categories, type, medium
    },{
        new: true
    }).exec((err, updated)=>{
        if(err){
            if(err){
                return res.status(400).json({
                    error: 'Error Updating the Link'
                })
            }
        }
        return res.json(updated)
    })
}

exports.read = async (req, res) => {
    const {id} = req.params
    Link.findOne({_id: id}).exec((err, data)=>{
        if(err){
            if(err){
                return res.status(400).json({
                    error: 'Error finding the Link'
                })
            }
        }
        return res.json(data)
    })
}

exports.popular = (req, res) => {
    Link.find()
        .populate('postedBy', 'name')
        .sort({ clicks: -1 })
        .limit(3)
        .exec((err, links) => {
            if (err) {
                return res.status(400).json({
                    error: 'Links not found'
                });
            }
            res.json(links);
        });
};

exports.popularInCategory = (req, res) => {
    const { slug } = req.params;
    console.log(slug);
    Category.findOne({ slug }).exec((err, category) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not load categories'
            });
        }

        Link.find({ categories: category })
            .sort({ clicks: -1 })
            .limit(3)
            .exec((err, links) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Links not found'
                    });
                }
                res.json(links);
            });
    });
};
