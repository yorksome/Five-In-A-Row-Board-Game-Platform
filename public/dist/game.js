var wrap = document.getElementById('wrap');
var login = document.getElementsByClassName('login')[0];
var real = document.getElementById('user');
var rank = document.getElementById('rank');
var credit = document.getElementById('credit');
var quit = document.getElementById('quit');
var socket;
var pull_no = 2;

function renderBoard(props) {
  if (credit.value >= 0) {
    login.style.display = 'none';
    wrap.style.display = 'block';
    socket = io();
    socket.emit('login', { 'userName': real.value, 'rank': rank.value, 'credit': credit.value, 'quit': quit.value });
    ReactDOM.render(React.createElement(Board, null), document.getElementById('wrap'));
  } else {
    alert('Game Blocked. Email to <yekang.gong@durham.ac.uk> for recovery.');
  }
}

//Quit Button
function Quit(props) {
  return React.createElement(
    'button',
    { onClick: () => props.onClick(), className: 'quit' },
    'Quit'
  );
}

//Pull Back
function Pull(props) {
  return React.createElement(
    'button',
    { onClick: () => props.onClick(), className: 'pull' },
    'Pull Back'
  );
}

//Give up match
function Give(props) {
  return React.createElement(
    'button',
    { onClick: () => props.onClick(), className: 'give' },
    'Give Up'
  );
}

// Draw offer
function Draw(props) {
  return React.createElement(
    'button',
    { onClick: () => props.onClick(), className: 'draw' },
    'Offer Draw'
  );
}

function Unit(props) {
  return React.createElement('div', { className: props.style, onClick: () => props.onClick() });
}

//Online Player Numbers
function OnlinePlayer(props) {
  let arr = [];
  for (let key in props.online) {
    arr.push(props.online[key]);
  }
  return React.createElement(
    'div',
    { className: 'online' },
    arr.map(function (value, index) {
      if (value.hasOwnProperty('role') && value.role) {
        return React.createElement(
          'div',
          { key: index, className: 'clearfix' },
          React.createElement(Unit, { style: 'unit unit-b' }),
          React.createElement(
            'div',
            { className: 'fl' },
            value.userName,
            '   [Rank: ',
            value.rank,
            ', Reputation: ',
            value.credit,
            ', Quit: ',
            value.quit,
            ']'
          )
        );
      } else if (value.hasOwnProperty('role') && !value.role) {
        return React.createElement(
          'div',
          { key: index, className: 'clearfix' },
          React.createElement(Unit, { style: 'unit unit-w' }),
          React.createElement(
            'div',
            { className: 'fl' },
            value.userName,
            '   [Rank: ',
            value.rank,
            ', Reputation: ',
            value.credit,
            ', Quit: ',
            value.quit,
            ']'
          )
        );
      } else {
        return React.createElement(
          'p',
          { key: index },
          value.userName,
          ' : is observing.'
        );
      }
    })
  );
}

//Players Turn
function Turn(props) {
  var result;
  if (props.turn) {
    result = React.createElement(
      'div',
      { className: 'turn' },
      React.createElement(
        'strong',
        null,
        'BLACK'
      )
    );
  } else {
    result = React.createElement(
      'div',
      { className: 'turn' },
      React.createElement(
        'strong',
        null,
        'WHITE'
      )
    );
  }
  return result;
}

//Main Board
class Board extends React.Component {
  constructor() {
    super();
    this.state = {
      'styleArr': Array(225).fill('unit'),
      isBlacksTurn: true,
      point: -1,
      last: null,
      urBlack: null,
      status: -1,
      giveup: null,
      quit: null,
      draw: {},
      online: {},
      gaming: {}
    };
  }
  componentWillMount() {
    var that = this;
    socket.on('role', function (msg) {
      if (msg.hasOwnProperty('role') && msg.role) {
        that.setState({ urBlack: true });
        console.log('You are Black.');
      } else if (msg.hasOwnProperty('role') && !msg.role) {
        that.setState({ urBlack: false });
        console.log('You are white.');
      } else {
        console.log('Chess Board Busy.');
      }
    });
    socket.on('online', function (user) {
      that.setState({ online: user });
    });
    socket.on('gaming', function (user) {
      that.setState({ gaming: user });
    });
  }
  componentDidMount() {
    var that = this;
    var last_point;

    socket.on('chat message', function (msg) {
      const styleArray = that.state.styleArr.slice();
      styleArray[msg.place] = that.state.isBlacksTurn ? 'unit unit-b' : 'unit unit-w';
      if (that.state.point == -1) {
        that.setState({
          'styleArr': styleArray,
          isBlacksTurn: !that.state.isBlacksTurn,
          point: msg.place,
          status: 0
        });
        last_point = msg.place;
      } else {
        that.setState({
          'styleArr': styleArray,
          isBlacksTurn: !that.state.isBlacksTurn,
          point: msg.place,
          last: last_point
        });
      }
    });
    socket.on('quit', function (obj) {
      if (obj.status == -1 || obj.status == 1) {
        alert('You are directing to index.');
        window.location = '/index';
        console.log(obj.userName + ' quit the game.');
      } else {
        if (obj.userName == real.value) {
          let result = window.confirm('You are still in game. Leave will lose reputation scores.');
          if (result) {
            alert('Submit result to quit');
            console.log('quit');
            that.setState({
              quit: obj.userName
            });
          }
        } else {
          alert('Opponent desired to quit');
          that.setState({
            quit: obj.userName
          });
        }
      }
    });
    socket.on('give up', function (obj) {
      console.log(obj.userName + ' give up');
      that.setState({
        status: 1,
        giveup: obj.userName
      });
    });
    socket.on('offer draw', function (obj) {
      let styles = {
        color: 'red'
      };
      if (obj.userName != real.value) {
        alert(obj.userName + ' wants to offer draw.');
      }
      ReactDOM.render(React.createElement(
        'div',
        { style: styles },
        ' * Reminder: ',
        obj.userName,
        ' wants to offer draw. '
      ), document.getElementById('warning'));
    });
    socket.on('draw', function (user) {
      that.setState({
        draw: user
      });
    });
    socket.on('pull back', function (msg) {
      console.log(msg.userName + ' pull back');
      const styleArray = that.state.styleArr.slice();
      if (msg.userName != real.value) {
        alert(msg.userName + ' pulled back.');
      }
      styleArray[msg.place] = 'unit';
      that.setState({
        'styleArr': styleArray,
        isBlacksTurn: !msg.turn,
        point: last_point
      });
    });
  }

  handle(n) {
    // CSS stones
    let num = 0;
    for (let i in this.state.online) {
      num++;
    }
    if (num < 2) {
      alert('Waiting for a partner.');
      return;
    }

    if (this.state.isBlacksTurn == this.state.urBlack) {
      if (this.state.styleArr[n] != 'unit') {
        alert('The place is occupied.');
        return;
      }
      socket.emit('chat message', { 'place': n, 'player': this.state.isBlacksTurn });
    } else {
      alert('It is not your turn.');
    }
  }
  quit() {
    socket.emit('quit', { "userName": real.value, "turn": this.state.isBlacksTurn, "status": this.state.status });
  }

  pull() {
    if (pull_no > 0 && this.state.status == 0) {
      socket.emit('pullback', { "place": this.state.point, "turn": this.state.isBlacksTurn, 'userName': real.value });
      pull_no--;
      alert(pull_no + ' time(s) left.');
    } else {
      if (this.state.status != 0) {
        alert('Cannot pull back.');
      }
      if (pull_no <= 0) {
        alert('Ran out of times.');
      }
    }
  }

  give() {
    socket.emit('giveup', { "userName": real.value });
  }

  draw() {
    socket.emit('offerdraw', { "userName": real.value });
  }

  componentDidUpdate() {
    // UI Update
    var gamingUser = this.state.gaming;
    var drawUser = this.state.draw;
    var p1 = real.value;
    var p1Rank = rank.value;
    var p1Rep = credit.value;
    var p1Quit = quit.value;
    var p1Status, p1Win;
    var p2, p2Rank, p2Rep, p2Quit, p2Status, p2Win;
    var num = 0;
    var styles = {
      color: 'red'
    };

    for (let key in gamingUser) {
      if (gamingUser[key].userName != p1) {
        p2 = gamingUser[key].userName;
        p2Rank = gamingUser[key].rank;
        p2Rep = gamingUser[key].credit;
        p2Quit = gamingUser[key].quit;
        p2Status = gamingUser[key].status;
        p2Win = gamingUser[key].win;
      } else {
        p1Status = gamingUser[key].status;
        p1Win = gamingUser[key].win;
      }
    }

    for (let key in drawUser) {
      num++;
    }

    if (this.state.status == 0 && num > 1) {
      alert('Offer Draw. No winner.');
      p1Status = p2Status = 0;
      p1Win = 'offer draw';p2Win = 'offer draw';
      let styles = {
        color: 'red'
      };
      ReactDOM.render(React.createElement(
        'div',
        { style: styles },
        '* Two players offered draw together. No winner.'
      ), document.getElementById('warning'));
      ReactDOM.render(React.createElement('img', { src: 'img/draw.png', className: 'victory' }), document.getElementById('gameover'));
      ReactDOM.render(React.createElement(
        'form',
        { action: '/result', method: 'post', onSubmit: this.submit },
        React.createElement(
          'table',
          null,
          React.createElement(
            'tbody',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1', name: 'p1', defaultValue: p1 })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Rank', name: 'p1Rank', defaultValue: p1Rank })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Rep', name: 'p1Rep', defaultValue: p1Rep })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Quit', name: 'p1Quit', defaultValue: p1Quit })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Status', name: 'p1Status', defaultValue: p1Status })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Win', name: 'p1Win', defaultValue: p1Win })
              )
            ),
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2', name: 'p2', defaultValue: p2 })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Rank', name: 'p2Rank', defaultValue: p2Rank })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Rep', name: 'p2Rep', defaultValue: p2Rep })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Quit', name: 'p2Quit', defaultValue: p2Quit })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Status', name: 'p2Status', defaultValue: p2Status })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Win', name: 'p2Win', defaultValue: p2Win })
              )
            ),
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'submit', value: 'Submit Result' })
              )
            )
          )
        )
      ), document.getElementById('result'));
    }

    if (p1 == this.state.quit) {
      p1Status = -1;p2Status = 0;
      p1Win = 'quit';p2Win = 'forced left';
      ReactDOM.render(React.createElement('img', { src: 'img/defeat.png', className: 'victory' }), document.getElementById('gameover'));
      ReactDOM.render(React.createElement(
        'form',
        { action: '/result', method: 'post', onSubmit: this.submit },
        React.createElement(
          'table',
          null,
          React.createElement(
            'tbody',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1', name: 'p1', defaultValue: p1 })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Rank', name: 'p1Rank', defaultValue: p1Rank })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Rep', name: 'p1Rep', defaultValue: p1Rep })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Quit', name: 'p1Quit', defaultValue: p1Quit })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Status', name: 'p1Status', defaultValue: p1Status })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p1Win', name: 'p1Win', defaultValue: p1Win })
              )
            ),
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2', name: 'p2', defaultValue: p2 })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Rank', name: 'p2Rank', defaultValue: p2Rank })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Rep', name: 'p2Rep', defaultValue: p2Rep })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Quit', name: 'p2Quit', defaultValue: p2Quit })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Status', name: 'p2Status', defaultValue: p2Status })
              ),
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'text', id: 'p2Win', name: 'p2Win', defaultValue: p2Win })
              )
            ),
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                null,
                React.createElement('input', { type: 'submit', value: 'Submit Result' })
              )
            )
          )
        )
      ), document.getElementById('result'));
    } else {
      if (p1 != this.state.quit && this.state.quit != null) {
        p1Status = 0;p2Status = -1;
        p1Win = 'forced left';p2Win = 'quit';
        ReactDOM.render(React.createElement('img', { src: 'img/victory.png', className: 'victory' }), document.getElementById('gameover'));
        ReactDOM.render(React.createElement(
          'form',
          { action: '/result', method: 'post', onSubmit: this.submit },
          React.createElement(
            'table',
            null,
            React.createElement(
              'tbody',
              null,
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1', name: 'p1', defaultValue: p1 })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Rank', name: 'p1Rank', defaultValue: p1Rank })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Rep', name: 'p1Rep', defaultValue: p1Rep })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Quit', name: 'p1Quit', defaultValue: p1Quit })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Status', name: 'p1Status', defaultValue: p1Status })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Win', name: 'p1Win', defaultValue: p1Win })
                )
              ),
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2', name: 'p2', defaultValue: p2 })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Rank', name: 'p2Rank', defaultValue: p2Rank })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Rep', name: 'p2Rep', defaultValue: p2Rep })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Quit', name: 'p2Quit', defaultValue: p2Quit })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Status', name: 'p2Status', defaultValue: p2Status })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Win', name: 'p2Win', defaultValue: p2Win })
                )
              ),
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'submit', value: 'Submit Result' })
                )
              )
            )
          )
        ), document.getElementById('result'));
      }
    }

    if (this.state.status == -1 || this.state.status == 0) {
      if (calculateWinner(this.state.styleArr, this.state.point)) {
        if (this.state.isBlacksTurn != this.state.urBlack && this.state.urBlack != null) {
          ReactDOM.render(React.createElement('img', { src: 'img/victory.png', className: 'victory' }), document.getElementById('gameover'));
          socket.emit('victory', { userName: real.value });
          p1Status = p2Status = 1;
          p1Win = 'victory';p2Win = 'defeat';
          ReactDOM.render(React.createElement(
            'form',
            { action: '/result', method: 'post', onSubmit: this.submit },
            React.createElement(
              'table',
              null,
              React.createElement(
                'tbody',
                null,
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1', name: 'p1', defaultValue: p1 })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Rank', name: 'p1Rank', defaultValue: p1Rank })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Rep', name: 'p1Rep', defaultValue: p1Rep })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Quit', name: 'p1Quit', defaultValue: p1Quit })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Status', name: 'p1Status', defaultValue: p1Status })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Win', name: 'p1Win', defaultValue: p1Win })
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2', name: 'p2', defaultValue: p2 })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Rank', name: 'p2Rank', defaultValue: p2Rank })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Rep', name: 'p2Rep', defaultValue: p2Rep })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Quit', name: 'p2Quit', defaultValue: p2Quit })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Status', name: 'p2Status', defaultValue: p2Status })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Win', name: 'p2Win', defaultValue: p2Win })
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'submit', value: 'Submit Result' })
                  )
                )
              )
            )
          ), document.getElementById('result'));
        } else {
          ReactDOM.render(React.createElement('img', { src: 'img/defeat.png', className: 'victory' }), document.getElementById('gameover'));
          socket.emit('defeat', { userName: real.value });
          p1Status = p2Status = 1;
          p1Win = 'defeat';p2Win = 'victory';
          ReactDOM.render(React.createElement(
            'form',
            { action: '/result', method: 'post', onSubmit: this.submit },
            React.createElement(
              'table',
              null,
              React.createElement(
                'tbody',
                null,
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1', name: 'p1', defaultValue: p1 })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Rank', name: 'p1Rank', defaultValue: p1Rank })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Rep', name: 'p1Rep', defaultValue: p1Rep })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Quit', name: 'p1Quit', defaultValue: p1Quit })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Status', name: 'p1Status', defaultValue: p1Status })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Win', name: 'p1Win', defaultValue: p1Win })
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2', name: 'p2', defaultValue: p2 })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Rank', name: 'p2Rank', defaultValue: p2Rank })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Rep', name: 'p2Rep', defaultValue: p2Rep })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Quit', name: 'p2Quit', defaultValue: p2Quit })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Status', name: 'p2Status', defaultValue: p2Status })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Win', name: 'p2Win', defaultValue: p2Win })
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'submit', value: 'Submit Result' })
                  )
                )
              )
            )
          ), document.getElementById('result'));
        }
      }
    } else {
      if (this.state.status == 1 && p1 == this.state.giveup) {
        ReactDOM.render(React.createElement('img', { src: 'img/defeat.png', className: 'victory' }), document.getElementById('gameover'));
        alert('You lost.');
        p1Status = p2Status = 1;
        p1Win = 'defeat';p2Win = 'victory';
        ReactDOM.render(React.createElement(
          'form',
          { action: '/result', method: 'post', onSubmit: this.submit },
          React.createElement(
            'table',
            null,
            React.createElement(
              'tbody',
              null,
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1', name: 'p1', defaultValue: p1 })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Rank', name: 'p1Rank', defaultValue: p1Rank })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Rep', name: 'p1Rep', defaultValue: p1Rep })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Quit', name: 'p1Quit', defaultValue: p1Quit })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Status', name: 'p1Status', defaultValue: p1Status })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p1Win', name: 'p1Win', defaultValue: p1Win })
                )
              ),
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2', name: 'p2', defaultValue: p2 })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Rank', name: 'p2Rank', defaultValue: p2Rank })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Rep', name: 'p2Rep', defaultValue: p2Rep })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Quit', name: 'p2Quit', defaultValue: p2Quit })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Status', name: 'p2Status', defaultValue: p2Status })
                ),
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'text', id: 'p2Win', name: 'p2Win', defaultValue: p2Win })
                )
              ),
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  null,
                  React.createElement('input', { type: 'submit', value: 'Submit Result' })
                )
              )
            )
          )
        ), document.getElementById('result'));
      } else {
        if (this.state.status == 1 && p1 != this.state.giveup && this.state.giveup != null) {
          ReactDOM.render(React.createElement('img', { src: 'img/victory.png', className: 'victory' }), document.getElementById('gameover'));
          alert(this.state.giveup + ' gave up the game.');
          p1Status = p2Status = 1;
          p1Win = 'victory';p2Win = 'defeat';
          ReactDOM.render(React.createElement(
            'form',
            { action: '/result', method: 'post', onSubmit: this.submit },
            React.createElement(
              'table',
              null,
              React.createElement(
                'tbody',
                null,
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1', name: 'p1', defaultValue: p1 })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Rank', name: 'p1Rank', defaultValue: p1Rank })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Rep', name: 'p1Rep', defaultValue: p1Rep })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Quit', name: 'p1Quit', defaultValue: p1Quit })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Status', name: 'p1Status', defaultValue: p1Status })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p1Win', name: 'p1Win', defaultValue: p1Win })
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2', name: 'p2', defaultValue: p2 })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Rank', name: 'p2Rank', defaultValue: p2Rank })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Rep', name: 'p2Rep', defaultValue: p2Rep })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Quit', name: 'p2Quit', defaultValue: p2Quit })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Status', name: 'p2Status', defaultValue: p2Status })
                  ),
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', id: 'p2Win', name: 'p2Win', defaultValue: p2Win })
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'submit', value: 'Submit Result' })
                  )
                )
              )
            )
          ), document.getElementById('result'));
        }
      }
    }
  }

  submit(e) {
    console.log('Submit Result');
    const path = '/result';
    browserHistory.push(path);
    e.preventDefault();
  }

  render() {

    let board = [];
    for (let r = 0; r < 15; r++) {
      for (let i = 0; i < 15; i++) {
        board[r * 15 + i] = React.createElement(Unit, { key: [r, i], style: this.state.styleArr[r * 15 + i], onClick: () => this.handle(r * 15 + i) });
      }
    }
    return React.createElement(
      'div',
      null,
      React.createElement(OnlinePlayer, { online: this.state.online }),
      React.createElement('div', { id: 'warning' }),
      board,
      React.createElement(Turn, { turn: this.state.isBlacksTurn }),
      React.createElement(Quit, { onClick: () => this.quit() }),
      React.createElement(Pull, { onClick: () => this.pull() }),
      React.createElement(Give, { onClick: () => this.give() }),
      React.createElement(Draw, { onClick: () => this.draw() }),
      React.createElement('div', { id: 'gameover' }),
      React.createElement('div', { id: 'result' })
    );
  }
}

function calculateWinner(arr, num) {
  var target = arr[num];
  var line = 1;
  var upSide, leftUp, rightUp;
  upSide = leftUp = rightUp = Math.min(Math.floor(num / 15), 5);
  // Horizontally
  var leftSide = Math.min(num % 15, 5);
  var rightSide = Math.min(14 - num % 15, 5);
  //console.log('rightSide',rightSide)
  for (let i = num - 1; i > num - leftSide - 1; i--) {
    if (arr[i] == target) {
      line++;
    } else {
      break;
    }
  }
  for (let i = num + 1; i <= num + rightSide; i++) {
    if (arr[i] == target) {
      line++;
    } else {
      break;
    }
  }
  if (line == 5) {
    return true;
  } else {
    line = 1;
  }
  //  Vertically
  for (let i = num - 15; i >= num - upSide * 15; i = i - 15) {
    if (arr[i] == target) {
      line++;
    } else {
      break;
    }
  }
  var downSide = 15 - upSide;
  for (let i = num + 15; i <= num + downSide * 15; i = i + 15) {
    if (arr[i] == target) {
      line++;
    } else {
      break;
    }
  }
  if (line == 5) {
    return true;
  } else {
    line = 1;
  }
  //   Diagonally : /

  rightUp = Math.min(rightUp, rightSide);
  for (let i = num - 14; i >= num - rightUp * 14; i = i - 14) {
    if (arr[i] == target) {
      line++;
    } else {
      break;
    }
  }
  var leftDown, rightDown;
  rightDown = leftDown = 14 - Math.floor(num / 15);
  leftDown = Math.min(leftDown, leftSide);
  for (let i = num + 14; i <= num + leftDown * 14; i = i + 14) {
    if (arr[i] == target) {
      line++;
    } else {
      break;
    }
  }
  if (line == 5) {
    return true;
  } else {
    line = 1;
  }
  //   Diagonally :  \
  rightUp = Math.min(rightUp, leftSide);
  for (let i = num - 16; i >= num - rightUp * 16; i = i - 16) {
    if (arr[i] == target) {
      line++;
    } else {
      break;
    }
  }
  rightDown = Math.min(rightDown, rightSide);
  for (let i = num + 16; i <= num + rightDown * 16; i = i + 16) {
    if (arr[i] == target) {
      line++;
    } else {
      break;
    }
  }
  if (line == 5) {
    return true;
  } else {
    line = 1;
  }

  return false;
}
//# sourceMappingURL=game.js.map
