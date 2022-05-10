"use strict";
const socketEvents = require("../Utility/Constant").gameplayEvents;
const commanVar = require("../Utility/Constant").commonVar;
let IO;
const PAWN_LAST_SPOT = 57;
const Log = require('debug')('gameplay');
const { removeAllListeners } = require("../config/db");
const { userExitGame } = require('./LobbyUser')
const { OnTimeUpdateWin, OnGameFinishedUpdateWinAmounts } = require('./OnTimeUpScript')
function GetSocket(io) {
    IO = io;
    Log('IO')
}
class LUDO {
    constructor(gameData, timer, roomName) {
        Log('game data', timer)
        this.players = [];
        this.winners = [];
        this.ExtraPointsForKilling = 50;
        this.ExtraPointsForWinningAPawn = 50;
        this.ExtraPointsForDoubleChance = 0;
        this.currentPlayer;
        this.pawnIndex;
        this.gameId;
        ///this object contaion Socket obj and Player id,username,
        this.SOCKETS = gameData.playersData;
        this.data = gameData;
        this.miniutsLeft;
        this.secLeft;
        this.isTimeUp = false;
        this.timer = "0:00";
        this.roomName = roomName;
        this.dissconnectedPlayers = [];
        this.reconnectingPlayers = [];
        this.pausedPlayers = [];
        this.isReconnecting = false;
        this.isReconnected = false;
        this.reconnectTime = 59;
        this.MAX_PLAYERS = 0;
        this.MAX_WINNERS = 0;
        this.tournament_id = "";
        this.IsGameOver = false;
        this.ALL_PLAYER_SOCKETS = [];
    }
 
    StartGame() {
        for (let i = 0; i < this.data.playersData.length; i++) {
            let socket = this.data.playersData[i].socket;
            let player = this.data.playersData[i].data;
            let username = player[commanVar.username];
            let playerId = player[commanVar.playerId];
            let user_id = player[commanVar.user_id];
            let p = {
                username: username,
                playerId: playerId,
                score: 0,
                chance: 3,
                pawns: [0, 0, 0, 0],//hold pathpoints on ludo board
                isLastMoveFinished: false,//this will use when timer is over
                isWon: false,
                isLeft: false,
                user_id,
                tournament_id: player[commanVar.tournament_id],
                colour: player[commanVar.colour],
            }
            this.tournament_id = player[commanVar.tournament_id];
            this.MAX_WINNERS = player[commanVar.max_winner];
            this.players.push(p);
            //Register Events
            this.OnDiceRoll(socket);
            this.OnPlayerFinishMoving(socket);
            this.OnPawnMove(socket);
            this.OnPawnKilled(socket);
            this.OnExit(socket);
            this.OnDoubleChance(socket);
            this.ScearchCompleted(socket);
            this.OnDissconnect(socket, p);
            // this.OnReconnect(socket);
            this.OnChanceMiss(socket);
            this.OnPlayerPaused(socket);
            this.OnPlayerUnPaused(socket);
            this.OnGameFinshed(socket);
            this.OnSwitchPlayers(socket);
            this.ALL_PLAYER_SOCKETS.push(socket);
        }
        //Change the parameters of the below fuction
        // inorder to customize the timer
        if (this.players.length == 2) {
            this.CountDown(1, 9);
        } else {
            this.CountDown(1, 10);
        }
        this.currentPlayer = this.players[0];
        this.MAX_PLAYERS = this.players.length;
        Log("Tornament ID:" + this.tournament_id)
        Log("MaxPlayers:" + this.MAX_PLAYERS)
        Log("MaxWinners:" + this.MAX_WINNERS)
    }


    OnPawnMove(socket) {
        socket.on(socketEvents.OnPawnMove, (pawnInfo) => {
            let playerId = pawnInfo[commanVar.playerId];
            let pawnNumber = pawnInfo[commanVar.pawnNumber];
            let pawnsSpotNumber = pawnInfo[commanVar.currentpathPoint];
            let diceNumber = pawnInfo[commanVar.diceNo];
            let currentPlayer = this.GetPlayerInstance(playerId);
            if (currentPlayer === undefined) {
                return;
            }
            currentPlayer[commanVar.pawns][pawnNumber] = pawnsSpotNumber + diceNumber;
            socket.to(this.roomName).emit(socketEvents.OnPawnMove, pawnInfo)
        });
    }


    OnDiceRoll(socket) {
        socket.on(socketEvents.OnDiceRoll, (diceInfo) => {
            socket.to(this.roomName).emit(socketEvents.OnDiceRoll, diceInfo)
        });
    }


    OnPlayerFinishMoving(socket) {
        socket.on(socketEvents.OnPawnFinishMoving, (player) => {
            let points = player[commanVar.diceNo];
            this.currentPlayer[commanVar.score] += points;
            let scoreCards = {
                score: this.currentPlayer[commanVar.score],
                player_id: this.currentPlayer[commanVar.playerId]
            }
            this.SendScore();
            if (this.isTimeUp) {
                this.OnTimeUP();
                this.RemoveGameplayListners(socket);
                return;
            }
            this.SwitchPlayers(player)

        });
    }


    OnSwitchPlayers(socket) {
        socket.on(socketEvents.OnSwitchPawns, (data) => {
            this.SwitchPlayers(data);
        })
    }

    SwitchPlayers(player, isScearchComplete = false) {
        if (player[commanVar.diceNo] !== 6 || isScearchComplete)
            this.currentPlayer = this.GetNextPlayer(player[commanVar.playerId]);
        //sent to all players 
        IO.to(this.roomName).emit(socketEvents.OnPlayerSwitch, {
            nextPlayerId: this.currentPlayer[commanVar.playerId],
            nextUsername: this.currentPlayer[commanVar.username],
        })
    }
    SwitchAndUpdateCurrentPlayerStatus(player) {
        this.currentPlayer = this.GetNextPlayer(player[commanVar.playerId]);
        //sent to all players 
        IO.to(this.roomName).emit(socketEvents.OnPlayerSwitch, {
            nextPlayerId: this.currentPlayer[commanVar.playerId],
            nextUsername: this.currentPlayer[commanVar.username],
        })
    }
    isRoundEnded() {
        if (this.isTimeUp) {
            this.currentPlayer[commanVar.isLastMoveFinished] = true;
            for (let i = 0; i < this.players.length; i++) {
                if (!this.players[i].isLastMoveFinished) {
                    return false;
                }
                if (!this.players[i].isLeft) {
                    return false;
                }
                if (!this.players[i].isWon) {
                    return false;
                }
            }

            return true;
        }
        return false;
    }


    OnTimeUP() {
        let _Players = [];
        let highScore = 0;

        _Players = this.players.sort(SortByScore);
        function SortByScore(player1, player2) {
            return -parseInt(player1[commanVar.score]) + parseInt(player2[commanVar.score]);
        }

        for (let i = 0; i < _Players.length; i++) {
            if (_Players[i][commanVar.isWon]) continue
            if (_Players[i][commanVar.isLeft]) continue
            this.winners.push(_Players[i])
        }
        //Update on database  
        console.table(_Players)
        this.TimeUpUpdateFun(_Players)
        if (!this.IsGameOver) {
            IO.to(this.roomName).emit(socketEvents.OnGameFinished, { winners: this.winners, MAX_WINNERS: this.MAX_WINNERS });
            this.RemoveAllPlayersGameplayListners();
        }
        this.IsGameOver = true;

    }


    OnPawnKilled(socket) {
        socket.on(socketEvents.OnPawnKill, (data) => {
            let points = data[commanVar.diceNo];
            let killedPawnPlayer = data[commanVar.killedPawnPlayer];
            for (let i = 0; i < this.players.length; i++) {
                if (killedPawnPlayer === this.players[i][commanVar.playerId]) {
                    //deduct points
                    // this.players[i][commanVar.score] = this.players[i][commanVar.score] - data[commanVar.currentpathPoint]; 

                    this.players[i][commanVar.score]
                        = this.players[i][commanVar.score] - this.players[i][commanVar.pawns][data[commanVar.pawnNumber]] + 1;

                }
            }
            //update score
            this.currentPlayer[commanVar.score] += points;
            let scoreCards = {
                score: this.currentPlayer[commanVar.score],
                player_id: this.currentPlayer[commanVar.playerId]
            }

            this.SendScore();
            //sent to all players 
            socket.to(this.roomName).emit(socketEvents.OnPlayerSwitch, {
                nextPlayerId: this.currentPlayer[commanVar.playerId],
                nextUsername: this.currentPlayer[commanVar.username],
            })
            //send back to the last player
            socket.emit(socketEvents.OnPlayerSwitch, {
                nextPlayerId: this.currentPlayer[commanVar.playerId],
                nextUsername: this.currentPlayer[commanVar.username],
            })
        });
    }


    //This will called if a pawn single pawn reach home
    ScearchCompleted(socket) {
        socket.on(socketEvents.ScearchCompleted, (data) => {
            let points = data[commanVar.diceNo];

            //update score
            this.currentPlayer[commanVar.score] += points + this.ExtraPointsForWinningAPawn;
            let scoreCards = {
                score: this.currentPlayer[commanVar.score],
                player_id: this.currentPlayer[commanVar.playerId]
            }
            this.SendScore();
            if (this.IsGameFinished()) {
                this.IsGameOver = true;
                this.RemoveGameplayListners(socket);
                return;
            }
            //sent to all players 
            IO.to(this.roomName).emit(socketEvents.OnPlayerSwitch, {
                nextPlayerId: this.currentPlayer[commanVar.playerId],
                nextUsername: this.currentPlayer[commanVar.username],
            })


        });
    }
    IsGameFinished() {
        for (let i = 0; i < this.currentPlayer[commanVar.pawns].length; i++) {
            if (this.currentPlayer[commanVar.pawns][i] !== PAWN_LAST_SPOT) return false;
        }
        this.currentPlayer.isWon = true;
        //-----DB--------  
        this.UpdateWinAmount(this.currentPlayer)

        this.winners.push(this.currentPlayer);
        if (this.winners.length !== this.MAX_WINNERS) {
            this.SwitchPlayers(this.currentPlayer, true)//Continue with the next player
            return false;
        }
        let msg = "______RANKS______\n";
        for (let i = 0; i < this.winners.length; i++) {
            let rank = i + 1;
            let m = ` ${rank}st Winner: ${this.winners[i][commanVar.username]}\n`;
            msg = msg + m;
        }

        msg = msg + "________________"

        if (!this.IsGameOver) {
            IO.to(this.roomName).emit(socketEvents.OnGameFinished, { winners: this.winners, MAX_WINNERS: this.MAX_WINNERS });
            this.RemoveAllPlayersGameplayListners();
        }
        this.IsGameOver = true;

        return true;
    }

    SendScore() {
        IO.to(this.roomName).emit(socketEvents.UpdateScore, { data: this.players });
    }

    OnExit(socket) {
        socket.on(socketEvents.OnExit, (player) => {
            this.RemovePlayer(player, socket);
        });
    }

    //Update winner data
    async UpdateWinAmount(data) {
        await OnGameFinishedUpdateWinAmounts(data)
        return true
    }

    ///Update data on time up 
    async TimeUpUpdateFun(data) {
        await OnTimeUpdateWin(data)
        return true
    }

    async RemovePlayer(player, socket) {
        if (this.IsGameOver) return;
        if (player[commanVar.playerId] === this.currentPlayer[commanVar.playerId]) {
            this.SwitchAndUpdateCurrentPlayerStatus(this.currentPlayer)
        }

        let removedPlayer = this.UpdatePlayerStatus(player[commanVar.playerId]);
        if (removedPlayer === null) {
            return;
        } else {
            socket.emit(socketEvents.OnLost);
        }

        //remove the player from every screens

        socket.to(this.roomName).emit(socketEvents.RemovePlayer, { playerId: removedPlayer.playerId, chance: player.is_chance });
        for (let i = 0; i < this.SOCKETS.length; i++) {
            if (this.SOCKETS[i].data[commanVar.playerId] === removedPlayer[commanVar.playerId]) {
                this.SOCKETS.splice(i, 1);
            }
        }
        //changes done 


        let playerLeftInTheGame = 0;
        let index = 0;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].isLeft) continue;
            if (this.players[i].isWon) continue;
            playerLeftInTheGame++;
            index = i;
        }


        //won if only one player is left in the game
        if (playerLeftInTheGame === 1) {
            /**
             * dont remove this sleep it will help frontend side 
             * to show Popup properly, this dely will help when 
             * someplayer pause and then kill the app
             */

            //won players
            let playerId = this.players[index][commanVar.playerId];
            let username = this.players[index][commanVar.username];
            let leftplayer = socket.username
            await this.sleep(100);
            //-------DB----
            if (!this.IsGameOver) {
                IO.to(this.roomName).emit(socketEvents.YouWon, { playerId, username, leftplayer });
                this.RemoveAllPlayersGameplayListners();
            }
            this.IsGameOver = true;
        }

        socket.leave(this.roomName);
        this.RemoveGameplayListners(socket);
    }

    OnDissconnect(socket, player) {
        socket.on(socketEvents.OnDisconnect, () => {
            let player = { playerId: socket[commanVar.playerId], username: socket[commanVar.username] };
            this.RemovePlayer(player, socket)

        });
    }

    async DisconnectedTimer(ID) {

        for (let i = 0; i < this.reconnectTime; i++) {
            /**find in 
             * @param  this.reconnectingPlayers 
             *   arrya if not found then the player is already connected
             * */
            let isPlayerReconnected = true;
            for (let j = 0; j < this.reconnectingPlayers.length; i++) {
                //if the player is still in reconnecting array the players is still disconnected
                if (ID[commanVar.playerId] === this.reconnectingPlayers[j]) {
                    isPlayerReconnected = false;
                    break;
                }
            }
            if (isPlayerReconnected) {
                return;
            }

            await this.sleep()
        }
        this.dissconnectedPlayers.push(ID[commanVar.playerId]);
        IO.to(this.roomName).emit(socketEvents.OnFailToReconnect, { playerId: ID[commanVar.playerId] });
    }

    OnReconnect(data) {
        for (let i = 0; i < this.dissconnectedPlayers.length; i++) {
            if (data[commanVar.playerId] === this.dissconnectedPlayers[i][commanVar.playerId]) {
                data[commanVar.socket].emit(socketEvents.ReconnectingTimeUP);
                return;
            }
        }

        for (let i = 0; i < this.reconnectingPlayers.length; i++) {
            if (data[commanVar.playerId] === this.reconnectingPlayers[i]) {
                this.isReconnecting = false;
                this.reconnectingPlayers.splice(i, 1);//remove player
                break;

            }
        }

        for (let i = 0; i < this.SOCKETS.length; i++) {
            if (data[commanVar.playerId] === this.SOCKETS[i].data[commanVar.playerId]) {
                this.SOCKETS[i].socket = data[commanVar.socket];
                data[commanVar.socket].join(this.roomName, () => {
                    data[commanVar.socket].to(this.roomName).emit(socketEvents.OnReconnected, {
                        playerId: data[commanVar.playerId]
                    });
                });
                return;
            }
        }
    }

    OnPlayerPaused(socket) {
        socket.on(socketEvents.OnPlayerPaused, (ID) => {
            this.pausedPlayers.forEach((player) => {
                //make sure the player is not already in the list
                if (player === ID[commanVar.playerId]) {
                    return;
                }
            })

            //tell everyone player is paused
            socket.to(this.roomName).emit(socketEvents.OnPlayerWentOffline,
                { playerId: ID[commanVar.playerId], username: ID[commanVar.username] });
            this.pausedPlayers.push(ID[commanVar.playerId]);
            this.PauseCoundown(ID, socket);

        })
    }

    async PauseCoundown(ID, socket) {
        //remove player after sometime
        for (let i = 0; i < this.reconnectTime; i++) {
            let isPlayerStillinPausedMode = false;
            //if the player missing from the array it means the player is already reconnected
            for (let j = 0; j < this.pausedPlayers.length; j++) {
                //player is still in paused mode
                if (this.pausedPlayers[j] === ID[commanVar.playerId]) {
                    isPlayerStillinPausedMode = true;
                    break;
                }

            }
            //if player reconnected the stop the timer
            if (!isPlayerStillinPausedMode) {
                return;//the player is already reconnected no need to remove the player 
            }

            await this.sleep();
        }
        //inform everone that player left the game 
        socket.to(this.roomName).emit(socketEvents.OnPlayerLeft,
            { playerId: ID[commanVar.playerId], username: ID[commanVar.username] });
        this.RemovePlayer(ID, socket);
    }

    OnPlayerUnPaused(socket) {
        socket.on(socketEvents.OnPlayerUnPaused, (ID) => {
            for (let i = 0; i < this.pausedPlayers.length; i++) {
                if (this.pausedPlayers[i] === ID[commanVar.playerId]) {
                    socket.to(this.roomName).emit(socketEvents.OnPlayerUnPaused,
                        { playerId: ID[commanVar.playerId], username: ID[commanVar.username] });
                    this.pausedPlayers.splice(i, 1);
                    return;
                }
            }
        })
    }


    OnDoubleChance(socket) {
        socket.on(socketEvents.OnDoubleChance, () => {
            //update score
            this.currentPlayer[commanVar.score] += 6 + this.ExtraPointsForDoubleChance;
            let scoreCards = {
                score: this.currentPlayer[commanVar.score],
                player_id: this.currentPlayer[commanVar.playerId]
            }


            this.SendScore();

            //send back to the last player
            socket.emit(socketEvents.OnPlayerSwitch, {
                nextPlayerId: this.currentPlayer[commanVar.playerId],
                nextUsername: this.currentPlayer[commanVar.username],
            })
        });
    }


    //this function will run if the player ignores his/her turn
    //which will reduce his/her chance and a life
    //there are only three lifes
    //once the three life is finished
    //the player will be eliminated

    OnChanceMiss(socket) {
        socket.on(socketEvents.OnChanceMiss, (player) => {
            let playerInstance = this.GetPlayerInstance(player[commanVar.playerId]);
            if (playerInstance === null || playerInstance === undefined) {
                return;
            }
            playerInstance[commanVar.chance] -= 1;

            console.log(player.is_chance, "player chance")
            if (playerInstance[commanVar.chance] <= 0) {
                player.is_chance = false;
                //swith player

                this.RemovePlayer(player, socket);
                return;
            }
            player.is_chance = true;
            IO.to(this.roomName).emit(socketEvents.UpdateLife,
                {
                    playerId: playerInstance[commanVar.playerId],
                    chances: playerInstance[commanVar.chance]
                });
            // IO.to(this.roomName).emit(socketEvents.UpdateLife,
            //     {
            //         playerId: playerInstance[commanVar.playerId],
            //         chances: playerInstance[commanVar.chance]
            //     });
            //swith player
            this.currentPlayer = this.GetNextPlayer(player[commanVar.playerId]);
            //sent to all players 
            IO.to(this.roomName).emit(socketEvents.OnPlayerSwitch, {
                nextPlayerId: this.currentPlayer[commanVar.playerId],
                nextUsername: this.currentPlayer[commanVar.username],
            })
        });
    }

    // OnChanceMiss(socket) {
    //     socket.on(socketEvents.OnChanceMiss, (player) => {
    //         let playerInstance = this.GetPlayerInstance(player[commanVar.playerId]);
    //         if (playerInstance === null || playerInstance === undefined) {
    //             return;
    //         }
    //         playerInstance[commanVar.chance] -= 1;

    //         console.log(player.is_chance, "player chance")
    //         if (playerInstance[commanVar.chance] <= 0) {
    //             player.is_chance = false;
    //             //swith player

    //             this.RemovePlayer(player, socket);
    //             return;
    //         }
    //         player.is_chance = true;
    //         IO.to(this.roomName).emit(socketEvents.UpdateLife,
    //             {
    //                 playerId: playerInstance[commanVar.playerId],
    //                 chances: playerInstance[commanVar.chance]
    //             });
    //         IO.to(this.roomName).emit(socketEvents.UpdateLife,
    //             {
    //                 playerId: playerInstance[commanVar.playerId],
    //                 chances: playerInstance[commanVar.chance]
    //             });
    //         //swith player
    //         this.currentPlayer = this.GetNextPlayer(player[commanVar.playerId]);
    //         //sent to all players 
    //         IO.to(this.roomName).emit(socketEvents.OnPlayerSwitch, {
    //             nextPlayerId: this.currentPlayer[commanVar.playerId],
    //             nextUsername: this.currentPlayer[commanVar.username],
    //         })
    //     });
    // }

    //helper functions
    GetNextPlayer(CurrentPlayerId) {

        let index = 0;
        if (this.IsEverOneLeft()) {
            return;
        }
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i][commanVar.playerId] === CurrentPlayerId) {
                index = i;
            }
        }
        for (let i = index + 1; i < this.players.length; i++) {

            if (this.players[i].isLeft) {
                continue;
            }
            if (this.players[i].isWon) {
                continue;
            }
            return this.players[i]
        }
        for (let i = 0; i < index; i++) {
            if (this.players[i].isLeft) {
                continue;
            }
            if (this.players[i].isWon) {
                continue;
            }
            return this.players[i]
        }
        return null;
    }
    IsEverOneLeft() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].isLeft) continue;
            if (this.players[i].isWon) continue;
            return false;
        }
        return true;
    }

    GetPlayerInstance(ID) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i][commanVar.playerId] === ID) {
                return this.players[i]
            }
        }
        return null;
    }

    async UserExitFromGame(data) {
        await userExitGame(data)
        return true
    }

    UpdatePlayerStatus(ID) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i][commanVar.playerId] === ID) {
                let removedPlayer = this.players[i];
                this.players[i].isLeft = true;
                let formData = {
                    tournament_id: this.players[i].tournament_id,
                    user_id: this.players[i].user_id
                }
                this.UserExitFromGame(formData)
                //this.players.splice(i, 1);
                if (this.players.length === 0) {
                    this.IsGameOver = true;
                }

                return removedPlayer;
            }
        }

        return null;
    }


    RemoveGameplayListners(socket) {
        socket.removeAllListeners(socketEvents.OnDiceRoll);
        socket.removeAllListeners(socketEvents.OnPawnFinishMoving);
        socket.removeAllListeners(socketEvents.OnPawnKilled);
        socket.removeAllListeners(socketEvents.OnDoubleChance);
        socket.removeAllListeners(socketEvents.OnExit);
        socket.removeAllListeners(socketEvents.OnPawnMove);
        socket.removeAllListeners(socketEvents.OnDissconnect);
        socket.removeAllListeners(socketEvents.OnGameFinished);
        socket.leave(this.roomName);
    }
    RemoveAllPlayersGameplayListners() {
        for (let i = 0; i < this.ALL_PLAYER_SOCKETS.length; i++) {
            this.RemoveGameplayListners(this.ALL_PLAYER_SOCKETS[i])
        }
    }
    //helper  s
    //------------------TIMER------------------------
    async CountDown(sec = 30, min = 10) {
        let timer;
        let miniutsLeft;
        let secLeft;
        while (min > -1) {
            if (this.isTimeUp) {
                break;
            }
            if (this.IsGameOver) {
                return;
            }
            miniutsLeft = min;
            secLeft = sec;
            if (sec.toString().split.Length == 1)
                timer = `${min}:0${sec}`;
            else
                timer = `${min}:${sec}`;
            await this.sleep(1000);
            if (sec < 1) {
                sec = 60;
                min--;
            }
            sec--;
            IO.to(this.roomName).emit(socketEvents.Timer, { timer });
        }
        timer = "0:00";
        this.isTimeUp = true;
        this.OnTimeUP();
        // this.RemoveGameplayListners(socket);
    }
    sleep(ms = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    OnGameFinshed(socket) {
        socket.on(socketEvents.OnGameFinshed, () => {
            for (let i = 0; i < this.SOCKETS.length; i++) {
                this.RemoveGameplayListners(this.SOCKETS[i].socket);
            }
        });
    }
    //------------------TIMER------------------------
}

module.exports = LUDO;
module.exports.GetSocket = GetSocket;