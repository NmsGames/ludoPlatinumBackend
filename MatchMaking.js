const commonVar = require('./Utility/Constant').commonVar;
const socketEvents = require('./Utility/Constant').gameplayEvents;
const CreateRoom = require('./CreateRoom');
const Log = require('debug')('matchmaking');

//max players 
let twoPlayers = [];
let fourPlayers = [];
let checkTwoPlayerData = [];
let checkFourPlayerData = [];
function AddPlayer(object) {
    Log("matchmaking...");
    Log("Player info ")
    let data=object.data
 if (data[commonVar.players] === 2) { 
        let l = {
            playerId: object.playerId,
            username: object.username,
            user_id: data.user_id,
            players: 2,
            tournament_id:data.tournament_id,
            max_winner: 1,
            balance: 1000
          }
        checkTwoPlayerData.push({user_id:data.user_id,tournament_id:data.tournament_id,object:object,twoPlayers:l}) 
        let result ;
        if(checkTwoPlayerData.length>1){
            result = Object.values(checkTwoPlayerData.reduce((a, curr)=>{
                (a[curr.tournament_id] = a[curr.tournament_id] || []).push(curr);
                return a;
            },{}));

            let ids =[];
            let i = 0;
            for(i; i <result.length;i++){
                if(result[i].length>1){
                    let m=0;
                    for(m; m <result[i].length;m++)
                    {  
                        ids.push(result[i][m]['user_id'])
                        AddPlayerData(twoPlayers, result[i][m].object, 2);
                    }
                }
                
            }
            if(ids.length>0){
                checkTwoPlayerData = checkTwoPlayerData.filter(function(i){
                    return ids.indexOf(i.user_id) === -1;
                });
            } 
        }
        // console.log(checkTwoPlayerData,'checkTwoPlayerData  data[commonVar.players] ',data[commonVar.players])
        // AddPlayerData(twoPlayers, object, 2);
    }
    if (data[commonVar.players] === 4) { 
        console.log(data,'object 1') 
       let l = {
            playerId: data.playerId,
            username: data.username,
            user_id: data.user_id,
            players: 4,
            tournament_id:data.tournament_id,
            max_winner: 1,
            balance: 1000
          }
          checkFourPlayerData.push({user_id:data.user_id,tournament_id:data.tournament_id,object:object,twoPlayers:l}) 
          console.log(checkFourPlayerData,'checkFourPlayerData') 
            if(checkFourPlayerData.length>3){ 
                console.log(checkFourPlayerData,'checkFourPlayerData 1') 
            const mp = new Map(checkFourPlayerData.map(o => [o.tournament_id, {...o, count: 0 }]));
            for (const {tournament_id} of checkFourPlayerData) mp.get(tournament_id).count++;
            const result = Array.from(mp.values());
            console.log(result,'result 1') 
            let i  	= 0;
            let ids 	= [];
            let m   	= 0;
        for(i; i<result.length; i++)
        { 
            if(result[i]['count'] >3)
            { 
            for(m;m<checkFourPlayerData.length;m++ ){ 
                if(result[i]['tournament_id'] == checkFourPlayerData[m]['tournament_id'])
                {

                    ids.push(checkFourPlayerData[m]['user_id']);
		            console.log('fourPlayers',fourPlayers,);
                    AddPlayerData(fourPlayers, checkFourPlayerData[m].object, 4); 
                } 
            }
            }
        } 
            if(ids.length>0)
            {
                checkFourPlayerData = checkFourPlayerData.filter(function(i){
                    return ids.indexOf(i.user_id) === -1;
                }); 
            } 
        }
    }
}
module.exports=AddPlayer;


function AddPlayerData(playerArray, playerData, maxPlayers) {

    let ID=playerData.data.playerId;
    let username=playerData.data.username;
    for (let i = 0; i < playerArray.length; i++) {
        if(playerArray[i].data.playerId===ID){
            Log(username+" Player already exist in matchmaking");
            return;
        }
    }
    //if accendently player got disconnected or purposefully 
    //remove that player from the array 
    playerData.socket.on(socketEvents.OnDisconnect,()=>{

        Log(username+" Player is dissconnected")
        RemovePlayer(ID,playerArray);
    });
    playerData.socket.on(socketEvents.WithDrawMatchMaking,()=>{

        Log(username+" Player withdraw from matchmaking")
        RemovePlayer(ID,playerArray);
        playerData.socket.removeAllListeners(socketEvents.WithDrawMatchMaking);
        
    });
    playerArray.push(playerData);
    if (playerArray.length !== maxPlayers) return;
    //this is a temperary array
    //which will hold the players which are about to
    // join room
    let finalPlayerQue = [];
    
    for (let i = 0; i < playerArray.length; i++) {
        if(playerArray[i].socket["disconnected"]){
            playerArray.splice(i,1);
            Log("player dissconnected "+playerArray[i].socket.id)
            Log("removing player"+playerArray[i].socket.id)
            return;
        }
        finalPlayerQue.push(playerArray[i]);

    }
    CreateRoom(finalPlayerQue);
    //remove players
    twoPlayers.splice(0,maxPlayers);
    
}

function RemovePlayer(ID,array){
    for (let i = 0; i < array.length; i++) {
        if(array[i].data.playerId===ID){
            Log(array[i].data.username+" Player removed")
            array.splice(i,1);
            return;
        }        
    }
}











// [] fourPlayers1
// {
//   set_id: 1,
//   game_versioin: '1.0',
//   last_updated: '2022-03-21T00:00:00.000Z',
//   description: null,
//   current_updated: '2022-03-21T00:00:00.000Z',
//   version_code: '1.0',
//   is_status: 0
// } [
//   RowDataPacket {
//     set_id: 1,
//     game_versioin: '1.0',
//     last_updated: 2022-03-21T00:00:00.000Z,
//     description: null,
//     current_updated: 2022-03-21T00:00:00.000Z,
//     version_code: '1.0',
//     is_status: 0
//   }
// ] versions
// [
//   {
//     socket: Socket {
//       nsp: [Namespace],
//       server: [Server],
//       adapter: [Adapter],
//       id: 'wOgmXuaX-k_2oWh0AAAF',
//       client: [Client],
//       conn: [Socket],
//       rooms: [Object],
//       acks: {},
//       connected: true,
//       disconnected: false,
//       handshake: [Object],
//       fns: [],
//       flags: {},
//       _rooms: [],
//       _events: [Object: null prototype],
//       _eventsCount: 28,
//       playerId: 'd9a679934a5390c1afa950d261376b0e',
//       username: 'Arup Sen'
//     },
//     data: {
//       playerId: 'd9a679934a5390c1afa950d261376b0e',
//       username: 'Arup Sen',
//       user_id: '135',
//       players: 4,
//       tournament_id: '42756822204',
//       max_winner: 3,
//       balance: 1000
//     }
//   }
// ] fourPlayers1
// [
//   {
//     socket: Socket {
//       nsp: [Namespace],
//       server: [Server],
//       adapter: [Adapter],
//       id: 'wOgmXuaX-k_2oWh0AAAF',
//       client: [Client],
//       conn: [Socket],
//       rooms: [Object],
//       acks: {},
//       connected: true,
//       disconnected: false,
//       handshake: [Object],
//       fns: [],
//       flags: {},
//       _rooms: [],
//       _events: [Object: null prototype],
//       _eventsCount: 28,
//       playerId: 'd9a679934a5390c1afa950d261376b0e',
//       username: 'Arup Sen'
//     },
//     data: {
//       playerId: 'd9a679934a5390c1afa950d261376b0e',
//       username: 'Arup Sen',
//       user_id: '135',
//       players: 4,
//       tournament_id: '42756822204',
//       max_winner: 3,
//       balance: 1000
//     }
//   },
//   {
//     socket: Socket {
//       nsp: [Namespace],
//       server: [Server],
//       adapter: [Adapter],
//       id: 'KPGGU6MEr4PVTl3gAAAG',
//       client: [Client],
//       conn: [Socket],
//       rooms: [Object],
//       acks: {},
//       connected: true,
//       disconnected: false,
//       handshake: [Object],
//       fns: [],
//       flags: {},
//       _rooms: [],
//       _events: [Object: null prototype],
//       _eventsCount: 28,
//       playerId: '6b50fb7c13596ddf1de13ab581d6dbbb',
//       username: 'Ankit Tripathi'
//     },
//     data: {
//       playerId: '6b50fb7c13596ddf1de13ab581d6dbbb',
//       username: 'Ankit Tripathi',
//       user_id: '132',
//       players: 4,
//       tournament_id: '42756822204',
//       max_winner: 3,
//       balance: 1000
//     }
//   }
// ] fourPlayers1
// [
//   {
//     socket: Socket {
//       nsp: [Namespace],
//       server: [Server],
//       adapter: [Adapter],
//       id: 'wOgmXuaX-k_2oWh0AAAF',
//       client: [Client],
//       conn: [Socket],
//       rooms: [Object],
//       acks: {},
//       connected: true,
//       disconnected: false,
//       handshake: [Object],
//       fns: [],
//       flags: {},
//       _rooms: [],
//       _events: [Object: null prototype],
//       _eventsCount: 28,
//       playerId: 'd9a679934a5390c1afa950d261376b0e',
//       username: 'Arup Sen'
//     },
//     data: {
//       playerId: 'd9a679934a5390c1afa950d261376b0e',
//       username: 'Arup Sen',
//       user_id: '135',
//       players: 4,
//       tournament_id: '42756822204',
//       max_winner: 3,
//       balance: 1000
//     }
//   },
//   {
//     socket: Socket {
//       nsp: [Namespace],
//       server: [Server],
//       adapter: [Adapter],
//       id: 'KPGGU6MEr4PVTl3gAAAG',
//       client: [Client],
//       conn: [Socket],
//       rooms: [Object],
//       acks: {},
//       connected: true,
//       disconnected: false,
//       handshake: [Object],
//       fns: [],
//       flags: {},
//       _rooms: [],
//       _events: [Object: null prototype],
//       _eventsCount: 28,
//       playerId: '6b50fb7c13596ddf1de13ab581d6dbbb',
//       username: 'Ankit Tripathi'
//     },
//     data: {
//       playerId: '6b50fb7c13596ddf1de13ab581d6dbbb',
//       username: 'Ankit Tripathi',
//       user_id: '132',
//       players: 4,
//       tournament_id: '42756822204',
//       max_winner: 3,
//       balance: 1000
//     }
//   },
//   {
//     socket: Socket {
//       nsp: [Namespace],
//       server: [Server],
//       adapter: [Adapter],
//       id: 'c_1b370qw-Qgq2egAAAB',
//       client: [Client],
//       conn: [Socket],
//       rooms: [Object],
//       acks: {},
//       connected: true,
//       disconnected: false,
//       handshake: [Object],
//       fns: [],
//       flags: {},
//       _rooms: [],
//       _events: [Object: null prototype],
//       _eventsCount: 28,
//       playerId: 'da7de0a702fa98850ca0a95598ddf34f',
//       username: 'K.BARGHAV PAVAN KUMAR'
//     },
//     data: {
//       playerId: 'da7de0a702fa98850ca0a95598ddf34f',
//       username: 'K.BARGHAV PAVAN KUMAR',
//       user_id: '156',
//       players: 4,
//       tournament_id: '42756822204',
//       max_winner: 3,
//       balance: 1000
//     }
//   }
// ] fourPlayers1

