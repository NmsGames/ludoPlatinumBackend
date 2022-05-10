require('dotenv').config()
require('./config/db') 
const express = require('express');
const cors    = require('cors');
const app     = express();
const http    = require("http").createServer(app);
const port    = process.env.PORT || 5000
const Log     = require('debug')('server');
const io      = require("socket.io")(http);
const path    = require('path');   
const fileupload = require('express-fileupload')
// require("./Gameplay/index").sendSocket(io.sockets);
require("./ServerSocket.js").createSocket(io); 
// import routes
 
 const CheckoutRoute = require('./src/paymentroutes/CheckoutRoute')
const AuthRoute     = require('./src/routes/AuthRoutes')  
const ThankYouRoute = require('./src/ThankYouRoute')
const TransactionsRoutes = require('./src/routes/TransactionsRoutes')
const UserRoutes = require('./src/routes/UserRoutes')
const KYCRoutes = require('./src/routes/KYCRoutes')
// const CashfreePayoutRoutes = require('./src/routes/CashfreePayoutRoutes')
const TicketQueryRoutes = require('./src/routes/TicketQueryRoutes')
const GameRoutes = require('./src/routes/GameRoutes')
const CashfreePayoutRoutes = require('./src/CashfreePayouts/CashfreePayoutRoutes')
require('./services/CronJob')
 
app.set('views' , path.join(__dirname,'views'));
app.set('view engine','ejs');
app.set('view options', {layout: 'layout.ejs'});
app.use(fileupload())
app.use(express.static('public'))
app.use(cors())
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use('/checkout',CheckoutRoute);
app.use('/auth',AuthRoute)
app.use('/addMoney',TransactionsRoutes)
app.use('/success',ThankYouRoute)
app.use('/api/me',TransactionsRoutes)
app.use('/api/users',UserRoutes)
app.use('/api/kyc',KYCRoutes)
// app.use('/cashfree',CashfreePayoutRoutes)
app.use('/api/query',TicketQueryRoutes)
app.use('/money',TransactionsRoutes)
app.use('/game',GameRoutes)
app.use('/payouts',CashfreePayoutRoutes)

//routes
app.get("/servertesting", (req, res) => {
  res.sendFile(path.join(__dirname + '/public/test/index.html'));
});
 //below will not be hit as server is not on https://
app.post('/notify', (req, res, next)=>{  
  return res.status(200).send({
      status: "success",
  })
});
app.get('/',(req, res, next)=>{ 
  return res.status(200).send({status:200,message:'default routes'});
});
app.get('/payment',(req, res, next)=>{ 
  return res.status(200).render("index");
});
 
app.use((err, req , res , next)=>{ 
  res.status(500).send({
      status:"fail",
      err: err.message,
  });
})
 
http.listen(port, () => {
  console.log("Server listening on port =>", port);
})

