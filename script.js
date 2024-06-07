const nodemailer = require('nodemailer');


function handleClick(){
    alert("Group Joined!");
}

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "cbd306e9c626cc",
        pass: "2aeaa68084a5ed"
    }
    });

async function handleMail() {
    const info = await transport.sendMail({
        from: '"The Icebreaker" <icebreaker@gmail.com>', // sender address
        to: "laksh.d.bulchandani@gmail.com, ", // list of receivers
        subject: "Friend Request Sent", // Subject line
        text: "Hello, your friend request has been sent" // plain text body
     } )
     console.log("Message sent: %s", info.messageId);
}




    