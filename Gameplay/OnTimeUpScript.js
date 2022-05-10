const conn = require("../config/db");
const { sendResponse } = require("../services/AppService");
const moment = require("moment");
const crypto = require("crypto");

const createTransactionReport = async (req) => {
  let message;
  let status = 404;
  let data = {};
  let sql = "";
  let results;
  let forms = {};
  try { 
    sql = "SELECT * FROM transactions WHERE user_id =? and tournament_id =? AND is_type =2 LIMIT 1";
    results = await conn.query(sql, [req.user_id, req.tournament_id]);
    forms = {
      user_id   : req.user_id,
      order_id  : crypto.randomBytes(8).toString("hex"),
      txn_id    : crypto.randomBytes(12).toString("hex"),
      tournament_id: req.tournament_id,
      currency  : "INR",
      txn_amount: `+${req.amount}`,
      txn_date  : moment().utcOffset(330).format("YYYY-MM-DD"),
      txn_time  : moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      banktxn_id: 1,
      added_type: req.added_type,
      gateway_name: "Local Wallet",
      local_txn_id: `LTD${moment().utcOffset(330).format("YYYYMMDDHHmmss")}`,
      payment_mode: "WALLET",
      banktxn_id: `${moment().utcOffset(330).format("MMDDHHmmss")}${req.user_id}`,
      status: 1,
      is_type: 2,
    };
    if (!(results.length > 0)) 
    { 
      sql = "INSERT INTO transactions Set ?";
      results = await conn.query(sql, forms);
    } 
    return sendResponse(status, message, data);
  } catch (err) {
    console.log(err);
  }
};

const OnTimeUpdateWin = async (data) => {
  try {
    let sql = "";
    let userResponse = data;
    userResponse.sort(function (a, b) {
      return -a.score + b.score;
    });
    let users;
    let result;
    //Update rest of users or Players
    if (userResponse.length > 0) {
      for (j = 0; j < userResponse.length; j++) 
      {
        sql = "SELECT * FROM game_reports WHERE DATE(tournament_play_date)= CURDATE() AND tournament_id =? AND player_id =? AND is_active = 1 LIMIT 1";
        responseData = await conn.query(sql, [ userResponse[j].tournament_id, userResponse[j].playerId]);
        //Array must not be empty
        if (responseData.length > 0) 
        {
          //Select Events
          sql               = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
          users             = await conn.query(sql, [responseData[0].user_id, 1]);
          let category_id   = responseData[0].category_id;
          let tournament_id = responseData[0].tournament_id;
          let rankPlayId    = responseData[0].game_play_id;

          sql         = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
          ranksData   = await conn.query(sql, [rankPlayId]);
         
          let winAmnt = users[0].wining_amount && users[0].wining_amount > 0 ? parseFloat(users[0].wining_amount) : 0;
          let balance = winAmnt + (ranksData[j].prize_distrubution ? ranksData[j].prize_distrubution : 0);
          sql     = "UPDATE users Set ? WHERE user_id = ?";
          result  = await conn.query(sql, [{ wining_amount: balance }, users[0].user_id]);
          switch (category_id) {
            case 1:
              if(j==0){
                let win_data = {
                  user_id : users[0].user_id,
                  amount  : ranksData[j].prize_distrubution ? ranksData[j].prize_distrubution: 0,
                  is_type : 2,
                  tournament_id: tournament_id,
                  added_type: "wON",
                };
                await createTransactionReport(win_data);
              }
              
              break;
            case 2:
              if(j==0)
              {
                let win_data = {
                  user_id : users[0].user_id,
                  amount  : ranksData[j].prize_distrubution ? ranksData[j].prize_distrubution: 0,
                  is_type : 2,
                  tournament_id: tournament_id,
                  added_type: "wON",
                };
                await createTransactionReport(win_data);
              }
              break;
              /**
               * Category
               */
              case 3:
                if(j<2){
                  let win_data = {
                    user_id : users[0].user_id,
                    amount  : ranksData[j].prize_distrubution ? ranksData[j].prize_distrubution: 0,
                    is_type : 2,
                    tournament_id: tournament_id,
                    added_type: "wON",
                  };
                  await createTransactionReport(win_data);
                }
                break;
              case 4:
                if(j<3){
                  let win_data = {
                    user_id : users[0].user_id,
                    amount  : ranksData[j].prize_distrubution ? ranksData[j].prize_distrubution: 0,
                    is_type : 2,
                    tournament_id: tournament_id,
                    added_type: "wON",
                  };
                  await createTransactionReport(win_data);
                }
                break; 
          } 
          continue;
        }
        continue;
      }
    }
    return true;
  } catch (err) {
    console.log(err);
  }
};
/**
 * 
 * On Game Finised
 */
const OnGameFinishedUpdateWinAmounts = async (data) => {
  try {
    let sql = ""; 
    let {user_id,tournament_id,isWon} = data;  
    let users;
    let result;
    sql = "SELECT * FROM game_reports WHERE DATE(tournament_play_date)= CURDATE() AND tournament_id =? AND user_id =? AND is_active = 1 LIMIT 1";

    responseData = await conn.query(sql, [ tournament_id, user_id]);
    if (responseData.length > 0) 
    {
      switch (responseData[0].category_id) {
        case 1:
          /**
           * Select Current winner user
           * Details
           */
          sql = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
          users = await conn.query(sql, [responseData[0].user_id, 1]);
          
          /**
           * Select Winning prize pool
           * Details
           */
          sql ="SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
          ranksData = await conn.query(sql, [responseData[0].game_play_id]); 
          if (users.length > 0) {
            //update winining amount
            let winingamount = users[0].wining_amount && users[0].wining_amount > 0 ? parseFloat(users[0]. wining_amount) : 0;
            let balance = winingamount + (ranksData[0].prize_distrubution ? ranksData[0].prize_distrubution :  0);
            sql = "UPDATE users Set ? WHERE user_id= ?";
            result = await conn.query(sql, [ { wining_amount: balance },  users[0].user_id]);
            let win_data = { 
              user_id : users[0].user_id,
              amount  : ranksData[0].prize_distrubution ? ranksData[0].prize_distrubution  : 0,
              is_type : 2,
              added_type: "wON",
              tournament_id: tournament_id
            };
            await createTransactionReport(win_data);
            sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
            result = await conn.query(sql, [{ is_status: 2, is_active: 2 }, responseData[0].game_report_id]);
            
          }
          break;
        case 2:
            /**
             * Select Current winner user
             * Details
             */
            sql = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
            users = await conn.query(sql, [responseData[0].user_id, 1]);
  
            /**
             * Select Winning prize pool
             * Details
             */
            sql ="SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
            ranksData = await conn.query(sql, [responseData[0].game_play_id]);
           
            let isType    = 2;
            let winStatus = 2;
            if (users.length > 0) 
            {
              //update winining amount
              let winAmnt   = users[0].wining_amount && users[0].wining_amount > 0 ? parseFloat(users[0]. wining_amount): 0;
              let balance   = winAmnt + (ranksData[0].prize_distrubution ? ranksData[0].prize_distrubution :  0);
              sql           = "UPDATE users Set ? WHERE user_id= ?";
              result        = await conn.query(sql, [ { wining_amount: balance },  users[0].user_id]);
              let win_data  = { 
                user_id : users[0].user_id,
                amount  : ranksData[0].prize_distrubution ? ranksData[0].prize_distrubution  : 0,
                is_type : isType,
                added_type: "wON",
                tournament_id: tournament_id
              };
              await createTransactionReport(win_data);
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result = await conn.query(sql, [{ is_status: winStatus, is_active: winStatus }, responseData[0].game_report_id]); 
            }
            break; 
      } 
    } 
    return true;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { OnTimeUpdateWin, OnGameFinishedUpdateWinAmounts };
