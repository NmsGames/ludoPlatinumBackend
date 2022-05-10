require('dotenv').config();

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN; 
const accountSid = "ACada619102a41c7617978d58344a85d46";
const authToken = "9726f0357ded860ceeaa3df80369cfa2";
const phoneNumber = "+18608313975"
const sendSms = async (phone, messagess) => {
  const client = require('twilio')(accountSid, authToken);
  let data = await client.messages
    .create({
      body: messagess,
      from: phoneNumber,
      to: `+91 ${phone}`
    })
  console.log(data)
  return true;
}

module.exports = sendSms;