const path = require('path');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const hbs = require('nodemailer-express-handlebars');

require('dotenv/config');

const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
);

const handlebarOptions = {
    viewEngine: {
        extName: '.html',
        partialsDir: path.resolve('./src/resources/mail/auth/'),
        layoutsDir: path.resolve('./src/resources/mail/auth/'),
        defaultLayout: 'forgot_password.html',
    },
    viewPath: path.resolve('./src/resources/mail/auth/'),
    extName: '.html',
};
transport.use('compile', hbs(handlebarOptions));

module.exports = transport;