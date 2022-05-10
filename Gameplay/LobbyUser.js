const conn = require("../config/db");
const { sendResponse } = require("../services/AppService");
const moment = require("moment");
const crypto = require("crypto");
 /**
  * 
  * @param {*} req 
  * @returns 
  * Create transaction report
  */
const createTransactionReport = async (req) => {
  let message;
  let status  = 404;
  let data    = {};
  let sql     = "";
  let results;
  let forms   = {};
  try { 
    sql = "SELECT * FROM transactions WHERE user_id =? and tournament_id =? AND is_type =2 LIMIT 1";
    results = await conn.query(sql, [req.user_id, req.tournament_id]);
    if (!(results.length > 0)) {
      forms = {
        user_id     : req.user_id,
        order_id    : crypto.randomBytes(8).toString("hex"),
        txn_id      : crypto.randomBytes(12).toString("hex"),
        currency    : "INR",
        txn_amount  :  `+${req.amount}`,
        txn_date    : moment().utcOffset(330).format("YYYY-MM-DD"),
        txn_time  : moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        banktxn_id  : 1,
        added_type  : req.added_type,
        gateway_name: "Local Wallet",
        local_txn_id: `LTD${moment().utcOffset(330).format("YYYYMMDDHHmmss")}`,
        payment_mode: "WALLET",
        banktxn_id  : `${moment().utcOffset(330).format("MMDDHHmmss")}${req.user_id}`,
        status      : 1,
        is_type     : 2,
        tournament_id: req.tournament_id,
      };
      sql = "INSERT INTO transactions Set ?";
      results = await conn.query(sql, forms);
    }
    
    return sendResponse(status, message, data);
  } catch (err) {
   return 5000
  }
};
const userExitGame = async (req) => {
  try {
    let sql     = ""; 
    let winAmnt = 0;
    let result;
    let balance; 
    let {user_id,tournament_id} = req;    
    sql         = "SELECT * FROM game_reports WHERE DATE(tournament_play_date)= CURDATE() AND tournament_id =? AND user_id =? AND is_active =1 LIMIT 1";
    let results = await conn.query(sql, [tournament_id, user_id]);

    if (results.length > 0) {
      let room_id       = results[0].room_id;
      let userID        = results[0].user_id;
      let category_id   = results[0].category_id;
      let rankPlayId    = results[0].game_play_id;
      let tournament_id = results[0].tournament_id;
      let game_report_id= results[0].game_report_id;
      let rankResponse;
      let responseData;
      let gameResponse;
      let updateResponse;
      let userResponse; 
      let win_data; 
      switch (category_id) {
        case 1: 
        sql = "SELECT * FROM game_reports  WHERE  DATE(tournament_play_date)= CURDATE() AND tournament_id=? AND room_id=? AND category_id =? AND is_active =1 LIMIT 2";
          results = await conn.query(sql, [tournament_id, room_id,category_id]);

          switch (results.length)
          { 
            case 2:
              // await createTransactionReport(losetData);
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              updateResponse = await conn.query(sql, [
                { is_status: 3, is_active: 3 },
                game_report_id,
              ]);
              if (updateResponse) 
              {
                status = 200;
                sql    = "SELECT * FROM game_reports  WHERE  DATE(tournament_play_date)= CURDATE() AND tournament_id=? AND room_id=? AND category_id =? AND is_active =1 LIMIT 1";
                gameResponse = await conn.query(sql, [
                  tournament_id,
                  room_id,
                  category_id,
                ]);
                if (gameResponse.length > 0) 
                {
                  sql = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
                  userResponse = await conn.query(sql, [gameResponse[0].user_id, 1,]); 
                  //get rank data
                  sql = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
                  rankResponse = await conn.query(sql, [rankPlayId]); 
                  if (userResponse.length > 0) 
                  {
                    //update winining amount
                    winAmnt = userResponse[0].wining_amount && userResponse[0].wining_amount > 0 ?  parseFloat(userResponse[0].wining_amount): 0;
                    balance = winAmnt + (rankResponse[0].prize_distrubution ? rankResponse[0].prize_distrubution: 0);
                    sql = "UPDATE users Set ? WHERE user_id= ?";
                    result = await conn.query(sql, [
                      { wining_amount: balance },
                      userResponse[0].user_id,
                    ]);
                  }
                  win_data = {
                    user_id : userResponse[0].user_id,
                    amount  : rankResponse[0].prize_distrubution ? rankResponse[0].prize_distrubution: 0,
                    is_type : 2,
                    tournament_id: tournament_id,
                    added_type: "Won",
                  };
                  await createTransactionReport(win_data);
                  sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
                  result = await conn.query(sql, [
                    { is_status: 2, is_active: 2 },
                    gameResponse[0].game_report_id,
                  ]);
                }
              }
              break;
            case 1:
              //select ranks
              sql     = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
              result  = await conn.query(sql, [rankPlayId]);
              //check users
              sql     = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
              users   = await conn.query(sql, [userID, 1]);
              if (users.length > 0) {
                //update winining amount
                winAmnt = users[0].wining_amount && users[0].wining_amount > 0 ? parseFloat(users[0].wining_amount) : 0;
                balance = winAmnt + (result[0].prize_distrubution ? result[0].prize_distrubution : 0);
                sql     = "UPDATE users Set ? WHERE user_id= ?";
                result = await conn.query(sql, [{ wining_amount: balance },users[0].user_id]);
              }
              win_data = {
                user_id   : userID,
                amount    : result[0].prize_distrubution ? result[0].prize_distrubution : 0,
                is_type   : 2,
                added_type: "Won",
                tournament_id: tournament_id,
              };
              await createTransactionReport(win_data);
              break;
          }
          break;
        case 2:
          sql = "SELECT * FROM game_reports  WHERE  DATE(tournament_play_date)= CURDATE() AND tournament_id=? AND room_id=? AND category_id =? AND is_active =1 LIMIT 4";
          results = await conn.query(sql, [tournament_id,room_id,
            category_id,
          ]);

          switch (results.length) 
          {
            case 4: 
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?"; 
              updateResponse = await conn.query(sql, [{ is_status: 3, is_active: 3 },game_report_id]);
            
              break;
            case 3: 
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result = await conn.query(sql, [{ is_status: 3, is_active: 3 },game_report_id]);
              
              break;
            case 2: 

              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result = await conn.query(sql, [ { is_status: 3, is_active: 3 }, game_report_id]);
              if (result) 
              { 
                sql         =  "SELECT * FROM game_reports  WHERE  DATE(tournament_play_date)= CURDATE() AND tournament_id=? AND room_id=? AND category_id =? AND is_active =1 LIMIT 1";
                gameResponse = await conn.query(sql, [tournament_id,room_id,category_id]);

                if (gameResponse.length > 0) {
                  sql           = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
                  userResponse  = await conn.query(sql, [ gameResponse[0].user_id, 1]);
                  //get rank data
                  sql           =  "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
                  rankResponse  = await conn.query(sql, [rankPlayId]);
                  if (userResponse.length > 0) {
                    //update winining amount
                    winAmnt = userResponse[0].wining_amount && userResponse[0].wining_amount > 0 ? parseFloat (userResponse[0].wining_amount) : 0;
                    balance = winAmnt + (rankResponse[0].prize_distrubution ? rankResponse[0]. prize_distrubution : 0);

                    sql = "UPDATE users Set ? WHERE user_id= ?";
                    result = await conn.query(sql, [ { wining_amount: balance }, userResponse[0].user_id]);
                  }
                  win_data = {
                    user_id   : userID,
                    amount    : rankResponse[0].prize_distrubution ? rankResponse[0].prize_distrubution: 0,
                    is_type   : 2,
                    added_type: "Won",
                    tournament_id: tournament_id,
                  };
                  await createTransactionReport(win_data);
                  sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
                  result = await conn.query(sql, [  { is_status: 2, is_active: 2 }, gameResponse[0]. game_report_id]);
                }
              }
              break;
            // case 1:
            //   //select ranks
            //   sql = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
            //   rankResponse = await conn.query(sql, [category_id]);
            //   //check users
            //   sql =
            //     "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
            //   users = await conn.query(sql, [userID, 1]);
            //   if (users.length > 0) {
            //     //update winining amount
            //     winAmnt =
            //       users[0].wining_amount && users[0].wining_amount > 0
            //         ? parseFloat(users[0].wining_amount)
            //         : 0;
            //     balance =
            //       winAmnt +
            //       (rankResponse[0].prize_distrubution
            //         ? rankResponse[0].prize_distrubution
            //         : 0);
            //     sql = "UPDATE users Set ? WHERE user_id= ?";
            //     result = await conn.query(sql, [
            //       { wining_amount: balance },
            //       users[0].user_id,
            //     ]);
            //   }
            //   win_data = {
            //     user_id: users[0].user_id,
            //     amount: rankResponse[0].prize_distrubution
            //       ? rankResponse[0].prize_distrubution
            //       : 0,
            //     is_type: 2,
            //     tournament_id: tournament_id,
            //     added_type: "Won",
            //   };
            //   await createTransactionReport(win_data);
            //   break;
          }
          break;
        case 3:
          sql = "SELECT * FROM game_reports  WHERE  DATE(tournament_play_date)= CURDATE() AND tournament_id=? AND room_id=? AND category_id =? AND is_active =1 LIMIT 4";  
          results = await conn.query(sql, [ tournament_id, room_id,category_id]);

          switch (results.length)
          {
            case 4: 
            //update game status
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result = await conn.query(sql, [ { is_status: 3, is_active: 3 }, game_report_id]);
               
              break;
            case 3: 
            
              //update Status  report
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result = await conn.query(sql, [ { is_status: 3, is_active: 3 },  game_report_id]);
              
              break;
            case 2:
              //get tanks data
              sql           = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
              rankResponse  = await conn.query(sql, [rankPlayId]);  
              //check users
              sql           = "SELECT wining_amount as win,user_id FROM users WHERE user_id=? limit ?";
              userResponse  = await conn.query(sql, [userID, 1]);
              if (userResponse.length > 0)
              {
                //update winining amount
                winAmnt = userResponse[0].win && userResponse[0].win > 0 ? parseFloat(userResponse[0].win) : 0;
                balance = (winAmnt + (rankResponse[1].prize_distrubution ? rankResponse[1].prize_distrubution : 0)).toFixed(2); 

                sql = "UPDATE users Set ? WHERE user_id= ?";
                result = await conn.query(sql, [{ wining_amount: balance },userResponse[0].user_id]);
              }
              win_data = {
                user_id   : userID,
                amount    :  rankResponse[1].prize_distrubution ? rankResponse[1].prize_distrubution : 0,
                is_type   : 2,
                added_type: "Won",
                tournament_id: tournament_id,
              };
              //create winner report
              await createTransactionReport(win_data);
              sql     = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result  = await conn.query(sql, [{ is_status: 2, is_active: 2 },game_report_id]);

              if (result)
              { 
                sql         = "SELECT * FROM game_reports  WHERE  DATE(tournament_play_date)= CURDATE() AND tournament_id=? AND room_id=? AND is_active =1 LIMIT 1";
                gameResponse = await conn.query(sql, [ tournament_id,room_id]);

                if (gameResponse.length > 0)
                {
                    sql           = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
                    userResponse  = await conn.query(sql, [gameResponse[0].user_id,1]);

                  if (userResponse.length > 0) 
                  { 
                    //update winining amount
                    winAmnt = userResponse[0].wining_amount && userResponse[0].wining_amount > 0 ? parseFloat(userResponse[0].wining_amount) : 0;
                    balance =  winAmnt + (rankResponse[0].prize_distrubution ? rankResponse[0]. prize_distrubution : 0);

                    sql     = "UPDATE users Set ? WHERE user_id= ?";
                    result  = await conn.query(sql, [ { wining_amount: balance }, userResponse[0].user_id]);
                  }
                  win_data = {
                    user_id   : gameResponse[0].user_id,
                    amount    : rankResponse[0].prize_distrubution ? rankResponse[0].prize_distrubution : 0,
                    is_type   : 2,
                    added_type: "Won",
                    tournament_id: tournament_id,
                  };
                  await createTransactionReport(win_data);
                  sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
                  result = await conn.query(sql,[{ is_status: 2, is_active: 2 },gameResponse[0].game_report_id]);
                }
              }
              break;
            case 1:
              //select ranks
              sql           = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
              rankResponse  = await conn.query(sql, [rankPlayId]); 
              //check users
              sql = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
              userResponse = await conn.query(sql, [userID, 1]);

              if (userResponse.length > 0) 
              {
                //update winining amount
                winAmnt = userResponse[0].wining_amount && userResponse[0].wining_amount > 0 ? parseFloat(userResponse[0].wining_amount) : 0;
                balance =  winAmnt + (rankResponse[0].prize_distrubution ? rankResponse[0].prize_distrubution : 0);
                sql = "UPDATE users Set ? WHERE user_id= ?";
                result = await conn.query(sql, [
                  { wining_amount: balance },
                  userResponse[0].user_id,
                ]);
              }
              win_data = {
                user_id   : userID,
                amount    : rankResponse[0].prize_distrubution ? rankResponse[0].prize_distrubution : 0,
                is_type   : 2,
                added_type: "Won",
                tournament_id: tournament_id,
              };
              await createTransactionReport(win_data);
              break;
          }
          break;
        case 4:
          sql = "SELECT * FROM game_reports  WHERE  DATE(tournament_play_date)= CURDATE() AND tournament_id=? AND room_id=? AND is_active =1 LIMIT 4";

          results = await conn.query(sql, [
            tournament_id,
            room_id 
          ]);
          switch (results.length) 
          {
            case 4:
              //update reports 
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result = await conn.query(sql, [{ is_status: 3, is_active: 3 },game_report_id]);
            
              break;
            case 3:
              //get tanks data
              sql = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
              rankResponse = await conn.query(sql, [rankPlayId]); 

              //check users
              sql = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
              userResponse = await conn.query(sql, [userID, 1]);
              if (userResponse.length > 0)
              {
                //update winining amount
                winAmnt =  userResponse[0].wining_amount &&  userResponse[0].wining_amount > 0 ? parseFloat(users[0].wining_amount) : 0;
                balance = winAmnt + (rankResponse[2].prize_distrubution ? rankResponse[2].prize_distrubution : 0);
                sql = "UPDATE users Set ? WHERE user_id= ?";
                result = await conn.query(sql, [
                  { wining_amount: balance },
                  userResponse[0].user_id,
                ]);
              }
              win_data = {
                user_id   : userID,
                amount    : rankResponse[2].prize_distrubution ? rankResponse[2].prize_distrubution : 0,
                is_type   : 2,
                added_type: "Won",
                tournament_id: tournament_id,
              };
              await createTransactionReport(win_data);
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result = await conn.query(sql, [{ is_status: 2, is_active: 2 },game_report_id]);
              
            case 2:

              //get tanks data
              sql = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
              rankResponse = await conn.query(sql, [rankPlayId]);

              //check users
              sql = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
              userResponse = await conn.query(sql, [userID, 1]);
              if (userResponse.length > 0) 
              {
                //update winining amount
                winAmnt = userResponse[0].wining_amount && userResponse[0].wining_amount > 0  ? parseFloat(users[0].wining_amount) : 0;
                balance =  winAmnt + (rankResponse[1].prize_distrubution ? rankResponse[1].prize_distrubution  : 0);
                sql = "UPDATE users Set ? WHERE user_id= ?";
                result = await conn.query(sql, [{ wining_amount: balance }, userResponse[0].user_id]);
              }
              win_data = {
                user_id   : userID,
                amount    : rankResponse[1].prize_distrubution ? rankResponse[1].prize_distrubution : 0,
                is_type   : 2,
                added_type: "Won",
                tournament_id: tournament_id,
              };
              await createTransactionReport(win_data);
              sql = "UPDATE game_reports Set ? WHERE game_report_id = ?";
              result = await conn.query(sql, [ { is_status: 2, is_active: 2 },game_report_id]);
              if (result)
              {
                status  = 200;
                sql     = "SELECT * FROM game_reports  WHERE  DATE(tournament_play_date)= CURDATE() AND tournament_id=? AND room_id=? AND is_active =1 LIMIT 1";
                gameResponse = await conn.query(sql, [ tournament_id, room_id ]);
                if (gameResponse.length > 0)
                {
                  sql   = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
                  userResponse = await conn.query(sql, [gameResponse[0].user_id, 1]);
                  if (userResponse.length > 0) 
                  {
                    //update winining amount
                    winAmnt  =  userResponse[0].wining_amount && userResponse[0].wining_amount > 0 ? parseFloat(userResponse[0].wining_amount) : 0;
                    balance  =  winAmnt + (rankResponse[0].prize_distrubution ? rankResponse[0]. prize_distrubution : 0);

                    sql     = "UPDATE users Set ? WHERE user_id= ?";
                    result  = await conn.query(sql, [ { wining_amount: balance },  userResponse[0].user_id]);
                  }
                  win_data = {
                    user_id   : userResponse[0].user_id,
                    amount    : rankResponse[0].prize_distrubution ? rankResponse[0].prize_distrubution : 0,
                    is_type   : 2,
                    added_type: "Won",
                    tournament_id: tournament_id,
                  };
                  await createTransactionReport(win_data);
                  sql     = "UPDATE game_reports Set ? WHERE game_report_id = ?";
                  result  = await conn.query(sql, [{ is_status: 2, is_active: 2 },gameResponse[0].game_report_id]);
                }
              }
              break;
            case 1:
              //select ranks
              sql     = "SELECT * FROM `ranks` WHERE game_category_id =? order by winner_type_id";
              result  = await conn.query(sql, [rankPlayId]);

              //check users
              sql = "SELECT wining_amount,user_id FROM users WHERE user_id=? limit ?";
              users = await conn.query(sql, [userID, 1]);
              if (users.length > 0) 
              {
                //update winining amount
                winAmnt =  users[0].wining_amount && users[0].wining_amount > 0 ? parseFloat(users[0]. wining_amount) : 0;
                balance = winAmnt + (result[0].prize_distrubution ? result[0].prize_distrubution : 0);

                sql     = "UPDATE users Set ? WHERE user_id= ?";
                result  = await conn.query(sql, [{ wining_amount: balance }, users[0].user_id]);
              }
              win_data = {
                user_id : userID,
                amount  : result[0].prize_distrubution ? result[0].prize_distrubution : 0,
                is_type : 2,
                added_type: "Won",
                tournament_id: tournament_id,
              };
              await createTransactionReport(win_data);
              break;
          }
          break;
      }
    }

    return true;
  } catch (err) {
    console.log(err);
  }
};

 
module.exports = { userExitGame };
