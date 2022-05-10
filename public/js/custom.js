const socket = io();



//connect clients
socket.on("connect", () => {

});

socket.on("OnUserProfile", (data) => {
    console.log('OnUserProfile', data)
})

socket.on("OnTransactionHistoy", (data) => {
    console.log('My Transaction ', data)
})

socket.on("OnLobbyCardList", (data) => {
    var divs = document.getElementById('ListMenu');
    let userId = document.getElementById('user_id').value;
    let text = "";
    text += `<div class="row">`;

    data.data.forEach((item, index) => {
       
        let tournamentId = {
            game_play_id: item.game_play_id,
            tournament_id: item.tournament_id,
            // entry_fee: item.entry_fee,
            // category_type_id: item.category_type_id,
            user_id: userId
        }
        text += ` <div class="col-md-3">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${item.category_name} GPID: ${item.category_type_id}</h5>
                <p class="card-text">Prize Pool:${item.prize_pool}  Rs</p>
                <p class="card-text">TournamentID: ${item.tournament_id} .</p>
                <span>Joined: 20</span>
                `;
        text += "<p class='card-text'><img width='18px' height  ='18px' src ='https://www.freeiconspng.com/thumbs/timer-icon/timer-icon-15.png'> <span class='font-weight-bold' id='dda" + index + "'></p>";
        for (let i = 0; i < (item.ranks).length; i += 1) {  
            text += `${item.ranks[i].type_name} - ${item.ranks[i].prize_distrubution}<br/>`;
        }

        text += `<button onclick="OnEntryLobby('${encodeURIComponent(JSON.stringify( {
            game_play_id: item.game_play_id,
            tournament_id: item.tournament_id, 
            user_id: 2
        }))}')" class="btn btn-primary">Entry <span>${item.entry_fee} Rs</span></button>
            </div>
        </div> 
    </div>`;
    });
    text += `</div>`;
    data.data.forEach((item, index) => {
    
        var countDownDate = new Date(`Mar 02, 2022 ${item.end_timer}`).getTime();

        // Update the count down every 1 second
        var x = setInterval(function () {

            // Get todays date and time
            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = countDownDate - now;
           

             
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Output the result in an element with id="demo"
            document.getElementById(`dda${index}`).innerHTML = minutes + "m " + seconds + "s ";

            // If the count down is over, write some text 
            if (distance < 0) { 
                clearInterval(x);
                document.getElementById(`dda${index}`).innerHTML =  '00' + "m " + '00' + "s ";
                // playOnline(`${item.category_name}`)
            }
        }, 1000);
    }); 
    document.getElementById("ListMenu").innerHTML = text;
    console.log(`data message `, data)
});



function playOnline(type) {
    console.log(type)

    socket.emit("OnLobbyCardList", { type: type ,user_id:66});
}



function OnSendOtp() {
    socket.emit("OnSendOtp", { phone: 9955956721, email: 'rahulkumar@nmsgames.com', device_id: 123456798 });
}
socket.on("OnSendOtp", (data) => {
    console.log('My OnSendOtp ', data)
})
function myProfile(id) {
    const obj = {
        user_id: 1
    }
    socket.emit("OnUserProfile", obj);
    console.log(obj)
}

function TransactionHistory(id) {
    const obj = {
        user_id: 94
    }
    socket.emit("OnTransactionHistoy", obj);
    console.log(obj)
}
function OnEntryLobby(obj) { 
    var elem = document.getElementById('user_id').value;
    // const data = {
    //     user_id:elem,
    //     data: decodeURIComponent(decodeURIComponent(obj))
    // }
  
    // socket.emit("OnPlayTournament",data);
    // // console.log('OnPlayTournament', JSON.parse(decodeURIComponent(obj)))
    // // const data = {
    // //     tournament_id: decodeURIComponent(obj).tournament_id
    // // }
    socket.emit("OnPlayTournament", JSON.parse(decodeURIComponent(obj)));
    // console.log('OnPlayTournament', JSON.parse(decodeURIComponent(obj)))
}

socket.on("OnPlayTournament", (data) => {
    console.log('My OnPlayTournament ', data)
})
//Check user logged 

// function LoginWithOtp() {
//     socket.emit("OnLogin", { phone: 9060665647, device_id: '123456798', username: 'rakesh', email: 'rajendra@nmsgames.com'});
// }

// socket.on("OnLogin", (data) => {
//     console.log('My OnLogin ddd ', data)
// })

// function OnLoggedIn() {
//     socket.emit("OnLoggedIn", { phone: 9060665647, email: 'rajendra@nmsgames.com', device_id: '1234567890' });
// }
// socket.on("OnLoggedIn", (data) => {
//     console.log('My OnLogin ', data)
// })

// function updateProfile() {
//     socket.emit("OnUpdateProfile", { user_id: 1, email_id: 'rajendra@nmsgames.com', device_id: '1234567890',username:"rajesh",dob:'2001-06-16' });
// }
// socket.on("OnUpdateProfile", (data) => {
//     console.log('My OnUpdateProfile ', data)
// })
// //bank detail
// function bank() {
   
//     socket.emit("OnUpdateBankDetail", { user_id: 1,ifsc_code:'BKID0056', account_holder_name: 'rajnedra',  account_number:"1234567890123456",confirm_account_number:'1234567890123456' });
// }
// socket.on("OnUpdateBankDetail", (data) => {
//     console.log('My bankDetailsUpdate ', data)
// })

 

// function upiU() {
   
//     socket.emit("OnUpdateUpiID", { user_id: '3' ,upi_id:'jaydeep@upi'});
// }
// socket.on("OnUpdateUpiID", (data) => {
//     console.log('My OnUpdateUpiID ', data)
// })
 

// ///CREate Tick
// function createTicket() {
//   const data =   {
//         user_id:1,
//         ticket_title:'First title demo',
//         description:'asdfd adfdf adfdfd adfdfa adfdf adfd'
//     }
//     socket.emit("OnUserCreateTicket", data);
// }
// socket.on("OnUserCreateTicket", (data) => {
//     console.log('My OnUserCreateTicket ', data)
// })

// function showTicket() {
//     const data =   {
//           user_id:1 
//       }
//       socket.emit("OnUserTickets", data);
//   }
//   socket.on("OnUserTickets", (data) => {
//       console.log('My OnUserTickets ', data)
//   })

//   function forceLogin() {
//     const data =   {
//           phone:null,
//           email:'raj@gmail.in',
//           device_id:'1234567890'
//       }
//       socket.emit("OnUserForceLogin", data);
//   }
//   socket.on("OnUserForceLogin", (data) => {
//       console.log('My OnUserForceLogin ', data)
//   })

//   document.getElementById('file').addEventListener('change', function() {

//     const reader = new FileReader();
//     reader.onload = function() {
//       const base64 = this.result.replace(/.*base64,/, '');
//       console.log(base64)
//       const img = new Image();
//     // change image type to whatever you use, or detect it in the backend 
//     // and send it if you support multiple extensions
//     const letss = `data:image/jpg;base64,${base64}`
//     console.log(letss)
//     //   socket.emit('image', base64);
//     };
//     reader.readAsDataURL(this.files[0]);
  
//   }, false);


//   function WithDraw() {
//     const data =   {
//           user_id:1, 
//           req_amount:2
//       }
//       socket.emit("OnWithdrawRequest", data);
//   }
//   socket.on("OnWithdrawRequest", (data) => {
//       console.log('My WithDraw ', data)
//   })
