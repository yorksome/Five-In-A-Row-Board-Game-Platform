var express=require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var mongoose = require('./config/mongoose.js');
var db = mongoose();

var loginRouter = require('./routes/login');
var loginProcessRouter = require('./routes/login_process');
//var indexRouter = require('./routes/index');
var regRouter = require('./routes/register');
var resetRouter = require('./routes/reset');
//app.set('views','views');
//app.set('view engine', 'html');
app.use(cookieParser('userStorage'));
app.use(session({
  resave:true,
  saveUninitialized:false,
  secret:'userStorage',
  name:'loginAcc',
  cookie:{
    maxAge:-1
  }
}));

//app.use(bodyParser.json()); // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',loginRouter); //render login page
//app.use('/index',indexRouter);
app.post('/loginProcess',loginProcessRouter); // login post process
app.post('/register',regRouter); // register post process
app.post('/reset',resetRouter);
app.use(express.static('public')); // provide static files such as images
app.use(function(req, res, next) {
  res.locals.session = req.session; // global variable that might change
  if (!req.session.user) {
    if (req.url == "/") {
      next(); //如果请求的地址是登录则通过，进行下一个请求
    } else {
      res.redirect('/');//跳转到登录页面
    }
  } else if (req.session.user) {
    var id = req.session.user;
    res.redirect('/loginProcess');
    next();//如果已经登录，则可以进入
  }
});

var userNum=0;//用来记录在线用户人数
var role=true;//用来分配下棋的身份
var onlineUser={}; //用来存储在线人数及socket的id
io.on('connection', function(socket){
  socket.on('gaming',function(obj){
    onlineUser[socket.id]=obj;
    //谁来的跟谁分配权限  下黑旗，白旗还是观战
    userNum++;
    if(userNum==1){
        onlineUser[socket.id]=Object.assign(obj,{role:true});
    }else if(userNum==2){
        onlineUser[socket.id]=Object.assign(obj,{role:false});
    }else if(userNum>2){
        onlineUser[socket.id]=obj;
    }

    io.to(socket.id).emit('role', onlineUser[socket.id]);//将身份信息（下黑旗还是白旗）传过去
    io.emit('online', onlineUser);//将在线人员名单带过去
    console.log(obj.userName,'is loginning');
    console.log('在线用户',onlineUser,'在线人数',userNum);
  })
  socket.on('disconnect', function(){
    console.log(socket.id,'disconnected');
    if(onlineUser.hasOwnProperty(socket.id)){//disconnect的时候，将它从onlineUser里删掉
      delete onlineUser[socket.id];
      userNum--;
    }
    io.emit('online',onlineUser);//用来同步数据在线人数
    console.log('在线用户',onlineUser,'在线人数',userNum);
  });
  socket.on('chat message', function(msg){
    // 参数为下到什么坐标和目前是黑方or白方
    console.log(msg.player?'黑方':'白方','落子在: ' + msg.place);
    io.emit('chat message', msg);
  });
  socket.on('reset', function(msg){
    //参数为目前黑旗or白旗
    console.log('清除重来');
    io.emit('reset',msg);
  });
});

http.listen(3000, function(){
  console.log('listening on :3000');
});
