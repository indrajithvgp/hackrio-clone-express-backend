exports.registerEmailParams = (email, token) => {
    console.log(process.env.CLIENT_URL);
    return{
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
                                <h1 style="color:blue;">Verify your Email Address</h1>
                                <p>Please use the following link to complete your registration</p>
                                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                            </html>
                            `
                }
            },
            Subject:{
                Charset: 'UTF-8',
                Data:'Bueno Idea!!! Complete your registration'
            }
        }
    }
}

exports.forgotPasswordEmailParams = (email, token) => {

    return{
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
                                <h1 style="color:red;">Reset Password Link</h1>
                                <p>Please use the following link to reset your password</p>
                                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                            </html>
                            `
                }
            },
            Subject:{
                Charset: 'UTF-8',
                Data:'Bueno Idea!!! Reset Password Link'
            }
        }
    }
}

exports.linkPublishedParams = (email, data) => {

    return{
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
                                <h1 style="color:blue;">New Link Published | Check out !!! </h1>
                                <p>New Link titled <b>${data.title}</b> has been just pubished in the following categories. </p>
                                ${data.categories.map(c=>{
                                    return `
                                    <div>
                                        <h2>${c.name}</h2>
                                        <img src="${c.image.url}" alt="${c.name}" style="height:50px;"/>
                                        <h3><a href="${process.env.CLIENT_URL}/links/${c.slug}">Check it out</a></h3>
                                    </div>

                                    `
                                }).join('-----------------------------')}

                                <br/>

                                <p>Do not with to recieve notification?</p>
                                <p>Turn off notificationby going to your <b>Dashboard</b><b>Update Profile</b>
                                <b>Uncheck the categories</b>
                                <p>${process.env.CLIENT_URL}/user/profile/update</p>
                                </p>
                            </html>
                            `
                }
            },
            Subject:{
                Charset: 'UTF-8',
                Data:'New Link Published'
            }
        }
    }
}
