
const helper   = require('../helpers/users')
const conn      = require('../../config/db')
const crypto    = require("crypto");
const moment    = require('moment');

// Add money function
const addMoney  = async (data) => {  
    const txn_id = crypto.randomBytes(16).toString("hex");
    let message = null
    let status = 400
    let response ={}
    try {  
        const user = await helper.userData(data)
        if(user){  
            sql = `INSERT INTO transactions Set ?`;
            const forms = {
                user_id     : data.user_id,
                order_id    : data.order_id,
                txn_id      : data.orderId,
                currency    : data.orderCurrency, 
                txn_amount  : data.orderAmount,
                txn_date    : moment().format(),
                added_type  : data.orderNote, 
                local_txn_id: null,
                gateway_name:"CASHFREE"
            } 
            let results = await conn.query(sql,forms);
            const response = (JSON.parse(JSON.stringify(results)));  
            status = 200 
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


 

 
module.exports = {
    addMoney 
}