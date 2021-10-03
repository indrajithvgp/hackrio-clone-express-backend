const AWS = require('aws-sdk');

class AWS_MAIL{
    constructor(){
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        })
        this.ses = new AWS.SES({apiVersion:'2010-12-01'})
    }
    registerEmailParams(email, token){
        const params = {
            Source: process.env.EMAIL_FROM,
            Destination:{   
                ToAddresses: [email]
            },
            ReplyToAddresses:[process.env.EMAIL_TO],
            Message:{
                Body:{
                    Html:{
                        Charset: 'UTF-8',
                        Data: `
                                <html>
                                    <h1 style="color:red;">Verify your Email Address</h1>
                                    <p>Please use the following link to complete your registration</p>
                                    <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                                </html>
                                `
                    }
                },
                Subject:{
                    Charset: 'UTF-8',
                    Data:'Bienvenue !!! Complete your registration'
                }
            }
        }
        return this.sendEmailOnRegister(params)
    }
    sendEmailOnRegister(params){
        const sendEmailOnRegistery = this.ses.sendEmail(params).promise()
        return sendEmailOnRegistery.then((data)=>{
                console.log('Email submitted to SES', data)
                return {
                    message: `Email has been sent to ${params.ReplyToAddresses}, Please follow the instructions to complete your registration`
                }
            })
            .catch(err =>{
                console.log('ses email on register failed',err)
                return{
                    message: `We could not able to verify your email: ${params.ReplyToAddresses}..Please try again`
                }
            })
    }
}

module.exports = AWS_MAIL