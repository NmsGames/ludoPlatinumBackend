const conn = require("../config/db.js");
const categoryTypes = require("../Utility/Constant").categoryTypes;
const {sendResponse} = require('./AppService');
let message;
let status = 404;
 
const categoryType = async () => {
    try {
        let categoryTypeArray = [];
        sql = `SELECT game_category_id as category_id,category_name as type FROM game_play_category`;
        if (categoryTypeArray.length < 1) {
            let results = await conn.query(sql);
            const catgeory = (JSON.parse(JSON.stringify(results)));
            categoryTypeArray = catgeory
        }
        return categoryTypeArray;

    } catch (err) {
        console.log(err)
    }
}

// Select tournament data

const tournamentType = async (id) => {
    try {  
        sql = `SELECT * from game_tournaments where tournament_id = ?`;
        if (id) {
            let results = await conn.query(sql,[id]);
            const tournaments = (JSON.parse(JSON.stringify(results)));
            categoryTypeArray = tournaments
            status = 200
            return sendResponse(status,"Success.",tournaments);
        }
        return sendResponse(status,"Failed.",data);

    } catch (err) {
        console.log(err)
    }
}
// const cr_tournaments 
const LudoTournament = async (data) => {
    let results = {};
    try {
        const rows = await categoryType()
        console.log(rows)
        console.log('rows[3].type', rows[3].type)
        const sql = `SELECT * FROM game_tournaments LEFT JOIN game_play_category ON game_tournaments.game_pc_id = game_play_category.game_category_id where game_pc_id = ?`;
        if (rows[0].type === data.type) {
            results = await conn.query(sql, rows[0].category_id);
        }
        else if (rows[1].type === data.type) {
            results = await conn.query(sql, [rows[1].category_id]);
        }
        else if (rows[2].type === data.type) {
            results = await conn.query(sql, [rows[2].category_id]);
        }
        else if (rows[3].type === data.type) {
            results = await conn.query(sql, [rows[3].category_id]);
        } else {
            const sql1 = `SELECT * FROM game_tournaments LEFT JOIN game_play_category ON game_tournaments.game_pc_id = game_play_category.game_category_id`;
            results = await conn.query(sql1);
        }
        const dataRows = (JSON.parse(JSON.stringify(results)));
        return dataRows
    } catch (err) {
        console.log(err)
        // debug(err);
    }
}

// Entry on tournament
const TournamentEntry = async (data) => { 
    try {   
        const rows = await tournamentType(data.tournament_id)
        if(rows.status === 200){
            sql = `INSERT INTO game_entry_reports Set ?`;
            const forms = {
                user_id: data.user_id,
                tournament_id:data.tournament_id,
                play_time:'23:12:00'
            } 
            let results = await conn.query(sql,forms);
            const tournaments = (JSON.parse(JSON.stringify(results))); 
            console.log('tournaments',tournaments)
            status = 200
            return sendResponse(status,"Success.",tournaments);
     
        }
        console.log('rows',rows)
        console.log('data',data)
        return data
    } catch (err) {
        console.log(err)
        // debug(err);
    }
}


module.exports = { LudoTournament ,TournamentEntry}