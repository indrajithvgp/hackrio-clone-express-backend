const Category = require('../models/category')
const Link = require('../models/link')
const slugify = require('slugify')
const formidable = require('formidable')
const AWS = require('aws-sdk')
const { uuid } = require('uuidv4');
const fs = require('fs')

const s3 = new AWS.S3({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

// exports.create = async (req, res) => {
//     const {name, content} = req.body
//     const slug = slugify(name)
//     image = {
//         url: `https://via.placeholder.com/200x150.png?text=${process.env.CLIENT_URL}`,
//         key: '123'
//     }

//     const category = new Category({name, slug, image, content})
//     category.postedBy = req.user._id

//     category.save((err, data) => {
//         if(err){
//             console.log('CATEGORY CREATE ERR', err)
//             return res.status(400).json({
//                 error: 'Category create failed'
//             })
//         }
//         console.log(data)
//         return res.status(201).json({
//             data
//         })
//     })
// }


// exports.create = async (req, res, next)=>{
//     let form = new formidable.IncomingForm()
//     form.parse(req, (err, fields, files)=>{
//         if(err){
//             return res.status(400).json({
//                 error: 'Image could not upload'
//             })
//         }

//         const {name, content} = fields
//         const {image} = files
//         console.log(image, name, content)
//         const slug = slugify(name)
//         let category = new Category({content: content, slug: slug, name: name})
//         if(image.size > 2000000){
//             return res.status(400).json({
//                 error: 'Image should be less than 2MB'
//             })
//         }
//         const uniId = uuid()
//         console.log(uniId)
//         const params = {
//             Bucket: 'hackr.io-rev-01',
//             Key: `category/${uniId}`,
//             Body: fs.readFileSync(image.path),
//             ACL: 'public-read',
//             ContentType: 'image/jpg'
//         }
//         s3.upload(params, function(err, data){
//             if(err) return res.status(400).json({error: 'Upload to S3 Failed'})

//             console.log(data)
//             category.image.url = data.Location
//             category.image.key = data.Key

//             category.save((err, success)=>{
//                 if(err) return res.status(400).json({error: 'Saving category to Database Failed'})
//                 return res.json(success)
//             })
//         })
//     })
// }

exports.create = async (req, res, next) => {
    const {name, image, content} = req.body
    console.log(req.user)

    const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    const type = image.split(';')[0].split('/')[1]

    const slug = slugify(name)
    let category = new Category({content: content, slug: slug, name: name})
    
                                
    const params = {
                    Bucket: 'hackr.io-rev-01',
                    Key: `category/${uuid()}.${type}`,
                    Body: base64Data,
                    ACL: 'public-read',
                    ContentEncoding: 'base64',
                    ContentType: 'image/${type}'
                }

                s3.upload(params, function(err, data){
                                if(err) return res.status(400).json({error: 'Upload to S3 Failed'})
                    
                                console.log(data)
                                category.image.url = data.Location
                                category.image.key = data.Key
                                category.postedBy = req.user._id
                                
                    
                                category.save((err, success)=>{
                                    if(err) return res.status(400).json({error: 'Saving category to Database Failed'})
                                    return res.json(success)
                                })
                            })

}

exports.list = async (req, res) => {
    await Category.find({}).exec((err, data)=>{
        if(err){
            return res.status(400).json({
                error: 'Categories could not load'
            })
        }
        return res.json(data)
    })
}

exports.read = async (req, res) => { 
    console.log(req.body.skip)
    const {slug} = req.params
    let {limit, skip} = req.body
    limit = limit ? parseInt(limit) : 10

    skip = skip ? parseInt(skip) : 10

    Category.findOne({ slug}) 
        .populate({
            path: "postedBy", 
            select:'_id name username'
        })
        .exec((err, category)=>{
            if(err){
                return res.status(400).json({
                    error: 'Could not load category'
                })
            }
            Link.find({categories: category})
                .populate({
                    path: "postedBy", 
                    select:'_id name username'
                })
                .populate({
                    path: "categories", 
                    select: 'name'
                })
                .sort({createdAt: -1})
                // .limit(limit)
                // .skip(skip)
                .exec((err, data)=>{
                    if(err){
                        return res.status(400).json({
                            error: 'Could not load links of a category'
                        })
                    }
                    res.json({category, data})
                })
            
        })
}

exports.remove = async (req, res) => {
    //please check up function skip, limit

    const {slug} = req.params

    Category.findOneAndRemove({slug}, (err, category) => {
        if(err){
            return res.status(400).json({
                error: 'Could not find category to remove'
            })
        }

        const deleteParams = {
            Bucket: 'hackr.io-rev-01',
            Key: `${category.image.key}`,
            // Body: base64Data,
            // ACL: 'public-read',
            // ContentEncoding: 'base64',
            // ContentType: 'image/${type}'
        }

        s3.deleteObject(deleteParams, (err, data)=>{
            if(err){
                console.log("S3 DELETE ERROR DURING UPDATE", err)
            }
            console.log("S3 DELETED DURING UPDATE", data)
        })
        return res.json({
            message:"Category delete successfully"
        })
    })
}

exports.update = async (req, res) => {
    const {slug} = req.params
    const { name, image, content } = req.body;
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(';')[0].split('/')[1]

    Category.findOneAndUpdate({slug},{
        name, content
    }, {
        new: true
    }).exec((err, updated)=>{
        if(err){
            return res.status(400).json({
                error: 'Could not find category to update'
            })
        }
        if(image){
            const deleteParams = {
                Bucket: 'hackr.io-rev-01',
                Key: `${updated.image.key}`,
                // Body: base64Data,
                // ACL: 'public-read',
                // ContentEncoding: 'base64',
                // ContentType: 'image/${type}'
            }

            s3.deleteObject(deleteParams, (err, data)=>{
                if(err){
                    console.log("S3 DELETE ERROR DURING UPDATE", err)
                }
                console.log("S3 DELETED DURING UPDATE", data)
            })

            const params = {
                Bucket: 'hackr.io-rev-01',
                Key: `category/${uuid()}.${type}`,
                Body: base64Data,
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: 'image/${type}'
            }

            s3.upload(params, function(err, data){
                if(err) return res.status(400).json({error: 'Upload to S3 Failed'})
    
                console.log(data)
                updated.image.url = data.Location
                updated.image.key = data.Key
                // updated.postedBy = req.user._id
                
    
                updated.save((err, success)=>{
                    if(err) return res.status(400).json({error: 'Saving category to Database Failed'})
                    return res.json(success)
                })
            })
        }else{
            res.json(updated)
        }
    })
}

