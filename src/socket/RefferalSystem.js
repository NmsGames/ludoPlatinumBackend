// const debug = require("debug")("test");
const db = require("../../config/db");
const { sendResponse, isValidArray } = require('../../services/AppService');
  
 
/**
 * Desc : Check Refferal is used or NOT
 * Req  :{ device_id}
 * Function : loggedInUser
 */
let status  = 404;
let data    = {}; 
let message;
let responseData;
let updateResponse;
let sql;

const checkDeviceVerify = async (req) => {
   
    const { device_id } = req 
    try {
        sql          = `SELECT * FROM users WHERE device_id=? limit ?`;
        responseData = await db.query(sql, [device_id, 1]); 
        if(responseData.length>0){
            status = 404
            message = "Sorry! it is not valid"
        }else{
            status  = 200
            message ="Success! valid "
        }
        return sendResponse(status,message,data)
    } catch (error) {
        return sendResponse(500,'Database error',data)
    } 
}


const getReferalCode = async (req) => {
   
    const { user_id,device_id} = req 
    try {
        sql          = `SELECT * FROM users WHERE device_id=? AND user_id =? limit ?`;
        responseData = await db.query(sql, [device_id,user_id ,1]); 
        if(responseData.length>0){
            sql = `SELECT * FROM user_coupon_codes WHERE device_id=? AND user_id = ? limit ?`;
            responseData = await db.query(sql, [device_id,user_id ,1]); 
            if(responseData.length>0){
                data= {
                    user_id     : responseData[0].user_id,
                    device_id   : responseData[0].device_id,
                    referral_code:responseData[0].refferal_code,
                    referral_bonus:responseData[0].refer_amount, 
                    app_download_link:"https://www.ludoplatinum.com/ludoplatinum.apk"
                }
                status = 200
                message = "Referral available!"
            }else{
                status  = 404
                message ="Not available"
            }
        }
        
        
        return sendResponse(status,message,data)
    } catch (error) {
        return sendResponse(500,'Database error',data)
    } 
}
  
 
module.exports = {  
    checkDeviceVerify, 
    getReferalCode
    }