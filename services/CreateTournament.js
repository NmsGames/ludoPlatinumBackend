 
const db      = require("../config/db");
const moment  = require("moment");
let date      = moment().utcOffset(330).format("YYYY-MM-DD");
let Socket;
 function getSocketData(io){
  Socket = io; 
 }
//get prize distribution ranks
 const getPrizeDistrubtionRank = async (ID) => {
  try { 
      const sql = `SELECT winner_type.*,ranks.* FROM winner_type RIGHT JOIN ranks
      ON ranks.winner_type_id = winner_type.type_id  WHERE  ranks.game_category_id = ?`; 
      let results = await db.query(sql,[ID]);
      const catgeory = (JSON.parse(JSON.stringify(results)));
      const ranks = (results.length >0)?catgeory:null; 
      return ranks; 
  } catch (err) {
      return false;
  }
}

//get current cards
 const getCurrentCards = async (catId,tournamenId,gamepcId) => {
  try { 
    
          let rresponse ;
          const sql1 = `SELECT game_play_category.entry_fee,game_play_category.category_id,game_play_category.prize_pool,game_play_category.game_category_id,tournaments.current_time,tournaments.game_duration,tournaments.timer as timer ,tournaments.tournament_id,tournaments.category_id,tournaments.timer_end_time,tournaments.room_id ,category.category_name FROM game_play_category INNER JOIN category ON category.category_id = game_play_category.category_id INNER JOIN tournaments ON tournaments.game_pc_id = game_play_category.game_category_id where tournaments.tournament_id = ? AND tournaments.category_id = ? AND tournaments.game_pc_id = ? AND tournaments.is_active = 0  limit 1`;
          let results = await db.query(sql1, [tournamenId,catId,gamepcId]); 
 
          if(results.length>0)
          { 
		let bonusAmount = (results[0].entry_fee*5)/100
            const ranks = await getPrizeDistrubtionRank(gamepcId)   
             rresponse = {
              tournament_id   : results[0].tournament_id,
              game_play_id    : results[0].game_category_id,
              category_type_id: results[0].category_id,  
              category_name   : results[0].category_name,
              prize_pool      : results[0].prize_pool,
              game_duration   : results[0].game_duration, 
              entry_fee       : results[0].entry_fee,
              timer           : results[0].timer,
              end_timer       : results[0].timer_end_time, 
              max_winner      : ((results[0].category_id==1) || (results[0].category_id==1))?1:(results[0].category_id==3)?2:3 ,
              join_user       : 12,
	bonus_amount: bonusAmount ,
              ranks:ranks 
          }
          return rresponse; 
        } 
      
  } catch (err) {
      return false;
  }
}

const createBattleList = async (tournament_id, game_id, timer, type, cateId) => { 
  const curret_time = moment().utcOffset("+05:30").format("HH:mm:ss");
  try {
    const sql = `SELECT * FROM tournaments WHERE timer=? and ct_type = ?`;
    const results = await db.query(sql, [timer, type]);
    const endtime = moment()
      .add(timer, "minutes")
      .utcOffset(330)
      .format("HH:mm:ss");
      
      let formsData = {
        tournament_id : tournament_id,
        game_pc_id    : game_id,
        category_id   : cateId,
        game_duration : 8,
        current_date  : date, 
        timer         : timer,
        current_time  : curret_time,
        timer_end_time: endtime,
        ct_type       : type,
      };
    if (results.length > 0)
    {
        for(i= 0; i<results.length;i++)
        {
           const sql1 = `UPDATE temporary_entry_records Set ?  WHERE tournament_id = ?`;
           await db.query(sql1, [{is_active:3}, results[i].tournament_id]);    
        }
        const sql1 = `UPDATE tournaments Set ?  WHERE id = ?`;
        let responseData = await db.query(sql1, [formsData, results[0].id]);
        if(responseData)
        {  
          let responseData = await getCurrentCards(cateId,tournament_id,game_id)
          Socket.emit('OnUpdateLobbyCard', {status:200,data:responseData }) 
        }
    } else {
      const sql12 = `INSERT INTO tournaments Set ?`;
      await db.query(sql12, [formsData]);
    }
  } catch (error) {
    console.log("err", error);
  }
};

module.exports = {
    createBattleList,
    getSocketData
}