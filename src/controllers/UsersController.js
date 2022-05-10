const conn   = require('../../config/db') 
const moment = require('moment');
const path   = require('path');
const check  = require('../validation/CheckValidation')
const {checkUser} = require('../socket/Users')
var pan = require('validate-india').pan;
let message = null
let status  = 400
let response={}
let errors={}
let data = {};
// Add money function

const uploadProfilePic = async (req, res) => { 
    try {
        // const errors = check.resultsValidator(req)
        // if (errors.length > 0) {
        //     return res.status(400).json({
        //         method: req.method,
        //         status: res.statusCode,
        //         error: errors
        //     })
        // }d
        let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
        let user = await conn.query(sql, [req.body.user_id, 1]);
        console.log(user,'as')
        if(!user.length>0)res.send({status:404,message:"user not found"})
        console.log(req.body)
        if (!req.files || Object.keys(req.files).length == 0) {
            res.status(400).send({ status: statusCode, message: 'No file are uploaded' })
        }
        prfoileFile = req.files.avatar
        let reqPath = path.join(__dirname, '../../public')
        const imagUrl= `Avatars/${req.body.user_id}-${prfoileFile.name}`
        uploadPath = `${reqPath}/${imagUrl}` 
        const profile = await prfoileFile.mv(uploadPath)

        let sql1 = "UPDATE users Set avatar= ? WHERE user_id= ?"
        const users = await conn.query(sql1, [imagUrl, req.body.user_id]);
        let statusCode = 404
        if (users) {
            statusCode = 200
            message = 'Image uploaded success'
        } else {
            statusCode = 500
            message = 'Unable to upload'
        }

        const responseData = {
            status: statusCode,
            message,
            errors: {}
        }
        res.send(responseData)
    } catch (error) {
        res.send('error')
    }

}
const retrieveProfilePic = async (req, res) => {
    console.log('121221212121212',pan.isValid('DPVPM8916J'))
    try {
        console.log('re',req.params.id)
        let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
        let user = await conn.query(sql, [req.params.id, 1]);
        const usersRows = (JSON.parse(JSON.stringify(user))[0]); 

        if(usersRows.avatar ==null) usersRows.avatar = 'Avatars/default.png';
        const responseData = {
            status: 200,
            message:'Success',
            avatarLink:`${req.protocol}://${req.headers.host}/${usersRows.avatar}`,
            errors: 'error'
        }  
        res.send(responseData) 
    } catch (e) {
        res.status(404).send()
    }

}

const getUsers = async (req, res) => {  
    // con
    try { 
        let sql = `SELECT * FROM users`;
        let user = await conn.query(sql);
        if(user.length>0){
            status = 200;
            message ='Success'
            const usersRows = (JSON.parse(JSON.stringify(user))); 
            data = usersRows
        }else{
            status = 404
            message = 'Users not found'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send('ERR')
    }

}

//changeStatusPlayer----

const changeStatusPlayer = async (req, res) => {  
    // con
    try { 
      let sql = "UPDATE users SET is_block=? WHERE user_id=?";
        const userss = await conn.query(sql, [req.body.is_block===1?0:1,req.body.user_id])  
        if(userss){
            status = 200
            message = 'Success'
            data = {};
        
    
    
    
    }else{
            status = 404
            message = 'Users not found'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: {},
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send('ERR')
    }

}



//changepassword for admin---------------------
//Transaction data histroy-------------------
const getTransactionData = async (req, res) => {
    let message = null
    let statusCode = 400 
    let data; 
    try { 
        let sql = `SELECT users.username,users.phone,users.email,transactions.txn_id,transactions.payment_mode,transactions.txn_amount,transactions.txn_date FROM  users left join transactions on transactions.user_id=users.user_id `;
            
            const agent = await conn.query(sql)
            if(agent.length>0){ 
                statusCode = 200
                message    = "success" 
                data = agent
            }else{
                statusCode = 404
                message    = "Agent not found"
            } 
            const responseData = {
                status: statusCode,
                message, 
                data
            }
            res.send(responseData)
     
    } catch (error) {
        res.status(500).send('Database error' )
    }
}



//Referral Bonus Data
const getReferralData = async (req, res) => {
    let message = null
    let statusCode = 400  
    try { 
        let sql = `SELECT  users.username,users.phone,users.email,referal_code_details.refered_by_amount,referal_code_details.refered_by FROM  users left join referal_code_details on referal_code_details.user_id=users.user_id`;
            
            const agent = await conn.query(sql)
            if(agent.length>0){ 
                statusCode = 200
                message    = "success" 
                data = agent
            }else{
                statusCode = 404
                message    = "Agent not found"
            } 
            const responseData = {
                status: statusCode,
                message, 
                data
            }
            res.send(responseData)
     
    } catch (error) {
        res.status(500).send('Database error' )
    }
}




module.exports = { 
    uploadProfilePic,
    retrieveProfilePic,
    changeStatusPlayer,
    

    getUsers,
    getReferralData,
    getTransactionData,

    
}