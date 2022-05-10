var cron = require("node-cron");
const moment = require("moment");
let {createBattleList} =require('./CreateTournament')

let tournament_id;
let game_pc_id;
let timer;
let type;
let game_category_id;

/**
 * 2 Players 
 * in 1 Winners
 */
/**
 * @ rajendra
 * 2 players 1 Winners
 * display time 1 min
 */
cron.schedule("00 */1 * * * *", function () {
  let time      = moment().format("YYMM");
  let random    = Math.floor(100000 + Math.random() * 999999);
  tournament_id = `14${random}${time}`;
  game_pc_id    = 1;
  timer         = 1;
  type          = "1101";
  game_category_id = 1;
  createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
});

cron.schedule("55 */1 * * * *", function () {
  let time      = moment().format("YYMM");
  let random    = Math.floor(100000 + Math.random() * 999999);
  tournament_id = `55${random}${time}`;
  game_pc_id    = 25;
  timer         = 1;
  type          = "1155";
  game_category_id = 1;
  createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
});

/** 1 Winners 4 players */

/** END */
cron.schedule("42 */2 * * * *", function () {
  let time        =  moment().format("YYMM");
  let random      = Math.floor(10000 + Math.random() * 99999);
  tournament_id   = `42${random}${time}`;
  game_pc_id      = 27;
  game_category_id = 1;
  timer            = 2
  type             = '421'
  createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
});
 cron.schedule("03 */1 * * * *", function () {
  let time      = moment().format("YYMM");
  let random    = Math.floor(100000 + Math.random() * 999999);
  tournament_id = `13${random}${time}`;
  game_pc_id    = 3;
  timer         = 1;
  type          = "1103";
  game_category_id = 1;
  createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
});
cron.schedule("02 */2 * * * *", function () {
    let time        =  moment().format("YYMM");
    let random      = Math.floor(100000 + Math.random() * 999999);
    tournament_id   = `12${random}${time}`;
    game_pc_id      = 4;
    game_category_id = 1;
    timer            = 2
    type             = '1104'
    createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
 });

 
cron.schedule("08 */1 * * * *", function () {
    let time        =  moment().format("YYMM");
    let random      = Math.floor(100000 + Math.random() * 999999);
    tournament_id   = `3${random}${time}`;
    game_pc_id      = 2;
    game_category_id = 1;
    timer            = 1
    type             = '1106'
    createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
 });
 cron.schedule("09 */2 * * * *", function () {
  let time      = moment().format("YYMM");
  let random    = Math.floor(100000 + Math.random() * 999999);
  tournament_id = `11${random}${time}`;
  game_pc_id    = 10;
  timer         = 2;
  type          = "1107";
  game_category_id = 1;
  createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
});
 
 cron.schedule("12 */2 * * * *", function () {
  let time      = moment().format("YYMM");
  let random    = Math.floor(10000 + Math.random() * 99999);
  tournament_id = `1${random}${time}`;
  game_pc_id    = 11;
  timer         = 2;
  type          = "1108";
  game_category_id = 1;
  createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
});
 
 cron.schedule("16 */2 * * * *", function () {
  let time      = moment().format("YYMM");
  let random    = Math.floor(100000 + Math.random() * 999999);
  tournament_id = `7${random}${time}`;
  game_pc_id    = 12;
  timer         = 2;
  type          = "114";
  game_category_id = 1;
  createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
});
 
 cron.schedule("17 */3 * * * *", function () {
  let time      = moment().format("YYMM");
  let random    = Math.floor(100000 + Math.random() * 999999);
  tournament_id = `2${random}${time}`;
  game_pc_id    = 13;
  timer         = 3;
  type          = "1210";
  game_category_id = 1;
  createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
});
cron.schedule("01 */3 * * * *", function () {
    let time        =  moment().format("YYMM");
    let random      = Math.floor(10000 + Math.random() * 99999);
    tournament_id   = `54${random}${time}`;
    game_pc_id      = 14;
    game_category_id = 1;
    timer            = 3
    type             = '1234'
    createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
 });
 
cron.schedule("20 */3 * * * *", function () {
    let time        =  moment().format("YYMM");
    let random      = Math.floor(10000 + Math.random() * 99999);
    tournament_id   = `8${random}${time}`;
    game_pc_id      = 15;
    game_category_id = 1;
    timer            = 3
    type             = '120'
    createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
 });

 cron.schedule("20 */3 * * * *", function () {
  let time        =  moment().format("YYMM");
  let random      = Math.floor(10000 + Math.random() * 99999);
  tournament_id   = `80${random}${time}`;
  game_pc_id      = 24;
  game_category_id = 1;
  timer            = 3
  type             = '321'
  createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
});

cron.schedule("20 */1 * * * *", function () {
  let time        =  moment().format("YYMM");
  let random      = Math.floor(10000 + Math.random() * 99999);
  tournament_id   = `81${random}${time}`;
  game_pc_id      = 26;
  game_category_id = 1;
  timer            = 1
  type             = '450'
  createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
});
cron.schedule("20 */1 * * * *", function () {
  let time        =  moment().format("YYMM");
  let random      = Math.floor(10000 + Math.random() * 99999);
  tournament_id   = `9${random}${time}`;
  game_pc_id      = 23;
  game_category_id = 1;
  timer            = 1
  type             = '40'
  createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
});

/** 1 Winners 4 players */
  cron.schedule("06 */1 * * * *", function () {
    let time      = moment().format("YYMM");
    let random    = Math.floor(100000 + Math.random() * 999999);
    tournament_id = `170${random}${time}`;
    game_pc_id    = 18;
    timer         = 1;
    type          = "111";
    game_category_id = 2;
    createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
  });

  cron.schedule("33 */1 * * * *", function () {
    let time      = moment().format("YYMM");
    let random    = Math.floor(100000 + Math.random() * 999999);
    tournament_id = `19${random}${time}`;
    game_pc_id    = 19;
    timer         = 1;
    type          = "19";
    game_category_id = 2;
    createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
  });

  cron.schedule("35 */1 * * * *", function () {
    let time      = moment().format("YYMM");
    let random    = Math.floor(100000 + Math.random() * 999999);
    tournament_id = `20${random}${time}`;
    game_pc_id    = 20;
    timer         = 1;
    type          = "111";
    game_category_id = 2;
    createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
  });

  cron.schedule("37 */2 * * * *", function () {
    let time      = moment().format("YYMM");
    let random    = Math.floor(100000 + Math.random() * 999999);
    tournament_id = `21${random}${time}`;
    game_pc_id    = 21;
    timer         = 2;
    type          = "21";
    game_category_id = 2;
    createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
  });

  cron.schedule("39 */2 * * * *", function () {
    let time      = moment().format("YYMM");
    let random    = Math.floor(100000 + Math.random() * 999999);
    tournament_id = `39${random}${time}`;
    game_pc_id    = 22;
    timer         = 2;
    type          = "39";
    game_category_id = 2;
    createBattleList(tournament_id, game_pc_id, timer, type, game_category_id);
  });
  cron.schedule("29 */1 * * * *", function () {
    let time        =  moment().format("YYMM");
    let random      = Math.floor(10000 + Math.random() * 99999);
    tournament_id   = `15${random}${time}`;
    game_pc_id      = 5;
    game_category_id = 2;
    timer            = 1
    type             = '55'
    createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
  });
  cron.schedule("30 */1 * * * *", function () {
    let time        =  moment().format("YYMM");
    let random      = Math.floor(10000 + Math.random() * 99999);
    tournament_id   = `10${random}${time}`;
    game_pc_id      = 17;
    game_category_id = 2;
    timer            = 1
    type             = '121'
    createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
  });
/**END */
// cron.schedule("02 */1 * * * *", function () {
//     let time        =  moment().format("YYMM");
//     let random      = Math.floor(10000 + Math.random() * 99999);
//     tournament_id   = `102${random}${time}`;
//     game_pc_id      = 2;
//     game_category_id = 1;
//     timer           = 2;
//     type            = '1102';
//     createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
// });

// cron.schedule("03 */3 * * * *", function () {
//     let time        =  moment().format("YYMM"); 
//     let random      = Math.floor(10000 + Math.random() * 99999);
//     tournament_id   = `101${random}${time}`; 
//     game_pc_id      = 1;
//     timer            = 3
//     type             = '1101'
//     game_category_id  = 1;
//     console.log(room,'tpir')
//     createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
// });

// // 1 winner tournaments
// cron.schedule("06 */1 * * * *", function () {
//     let time        =  moment().format("YYMM"); 
//     let random      = Math.floor(10000 + Math.random() * 99999);
//     tournament_id   = `115${random}${time}`; 
//     game_pc_id  = 5;
//     game_category_id  = 2;
//     timer       = 1
//     type        = '1105' 
//     createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
//  });

//Two winner
// cron.schedule("08 */3 * * * *", function () {
//   let time = moment().format("YYMM");
//   let random = Math.floor(10000 + Math.random() * 99999);
//   tournament_id = `126${random}${time}`;
//   game_pc_id = 6;
//   game_category_id = 3;
//   timer = 3;
//   type = "1126";
//   createBattleList(tournament_id, game_pc_id,timer,type,game_category_id);
// });
// cron.schedule("11 */1 * * * *", function () {
//     let time        =  moment().format("YYMM"); 
//     let random      = Math.floor(10000 + Math.random() * 99999);
//     tournament_id   = `127${random}${time}`; 
//     game_pc_id  = 7;
//     game_category_id  = 3;
//     timer       = 1;
//     type        = '1127'; 
//     createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
// });

//3 Winners
// cron.schedule("13 */4 * * * *", function () {
//     let time        =  moment().format("YYMM"); 
//     let random      = Math.floor(10000 + Math.random() * 99999);
//     tournament_id   = `138${random}${time}`; 
//     game_pc_id       = 8;
//     game_category_id = 4;
//     timer            = 4
//     type             = '1138' 
//     createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
// });


// cron.schedule("15 */3 * * * *", function () {
//     let time        =  moment().format("YYMM"); 
//     let random      = Math.floor(10000 + Math.random() * 99999);
//     tournament_id   = `139${random}${time}`; 
//     game_pc_id      = 9;
//     timer           = 3
//     game_category_id= 4;
//     type        = '1139' 
//     createBattleList(tournament_id, game_pc_id,timer,type,game_category_id)
// });
