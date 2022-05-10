const commonVar = {
    playerId: "playerId",
    user_id: "user_id",
    isWon: "isWon",
    isLeft: "isLeft",
    tournament_id: "tournament_id",
    OnGameFinished: "OnGameFinished",
    max_winner: "max_winner",
    pawnColour: "pawnColour",
    balance: "balance",
    roundId: "roundId",
    score: "score",
    players: "players",
    socket: "socket",
    roomName: "roomName",
    username: "username",
    diceNo: "diceNo",
    pawnNumber: "pawnNumber",
    pawnColour: "pawnColour",
    currentpathPoint: "currentpathPoint",
    killedPawnPlayer: "killedPawnPlayer",
    chance: "chance",
    pawnsSpotNumber: "pawnsSpotNumber",
    pawnNumber: "pawnNumber",
    pawns: "pawns",
    isLastMoveFinished: "isLastMoveFinished"
}

const gameplayEvents = {
    OnDiceRoll: "OnDiceRoll",
    OnPawnMove: "OnPawnMove",
    OnPawnKill: "OnPawnKill",
    OnPlayerSwitch: "OnPlayerSwitch",
    OnPlayerWin: "OnPlayerWin",
    OnPawnReachedDestination: "OnPawnReachedDestination",
    OnPlayerLeft: "OnPlayerLeft",
    OnPawnFinishMoving: "OnPawnFinishMoving",
    OnMatchMaking: "OnMatchMaking",
    OnMatchMakingComplete: "OnMatchMakingComplete",
    OnGameStart: "OnGameStart",
    OnExit: "OnExit",
    YouWon: "YouWon",
    RemovePlayer: "RemovePlayer",
    OnDisconnect: "disconnect",
    OnDoubleChance: "OnDoubleChance",
    UpdateScore: "UpdateScore",
    RemovePlayer: "RemovePlayer",
    ScearchCompleted: "ScearchCompleted",
    Timer: "Timer",
    OnChanceMiss: "OnChanceMiss",
    UpdateLife: "UpdateLife",
    OnSomeoneWon: "OnSomeoneWon",
    OnLost: "OnLost",
    Reconnecting: "Reconnecting",
    ReconnectingTimeUP: "ReconnectingTimeUP",
    OnFailToReconnect: "OnFailToReconnect",
    OnReconnectingRequest: "OnReconnectingRequest",
    OnReconnected: "OnReconnected",
    OnPlayerUnPaused: "OnPlayerUnPaused",
    OnPlayerPaused: "OnPlayerPaused",
    OnPlayerWentOffline: "OnPlayerWentOffline",
    PausedPlayerDisconnected: "PausedPlayerDisconnected",
    OnGameRejoiningRequest: "OnGameRejoiningRequest",
    OnGameRejoinedSuccessfully: "OnGameRejoinedSuccessfully",
    OnGameFinished: "OnGameFinished",
    OnRoomKeyGenerated: "OnRoomKeyGenerated",
    OnPrivateRoomNotFound: "OnPrivateRoomNotFound",
    OnPrivateRoomRequest: "OnPrivateRoomRequest",
    OnJoinPrivateRoomRequested: "OnJoinPrivateRoomRequested",
    OnLeavingPrivateRoomBeforJoining: "OnLeavingPrivateRoomBeforJoining",
    OnMasterLeft: "OnMasterLeft",
    OnSwitchPawns: "OnSwitchPawns",
    WithDrawMatchMaking: "WithDrawMatchMaking",
}
//Events
const Events = {
    PlayOnline: "PlayOnline",
    OnLogin: "OnLogin",
    OnForceLogin: "OnForceLogin",
    OnForceExit: "OnForceExit",
    OnPlaceBet: "OnPlaceBet",
    OnWinNo: "OnWinNo",
    OnWinAmount: "OnWinAmount",
    OnTakeAmount: "OnTakeAmount",
    OnTimer: "OnTimer",
    OnUserInfo: "OnUserInfo",
    OnPreBet: "OnPreBet",
    OnChipMove: "OnChipMove",
    OnPlayerExit: "OnPlayerExit",
    OnJoinRoom: "OnJoinRoom",
    OnTimeUp: "OnTimeUp",
    OnTimerStart: "OnTimerStart",
    OnDrawCompleted: "OnDrawCompleted",
    OnWait: "OnWait",
    OnGameStart: "OnGameStart",
    OnAddNewPlayer: "OnAddNewPlayer",
    OnCurrentTimer: "OnCurrentTimer",
    OnBetsPlaced: "OnBetsPlaced",
    OnBotsData: "OnBotsData",
    OnPlayerWin: "OnPlayerWin",
    OnEnterLobby: "OnEnterLobby",
    OnChangePassword: "OnChangePassword",
    OnNotification: "OnNotification",
    OnSendPoints: "OnSendPoints",
    OnVerifyOtp: "OnVerifyOtp",
    OnRejectPoints: "OnRejectPoints",
    OnWithdrawRequest: "OnWithdrawRequest",
    OnUserProfile: "OnUserProfile",
    OnLogout: "OnLogout",
    OnSendOtp: "OnSendOtp",
    OnPlayTournament: "OnPlayTournament",
    OnUpdateProfile: "OnUpdateProfile",
    OnLoggedIn: "OnLoggedIn",
    OnUpdateBankDetail: "OnUpdateBankDetail",
    OnBankDetails: "OnBankDetails",
    OnUpdateUpiID: "OnUpdateUpiID",
    OnUpdateUsername: "OnUpdateUsername",
    OnUpiID: "OnUpiID",
    OnEntryLobby: "OnEntryLobby",
    OnLobbyCardList: "OnLobbyCardList",
    OnUserCreateTicket: "OnUserCreateTicket",
    OnUserTickets: "OnUserTickets",
    OnUserEmailVerify: "OnUserEmailVerify",
    OnUserPhoneVerify: "OnUserPhoneVerify",
    OnUserForceLogin: "OnUserForceLogin",
    OnsenderNotification: "OnsenderNotification",
    OnTransactionHistoy: "OnTransactionHistoy",
    OnCheckDeviceVerify: "OnCheckDeviceVerify",
    OnGetReferCode: "OnGetReferCode",
};
const pawn = {
    red: 0,
    green: 1,
    yellow: 2,
    blue: 3,
}

const TimerVar = {
    bettingTimer: 60,
    betCalculationTimer: 7,
    waitTimer: 3,
    delay: 1000,
    intervalDalay: 1500,
}
const categoryTypes = ['1V1 BATTLE', '1 WINNER', '2 WINNERS', '3 WINNERS'];
module.exports = { gameplayEvents, TimerVar, commonVar, pawn, categoryTypes, Events }