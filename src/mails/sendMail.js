
require('dotenv').config();
var nodemailer = require('nodemailer');
const conn  = require("../../config/db");
const moment = require('moment')


const sendMail = async(user_id,txn_id,amount,type) => {
    
    try {   
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'rajendra@nmsgames.com',
            pass: 'lyszrpneixiqhpxv',
            },
        }); 

        //Check User confirmations
        let sql = `SELECT * FROM users WHERE user_id = ? limit ?`; 
        let responseData = await conn.query(sql, [user_id, 1]);  
        if(responseData.length>0){  
            let AdminMsg    = ""
            let ClientMsg   = ""
            let subject     = ""
            let subjectAdmin = ""
            let userName    = responseData[0].username?responseData[0].username:`Guest0${responseData[0].user_id}`;
            let userId      = responseData[0].user_id;
            let clienMail   = responseData[0].email;
           // let clienMail   = "rajendraakmr@gmail.com";
          //  let adminMail   = 'rajendra@nmsgames.com';
 	let adminMail   = 'business@ludoplatinum.com';
            let txnId       = txn_id;
            let date        = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
            if(type ==1){ 
                //user formate
                subject    = `Thank you ${userName}! Your payment is in progress...`
                ClientMsg  = `<h3>Hi ${userName} </h3><br>
                Withdraw Request Received, Your payment is in progress.<br>Transaction ID : ${txnId}<br>
                Date : ${date}<br><br><br>Thanks & Regards`
                //Admin mail formate
                subjectAdmin =  `With Request from ${userName}!`
                AdminMsg = `<p>Withdraw Request Received from ${userName} ID #${userId}</p>
                <br> Request Amount : Rs ${amount}
                <br>Transaction ID : ${txnId}<br>
                Date : ${date} `
            }else{
                subject    = `Congratulations...! Transaction completed`
                ClientMsg = `<p>Your Withdraw Amount Rs ${amount} credited to your account successfully </p>
                <br>Transaction ID : ${txnId}<br>
                Date : ${date}<br><br><br>Thanks & Regards`
                //Admin mail formate
                subjectAdmin = `Payment Confimations`
                AdminMsg = `<p>Payment Successfully Done. Rs. ${amount}  Credited to ${userName} ID #${userId}</p>
                <br>Transaction ID : ${txnId}<br>
                Date : ${date}<br>`
               
            }  
            transporter.sendMail({
                from: '"Sports Ten Technologies Private Limited!" <rajendra@nmsgames.com>', // sender address
                to: clienMail,  
                subject:subject,
                html:  ClientMsg,  
            }).then(info => {
                if(info){
                    console.log(info)
                    transporter.sendMail({
                        from: '"Sports Ten Technologies Private Limited!" <rajendra@nmsgames.com>',  
                        to: adminMail,  
                        subject: subjectAdmin, 
                        html:  AdminMsg,  
                    }).then(info => { 
                        console.log('success');
                    }).catch(console.error); 
                } 
            }).catch(console.error); 
        }
        return true;
                
    } catch (error) {
        res.send({ error: error })
    }
}
module.exports = sendMail;