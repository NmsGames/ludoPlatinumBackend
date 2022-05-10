// const debug = require("debug")("test");
const db            = require("../../config/db");
const bcrypt        = require('bcrypt');
const moment        = require('moment');
var url             = require('url');
const { sendResponse, isValidArray } = require('../../services/AppService');
const { getUserTransactionAmount,userTransactionsHistory,createBonusReports ,referralBonus} = require('./Transactions');
const sendSms       = require('../sms/PhoneSms')
const hostname      = `http://13.127.231.91:5000`
const emailvalidator= require("email-validator");
const ifsc          = require('ifsc');
const {generateToken}    = require('../CashfreePayouts/AuthToken')
const commanEnv = require("../CashfreePayouts/constants").ENVS;
const commanVar = require("../CashfreePayouts/constants").KEYS;
const { table } = require("console");
const axios = require('axios'); 
 
const sendMail = require('../mails/sendMail')
 

// Instantiate Cashfree Payouts



/**
 * Desc : User exist or not by phone no  
 * Req  :{ user_id}
 * Function : loggedInUser
 */
const checkUser = async (req) => {
    let status;
    let data = {}; 
    const { phone,type ,user_id} = req 
    if(type !== "userID"){
        if (!phone) return sendResponse(status = 404, "Invalid details d.", data) 
        var regx = /^[6-9]\d{9}$/;
        if (!regx.test(phone)) return sendResponse(status = 404, "Invalid phone details.", data)
        //check user
        let sql = `SELECT * FROM users WHERE phone=? limit ?`;
        let check = await db.query(sql, [phone, 1]); 
        if (check.length > 0) {
            data = {
                status      : 200,
                user_id     : check[0].user_id,
                device_id   : check[0].device_id,
                username    : check[0].username,
                email       : check[0].email,
                phone       : check[0].phone,
                otp         : check[0].otp,
                verify_time : check[0].verify_time,
                is_block    : check[0].is_block,
                is_logged_in: check[0].is_logged_in,
                 
                is_user_update: check[0].is_user_update,
                wallet_amount: ((check[0].wallet_amount && check[0].wallet_amount>0)?parseFloat((check[0].wallet_amount).toFixed(2)):0), 
                bonus_amount: ((check[0].bonus_amount && check[0].bonus_amount>0)?parseFloat((check[0].bonus_amount).toFixed(2)):0),
                winnig_amount:((check[0].wining_amount && check[0].wining_amount>0)?parseFloat(check[0].wining_amount):0),
                is_user_update: check[0].is_user_update,
                balance:((check[0].wallet_amount && check[0].wallet_amount>0)?parseFloat(check[0].wallet_amount):0)+((check[0].wining_amount && check[0].wining_amount>0)?parseFloat(check[0].wining_amount):0)+((check[0].bonus_amount && check[0].bonus_amount>0)?parseFloat(check[0].bonus_amount):0)
            } 
        } else {
            data = {
                status      : 403
            }
        }
    }else{
        let sql     = `SELECT * FROM users WHERE user_id=? limit ?`;
        let check   = await db.query(sql, [user_id, 1]); 
        if (check.length > 0) {
            data = {
                status      : 200,
                user_id     : check[0].user_id,
                device_id   : check[0].device_id,
                username    : check[0].username,
                email       : check[0].email,
                phone       : check[0].phone,
                avatar      : check[0].avatar,
                otp         : check[0].otp,
                verify_time : check[0].verify_time,
                is_block    : check[0].is_block,
                is_logged_in: check[0].is_logged_in, 
                wallet_amount: ((check[0].wallet_amount && check[0].wallet_amount>0)?parseFloat((check[0].wallet_amount).toFixed(2)):0), 
                bonus_amount: ((check[0].bonus_amount && check[0].bonus_amount>0)?parseFloat((check[0].bonus_amount).toFixed(2)):0),
                winnig_amount:((check[0].wining_amount && check[0].wining_amount>0)?parseFloat(check[0].wining_amount):0),
                is_user_update: check[0].is_user_update,
                balance:((check[0].wallet_amount && check[0].wallet_amount>0)?parseFloat(check[0].wallet_amount):0)+((check[0].wining_amount && check[0].wining_amount>0)?parseFloat(check[0].wining_amount):0)+((check[0].bonus_amount && check[0].bonus_amount>0)?parseFloat(check[0].bonus_amount):0)
            } 
        } else {
            data = {
                status      : 403
            }
        }
    } 
    
     
    return data
    // return sendResponse(status = 200, message, data)
}
 
/**
 * Desc : check User logged In or not  
 * Req  :{ user_id}
 * Function : loggedInUser
 */
const loggedInUser = async (req) => { 
    let data; 
    const { device_id } = req 
    const user = await checkUser(req)  
    if(user.status === 200){ 
        if((user.device_id).trim() == device_id.trim()){
            if((user.is_block === 0)){
                if(user.is_logged_in ===1){
                    data  = { 
                        status         : 200, 
                        is_logged_in   : true,
                        is_registred   : true,
                        is_blocked     : false
                    }
                }else{
                    data  = { 
                        status         : 200, 
                        is_logged_in   : false,
                        is_registred   : true,
                        is_blocked     : false
                    }
                }
                
            }else{
                data  = { 
                    status         : 200, 
                    is_logged_in   : false,
                    is_registred   : true,
                    is_blocked     : true
                }
            }   
        }else{
            data  = { 
                status         : 200, 
                is_logged_in   : false,
                is_registred   : true
            }
        }
    }else{  
        data  = { 
            status         :200, 
            is_logged_in   : false,
            is_registred   : false
        }
    }
    return data;
}

/**
 * Desc : Get user profile details  
 * Req  :{ user_id}
 * Function : userProfile
 */
const userProfile = async (req) => {
    let message;
    let status = 404;
    let data   = {};
    try {
        const user_id = req.user_id;

        if (!user_id) return sendResponse(status, "Invalid details.", data)
        const request ={
            user_id:user_id,
            type:"userID"
        }
        const user = await checkUser(request) 
        if(user.status === 200)
        {
            /**Check BankDetais */
            let sql = `SELECT CONCAT(LEFT(account_number, 4), 'XXXXXXXX', RIGHT(account_number, 4)) as acc,bank_name,is_verified ,upi_id
            FROM bank_details WHERE user_id = ? limit ?`;
            let checkBankDetail = await db.query(sql, [user_id, 1]);  
      
            /**Check kyc details */
            let sql1 = `SELECT * from kyc_details WHERE user_id = ? AND is_type="VoterID" limit 1`;
            let sql2 = `SELECT * from kyc_details WHERE user_id = ? AND is_type="ADHAR" limit 1`;
            let sql3 = `SELECT * from kyc_details WHERE user_id = ? AND is_type="PAN" limit 1`;
            // let voterCheck  = await db.query(sql1, [user_id]);   
            let dlCheck     = await db.query(sql2, [user_id]); 
            let panCheck    = await db.query(sql3, [user_id]); 

            status = 200;
            message = 'My Profile';  
            data = {
                username    : user.username?user.username:`Guest1001${user_id}`,
                phone       : user.phone,
                email       : user.email,
                avatarLink  : user.avatar?`${hostname}/${user.avatar}`:null,
                is_username_update :user.is_user_update ==1?true:false,
                balance     : ( user.balance>0 ?parseFloat((user.balance).toFixed(2)):0), 
                added_amount: user.wallet_amount, 
                bonus_amount: user.bonus_amount,
                winnig_amount:user.winnig_amount,
                is_verified_bank_details :(checkBankDetail.length>0 && checkBankDetail[0].is_verified==1)?true:false,
                is_verified_upi_id       :false,
                is_submitted_upi_id      :(checkBankDetail.length>0 && checkBankDetail[0].upi_id!=null)?true:false,
                is_submitted_bank_details:checkBankDetail.length>0?true:false,
                kyc:{
                    is_pan_submitted    :   panCheck.length>0?true:false, 
                    is_adhar_submitted  :   dlCheck.length>0?true:false,
                    is_pan_verified     :   (panCheck.length>0 && panCheck[0].is_status==1)?true:false, 
                    is_adhar_verified   :   (dlCheck.length>0 && dlCheck[0].is_status==1)?true:false
                }
            }
            if(checkBankDetail.length>0){
                if(checkBankDetail[0].acc !==null){ 
                    is_bank = true  
                    data.account_number = checkBankDetail[0].acc;
                    data.bank_name   = checkBankDetail[0].bank_name?checkBankDetail[0].bank_name:'A/C';
                }
                if(checkBankDetail[0].upi_id !==null){ 
                    data.upi_id  = checkBankDetail[0].upi_id;
                }
            } 
        }else{
            message = "Invalid details"
            status = 404
        } 
         
     return sendResponse(status, message, data);
         
    } catch (err) {
       return sendResponse(500, 'database error', data);
    }
}

/**
 * Desc : Register on tournaments entry fee  
 * Req  :{ user_id,device_id,game_play_id,category_type_id}
 * Function : userLogin
 */
  
const userLogin = async (req) => {
    let message;
    let status = 404;
    let data = {};
    try { 
        //check user
        const user = await checkUser(req)   
        const {phone,username, device_id} = req  
        if (user.status === 200) 
        {
            if((user.device_id).trim() == device_id.trim())
            { 
                const sql = "UPDATE users Set ?  WHERE user_id= ?"
                await db.query(sql, [{ username: username, otp: null, is_verified: 1,is_logged_in:1 }, user.user_id]);
                status  = 200;
                message = 'Login Successfully';
                data = {
                    user_id : user.user_id,
                    username: user.username,
                    phone   : user.phone,
                    device_id
                }
                   
            }else{
                const sql = "UPDATE users Set ?  WHERE user_id= ?"
                await db.query(sql, [{ username: username, is_verified: 1,is_logged_in:1 }, user.user_id]);
                status  = 200;
                message = 'Login Successfully';
                data = {
                    user_id : user.user_id,
                    username: user.username,
                    phone   : user.phone,
                    device_id
                } 
            }
            
        } else {
            const sql2 = "INSERT INTO users Set ?"
            let formData = { 
                username: username,
                is_verified: 1,
                is_logged_in:1,
                device_id:device_id,
                phone:phone
             }
           const u=  await db.query(sql2,formData);
           if(u){
            status  = 200;
            message = 'Login Successfully';
            data = {
                user_id : user.user_id,
                username: user.username,
                phone   : user.phone,
                device_id
            } 
           }else{
            status  = 500;
            message = 'Data base error';
           }
            
        }
        return sendResponse(status, message, data); 
    } catch (err) {
        // debug(err);
    }
}



/**
 * Desc : Send otp  
 * Req  : { phone, email_id,device_id }
 * Function : userLogin
 */
const sendOtp = async (req) => {
    let message;
    let status = 404;
    let data = {};
    try { 
        console.log('1 sendOtp',req)
        var otp                 = Math.floor(1000 + Math.random() * 9000);
        let date_ob             = new Date();
        const verifyotp_time    = date_ob.getTime()
        const { phone,device_id,user_id} = req; 
        let formData;
        let users  ;
        const welcomeMessage = `Welcome to Ludo Platinum! Your verification code is #${otp}#`;
        if(user_id){ 
            let sql = `SELECT * FROM users WHERE LOWER(phone)= ? limit ?`;
            let users = await db.query(sql, [phone, 1]);
            if(users.length>0){
                message     = "Already verified other device"
                status      = 404 
            }else{
                formData = { 
                    phone,
                    otp,
                    device_id:device_id,
                    verify_time: verifyotp_time
                }
                sql         = "UPDATE users Set ?  WHERE user_id= ?"
                users       = await db.query(sql, [formData, user_id]);
                status      = 200
                message     = 'Otp have sent' 
                console.log('2',welcomeMessage)
                await sendSms(phone, welcomeMessage);
                console.log('1',welcomeMessage)
            }
            
        }else{ 
            if (!phone) return sendResponse(status = 404, "Invalid details.", data)
            var regx = /^[6-9]\d{9}$/;
            if (!regx.test(phone)) return sendResponse(status = 404, "Invalid Phone details.", data) 
  
            sql         = `SELECT * FROM users WHERE LOWER(phone)= ? limit ?`;
            users       = await db.query(sql, [phone, 1]);
            if(users.length>0){
                formData = {
                    phone:phone,
                    otp,
                    device_id:device_id,
                    verify_time: verifyotp_time
                }
                sql         = "UPDATE users Set ?  WHERE user_id= ?"
                users       = await db.query(sql, [formData, users[0].user_id]);
                await sendSms(phone, welcomeMessage);
                status      = 200
                message     = 'Otp have sent'
            }else{ 
                formData = {
                    phone:phone,
                    otp,
                    device_id:device_id,
                    verify_time: verifyotp_time
                }
                sql     = `INSERT INTO users set ?`;
                users   = await db.query(sql, formData) 
                console.log('7',welcomeMessage)
                if(users){
                    await sendSms(phone, welcomeMessage);
                    status      = 200
                    message     = 'Otp have sent' 
                }else{
                    status      = 404
                    message     = 'Something went wrong!' 
                }
               
            } 
        } 

        return sendResponse(status, message, data);

    } catch (err) {
        return sendResponse(500, 'Database error', data);
    }
}
/**
 * 
 * @param {*} req 
 * @returns 
 * Verify otp 
 * 
 */
const otpVerify = async (req) => {
    let message;
    let status      = 404;
    let statusCode  = 404;
    let data = {};
    try {  
        let sql = ""
        let responseData;
        //check user
        let date_ob             = new Date();
        let verifyotp_tiime     = date_ob.getTime()
        let expiredTime         = ""
        const {phone,device_id,otp,user_id} = req 
        const updateData={
            otp:null, 
        }
        if(user_id){
            sql             = "SELECT * FROM users  WHERE user_id =? LIMIT 1"
            responseData    =  await db.query(sql, [user_id]);
            if(responseData.length>0){
                sql             = "SELECT * FROM users  WHERE user_id =? LIMIT 1"
                responseData    =  await db.query(sql, [user_id]); 
                expiredTime     =   (responseData[0].verify_time + 10 * 60000);
              
                if (verifyotp_tiime<= expiredTime) {
                    if(responseData[0].otp == otp){
                        statusCode      = 200
                        message         = "Success"   
                        sql             = "UPDATE users Set ? WHERE user_id= ?"
                        responseData    = await db.query(sql, [updateData,user_id]);  
                        if (responseData) {
                            statusCode  = 200
                            message     = 'Otp verify'
                            data = {
                                user_id:user_id
                            }
                        } else {
                            statusCode  = 404
                            message     = 'Unable to verify'
                            error       = "Database error"
                        }
                    }else{
                        statusCode  = 404
                        message     = 'Invalid otp'
                    }
                }else{
                    statusCode  = 404
                    message     = 'Time expired' 
                }

            }else{
                statusCode  = 404
                message     = 'Something went wrong' 
            }
        }else{ 
            if (!phone) return sendResponse(status = 404, "Invalid details.", data)
            var regx = /^[6-9]\d{9}$/;
            if (!regx.test(phone)) return sendResponse(status = 404, "Invalid Phone details.", data) 
            sql          =   "SELECT * FROM users  WHERE phone =? AND device_id =? LIMIT 1"
            responseData =   await db.query(sql, [phone,device_id]);
            if(responseData.length>0)
            {
                expiredTime     =   (responseData[0].verify_time + 10 * 60000);
                if (verifyotp_tiime<= expiredTime)
                {
                    if(responseData[0].otp == otp){
                        statusCode      = 200
                        message         = "Success"  
                        sql             = "UPDATE users Set ? WHERE user_id= ?"
                        const userID =responseData[0].user_id;
                        responseData    = await db.query(sql, [updateData,userID]);  
                        if (responseData) {
                            statusCode  = 200
                            message     = 'Otp verify'
                            data = {
                                user_id:userID
                            }
                        } else {
                            statusCode  = 404
                            message     = 'Unable to verify'
                            error       = "Database error"
                        }
                    }else{
                        statusCode  = 404
                        message     = 'Invalid otp'
                    }
                }else{
                    statusCode  = 404
                    message     = 'Time expired' 
                }
            }else{
                statusCode  = 404
                message     = 'Something went wrong' 
            } 
        } 
        
        return sendResponse(statusCode, message, data);  
    } catch (err) {
        return sendResponse(status = 500, "Database error.", data) 
    }
}
/**
 * Desc : Update bank details  
 * Req  : { user_id, and bank details }
 * Function : bankDetailsUpdate
 */
 const bankDetailsUpdate = async (req) => {

    let message="";
    let status = 404;
    let data   = {};
 
    try {
        const { user_id,confirm_account_number,ifsc_code,account_number ,account_holder_name } = req; 
         
       // let account_holder_name = "Rajenra" 
        if (!user_id) return sendResponse(status = 404, "Invalid details.", data)
        if(!account_number) return sendResponse(status = 404, "Account number should not be empty.", data)
        var expression=/[0-9]{6}/;  
        if(!(expression.test(account_number))) return sendResponse(status = 200, "Please enter valid account number.", data) 
        if(!ifsc_code) return sendResponse(status = 404, "IFSC Code name should not be empty.", data)
        if(!account_holder_name) return sendResponse(status = 404, "Account holder name is required.", data)
        if(account_number !== confirm_account_number) return sendResponse(status = 404, "Confirm account number does not match", data)

        //check user 
       let sql  = `SELECT * FROM users WHERE user_id= ? limit ?`; 
       let usersResponse = await db.query(sql, [user_id, 1]);  
        if ((usersResponse.length>0)) 
        {     
            let phoneNumber     = usersResponse[0].phone;
            let emailId         = usersResponse[0].email;  
            if(usersResponse[0].email)
            { 
                if((usersResponse[0].phone) && (usersResponse[0].phone !=null))
                { 
                    sql  = `SELECT * FROM bank_details WHERE user_id= ? limit ?`;
                    usersResponse = await db.query(sql, [user_id, 1]);
                    if (!(usersResponse.length>0)) 
                    {
                        let reqResponse = await generateToken() 
                        if(reqResponse.status==200)
                        {
                          
                            let authTokens = reqResponse.token
                            let ifscCode = ifsc_code.toUpperCase(); 
                            // let config = {
                            //     method: 'GET', 
                            //     url: `${commanEnv.TEST}/payout/v1/validation/bankDetails?name=${account_holder_name}&phone=${phoneNumber}&bankAccount=${account_number}&ifsc=${ifscCode}`,
                            //     headers: { 
                            //         'Authorization': `Bearer ${authTokens}`, 
                            //         'Content-Type': 'application/x-www-form-urlencoded'
                            //     },
                            //     // data : jsondata
                            // }; 
                            // //Validate A/C number
                            // axios(config).then(async function (response) { 
                            //     console.log(response.data.message,'data1')  
                            //     if(response.data.status =="SUCCESS"){   
                                    if(ifsc.validate(ifscCode))
                                    {     
                                        const ifscd = await ifsc.fetchDetails(ifscCode) 
                                        if(ifscd){ 
                                           
                                            let userName    = account_holder_name.replace(/\s/g, '')
                                            let userId      = userName.substring(0, 6);//get first  chars
                                            let str         = `${userId}${phoneNumber}`
                                            let beneId      = str.toUpperCase()
                                            const formData ={ 
                                                user_id, 
                                                benefieciary_id :beneId,
                                                ifsc_code       :ifscCode,
                                                account_number  :account_number,
                                                account_holder_name:account_holder_name,
                                                branch   :ifscd.BRANCH,
                                                city     :ifscd.CITY,
                                                state    :ifscd.STATE,
                                                bank_name:ifscd.BANK,
                                                is_verified:1,
                                                benefieciary_status:1
                                            } 
                                            //CReaTE Benificiery ID
                                            var jsondata = `{\n  "beneId": "${beneId}",\n  
                                                            "name": "${account_holder_name}",\n  
                                                            "email":  "${emailId}",\n  
                                                            "phone":  "${phoneNumber}",\n  
                                                            "bankAccount": "${account_number}",\n  
                                                            "ifsc":  "${ifscCode}",\n  
                                                            "address1":  "${ifscd.DISTRICT}" ,\n  
                                                            "state": "${ifscd.STATE}" \n }` 
                                            config = {
                                                method: 'POST', 
                                                url: `${commanEnv.TEST}/payout/v1/addBeneficiary`,
                                                headers: { 
                                                    'Authorization': `Bearer ${authTokens}`, 
                                                    'Content-Type': 'application/x-www-form-urlencoded'
                                                },
                                                data : jsondata
                                            }; 
                                            // await axios(config)
                                            await axios(config).then(async function (response) {  
                                                if(response.data.status =="SUCCESS"){  
                                                    sql = `INSERT INTO bank_details set ?`;
                                                    await db.query(sql,formData);
                                                    status  = 200
                                                    message     = "Account number added successfully"
                                                }else{
                                                    console.log(response.data,'response.data.status')
                                                    status  = 404
                                                    message     = response.data.message
                                                } 
                                              return sendResponse(status, message, data);
                                            }).catch(function (error) {
                                                 
                                                status  = 500
                                                message     = "Something went wrong!"
                                                return sendResponse(status, message, data);
                                            });  
                                        }else{
                                            status  = 404
                                            message = 'Invalid Bank details'
                                        } 
                                    }else{
                                        status  = 404
                                        message = 'Invalid IFSC Code'
                                    } 
                            //     } else{
                            //         status    = 404
                            //         message     = response.data.message
                            //     }
                            //     // return sendResponse(status, message, data);
                            // }).catch(function (error) { 
                            //      status  = 500
                            //         message     = "Server issue!"
                            // });
                        }else{ 
                            status  = 403
                            message     = "IP not whitelisted" 
                        }
                        
                    }else{ 
                        status  = 404
                        message     = 'Already'
                    } 
                }else{
                    status  = 404
                    message = 'Profile not complete!'
                }
            }else{
                status  = 404
                message = 'Profile not complete!'
            } 
        }else{
            status = 400
            message= 'Something went wrong!'
        }
        console.log(message,status,'message')
        return sendResponse(status, message, data);

    } catch (err) {
       return sendResponse(500, 'Database error', data);
    }
}
const updateUpiID = async (req) => {
    let message;
    let status = 404;
    let data   = {};
     
    try {
        const { user_id,upi_id} = req; 
        if (!user_id) return sendResponse(status = 404, "Invalid details.", data)
        if(!upi_id) return sendResponse(status = 404, "Please enter your UPI.", data)
        var result = /^[\w.-]+@[\w.-]+$/.test(upi_id)
        if(!result) return sendResponse(status = 404, "Invalid UPI ID.", data) 
        var match = /[a-zA-Z0-9_]{3,}@[a-zA-Z]{3,}/; 
        if(!(match.test(upi_id)))return sendResponse(status = 404, "Invalid UPI ID.", data) 

        //check user
        let request = {
            user_id:user_id,
            type:'userID'
        }
        
        const user = await checkUser(request) 
        if (user.status === 200) 
        {  
            const formData ={ 
                user_id,
                upi_id
            }
            let sql  = `SELECT * FROM bank_details WHERE user_id= ? limit ?`;
            let user = await db.query(sql, [user_id, 1]); 
            if (user.length > 0) {
                sql   = "UPDATE bank_details Set ?  WHERE user_id= ?"
                user  = await db.query(sql, [formData,user_id]);
                status  = 200
                message = 'Success! UPI ID upated'
            } else { 
                sql = `INSERT INTO bank_details set ?`;
               let user1 = await db.query(sql, formData)
                
                status  = 200
                message = 'Success! UPI ID upated'
                 
            }
           
            return sendResponse(status, message, data);
        }else{
            status = 400
            message= 'Something went wrong!'
        }
        
        return sendResponse(status, message, data);

    } catch (err) {
        // debug(err);
    }
}
 
const myAccountDetails = async (req) => {
    let message;
    let status = 404;
    let data   = {};
    try {
        const { user_id } = req;   
        //check user
        let request = {
            user_id:user_id,
            type:'userID'
        }
        
        const user = await checkUser(request) 
        if (user.status === 200) 
        {   
            let sql  = `SELECT * FROM bank_details WHERE user_id= ? limit ?`;
            let user = await db.query(sql, [user_id, 1]); 
            if (user.length > 0) { 
                const userAcco = (JSON.parse(JSON.stringify(user))[0]);  
                status  = 200
                message = 'Success'
                data =userAcco
            } else {  
                status  = 404
                message = 'Success'
            } 
        }else{
            status = 400
            message= 'Something went wrong!'
        }
        
        return sendResponse(status, message, data);

    } catch (err) {
        // debug(err);
    }
}
/**
 * Desc : Update profiles
 * Req  : { user_id }
 * Function : profileUpdate
 */
 const profileUpdate = async (req) => {
    let message;
    let status  = 404;
    let data    = {};
    try {
        const { user_id, email_id,username,dob,device_id} = req; 
        if (!user_id) return sendResponse(status, "Invalid details.", data) 
        //Check user ID is correct or not
        req.type= 'userID' 
        const user = await checkUser(req)
        if (user.status === 200) 
        { 
            const dt = moment().format(dob,'YYYY-MM-DD');
            const formData = {
                email:email_id,
                username,
                dob:dt,
                device_id
            }  
            
           let sql = "UPDATE users Set ? WHERE user_id= ?"
          const result = await db.query(sql, [formData, user_id]); 
           if(result){
                status = 200
                message= 'Profile updated'
            }else{
                status = 500
                message= 'Something went wrong!'
            }
            
        }else{
            status = 500
            message= 'Database error!'
        }
        console.log(status)
       
        return sendResponse(status,message,data);

    } catch (err) {
        // debug(err);
    }
}
//force login with mobile no or email and device_id
const userForceLogin = async (req) => {
    let message;
    let status = 404;
    let data = {};
    try { 
        //check user
        const {phone,email, device_id,username,code} = req 
        let sql = " "
        let responseData = ""
        let formData; 
        if(email)
        { 
            if(!email) return sendResponse(status = 404, "Invalid details.", data)
        
            if(!(emailvalidator.validate(email))){
                return sendResponse(status = 404, "Invalid email address .", data)
            } 

            sql          = "SELECT * FROM users  WHERE LOWER(email) = ? LIMIT 1"
            responseData =  await db.query(sql, [email.toLowerCase()]);  

            switch (responseData.length) {
                case 0:
                    sql = "INSERT INTO users Set ?"
                     formData = { 
                        email        : email,
                        username     : username,
                        is_verified  : 1,
                        is_logged_in : 1,
                        device_id    : device_id
                     }
                    responseData = await db.query(sql,formData); 
                    if(responseData)
                    { 
                        let UserId = responseData.insertId
                        sql = "SELECT user_id FROM user_coupon_codes  WHERE user_id = ? AND device_id = ? LIMIT 1"
                        responseData = await db.query(sql,[UserId,device_id]); 

                        if(!(responseData.length>0))
                        {
                            formData = { 
                                device_id    : device_id, 
                                applied_on   : moment().utcOffset(330).format("YYYY-MM-DD"),
                                refferal_code: moment().utcOffset(330).format('DDmmss'),
                                user_id      : UserId
                             }
                            sql = "INSERT INTO user_coupon_codes Set ?"
                            responseData = await db.query(sql,formData); 
                        }
                        status = 200
                        message = 'Login success'
                        data = {
                            is_logged_in : true,
                            device_id    : device_id,
                            user_id      : UserId
                        } 
                        await createBonusReports(UserId)
                        if(code){
                            sql = "SELECT * FROM user_coupon_codes WHERE refferal_code = ? LIMIT 1"
                            responseData = await db.query(sql,[code]);  
                            if(responseData.length>0)
                            {  
                                formData = { 
                                    amount       : responseData[0].refer_amount, 
                                    refer_by     : responseData[0].user_id,
                                    refferal_code: code,
                                    user_id      : UserId
                                } 
                                await referralBonus(formData)
                                status = 200
                            }
                        }
                       
                    }
                    break;
                case 1:
                    if(responseData[0].is_block ==1 ){
                        status = 404
                        message = 'Account Blocked' 
                        data = {
                            is_logged_in : true,
                            device_id    : responseData[0].device_id,
                            user_id      : responseData[0].user_id
                        } 
                    }else{
                    status = 200
                    message = 'Login success'
                    data = {
                        is_logged_in : true,
                        device_id    : responseData[0].device_id,
                        user_id      : responseData[0].user_id
                    } 
                    if(responseData[0].is_wallet ===0)
                    {
                        await createBonusReports(responseData[0].user_id)
                    }
                    let DID = responseData[0].device_id
                    let UID = responseData[0].user_id
                    sql = "SELECT user_id FROM user_coupon_codes  WHERE user_id = ? AND device_id = ? LIMIT 1"
                    responseData = await db.query(sql,[UID,DID]);  
                    if(!(responseData.length>0))
                    {
                        formData = { 
                            device_id    : DID, 
                            applied_on   : moment().utcOffset(330).format("YYYY-MM-DD"),
                            refferal_code: moment().utcOffset(330).format('DDmmss'),
                            user_id      : UID
                            }
                        sql = "INSERT INTO user_coupon_codes Set ?"
                        responseData = await db.query(sql,formData); 
                    }
                    
                }
                break; 
                default:
                    status = 404
                    message = 'Something went wrong!'
                    break;
            } 
            return sendResponse(status, message, data); 
        }
        else if(phone)
        {
            if(!phone) return sendResponse(status = 404, "Invalid details.", data) 
            sql           = "SELECT * FROM users  WHERE phone = ? LIMIT 1"
            responseData  =  await db.query(sql, [phone]);
            switch (responseData.length)
             {
                case 0: 
                    sql = "INSERT INTO users Set ?"
                     formData = { 
                        phone        : phone,
                        username     : 'Guest',
                        is_verified  : 1,
                        is_logged_in : 1,
                        device_id    : device_id
                     }
                    responseData = await db.query(sql,formData); 
                    if(responseData)
                    { 
                        status = 200
                        let UserId = responseData.insertId
                        await createBonusReports(UserId)
                        message = 'Login success'
                        sql = "SELECT user_id FROM user_coupon_codes  WHERE user_id = ? AND device_id = ? LIMIT 1"
                        responseData = await db.query(sql,[UserId,device_id]); 

                        if(!(responseData.length>0))
                        {
                            formData = { 
                                device_id    : device_id, 
                                applied_on   : moment().utcOffset(330).format("YYYY-MM-DD"),
                                refferal_code: moment().utcOffset(330).format('DDmmss'),
                                user_id      : UserId
                             }
                            sql = "INSERT INTO user_coupon_codes Set ?"
                            responseData = await db.query(sql,formData); 
                        }
                        data = {
                            is_logged_in : true,
                            device_id    : device_id,
                            user_id      : UserId
                        } 
                        
                        if(code){
                            sql = "SELECT * FROM user_coupon_codes WHERE refferal_code = ? LIMIT 1"
                            responseData = await db.query(sql,[code]);  
                            if(responseData.length>0)
                            {  
                                formData = { 
                                    amount       : responseData[0].refer_amount, 
                                    refer_by     : responseData[0].user_id,
                                    refferal_code: code,
                                    user_id      : UserId
                                } 
                                await referralBonus(formData)
                                status = 200
                            }
                        }
                    }
                    break;
                case 1: 
                    if(responseData[0].is_block ==1 )
                    {
                        status = 404
                        message = 'Account Blocked' 
                        data = {
                            is_logged_in : true,
                            device_id    : responseData[0].device_id,
                            user_id      : responseData[0].user_id
                        } 
                    }else{
                        status = 200 
                        if(responseData[0].is_wallet ==0)
                        {   
                            await createBonusReports(responseData[0].user_id)
                        }
                        data = {
                            is_logged_in : true,
                            device_id    : responseData[0].device_id,
                            user_id      : responseData[0].user_id
                        } 
                        let DID = responseData[0].device_id
                        let UID = responseData[0].user_id
                        sql = "SELECT user_id FROM user_coupon_codes  WHERE user_id = ? AND device_id = ? LIMIT 1"
                        responseData = await db.query(sql,[UID,DID]);  
                        if(!(responseData.length>0))
                        {
                            formData = { 
                                device_id    : DID, 
                                applied_on   : moment().utcOffset(330).format("YYYY-MM-DD"),
                                refferal_code: moment().utcOffset(330).format('DDmmss'),
                                user_id      : UID
                            }
                            sql = "INSERT INTO user_coupon_codes Set ?"
                            responseData = await db.query(sql,formData); 
                        }
                        if(code){
                            sql = "SELECT * FROM user_coupon_codes WHERE refferal_code = ? LIMIT 1"
                            responseData = await db.query(sql,[code]);  
                            if(responseData.length>0)
                            {  
                                formData = { 
                                    amount       : responseData[0].refer_amount, 
                                    refer_by     : responseData[0].user_id,
                                    refferal_code: code,
                                    user_id      : UID
                                } 
                                await referralBonus(formData)
                                status = 200
                            }
                        } 
                    } 
                    break; 
                default:
                    status = 404
                    message = 'Something went wrong!'
                    break;
            }
            return sendResponse(status,message, data) 
        }
        return sendResponse(status = 404, "Invalid details.", data)
        
    } catch (err) {
        return sendResponse(status = 500, "Database error.", data) 
    }
}


const userEmailVerify = async (req) => {
    let message;
    let status  = 404;
    let data    = {};
    let sql = "";
    let responseData;
    try {
        const { user_id, username,email,device_id} = req; 
        if (!user_id) return sendResponse(status, "Invalid details.", data) 
        if (!device_id) return sendResponse(status, "Invalid device details.", data) 
        //Check user ID is correct or not
        sql          = `SELECT * FROM users WHERE user_id= ? AND device_id =? limit 1`;
        responseData = await db.query(sql, [user_id, device_id]);  
        if (responseData.length>0) 
        {  
            if(!(emailvalidator.validate(email)))
            {
                return sendResponse(status = 404, "Invalid email address .", data)
            } 
            const formData = {
                email       : email,
                username    : username 
            }  
            sql  = `SELECT * FROM users WHERE email= ? limit 1`;
            responseData =  await db.query(sql, [email.toLowerCase()]);  
            if(responseData.length>0){
                status = 404
                message= 'Already verified'
                data ={
                    user_id:responseData[0].user_id
                }
            }else{
                sql = "UPDATE users Set ? WHERE user_id= ?"
                responseData = await db.query(sql, [formData, user_id]); 
                if(responseData)
                {
                    status = 200
                    message= 'Email verified'
                }else{
                    status = 500
                    message= 'Something went wrong!'
                }  
            }  
        }else{
            status = 404
            message= 'User not found'
        }  
        return sendResponse(status,message,data);

    } catch (err) {
        // debug(err);
    }
}

const userPhoneVerify = async (req) => {
    let message;
    let status  = 404;
    let data    = {};
    try {
        let sql ="";
        let result = ""
        let responseData = ""
        const { user_id, phone,device_id,email} = req; 
        const formData = {
            device_id   : device_id,
            phone       : phone 
        }  
        if(user_id){ 
            sql  = `SELECT * FROM users WHERE phone= ? limit 1`;
            responseData =  await db.query(sql, [phone]);  
            if(responseData.length>0){ 
                status = 200
                message= 'Already Verified'
                data ={
                    user_id:responseData[0].user_id
                }
            }else{ 
                sql = "UPDATE users Set ? WHERE user_id= ?"
                result = await db.query(sql, [formData, user_id]); 
                if(result){
                    status = 200
                    message= 'Phone Verified'
                    data ={
                        user_id:user_id
                    }
                }else{
                    status = 500
                    message= 'Something went wrong!'
                }   
            }  
        }else{
            sql  = `SELECT * FROM users WHERE phone= ? limit 1`;
            responseData =  await db.query(sql, [phone]);  
            if(responseData.length>0){  
                status = 200
                message= 'Already verified'
                data ={
                    user_id:responseData[0].user_id
                }
            }else{ 
                sql          = "INSERT INTO users Set ?" 
                responseData = await db.query(sql,formData); 
                if(responseData)
                {
                    status = 200
                    message= 'Successfully login'
                    data ={
                        user_id:responseData[0].user_id
                    }
                }else{
                    status = 500
                    message= 'Something went wrong!'
                }  
            }
             
        } 
        return sendResponse(status,message,data); 
    } catch (err) {
        // debug(err);
    }
}

const UpdateUsername = async (req) => {
    let message;
    let status  = 404;
    let data    = {};
    try {
        const { user_id,username} = req; 
        if (!user_id) return sendResponse(status, "Invalid user details.", data) 
        //Check user ID is correct or not
        req.type= 'userID' 
        const user = await checkUser(req)
        if (user.status === 200) 
        {  
            const formData = { 
                username,
                is_user_update:1 
            }  
           let sql = "UPDATE users Set ? WHERE user_id= ?"
          const result = await db.query(sql, [formData, user_id]); 
       
           if(result){
                status = 200
                message= 'Username updated'
            }else{
                status = 500
                message= 'Something went wrong!'
            }
            
        }else{
            status = 500
            message= 'Database error!'
        }  
        return sendResponse(status,message,data);

    } catch (err) {
        return sendResponse(500,'Database error',data);
    }
}
module.exports = { userProfile, 
    bankDetailsUpdate,
    userLogin,
    sendOtp,
    profileUpdate,
    loggedInUser,
    checkUser,
    myAccountDetails,
    updateUpiID,
    // upiID,
    userForceLogin,
    userPhoneVerify,
    userEmailVerify,
    otpVerify,
    UpdateUsername
    }