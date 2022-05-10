
const matchmaking = require('./MatchMaking');
const socketEvents = require("./Utility/Constant").gameplayEvents;
const commonVar = require("./Utility/Constant").commonVar;
const TimerVar = require("./Utility/Constant").TimerVar;
const events = require("./Utility/Constant").Events;
const sendSocket = require("./Gameplay/Ludo").GetSocket;
const CreatePrivateRoom = require('./PrivateRoom').CreatePrivateRoom;
const JoinPrivateRoom = require('./PrivateRoom').JoinPrivateRoom;
const SendConnectionRequest = require('./PawnColourAssigner').SendRequestConnection
const { TournamentEntry } = require("./services/LudoTournament");
/** Import methods  */
const { checkDeviceVerify, getReferalCode } = require('./src/socket/RefferalSystem')
const { getTransactionHistory, withdrawRequest } = require('./src/socket/Transactions')
const {
  sendOtp,
  userLogin,
  userProfile,
  loggedInUser,
  updateUpiID,
  profileUpdate,
  UpdateUsername,
  userForceLogin,
  userEmailVerify,
  myAccountDetails,
  bankDetailsUpdate,
  otpVerify,
  userPhoneVerify } = require('./src/socket/Users')
const { lobbyCardList, matchMakingTournaments } = require('./src/socket/LobbyTournament')
const { createUserTickets, getUserTickets } = require('./src/socket/Ticket')
const { updateWinningStatus } = require('./Gameplay/LobbyUser')
const Log = require('debug')('server');
const getSocketData = require("./services/CreateTournament").getSocketData;
const { onCheckVersion } = require('./src/socket/Settings')
/**
 * Desc :Start Socket Server
 * Function :createSocket()
 */
function createSocket(io) {
  sendSocket(io);
  getSocketData(io)

  //create connection
  io.on("connection", (socket) => {
    OnMatchMaking(socket)
    OnPrivateRoomRequest(socket)
    OnJoinPrivateRoomRequested(socket)
    OnDisconnected(socket)
    ReConnected(socket)
    //Game play 
    OnPlayLobby(socket)
    OnLobby(socket)
    TransactionHistory(socket)
    UserProfile(socket)
    SendOtp(socket)
    UserLogin(socket)
    CheckUserLogin(socket)
    BankDetailsUpdate(socket)
    ProfileUpdate(socket)
    MyAccountDetails(socket)
    // MyUpiID(socket)
    UpdateUpi(socket)
    GenerateTicket(socket)
    GetTickets(socket)
    ForceLogin(socket)
    PhoneVerify(socket)
    EmailVerify(socket)
    OtpVerify(socket)
    UpdateName(socket)
    Withdraw(socket)
    OnCheckVersion(socket)
    DeviceVerify(socket)
    GetRefer(socket)
  })



  /* On Game play Instruction */
  function OnDisconnected(socket) {
    socket.on("disconnect", () => {
      let id = socket.username !== undefined ? socket.username : socket.id;
      Log("someone disconnect " + id)
    });
  }
  function OtpVerify(socket) {
    socket.on(events.OnVerifyOtp, async (data) => {
      let result = await otpVerify(data);
      socket.emit(events.OnVerifyOtp, result);
    })
  }
  function OnMatchMaking(socket) {
    socket.on(socketEvents.OnMatchMaking, (data) => {
      socket.playerId = data[commonVar.playerId];
      socket.username = data[commonVar.username];
      let obj = {
        socket: socket,
        data: data
      }
      matchmaking(obj);
    });
  }
  //Check versions
  function OnCheckVersion(socket) {
    socket.on('OnCheckUpdateVersion', async (data) => {
      let result = await onCheckVersion(data);
      socket.emit('OnCheckUpdateVersion', result);
    })
  }
  // Update username
  function UpdateName(socket) {
    socket.on(events.OnUpdateUsername, async (data) => {
      let result = await UpdateUsername(data);
      socket.emit(events.OnUpdateUsername, result);
    })
  }
  function OnPrivateRoomRequest(socket) {
    socket.on(socketEvents.OnPrivateRoomRequest, (data) => {
      //   Log("Private room request");
      socket.playerId = data[commonVar.playerId];
      socket.username = data[commonVar.username];
      let obj = {
        socket: socket,
        data: data
      }
      CreatePrivateRoom(obj);
    });
  }
  function OnJoinPrivateRoomRequested(socket) {
    socket.on(socketEvents.OnJoinPrivateRoomRequested, (data) => {
      Log("join Private room request");
      socket.playerId = data[commonVar.playerId];
      socket.username = data[commonVar.username];
      let obj = {
        socket: socket,
        data: data,
        roomName: data[commonVar.roomName]
      };

      JoinPrivateRoom(obj);
    });
  }
  function ReConnected(socket) {
    socket.on(socketEvents.OnGameRejoiningRequest, (data) => {
      Log("Got reconnection request " + data[commonVar.username]);
      socket.username = data.username;
      let obj = {
        socket: socket,
        playerId: data[commonVar.playerId],
        username: data[commonVar.username],
        roomName: data[commonVar.roomName]
      }
      SendConnectionRequest(obj);
    });
  }


  /** User Profile & History of Payment */
  function OnLobby(socket) {
    socket.on(events.OnLobbyCardList, async (data) => {
      const responseData = await lobbyCardList(data, socket);
      socket.emit(events.OnLobbyCardList, responseData)
    })
  }

  //With draw request
  function Withdraw(socket) {
    socket.on(events.OnWithdrawRequest, async (data) => {
      const responseData = await withdrawRequest(data);
      socket.emit(events.OnWithdrawRequest, responseData)
    })
  }
  //User Profile
  function OnPlayLobby(socket) {
    socket.on(events.OnPlayTournament, async (data) => {
      data.player_id = socket.id
      const responseData = await matchMakingTournaments(data);
      // let responseData={status:200,message:"successfull",data:null}
      socket.emit(events.OnPlayTournament, responseData);
    })
  }
  //Transaction History
  function TransactionHistory(socket) {
    socket.on(events.OnTransactionHistoy, async (data) => {
      const responseData = await getTransactionHistory(data);
      socket.emit(events.OnTransactionHistoy, responseData);
    })
  }

  //User Profile
  function UserProfile(socket) {
    socket.on(events.OnUserProfile, async (data) => {
      const responseData = await userProfile(data);
      socket.emit(events.OnUserProfile, responseData);
    })
  }

  function SendOtp(socket) {
    socket.on(events.OnSendOtp, async (data) => {
      console.log('send otp', data)
      let result = await sendOtp(data);
      socket.emit(events.OnSendOtp, result);
    })
  }

  //Check user Logged in or not
  function CheckUserLogin(socket) {
    socket.on(events.OnLoggedIn, async (data) => {
      let result = await loggedInUser(data);
      socket.emit(events.OnLoggedIn, result);
    })
  }
  //  user login 
  function UserLogin(socket) {
    socket.on(events.OnLogin, async (data) => {
      let result = await userLogin(data);
      socket.emit(events.OnLogin, result);
    })
  }
  //  user profile update 
  function ProfileUpdate(socket) {
    socket.on(events.OnUpdateProfile, async (data) => {
      let result = await profileUpdate(data);
      socket.emit(events.OnUpdateProfile, result);
    })
  }
  //  user bank details update
  function BankDetailsUpdate(socket) {
    socket.on(events.OnUpdateBankDetail, async (data) => {
      let result = await bankDetailsUpdate(data);
      socket.emit(events.OnUpdateBankDetail, result);
    })
  }
  //  user bank details update
  function MyAccountDetails(socket) {
    socket.on(events.OnBankDetails, async (data) => {
      let result = await myAccountDetails(data);
      socket.emit(events.OnBankDetails, result);
    })
  }
  function UpdateUpi(socket) {
    socket.on(events.OnUpdateUpiID, async (data) => {
      let result = await updateUpiID(data);
      socket.emit(events.OnUpdateUpiID, result);
    })
  }
  // function MyUpiID(socket){
  //   socket.on(events.OnUpiID, async(data) =>{
  //     let result = await upiID(data);  
  //       socket.emit(events.OnUpiID,result);
  //     })
  // }
  //CREATE tickets
  function GenerateTicket(socket) {
    socket.on(events.OnUserCreateTicket, async (data) => {
      let result = await createUserTickets(data);
      socket.emit(events.OnUserCreateTicket, result);
    })
  }
  function GetTickets(socket) {
    socket.on(events.OnUserTickets, async (data) => {
      let result = await getUserTickets(data);
      socket.emit(events.OnUserTickets, result);
    })
  }
  function ForceLogin(socket) {
    socket.on(events.OnUserForceLogin, async (data) => {
      let result = await userForceLogin(data);
      socket.emit(events.OnUserForceLogin, result);
    })
  }
  //Email Verify
  function EmailVerify(socket) {
    socket.on(events.OnUserEmailVerify, async (data) => {
      let result = await userEmailVerify(data);
      socket.emit(events.OnUserEmailVerify, result);
    })
  }
  //Phone Verify
  function PhoneVerify(socket) {
    socket.on(events.OnUserPhoneVerify, async (data) => {
      console.log(data, 'phone')
      let result = await userPhoneVerify(data);
      console.table(result)
      socket.emit(events.OnUserPhoneVerify, result);
    })
  }
  //Device Verify
  function DeviceVerify(socket) {
    socket.on(events.OnCheckDeviceVerify, async (data) => {
      let result = await checkDeviceVerify(data);
      socket.emit(events.OnCheckDeviceVerify, result);
    })
  }

  function GetRefer(socket) {
    socket.on(events.OnGetReferCode, async (data) => {
      let result = await getReferalCode(data);
      socket.emit(events.OnGetReferCode, result);
    })
  }
}

module.exports.createSocket = createSocket;