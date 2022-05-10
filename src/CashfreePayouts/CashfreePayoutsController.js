const conn  = require("../../config/db");
const path  = require("path")
const moment= require("moment");
const cfSdk = require('cashfree-sdk');
const axios = require('axios'); 
const commanEnv = require("./constants").ENVS;
const commanUrl = require("./constants").URLS;
const {generateToken}    = require('./AuthToken')
const ifsc = require('ifsc');
const sendMail = require('../mails/sendMail')
 
let responseData;
let responseJson;
let updateResponse;
let sql;
let message;
let data;
let statusCode = 404
  
const acceptPayouts= async(req,res)=> {

    // try {
console.log('request data',req.body)
    let transferId =moment().utcOffset(330).format('YYYYMMDDHHmmss')
     let {user_id,bank_detail_id,txn_id} = req.body
     sql = `SELECT * FROM bank_details INNER JOIN users ON users.user_id=bank_details.user_id WHERE bank_details.bank_detail_id=? AND bank_details.user_id = ? limit ?`;
     responseData = await conn.query(sql, [bank_detail_id,user_id, 1]);  
     if(responseData.length>0)
     {
        if(responseData[0].benefieciary_status ==1)
        {
            let benefieciaryId = responseData[0].benefieciary_id
            sql = `SELECT * FROM transactions WHERE transaction_id = ? limit ?`;
            responseData = await conn.query(sql, [txn_id, 1]); 
            if(responseData.length>0)
            { 
                let Amount      = Math.abs(responseData[0].txn_amount) 
                let TxnId       =  responseData[0].txn_id 
                var dataJson    = `{\n "beneId": "${benefieciaryId}",\n  "amount": "${Amount}",\n  "transferId": "${transferId}"\n}`;

                let reqResponse =  await generateToken();   
                if(reqResponse.status==200)
                { 
                    var config = {
                        method: 'post',
                        url: `${commanEnv.TEST}/payout/v1/requestTransfer`,
                        headers: { 
                            'Authorization': `Bearer ${reqResponse.token}`
                        },
                        data : dataJson
                    };
                    axios(config).then(async function (response)
                    { 
                        if(response.data.status =="SUCCESS"){
                            let formDaTA = {
                                is_type:6
                            }
                           let sql1 = "UPDATE transactions Set ?  WHERE transaction_id = ?"
                            let  results = await conn.query(sql1, [formDaTA,txn_id]); 
                            // let  results = true; 
                            if(results)
                            {
                                await sendMail(user_id,TxnId,Amount,2);
                                statusCode  = 200
                                message     = "Accepted"
                            }else{
                                statusCode  = 404
                                message     = "Something went wrong!"
                            }  
                        }else{
                            statusCode  = 403
                            message     = "Unabled to transfered" 
                        }  
                    }).catch(function (error) {
                        statusCode  = 500
                        message     = "Something went wrong!"
                    });
                }else{
                    statusCode  = 403
                    message     = "IP not whitelisted"
                }  
            }else{
                statusCode  = 404
                message     = "Invalid transaction details"
            } 
        }else{

        }
     }else{
        statusCode  = 404
        message     = "Invalid Details!"
     }
     responseJson = {
        status:statusCode,
        message:message
    }
    res.send(responseJson)
    // } catch (error) {
    //     responseJson = {
    //         status:500,
    //         message:"Database Error!"
    //     }
    //     res.send(responseJson)
    // }
     
 
 }


const VerifyAccount= async(req,res)=> {

   try {
    let {user_id,status,trasactionId,withdrawAmmount} = req.body
    user_id = 146
    sql          = `SELECT * FROM users  WHERE user_id = ? limit ?`;
    responseData = await conn.query(sql, [user_id, 1]);   
    if(responseData.length>0)
    {
        let phoneNumber = responseData[0].phone
        let emailId       = responseData[0].email
        if(responseData[0].phone)
        {
            if(responseData[0].email)
            {
                sql          = `SELECT * FROM bank_details  WHERE user_id = ? limit ?`;
                responseData = await conn.query(sql, [user_id, 1]); 
                if(responseData.length>0){
                    var expression=/[0-9]{6}/; 
                    if(expression.test(responseData[0].account_number))
                    {
                        let IFSCCODe      = (responseData[0].ifsc_code).toUpperCase()
                        if(ifsc.validate(IFSCCODe))
                        { 
                            console.table(IFSCCODe)
                            const ifscd = await ifsc.fetchDetails(IFSCCODe)
                            console.table(ifscd) 
                            if(ifscd)
                            {
                                //CReate Benefieciary ID
                                let account_holder_name = responseData[0].account_holder_name 
                                let userName    = account_holder_name.replace(/\s/g, '')
                                let userId      = userName.substring(0, 6);//get first  chars
                                let str         = `${userId}${phoneNumber}`
                                let beneId      = str.toUpperCase()
                                const formData ={  
                                    benefieciary_id:beneId,
                                    ifsc_code     :IFSCCODe,
                                    account_number:responseData[0].account_number,
                                    account_holder_name:responseData[0].account_holder_name,
                                    branch   :ifscd.BRANCH,
                                    city     :ifscd.CITY,
                                    state    :ifscd.STATE,
                                    bank_name:ifscd.BANK,
                                    is_verified:1
                                }
                               

                                console.table(jsondata)
                               let reqResponse =  await generateToken();
                               console.log(reqResponse,'reqResponse')
                                if(reqResponse.status ==200)
                                { 
                                        var jsondata = `{\n  "beneId": "${beneId}",\n  "name": "${responseData[0].account_holder_name}",\n  "email":  "${emailId}",\n  "phone":  "${phoneNumber}",\n  "bankAccount": "${responseData[0].account_number}",\n  "ifsc":  "${IFSCCODe}",\n  "address1":  "${ifscd.ADDRESS}" ,\n  "state": "${ifscd.STATE}" \n }`
                                        const config = {
                                                method: 'POST',
                                                // url: `${commanEnv.TEST}${commanVar.BENEFICIARY_ADD}`,
                                                url: `${commanEnv.TEST}/payout/v1/addBeneficiary`,
                                                headers: { 
                                                    'Authorization': `Bearer ${reqResponse.token}`, 
                                                    'Content-Type': 'application/x-www-form-urlencoded'
                                                },
                                                data : jsondata
                                            }; 
                                            // axios(config)
                                            // .then(function (response) {
                                            // console.log((response.data));
                                            // res.send(response.data)
                                            // })
                                            // .catch(function (error) {
                                            //     console.log(error);
                                            // });
                                            const responseData =  await axios(config);
                                        console.log(responseData,'veriAdd',config)
                                        data        = jsondata
                                        statusCode  = 200
                                        message     = "Validated"

                                }else{
                                    statusCode  = 403
                                    message     = "IP not whitelisted"
                                }     
                            }else{
                                statusCode = 500
                                message = "Validation error"
                            }
                            
                        }else{
                            statusCode = 401
                            message = "Invalid IFSC code!"
                        }
                    }else{
                        statusCode = 401
                        message = "Invalid A/C number!"
                    }
                }else{  
                    statusCode  = 404
                    message     = "Players Bank details not completed"
                } 
            }else{
                statusCode  = 404
                message     = "Players Email Id does not exist!"
            }
        }else{
            statusCode  = 404
            message     = "Players Phone number does not exist!"
        }
    }else{
        statusCode  = 404
        message     = "User not Exist!"
    }
    responseJson = {
        status:statusCode,
        message,
        data
    }
    res.send(responseJson)
   } catch (error) {
    responseJson = {
        status:statusCode,
        message:"Database Error!"
    }
    res.send(responseJson)
   } 
}
 
const VerifyAccountStatus= async(req,res)=> { 
    try {
     let {user_id,bank_detail_id} = req.body 
     sql = `SELECT * FROM users  WHERE user_id = ? limit ?`;
     responseData = await conn.query(sql, [user_id, 1]);   
     if(responseData.length>0)
     {
         let phoneNumber    = responseData[0].phone 
         if(responseData[0].phone)
         { 
            sql = `SELECT * FROM bank_details  WHERE bank_detail_id = ? limit ?`;
            responseData = await conn.query(sql, [bank_detail_id, 1]); 
            if(responseData.length>0){
                var expression=/[0-9]{6}/; 
                if(expression.test(responseData[0].account_number))
                {
                    let IFSCCODe = (responseData[0].ifsc_code).toUpperCase()
                    if(ifsc.validate(IFSCCODe))
                    {  
                        const ifscd = await ifsc.fetchDetails(IFSCCODe) 
                        if(ifscd)
                        {
                            //CReate Benefieciary ID
                            let account_holder_name = responseData[0].account_holder_name 
                            let userName    = account_holder_name.replace(/\s/g, '')
                            let userId      = userName.substring(0, 6);//get first  chars
                            let str         = `${userId}${phoneNumber}`
                            let beneId      = str.toUpperCase()
                            const formData  = {  
                                benefieciary_id:beneId,
                                ifsc_code     :IFSCCODe,
                                account_number:responseData[0].account_number,
                                account_holder_name:responseData[0].account_holder_name,
                                branch   :ifscd.BRANCH,
                                city     :ifscd.CITY,
                                state    :ifscd.STATE,
                                bank_name:ifscd.BANK,
                                is_verified:1
                            }
                        sql = "UPDATE bank_details Set ?  WHERE bank_detail_id= ?"
                        updateResponse = await conn.query(sql, [formData,bank_detail_id]);  
                        if(updateResponse){
                            statusCode = 200
                            message = "Bank Verified" 
                        }else{
                            statusCode = 500
                            message = "Something went wrong!" 
                        } 
                        }else{
                            statusCode = 500
                            message    = "Validation error"
                        }
                        
                    }else{
                        statusCode = 401
                        message = "Invalid IFSC code!"
                    }
                }else{
                    statusCode = 401
                    message = "Invalid A/C number!"
                }
            }else{  
                statusCode  = 404
                message     = "Invalid Data"
            }  
         }else{
             statusCode  = 404
             message     = "Players Phone number does not exist!"
         }
     }else{
         statusCode  = 404
         message     = "User not Exist!"
     }
     responseJson = {
         status:statusCode,
         message,
         data
     }
     res.send(responseJson)
    } catch (error) {
        responseJson = {
            status:statusCode,
            message:"Database Error!"
        }
     res.send(responseJson)
    }
  
 
 
 }

//Direct withdraw
const directPayment = async(req)=> {
    console.log('req',req)

    try {
    const {user_id,tranferAmount} = req

    let transferId  = moment().utcOffset(330).format('YYYYMMDDHHmmss') 
    let referenceId = ""
    sql         = `SELECT * FROM bank_details WHERE user_id = ? limit ?`;
    responseData = await conn.query(sql, [user_id, 1]);  
     if(responseData.length>0)
     {
        if(responseData[0].benefieciary_status ==1)
        {

                let benefieciaryId = responseData[0].benefieciary_id    
                let Amount      =  Math.abs(tranferAmount) 
                var dataJson    = `{\n "beneId": "${benefieciaryId}",\n  "amount": "${Amount}",\n  "transferId": "${transferId}"\n}`; 
                let reqResponse =  await generateToken();   
                if(reqResponse.status==200)
                { 
                    var config = {
                        method: 'post',
                        url: `${commanEnv.TEST}/payout/v1/requestTransfer`,
                        headers: { 
                            'Authorization': `Bearer ${reqResponse.token}`
                        },
                        data : dataJson
                    };
                  await axios(config).then(async function (response)
                    { 
                        
                        referenceId = response.data.data.referenceId
                        if(response.data.status =="SUCCESS")
                        {
                           
                            var config = {
                                method: 'get',
                                url: `${commanEnv.TEST}/payout/v1/getTransferStatus?referenceId=${ referenceId = response.data.data.referenceId}`,
                                headers: { 
                                    'Authorization': `Bearer ${reqResponse.token}`
                                }, 
                            };
                            await axios(config).then(async function (response)
                            {
                              
                                statusCode  = response.data.subCode
                                message     = response.data.message  
                                if(response.data.status =="SUCCESS")
                                { 
                                    await sendMail(user_id,transferId,Amount,2);
                                }
                                else if(response.data.status =="PENDING")
                                { 
                                    await sendMail(user_id,transferId,Amount,2);
                                } else{ 
                                    await sendMail(user_id,transferId,Amount,1);
                                }   
                            }).catch(function (error) { 
                                statusCode  = 500
                                message     = "Something went wrong!"
                            });  
                        }
                        else if(response.data.status =="PENDING")
                        {  
                            var config = {
                                method: 'get',
                                url: `${commanEnv.TEST}/payout/v1/getTransferStatus?referenceId=${referenceId}`,
                                headers: { 
                                    'Authorization': `Bearer ${reqResponse.token}`
                                }, 
                            };
                            await axios(config).then(async function (response)
                            {
                                 
                                statusCode  = response.data.subCode
                                message     = response.data.message  
                                if(response.data.status =="SUCCESS")
                                { 
                                    await sendMail(user_id,transferId,Amount,2);
                                }
                                else if(response.data.status =="PENDING")
                                { 
                                    await sendMail(user_id,transferId,Amount,2);
                                } else{ 
                                    await sendMail(user_id,transferId,Amount,1);
                                }   
                            }).catch(function (error) { 
                                statusCode  = 500
                                message     = "Something went wrong!"
                            });  
                        }
                        else{
                            statusCode  = 403
                            message     = "Unabled to transfered" 
                        }  
                    }).catch(function (error) {
                        statusCode  = 500
                        message     = "Something went wrong!"
                    });
                }else{
                    statusCode  = 403
                    message     = "IP not whitelisted"
                } 
        }else{
            statusCode  = 404
            message     = "Invalid benefiary details!"
        }
     }else{
        statusCode  = 404
        message     = "Invalid Details!"
     }
     responseJson = {
        status:statusCode, 
        transferId:transferId,
        referenceId
    } 
    return responseJson
    } catch (error) {
        responseJson = {
            status:500,
            message:"Database Error!"
        }
        return responseJson
    } 
 }
module.exports = { 
    acceptPayouts,
    VerifyAccountStatus,
    VerifyAccount, 
    directPayment
};

