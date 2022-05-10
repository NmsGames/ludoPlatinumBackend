// const debug = require("debug")("test");
const db     = require("../../config/db"); 
const crypto = require("crypto"); 
const moment = require('moment')
const {sendResponse,isValidArray} = require('../../services/AppService');
const sendMail = require('../mails/sendMail')
  const { directPayment } = require('../CashfreePayouts/CashfreePayoutsController')
/**
 * Desc :Get user wallet amount by ID
 * Req  :{ user_id}
 * Function : userTransactionsHistory
 */
async function getUserTransactionAmount(playerId){
	try{ 
		let sql = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status = 1 and is_type = 1 group by user_id limit ?`;
		const results = await db.query(sql,[playerId,1]);   
		const amount =  (results.length>0)? results[0].amount:0;
	    return amount;
    } catch (err){
        console.log(err)
        // debug(err);
	}   
}

 
/**
 * Desc :GET User transaction Amount 
 * Req  :{ user_id}
 * Function : userTransactionsHistory
 */
 async function userTransactionsHistory(playerId){
	try{  
        /**
         * By userID
         * Get Loss amount
         */  
        
        let sql1 = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status = 1 and is_type = 2`; 
        const results1 = await db.query(sql1,[playerId]);
        /**
         * By userID
         * Entry fee debited amount
         */ 
        let sql2 = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status = 1 and is_type = 5`;
        const results2 = await db.query(sql2, [playerId]);
        /**
         * By userID
         * added amount
         */ 
        let sql3 = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status = 1 and is_type = 1`;
        const results3 = await db.query(sql3, [playerId]); 
        let added_amount=(results3.length>0)? results3[0].amount:0;
        let entry_amount= (results2.length>0)? results2[0].amount:0;
        let winning_amount=(results1.length>0)? results1[0].amount:0;

        const data = {
            total_amount:((added_amount-entry_amount)+winning_amount),
            add_amount: ((added_amount-entry_amount)), 
            winning_amount:winning_amount
        }
	    return data;
    } catch (err){
        console.log(err) 
	}   
}
 

// Check battle types
const battleType = async(id)=>{
    const sql = `SELECT category.category_name FROM game_reports INNER JOIN category ON 
    category.category_id = game_reports.category_id WHERE game_reports.tournament_id = ? LIMIT 1;`
    let battles = await db.query(sql,[id]); 
    let data ;
    
    if(battles.length>0){
        // console.log(battles[0].category_name,'categor')
        data={
            category_name:battles[0].category_name
        }
    }else{
        data={
            category_name:null
        }
    }
    return data;
}
/**
 * Desc : Get user transactions history  
 * Req  :{ user_id,tournament_id,game_play_id,category_type_id}
 * Function : getTransactionHistory
 */

const getTransactionHistory = async(req) => {
    let message;
	let status = 404;
	let data   = {};
    try{ 
        const user_id = req.user_id; 
        if(!user_id) return sendResponse(status,"Invalid details.",data)  
        let sql = `SELECT transaction_id,added_type,tournament_id,txn_amount as amount 
        ,status, currency,payment_mode,local_txn_id,DATE_FORMAT(txn_date,'%Y-%m-%d') AS txn_date,TIME( CASE WHEN txn_time IS NOT NULL THEN TIME(txn_time) ELSE TIME(txn_date) END )AS txn_time,is_type from transactions WHERE user_id= ?  order  by transaction_id DESC`;
	    let trans = await db.query(sql,[user_id]);  
	    if(isValidArray(trans)) {
            let response = [];
            const transactions = (JSON.parse(JSON.stringify(trans)));    
            for(i= 0; i<trans.length;i++){
                let rresponse = {
                    transaction_id  : trans[i].tournament_id?trans[i].tournament_id:trans[i].local_txn_id, 
                    amount          : trans[i].amount,
                    status          : trans[i].status,
                    currency        : trans[i].currency, 
                    local_txn_id    : trans[i].local_txn_id,
                    txn_date        : trans[i].txn_date,
                    txn_time        : trans[i].txn_time,
                    is_type         : trans[i].is_type,
                    transaction_mode:trans[i].payment_mode?trans[i].payment_mode:'UPI',
                    added_type: (trans[i].is_type==9)?'Failed':(trans[i].is_type==8)?'Sign Up Bonus':(trans[i].is_type==1)?'Add Money':(trans[i].is_type==2)?'Winnigs':(trans[i].is_type==3)?'Cancelled':(trans[i].is_type==4)?'Loss Money':(trans[i].is_type==5)?'Entry Fee':(trans[i].is_type==6)?'Withdrawn success':(trans[i].is_type==7)?'Withdrawn':(trans[i].is_type==10)?'Referral Bonus':"Pending"
                 }  
                response.push(rresponse);
                if(trans[i].tournament_id){
                    const types=await battleType(trans[i].tournament_id) 
                    response[i].transaction_mode = types.category_name  
                }  
                
            }
	    	status = 200;
            message = 'My Transactions'; 
            data = response
            return sendResponse(status,message,data);
	    } else { 
           return sendResponse(status,"No trasaction history.",data);
	    }	
	} catch (err){
        console.log(err) 
	}   
}
/**
 * Desc : Register on tournaments entry fee  
 * Req  :{ user_id,tournament_id,game_play_id,category_type_id}
 * Function : createGamePlayTransactionReports
 */
const createGamePlayTransactionReports = async(req) => {
    const orderId      = crypto.randomBytes(16).toString("hex"); 
    let message;
	let status = 404;
	let data   = {};
    let sql1  = ''
    let users;
    let UpdateAmount ={};
    try{  
            sql1 = "SELECT * FROM users WHERE user_id=? limit ?";
            users = await db.query(sql1, [req.user_id, 1]); 
            if(users.length>0)
            {  
                let bonusAmount         = 0
                let wininingAmount      = 0
                let bonusAmountUpdate   = 0
                let wininingAmountUpdate= 0
                let walletAmount        = 0
                let balance             = 0
                let wallAccBalance      = 0
                //check bonus amount
                let TotalBonusAmount    =0
                if(req.orderAmount != 0){
                    TotalBonusAmount = ((req.orderAmount)*5)/100;
                   
                    if(users[0].bonus_amount >=TotalBonusAmount)
                    { 
                        bonusAmountUpdate   = TotalBonusAmount;
                        bonusAmount         = (users[0].bonus_amount - TotalBonusAmount).toFixed(2)  
                        console.log(bonusAmount,'bonusAmount')
                        if(bonusAmountUpdate>=req.orderAmount)
                        {
                            balance = bonusAmountUpdate 
                            UpdateAmount = { 
                                bonus_amount : parseFloat(bonusAmount), 
                            }  
                        }else{
                            if(users[0].wallet_amount>1){  
                                    let BonBal = req.orderAmount - bonusAmountUpdate 
                                    if(users[0].wallet_amount>=BonBal){
                                        BonBal = users[0].wallet_amount -BonBal
                                        wininingAmount       = (users[0].wining_amount - BonBal).toFixed(2)  
                                        UpdateAmount = { 
                                            wallet_amount :  BonBal, 
                                            bonus_amount  :  parseFloat(bonusAmount), 
                                            // wining_amount :  parseFloat(wininingAmount),
                                        }  
                                    }else{     
                                        // 4750-1500 =//3250
                                        BonBal = BonBal-users[0].wallet_amount 
                                        wininingAmount       = (users[0].wining_amount - BonBal).toFixed(2)  
                                        UpdateAmount = { 
                                            wallet_amount : 0, 
                                            bonus_amount  :  parseFloat(bonusAmount), 
                                            wining_amount :  parseFloat(wininingAmount),
                                        }  
                                    } 

                            }else{
                                if(users[0].wining_amount>0){
                                    balance = balance + users[0].wining_amount  
                                    let bAmount = req.orderAmount - bonusAmountUpdate 
                                    wininingAmount = (users[0].wining_amount - bAmount).toFixed(2)  
                                    UpdateAmount = { 
                                        bonus_amount :  parseFloat(bonusAmount), 
                                        wining_amount : (parseFloat(wininingAmount)),
                                    }   
                                }
                            }

                        }
                    }else{
                        if(users[0].wallet_amount>1){ 
                            
                            let BonBal = req.orderAmount - users[0].wallet_amount 
                            if(users[0].wallet_amount>=req.orderAmount){

                                BonBal = users[0].wallet_amount -req.orderAmount   
                                UpdateAmount = { 
                                    wallet_amount :  BonBal,   
                                }  
                            }else{   
                                wininingAmount       = (users[0].wining_amount - BonBal).toFixed(2)  
                                UpdateAmount = { 
                                    wallet_amount : 0,  
                                    wining_amount :  parseFloat(wininingAmount),
                                } 
                                console.log(UpdateAmount,'UpdateAmount 3')
                            } 

                        }else{
                            balance = users[0].wining_amount 
                            if(users[0].wining_amount>0)
                            { 
                                wininingAmount = (users[0].wining_amount - req.orderAmount).toFixed(2)  
                                UpdateAmount = {  
                                    wining_amount : (parseFloat(wininingAmount)),
                                }   
                            }
                        }
                    }

                }else{
                    UpdateAmount = { 
                        is_user_update  : 0,  
                    } 
                } 
                
                 
                
                
                
                sql     = "UPDATE users Set ? WHERE user_id= ?"
                result  = await db.query(sql, [UpdateAmount,req.user_id]);
                if(result){
                    const forms = {
                        user_id     : req.user_id,
                        order_id    : crypto.randomBytes(8).toString("hex"),
                        txn_id      : orderId,
                        tournament_id:req.tournament_id,
                        currency    : 'INR', 
                        txn_amount  : `-${req.orderAmount}`,
                        txn_date    : moment().utcOffset(330).format("YYYY-MM-DD"),
                        txn_time    : moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                        banktxn_id  : 1,
                        added_type  : 'Entry Fee',
                        gateway_name: 'Local Wallet', 
                        local_txn_id: `LTD${moment().utcOffset(330).format('YYYYMMDDHHmmss')}`,
                        payment_mode: "WALLET",
                        banktxn_id : `${moment().utcOffset(330).format('MMDDHHmmss')}${req.user_id}`,
                        status : 1,
                        is_type: 5,
                        bonus_amount:bonusAmountUpdate
                    } 
                    sql1  = `INSERT INTO transactions Set ?`;
                    let results = await db.query(sql1,forms); 
                    status = 201
                    message = "Success"  
                }
               	
            }else{
                status = 404
                message = "Success"
            }
           
        return sendResponse(status,message,data);
	} catch (err){
        console.log(err) 
	}   
}

//Create Withdraw request trasaction reports
const createWithdraw = async(req) => 
{  
    let statusCode  = 404 
    let transferId  = "" 
    try {
        let reqData = {
            user_id         :req.user_id,
            tranferAmount: req.amount,
        }
          const  responseData = await directPayment(reqData) 
          if(responseData.status != 500){ 
            transferId = responseData.transferId
            const forms = {
                user_id     : req.user_id,
                order_id    : crypto.randomBytes(8).toString("hex"),
                txn_id      : transferId, 
                currency    : 'INR', 
                txn_amount  : `-${req.amount}`,
                txn_date    : moment().utcOffset(330).format("YYYY-MM-DD"),
                txn_time    : moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                banktxn_id  : 1,
                added_type  : 'Withdraw request',
                gateway_name: 'Withdraw', 
                local_txn_id: `WTD${moment().utcOffset(330).format('YYYYMMDDHHmmss')}`,
                payment_mode: "BANK(IMPS)",
                banktxn_id  : `${moment().utcOffset(330).format('MMDDHHmmss')}${req.user_id}`,
                status      : 1,
                reference_id: responseData.referenceId,
                txn_message : responseData.message,
                is_type     : (responseData.status==200)?6:(responseData.status==201)?11:7,
                is_request_mode:req.is_mode
            } 
            
                let updatedAmount   = req.winning_amount - req.amount
                let updateWithdraw  = req.withdraw + req.amount
                let sql = "UPDATE users Set ? WHERE user_id= ?"
                let result  = await db.query(sql, [{withdraw_amount:updateWithdraw,wining_amount:updatedAmount},req.user_id]);
          
            //Create transaction history
                if(result)
                {
                    sql  = `INSERT INTO transactions Set ?`; 
                    let response = await db.query(sql,forms); 
                    if(response){
                        console.log('update',response)
                        await sendMail(req.user_id,transferId,req.amount,1); 
                        statusCode = 200
                    }else{
                        statusCode  =  404
                    }
                }else{
                    statusCode  = 500
                }
            }else{
                statusCode      = 200
            } 
       let responseJson = {
            status      : statusCode, 
            transferId  : transferId
        } 
        return responseJson
    } catch (error) {
        let responseJson = {
            status:500, 
        } 
        return responseJson
    }

}

const withdrawRequest = async(req) => { 
    let message;
	let status = 404;
	let data   = {};
    try{  
        const {user_id,req_amount,is_mode} = req
        if(!req.user_id) return sendResponse(status,"Invalid details.",data)  
        const sql1  = `SELECT * FROM users WHERE user_id = ? LIMIT ?`;
        let results = await db.query(sql1,[user_id,1]); 
        let sql2 = `SELECT * FROM bank_details WHERE user_id = ? limit ?`;
        let checkBankDetails = await db.query(sql2, [user_id, 1]); 
        if(results.length>0)
        {
            let winning_amount = (results[0].wining_amount &&  (results[0].wining_amount>0))?results[0].wining_amount:0
            let withdraw = (results[0].withdraw_amount &&  (results[0].withdraw_amount>0))?results[0].withdraw_amount:0
            if(req_amount>=30)
            {
                if(checkBankDetails.length>0)
                {  
                    if(winning_amount>=req_amount)
                    {
                            let reqData ={
                                user_id : user_id,
                                amount  : req_amount,
                                is_mode : is_mode,
                                winning_amount: winning_amount,
                                withdraw: withdraw
                            }
                            switch (is_mode)
                            {
                                case "UPI":
                                    if(checkBankDetails[0].upi_id && checkBankDetails[0].upi_id != null){
                                        let responseData = await createWithdraw(reqData) 
                                        if(responseData){
                                           
                                            status  =  200
                                            message = "Withdraw requested submitted"
                                        }else{
                                            status  =  404
                                            message = "Something went wrong! database"
                                        }
                                    }else{
                                        status  =  404
                                        message = "Please add Your UPI ID"
                                    }
                                break;
                                case "BANK":
                                    if((checkBankDetails[0].account_number && checkBankDetails[0].account_number != null) &&  checkBankDetails[0].is_verified==1)
                                    {
                                        let responseData = await createWithdraw(reqData) 
                                        if(responseData){
                                            status  =  200
                                            message = "Withdraw requested submitted"
                                        }else{
                                            status  =  404
                                            message = "Something went wrong! database"
                                        }
                                    }else{
                                        status  =  404
                                        message = "Your Bank Account is not verified"
                                    }
                                break; 
                        } 
                    
                    }else{
                        status = 404
                        message = `Insufficient balance! ${winning_amount}`
                    }
                }else{
                    status = 404
                    message = "Please add bank account details"
                }
                 
            }else{
                status = 404
                message= "Minimum withdraw limit 30"
            }
        }else{
            status = 404
            message= "User not valid"
        }
       	
        return sendResponse(status,message,data);
	} catch (err){
        console.log(err) 
	}   
}
const createBonusReports = async(req) => {
    const orderId      = crypto.randomBytes(16).toString("hex"); 
    let message;
	let status = 404;
	let data   = {};
    try{  
        const user_id = req
        const bonusamount = 20
        if(!user_id) return sendResponse(status,"Invalid details.",data)  
        const sql1  = `INSERT INTO transactions Set ?`;
        const forms = {
            user_id     : user_id,
            order_id    : crypto.randomBytes(8).toString("hex"),
            txn_id      : orderId,
            tournament_id:'',
            currency    : 'INR', 
            txn_amount  : bonusamount,
            txn_date    : moment().utcOffset(330).format("YYYY-MM-DD"),
            txn_time    : moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
            banktxn_id  : 1,
            added_type  : 'Bonus Amount',
            gateway_name: 'Local Wallet', 
            local_txn_id: `BNA${moment().utcOffset(330).format('YYYYMMDDHHmmss')}`,
            payment_mode: "WALLET",
            banktxn_id : `${moment().utcOffset(330).format('MMDDHHmmss')}${user_id}`,
            status : 1,
            is_type: 8
        } 
        let results = await db.query(sql1,forms); 
	    if(results) { 
           
            let sql = "SELECT * FROM users  WHERE user_id = ? LIMIT 1"
            let responseData = await db.query(sql, [user_id]); 
            if(responseData.length>0){
                const formData = {
                    bonus_amount    :responseData[0].bonus_amount+15,
                    wallet_amount   :responseData[0].wallet_amount+5,
                    is_wallet       :1
                }
                let sql = "UPDATE users Set ? WHERE user_id= ?"
                const result = await db.query(sql, [formData, user_id]); 
                if(result)
                {
                    status = 200 
                }else{
                    status = 500 
                } 
            }
	    } else { 
            status = 403
            message = 'failed' 
	    }	
        return sendResponse(status,message,data);
	} catch (err){
        return sendResponse(500,'Database error',data);
	}   
}

const referralBonus = async(req) => { 
    const orderId   = crypto.randomBytes(6).toString("hex"); 
    let message;
	let status = 404;
	let data   = {};
    let sql     = ""
    let updateResponse;
    let formData;
    let responseData;
    
    try{  
    // 
        sql  = `INSERT INTO transactions Set ?`;
        const {  amount , refer_by,  refferal_code, user_id  } = req
        formData = {
            user_id     : refer_by,
            order_id    : crypto.randomBytes(8).toString("hex"),
            txn_id      : orderId,
            tournament_id:'',
            currency    : 'INR', 
            txn_amount  : amount,
            txn_date    : moment().utcOffset(330).format("YYYY-MM-DD"),
            txn_time    : moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
            banktxn_id  : 1,
            added_type  : 'Referral Bonus',
            gateway_name: 'Local Wallet', 
            local_txn_id: `BNA${moment().utcOffset(330).format('YYYYMMDDHHmmss')}`,
            payment_mode: "WALLET",
            banktxn_id : `${moment().utcOffset(330).format('MMDDHHmmss')}${refer_by}`,
            status : 1,
            is_type: 10
        } 
        responseData = await db.query(sql,formData);  
	    if(responseData) 
        { 
            sql = "SELECT * FROM users  WHERE user_id = ? LIMIT 1"
            responseData = await db.query(sql, [refer_by]); 
            if(responseData.length>0){
                formData = {
                    bonus_amount    :(responseData[0].bonus_amount + amount),  
                } 
                sql = "UPDATE users Set ? WHERE user_id= ?"
                updateResponse= await db.query(sql, [formData, refer_by]);
                if(updateResponse)
                {
                    sql  = `INSERT INTO referal_code_details Set ?`;
                    formData = {  
                        refered_by     : refer_by,
                        referal_code   : refferal_code,
                        user_id         : user_id,
                        refered_by_amount:amount,
                        user_amount :amount,
                        status:1
                     } 
                     await db.query(sql,formData); 
                     status = 200 
                }else{
                    status = 500 
                } 
            }  
	    } else { 
            status = 403
            message = 'failed' 
	    }	
        return sendResponse(status,message,data);
	} catch (err){
        return sendResponse(500,'Database error',data);
	}   
}
module.exports = {
    createBonusReports,
    withdrawRequest,
    getTransactionHistory,
    getUserTransactionAmount,
    createGamePlayTransactionReports,
    userTransactionsHistory,
    referralBonus
}