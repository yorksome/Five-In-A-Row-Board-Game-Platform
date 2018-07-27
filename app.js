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
app.use('/gaming',gameRouter);//render game page
app.post('/loginProcess',loginProcessRouter); // login post process
app.post('/registerProcess',regProcessRouter); // register post process
app.post('/resetProcess',resetProcessRouter);
app.post('/result',resultRouter);

app.use(function(req, res, next) {
  res.locals.session = req.session; // global variable that might change
  if (!req.session.user) {
    if (req.url == "/") {
      next();
    } else {
      res.redirect('/');
    }
  } else if (req.session.user) {
    next();
  }
});

var userNum=0;//用来记录在线用户人数
var role=true;//用来分配下棋的身份
var onlineUser={}; //用来存储在线人数及socket的id
var gamingUser = {}; //在游戏中的一对
io.on('connection', function(socket){
  socket.on('login',function(obj){
    onlineUser[socket.id]=obj;
    //谁来的跟谁分配权限  下黑旗，白旗还是观战
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

    io.to(socket.id).emit('role', onlineUser[socket.id]);//将身份信息（下黑旗还是白旗）传过去
    io.emit('online', onlineUser);//将在线人员名单带过去
    io.emit('gaming', gamingUser);//在玩人员名单带过去
    console.log('Online User: ',onlineUser,'Online Numbers: ',userNum);
    console.log('Gaming User:',gamingUser);
  })
  socket.on('disconnect', function(obj){
    onlineUser[socket.id]=obj;
    gamingUser[socket.id]=obj;
    console.log(obj.userName,'disconnected');
    if(onlineUser.hasOwnProperty(socket.id)){//disconnect的时候，将它从onlineUser里删掉
      delete onlineUser[socket.id];
      userNum--;
    }
    if(gamingUser.hasOwnProperty(socket.id)){//disconnect的时候，将它从onlineUser里删掉
      delete gamingUser[socket.id];
    }
    io.emit('online',onlineUser);//用来同步数据在线人数
    io.emit('gaming',gamingUser);
    console.log('Online User: ',onlineUser,'Online Numbers: ',userNum);
    console.log('Gaming User:',gamingUser);
  });
  socket.on('chat message', function(msg){
    // 参数为下到什么坐标和目前是黑方or白方
    console.log(msg.player?'Black':'White','placed at: ' + msg.place);
    io.emit('chat message', msg);
  });
  socket.on('reset', function(msg){
    //参数为目前黑旗or白旗
    console.log('Restart');
    io.emit('reset',msg);
  });
});

http.listen(3000, function(){
  console.log('listening on :3000');
});
