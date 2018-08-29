var express=require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var mongoose = require('./config/mongoose.js');
var db = mongoose();

var loginRouter = require('./routes/login');
var loginProcessRouter = require('./routes/login_process');
var indexRouter = require('./routes/index');
var regRouter = require('./routes/register');
var resRouter = require('./routes/reset');
var regProcessRouter = require('./routes/register_process');
var resetProcessRouter = require('./routes/reset_process');
var logoutRouter = require('./routes/logout');
var profileRouter = require('./routes/profile');
var historyRouter = require('./routes/history');
var gameRouter = require('./routes/gaming');
var resultRouter = require('./routes/result');
var vic,los;

app.set('views','views');
app.set('view engine','ejs'); //utilize ejs template
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static('public')); // provide static files such as images
app.use('/lib',express.static('node_modules'));

app.use(session({
  resave:true,
  saveUninitialized:false,
  secret:'userStorage',
  cookie:{
    maxAge:15*60*1000,
    secure:false
  }
}));

app.use('/',loginRouter); //render login page
app.use('/index',indexRouter); // render index page
app.use('/register',regRouter); // render register page
app.use('/reset',resRouter); // render reset page
app.use('/logout',logoutRouter); // render logout page
app.use('/profile',profileRouter);// render personal profile
app.use('/history',historyRouter);// render history page
app.use('/gaming',gameRouter); //render game page
app.post('/loginProcess',loginProcessRouter); // login post process
app.post('/registerProcess',regProcessRouter); // register post process
app.post('/resetProcess',resetProcessRouter); // reset post process
app.post('/result',resultRouter);

app.use(function(req, res, next) {
  var sess = req.session; // global variable that might change
  var loginUser = sess.user;
  if (!loginUser) {
    res.redirect('/');
  } else if (loginUser) {
    res.redirect('/index');
    next();
  }
});

var userNum=0;//Online User Numbers
var role=true;//Black or White
var onlineUser={};
var gamingUser = {};
var offerDraw = {};
io.on('connection', function(socket){
  socket.on('login',function(obj){
    onlineUser[socket.id]=obj;
    //Assign White / Black STONE
    userNum++;
    if(userNum==1){
        onlineUser[socket.id]=Object.assign(obj,{role:true});
        gamingUser[socket.id]=Object.assign(obj,{win:null,status:0});
    }else if(userNum==2){
        onlineUser[socket.id]=Object.assign(obj,{role:false});
        gamingUser[socket.id]=Object.assign(obj,{win:null,status:0});
    }else if(userNum>2){
        onlineUser[socket.id]=obj;
    }

    io.to(socket.id).emit('role', onlineUser[socket.id]);//Role: Black / White
    io.emit('online', onlineUser);
    io.emit('gaming', gamingUser);
    console.log('Online User: ',onlineUser,'Online Numbers: ',userNum);
    console.log('Gaming User: ',gamingUser);
  })
  socket.on('disconnect', function(obj){
    onlineUser[socket.id]=obj;
    gamingUser[socket.id]=obj;
    offerDraw[socket.id]=obj;
    if(onlineUser[socket.id]){//disconnect invoked, delete user from onlineUser
      delete onlineUser[socket.id];
      userNum--;
    }
    if(gamingUser[socket.id]){
      delete gamingUser[socket.id];
    }
    if(offerDraw[socket.id]){
      delete offerDraw[socket.id];
    }
    io.emit('online',onlineUser);// Update Online Users
    io.emit('gaming',gamingUser);// Update Gaming Users
    io.emit('offerdraw',offerDraw);// Update Users who wants to offer draw
    console.log('Online User: ',onlineUser,'Online Numbers: ',userNum);
    console.log('Gaming User:',gamingUser);
  });
  socket.on('chat message', function(msg){
    // parameter - stores location & Turn
    console.log(msg.player?'Black':'White','placed at: ' + msg.place);
    io.emit('chat message', msg);
  });
  socket.on('quit', function(obj){
    //parameter - Black or White
    console.log(obj.userName+' requests quit. Current Board Status: '+ obj.status);
    io.emit('quit',obj);
  });
  socket.on('number',function(obj){
    onlineUser[socket.id]=obj;
    gamingUser[socket.id]=obj;
    offerDraw[socket.id]=obj;

    if(onlineUser.hasOwnProperty(socket.id)){//disconnect invoked, delete user from onlineUser
      delete onlineUser[socket.id];
      userNum--;
    }
    if(gamingUser.hasOwnProperty(socket.id)){
      delete gamingUser[socket.id];
    }
    if(offerDraw.hasOwnProperty(socket.id)){
      delete offerDraw[socket.id];
    }
    io.emit('online',onlineUser);// Update Online Users
    io.emit('gaming',gamingUser);// Update Gaming Users
    io.emit('offerdraw',offerDraw);// Update Users who wants to offer draw
    console.log('Online User: ',onlineUser,'Online Numbers: ',userNum);
    console.log('Gaming User:',gamingUser);
  });
  socket.on('giveup',function(obj){
    console.log(obj.userName + ' gave up the game.');
    io.emit('give up',obj);
  });
  socket.on('offerdraw',function(obj){
    console.log(obj.userName + ' wants to offer draw.');
    offerDraw[socket.id]=obj;
    io.emit('offer draw',obj);
    io.emit('draw',offerDraw);
  });
  socket.on('pullback',function(msg){
    console.log(msg.userName+' pulled back last operation.');
    io.emit('pull back',msg);
  });
});

http.listen(3000, function(){
  console.log('listening on :3000');
});
