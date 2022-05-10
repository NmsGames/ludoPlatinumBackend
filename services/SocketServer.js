// const conn          = require("../config/db"); 
// const {sendResponse} = require('../services/AppService'); 
// const moment = require('moment');
 
// const crypto = require("crypto"); 
// const { response } = require("express");
 
// const checkUser = async (req) => { 
//     let data = {}; 
//     const user_id = req  
//     let sql = "SELECT * FROM users WHERE user_id=? limit ?";
//     let check   = await conn.query(sql, [user_id, 1]); 
//     if (check.length > 0) {
//         data = {
//             status      : 200,
//             user_id     : check[0].user_id,
//             device_id   : check[0].device_id,
//             username    : check[0].username,
//             email       : check[0].email,
//             phone       : check[0].phone,
//             avatar      : check[0].avatar,
//             otp         : check[0].otp,
//             verify_time : check[0].verify_time,
//             is_block    : check[0].is_block,
//             is_logged_in: check[0].is_logged_in,
//             wallet_amount: check[0].wallet_amount,
//             bonus_amount: check[0].bonus_amount,
//             winnig_amount: ((check[0].wining_amount != null) && (check[0].wining_amount >0))?check[0].wining_amount:0 
//         } 
//     } else {
//         data = {
//             status : 403
//         } 
//     } 
     
//     return data 
// }
// const createTransactionReport = async(req) => { 
//     let message;
// 	let status = 404;
// 	let data   = {};
//     let sql = ""  
//     let results ;
//     let forms ={}
//     try{   
//         const orderId2 = crypto.randomBytes(12).toString("hex");  
        
//         sql  = "SELECT * FROM transactions WHERE user_id =? and tournament_id =? AND is_type =5 LIMIT 1";
//         results = await conn.query(sql ,[req.user_id, req.tournament_id]); 
//         let amount;
//         if(req.is_type ===4){
//             if(results.length>0){
//                 amount = `-${results[0].txn_amount}`
//             }else{
//                 amount = 0
//             }

//             sql  = "SELECT * FROM transactions WHERE user_id =? and tournament_id =? AND is_type =4 LIMIT 1";
//             results = await conn.query(sql ,[req.user_id, req.tournament_id]); 
//             if(!(results.length>0)){
//                 forms = {
//                     user_id     : req.user_id,
//                     order_id    : crypto.randomBytes(8).toString("hex"),
//                     txn_id      : orderId2,
//                     tournament_id:req.tournament_id,
//                     currency    : 'INR', 
//                     txn_amount  : amount,
//                     txn_date    : moment().format(),
//                     banktxn_id  : 1,
//                     added_type  : req.added_type,
//                     gateway_name: 'Local Wallet', 
//                     local_txn_id: `LTD${moment().format('YYYYMMDDHHmmss')}`,
//                     payment_mode: "WALLET",
//                     banktxn_id : `${moment().format('MMDDHHmmss')}${req.user_id}`,
//                     status : 1,
//                     is_type: 4
//                 }
//                 sql  = "INSERT INTO transactions Set ?";
//                 results = await conn.query(sql,forms);
//             }
//         }else{
//             amount = `+${req.amount}`
//             sql  = "SELECT * FROM transactions WHERE user_id =? and tournament_id =? AND is_type =2 LIMIT 1";
//             results = await conn.query(sql ,[req.user_id, req.tournament_id]); 
//             if(!(results.length>0)){
//                 forms = {
//                     user_id     : req.user_id,
//                     order_id    : crypto.randomBytes(8).toString("hex"),
//                     txn_id      : orderId2,
//                     tournament_id:req.tournament_id,
//                     currency    : 'INR', 
//                     txn_amount  : amount,
//                     txn_date    : moment().format(),
//                     banktxn_id  : 1,
//                     added_type  : req.added_type,
//                     gateway_name: 'Local Wallet', 
//                     local_txn_id: `LTD${moment().format('YYYYMMDDHHmmss')}`,
//                     payment_mode: "WALLET",
//                     banktxn_id : `${moment().format('MMDDHHmmss')}${req.user_id}`,
//                     status : 1,
//                     is_type: 2
//                 }
//                 sql  = "INSERT INTO transactions Set ?";
//                 results = await conn.query(sql,forms);
//             }
//         } 
//         return sendResponse(status,message,data);
// 	} catch (err){
//         console.log(err) 
// 	}   
// }
// const userExitGame = async (req) => {
//     try {
//         let sql = ""
//         let status = 404 
//         let result;
//         let balance;
//         let player_id = req 
//         let report_data;
//         let moneyType = ""
//         let isType = 4
//         let isStatus = 3
//         let isActive = 3
//         let tdate     = moment().utcOffset(330).format('YYYY-MM-DD')
//         let last_minute = moment().subtract(10, 'minutes').utcOffset(330).format("HH:mm:ss");
//         sql = "SELECT * FROM game_reports WHERE DATE(tournament_play_date)=? AND TIME(tournament_end_time)>=? AND player_id =? AND is_active =1 LIMIT 1";
//         let results = await conn.query(sql ,[tdate,last_minute,player_id]); 
       
//         if (results.length >0){   
//             let category_id   = results[0].category_id 
//             let room_id       = results[0].room_id 
//             let tournament_id = results[0].tournament_id    
//             if(category_id ==1){ 
//                 sql = "SELECT * FROM game_reports WHERE tournament_id=? AND room_id=? AND player_id =? AND is_active =1 LIMIT 1";
//                 let results = await conn.query(sql ,[tdate,last_minute,player_id]); 

//                 sql = "SELECT game_play_category.prize_pool,game_reports.user_id,game_reports.game_report_id,game_reports.player_id,game_reports.tournament_id FROM game_reports LEFT JOIN game_play_category ON game_play_category.game_category_id =game_reports.game_play_id  WHERE game_reports.tournament_id =? AND game_reports.room_id =? AND game_reports.is_active = 1 order by game_reports.scores";
//                let responseData = await conn.query(sql ,[tournament_id,room_id]); 

//                 if(responseData.length>0)
//                 {   
//                     for(j=0;j<responseData.length; j++)
//                     {
//                         let tempPlayerId  = responseData[j].player_id
//                         let userId        = responseData[j].user_id
//                         let poolPrice     = responseData[j].prize_pool
//                         let tournamentId  = responseData[j].tournament_id 
//                         let gameReportIid =responseData[j].game_report_id 
//                         sql = "SELECT wining_amount FROM users WHERE user_id=? limit ?";
//                         users = await conn.query(sql, [userId, 1]);   
//                       console.log( 'Update STATUS1' )
//                       if(users.length>0)
//                       {   
//                             let winingamount = ((users[0].wining_amount && users[0].wining_amount>0)?parseFloat(users[0].wining_amount):0)  
//                              balance = (winingamount + poolPrice)  

//                             sql = "UPDATE game_reports Set ? WHERE game_report_id= ?"
//                             result = await conn.query(sql, [{is_status:2,is_active:2},gameReportIid]); 
//                             // if(tempPlayerId ==player_id){
//                                 if(j==0){
//                                     moneyType = "Lose"
//                                     isType = 4
//                                     isStatus =3
//                                     isActive =3
//                                 }else{
//                                     sql     = "UPDATE users Set ? WHERE user_id= ?"
//                                     result  = await conn.query(sql, [{wining_amount:balance},userId]);
//                                     moneyType = "Won"
//                                     isType = 2
//                                     isStatus =2
//                                     isActive =2 
//                                 }
//                             // }else{
//                             //     if(j==0){
//                             //         sql     = "UPDATE users Set ? WHERE user_id= ?"
//                             //         result  = await conn.query(sql, [{wining_amount:balance},userId]);
//                             //         moneyType = "Won"
//                             //         isType = 2
//                             //         isStatus =2
//                             //         isActive =2 
//                             //     }else{
                                    
//                             //         moneyType = "Lose"
//                             //         isType = 4
//                             //         isStatus =3
//                             //         isActive =3
//                             //     }
//                             // }
                               
//                             report_data = {
//                                 user_id: userId,
//                                 amount :poolPrice,
//                                 is_type:isType,
//                                 tournament_id:tournamentId,
//                                 added_type:moneyType,
//                             } 
//                             await createTransactionReport(report_data)  
//                             sql = "UPDATE game_reports Set ? WHERE game_report_id = ?"
//                             result = await conn.query(sql, [{is_status:isStatus,is_active:isActive}, gameReportIid]);
//                              console.log('updated gameReportIid status',result)
//                             if(result){
//                                 status = 200
//                             }  
//                         }     
//                         continue 
//                     }
//                 } 
               
//             }else{ 
//                 let sql4     = "UPDATE game_reports Set ? WHERE game_report_id= ?"
//                 const result = await conn.query(sql4, [{is_status:3,is_active:3}, results[0]. game_report_id]);
//                 if(result){  
//                     status = 200
//                 }
//             }  
//         } 

//         return true; 
//     } catch (err) {
//         console.log(err)
//     }
// }


// const updateWinningStatus = async (req) => {
//     try {
//         let status = 404
//         let sql = "" 
//         let result;
//         let balance;
//         let player_id = req
//         let report_data;
//         let tdate     = moment().utcOffset(330).format('YYYY-MM-DD')
//         let last_minute = moment().subtract(10, 'minutes').utcOffset(330).format("HH:mm:ss");
      
//         sql = "SELECT game_play_category.prize_pool,game_reports.category_id,game_reports.user_id,game_reports.game_report_id,game_reports.player_id,game_reports.tournament_id FROM game_reports LEFT JOIN game_play_category ON game_play_category.game_category_id =game_reports.game_play_id  WHERE  DATE(game_reports.tournament_play_date)=? AND TIME(game_reports.tournament_end_time)>=? AND game_reports.player_id =? AND game_reports.is_active =3 LIMIT 1"
//         let results = await conn.query(sql ,[tdate,last_minute,player_id]); 
         
//         if (results.length >0){   
//             let category_id = results[0].category_id  
//             if(category_id ==1){  
//                 let userId        = results[0].user_id
//                 let poolPrice     = results[0].prize_pool
//                 let tournamentId  = results[0].tournament_id 
//                 let gameReportIid = results[0].game_report_id 
//                 let users = await checkUser(userId)     
//                   sql = "SELECT wining_amount FROM users WHERE user_id=? limit ?";
//                   users = await conn.query(sql, [userId, 1]);   
//                 console.log( 'Update STATUS1' )
//                 if(users.length>0)
//                 {  
//                    let winingamount = ((users[0].wining_amount && users[0].wining_amount>0)?parseFloat(users[0].wining_amount):0)  
//                    balance = (winingamount + poolPrice) 
//                     report_data = {
//                         user_id : userId,
//                         amount  : poolPrice,
//                         is_type : 2,
//                         tournament_id:tournamentId,
//                         added_type:"Winnig Amount",
//                     } 
//                     result = await createTransactionReport(report_data)  
//                     console.log( 'Update STATUS 3 result',result )
//                     sql     = "UPDATE users Set ? WHERE user_id= ?"
//                     result  = await conn.query(sql, [{wining_amount:balance},userId]); 
//                     console.log( 'Update STATUS 4 result',result )
//                     sql = "UPDATE game_reports Set ? WHERE game_report_id = ?"
//                     result = await conn.query(sql, [{is_status:2,is_active:2}, gameReportIid]);
//                     console.log('updated status',result)
//                     if(result)
//                     {
//                         status = 200
//                     }  
//                 }  
//             }else{ 
                
//             }    
//         }else{
//             console.log( 'Update eklseresult ')
//         } 
//         return true; 
//     } catch (err) {
//         console.log(err)
//     }
// }

// const updatePoints = async (req) => {
//     try {
//         let status = 404
//         let sql = "" 
//         let result; 
//         let {player_id,score} = req 
//         let tdate     = moment().utcOffset(330).format('YYYY-MM-DD')
//         let last_minute = moment().subtract(10, 'minutes').utcOffset(330).format("HH:mm:ss");  
//         sql = "SELECT * FROm game_reports WHERE  DATE(tournament_play_date)=? AND TIME(tournament_end_time)>=? AND player_id =? AND is_active =1 LIMIT 1"
//         let results = await conn.query(sql ,[tdate,last_minute,player_id]); 
         
//         if (results.length >0){    
//             sql = "UPDATE game_reports Set ? WHERE game_report_id = ?"
//             result = await conn.query(sql, [{scores:score}, results[0].game_report_id]); 
//             if(result)
//             {
//                 status = 200
//             }       
//         } 
//         return true; 
//     } catch (err) {
//         console.log(err)
//     }
// }
 
 

// module.exports = { userExitGame,updateWinningStatus,updatePoints}