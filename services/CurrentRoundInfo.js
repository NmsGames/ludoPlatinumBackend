const conn = require("../config/db.js");

// const cr_tournaments 
const tournamenListInfo = async(req) => { 
    try{
        sql = `SELECT * FROM game_tournaments LEFT JOIN game_play_category
        ON game_tournaments.game_pc_id = game_play_category.game_category_id`;
        let results  = await db.query(sql);
        console.log(results)
        // if(results.affectedRows === 1) return true;
        // else return false;
    } catch (err){
        console.log(err)
        // debug(err);
    }   
}


module.exports = {tournamenListInfo}