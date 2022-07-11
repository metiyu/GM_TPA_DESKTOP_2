// const nodemailer = require('nodemailer')

// const transporter = nodemailer.createTransport({
//     service: "hotmail",
//     auth: {
//         user: "chello_gm@outlook.com",
//         pass: "TPADesktop"
//     }
// })

// export default function sendEmail() {
//     const options = {
//         from: "chello_gm@outlook.com",
//         to: "gabriel.mintana@gmail.com",
//         subject: "Test Chello",
//         text: "The main message"
//     }

//     transporter.sendMail(options, function (err, info) {
//         if (err) {
//             console.log(err);
//             return
//         }
//         console.log("Sent" + info.response);
//     })
// }