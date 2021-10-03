const express = require('express')
const chalk = require('chalk')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const linkRoutes = require('./routes/link')

const { ApplicationCostProfiler } = require('aws-sdk')

const app = express()

mongoose.connect(process.env.DATABASE_CLOUD, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log(chalk.bgGreenBright('DATABASE CONNECTED')))
    .catch(err => console.error(chalk.bgRedBright(err.message)))

// app.use(cors())
app.use(cors()) //restricts only to Local development

app.use(bodyParser.json({limit: '5mb', type:'application/json'}))

app.use(morgan('dev'))


app.get('/', (req, res)=>{
    res.send('<h1>Server Running..........</h1>')
})
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', categoryRoutes)
app.use('/api', linkRoutes)

const PORT = process.env.PORT || 8000

app.listen(PORT,()=>{
    console.log(chalk.underline.bgBlueBright(`API listening on port ${PORT}`))
})