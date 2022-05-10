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
let sql = ""
let responseData = {};
let responseJson = {};
let updateResponse = {}
// Add money function

const getContestTable = async (req, res) => { 
    try { 
        sql = "SELECT tournaments.id,game_play_category.prize_pool,game_play_category.entry_fee,tournaments.tournament_id,tournaments.is_active,category.category_name FROM `tournaments` LEFT JOIN category ON category.category_id =tournaments.category_id INNER JOIN game_play_category ON game_play_category.game_category_id =tournaments.game_pc_id";
        responseData = await conn.query(sql);
        if(responseData.length>0){
            message = 'success'
            status = 200
           data = responseData
        }else{
            message = "Data not found!"
        } 
        responseJson = {
            status: status,
            message,
            data,
            errors: {}
        }
        res.send(responseJson)
    } catch (error) {
        res.send('error')
    }

}
 //changestatuscard-------------------

 const changeStatusCard = async (req, res) => {  
    // con
    try { 
      let sql = "UPDATE tournaments SET is_active=? WHERE tournament_id=?";
        const userss = await conn.query(sql, [req.body.is_active===1?0:1,req.body.tournament_id])  
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


module.exports = { 
    getContestTable, 
    changeStatusCard,
}