const conn   = require('../../config/db') 
const moment = require('moment')
const check  = require('../validation/CheckValidation') 
let message = null
let status  = 400
let response={}
let errors={}
// Add money function
const createTransaction  = async (data) => {   
    try {  
        var d = new Date();

        var currentDate = d.getFullYear()  + "-" + (d.getMonth()+1) + "-" + d.getDate(); 
        const sql     = `SELECT * FROM users  WHERE user_id = ? limit ?`;
        const user = await conn.query(sql, [data.userId, 1]);   
        if(user.length>0 )
        {
            const sql1 = `INSERT INTO transactions Set ?`;
            const forms = {
                user_id     : data.userId,
                order_id    : data.orderId,
                txn_id      : data.orderId,
                currency    : data.orderCurrency, 
                txn_amount  :  data.orderAmount,
                txn_date    : currentDate,
                added_type  : data.orderNote, 
                local_txn_id: `12adfdfd${data.userId}`,
                gateway_name:"CASHFREE"
            } 
            let results = await conn.query(sql1,forms);
            response = (JSON.parse(JSON.stringify(results)));  
            status = 200 
        }else{
            status = 400 
            message ="Invalid transaction details"
        } 
      const rpdata = {
          status,
          message,
          response 
         }
        return rpdata
    } catch (err) {
        console.log(err) 
    }
}

const updateTransactionStatus = async (data) => {   
    try {  
        const sql     = `SELECT * FROM transactions WHERE order_id= ? limit ?`;
        const sql1    = `UPDATE transactions Set ?  WHERE transaction_id= ?`;
        const sql3     = `SELECT * FROM users WHERE user_id= ? limit ?`;
        const results = await conn.query(sql, [data.orderId, 1]);
        const transactions  = (JSON.parse(JSON.stringify(results))[0]);   
        const formsData = { 
            status       : (data.txStatus == 'SUCCESS')?1:2,
            txn_status   : data.txStatus,
            txn_message  : data.txMsg,  
            txn_time     : data.txTime,
            is_type      : 1,
            reference_id : data.referenceId, 
            payment_mode : data.paymentMode,
            checkcum_signature: data.signature, 
        } 
        let results1    = await conn.query(sql1, [formsData, transactions.transaction_id]);
        const response  = (JSON.parse(JSON.stringify(results1))); 
        if(response){
            if((data.txStatus == 'SUCCESS')){
                const users = await conn.query(sql3, [transactions.user_id, 1]);
                const balance =  ((users[0].wallet_amount && users[0].wallet_amount>0)?parseFloat(users[0].wallet_amount):0)+parseFloat(transactions.txn_amount)
                let sql4 = "UPDATE users Set ? WHERE user_id= ?"
                const result = await conn.query(sql4, [{wallet_amount:balance}, transactions.user_id]); 
            } 
            status  = 200 
            message = "Success" 
        }else{
            message = "Failed" 
        } 
        const rpdata = {
          status,
          message,
          response 
         }
        return rpdata
    } catch (err) {
        console.log(err) 
    }
}

//User account details by id
const accountDetails =  async (req, res) => { 
    try {
        /**Check validation Error */
         let data ;
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        }
       /** check user exist or not */ 
        const user_id = req.body.user_id;
        const sql     = `SELECT * FROM users  WHERE user_id = ? limit ?`;
        const results = await conn.query(sql, [user_id, 1]); 
        const user    = (JSON.parse(JSON.stringify(results))[0]); 
        if(user){   
          /** select the total amount of current user */
            const sql1    = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status =1 group by user_id`;
            const results = await conn.query(sql1, [user_id]); 
            const responses = (JSON.parse(JSON.stringify(results))[0]);  
            message = 'Success' 
            status  = 200
            data = {
                total_cash_amount:responses.amount,
                username:user.username,
                phone:user.phone
            }
        } 
        else{
            status  = 404
            message = "User does not exist"
        }  
        const responseData = {
            status,
            message,
            data:data,
            errors 
        }
        res.send(responseData)
    } catch (error) {
        res.send({err:error })
    }
}

// Transaction history current user
const transactionHistory =  async (req, res) => { 
    try {
        /**Check validation Error */
         let data ;
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        }
        /** check user exist or not */ 
        const user_id = req.body.user_id;
        const sql     = `SELECT * FROM users  WHERE user_id = ? limit ?`;
        const results = await conn.query(sql, [user_id, 1]); 
        const user    = (JSON.parse(JSON.stringify(results))[0]); 
        if(user){   
            const sql1 = `SELECT transaction_id,added_type,txn_amount as amount,status,txn_id,txn_time,currency,payment_mode,local_txn_id from transactions WHERE user_id= ?`;
            const results = await conn.query(sql1, [user_id]); 
            const responses = (JSON.parse(JSON.stringify(results))); 
            message = 'Success' 
            status  = 200
            data = responses
        } 
        else{
            status  = 404
            message = "User does not exist"
        }  
        const responseData = {
            status,
            message,
            data:data,
            errors
        }
        res.send(responseData)
    } catch (error) {
        res.send({err:error })
    }
}

// Transaction history current user
const userTransactionHistory =  async (req, res) => { 
    try {
        
        /** check user exist or not */ 
        const sql1 = `SELECT * from transactions LEFT JOIN users ON transactions.user_id = users.user_id WHERE  transactions.is_type != 7 ORDER BY transaction_id DESC  `;
        const results = await conn.query(sql1); 
        if(results.length>0){    
            const responses = (JSON.parse(JSON.stringify(results))); 
            message = 'Success' 
            status  = 200
            data = responses
        } 
        else{
            status  = 404
            message = "No transaction history"
        }  
        const responseData = {
            status,
            message,
            data:data,
            errors
        }
        res.send(responseData)
    } catch (error) {
        res.send({err:error })
    }
}
// Transaction history current user
const withdrawRequestHistory =  async (req, res) => { 
    try {
        
        /** check user exist or not */ 
        const sql1 = `SELECT * from transactions LEFT JOIN users ON transactions.user_id = users.user_id 
        LEFT JOIN bank_details ON transactions.user_id = bank_details.user_id WHERE  transactions.is_type = 7 OR transactions.is_type = 6 OR transactions.is_type = 11 ORDER BY transaction_id DESC`;
        const results = await conn.query(sql1); 
        if(results.length>0){    
            const responses = (JSON.parse(JSON.stringify(results))); 
            message = 'Success' 
            status  = 200
            data = responses
        } 
        else{
            status  = 404
            message = "No Withdraw history"
        }  
        const responseData = {
            status,
            message,
            data:data,
            errors
        }
        res.send(responseData)
    } catch (error) {
        res.send({err:error })
    }
}

//Account Details
const usersAccoutDetails =  async (req, res) => { 
    try {
        /**Check validation Error */
         let data ={}; 
          /** select the total amount of current user */
            const sql1    = `SELECT * from bank_details LEFT JOIN users ON bank_details.user_id = users.user_id`;
            const results = await conn.query(sql1);  
            if(results.length>0){    
                const responses = (JSON.parse(JSON.stringify(results))); 
                message = 'Success' 
                status  = 200
                data = responses
            } 
            else{
                status  = 404
                message = "No bank details history"
            }  
            const responseData = {
                status,
                message,
                data:data,
                errors
            }
            res.send(responseData) 
    } catch (error) {
        res.send({err:error })
    }
}
module.exports = {
    accountDetails,
    createTransaction,
    updateTransactionStatus,
    transactionHistory,
    userTransactionHistory,
    withdrawRequestHistory,
    usersAccoutDetails, 
}