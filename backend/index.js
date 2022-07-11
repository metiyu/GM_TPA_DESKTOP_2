var express = require("express");
const PORT = process.env.PORT || 3001
var app = express();
var bodyparser = require('body-parser')
var cors = require('cors')
const nodemailer = require('nodemailer')

app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: "chello_gm@outlook.com",
        pass: "TPADekstop"
    }
})

const options = {
    from: "chello_gm@outlook.com",
    to: "gabriel.mintana@binus.edu",
    subject: "Chello Invitation",
    text: "The main message"
}

app.post("/sendInvitation", (req, res) => {
    transporter.sendMail({
        ...options,
        to: req.body.to,
        text: req.body.link
    }, function(err, info) {
        res.send(req.body.link)
        if(err) {
            console.log(err);
            return
        }
        console.log("Sent " + info.response);
    })
})