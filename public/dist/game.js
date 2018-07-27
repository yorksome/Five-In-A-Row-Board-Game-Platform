var wrap = document.getElementById('wrap');
var login = document.getElementsByClassName('login')[0];
var real = document.getElementById('user');
var rank = document.getElementById('rank');
var credit = document.getElementById('credit');
var socket;

function renderBoard(props) {
    if (credit.value >= 0) {
        login.style.display = 'none';
        wrap.style.display = 'block';
        socket = io();
        socket.emit('login', { 'userName': real.value, 'rank': rank.value, 'credit': credit.value });
        ReactDOM.render(React.createElement(Board, null), document.getElementById('wrap'));
    } else {
        alert('Low reputation credits. Game Blocked.');
    }
}
//Restart Button
function Reset(props) {
    return React.createElement(
        'button',
        { onClick: () => props.onClick(), className: 'reset' },
        'Restart'
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
//玩家切换
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
//主棋盘
class Board extends React.Component {
    constructor() {
        super();
        this.state = {
            'styleArr': Array(225).fill('unit'),
            isBlacksTurn: true,
            point: -1,
            urBlack: null,
            status: 0,
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
        socket.on('chat message', function (msg) {
            //更新视图
            const styleArray = that.state.styleArr.slice();
            styleArray[msg.place] = that.state.isBlacksTurn ? 'unit unit-b' : 'unit unit-w';
            that.setState({
                'styleArr': styleArray,
                isBlacksTurn: !that.state.isBlacksTurn,
                point: msg.place
            });
        });
        socket.on('reset', function (msg) {
            console.log('reset');
            const styleArray = that.state.styleArr.slice();
            styleArray.fill('unit');
            that.setState({
                'styleArr': styleArray,
                point: -1
            });
            ReactDOM.render(React.createElement('div', null), document.getElementById('gameover'));
            if (msg.turn) {
                alert("Black starts first.");
            } else {
                alert("White starts first.");
            }
        });
    }

    handle(n) {

        //刚落子的加个css3特效
        //
        //
        //
        let num = 0;
        for (let i in this.state.online) {
            num++;
        }
        if (num < 2) {
            alert('Waiting for a partner.');
            return;
        }
        //判断该谁落子
        if (this.state.isBlacksTurn == this.state.urBlack) {
            if (this.state.styleArr[n] != 'unit') {
                //如果落子的地方有子
                alert('The place is occupied.');
                return;
            }
            socket.emit('chat message', { 'place': n, 'player': this.state.isBlacksTurn });
        } else {
            alert('It is not your turn.');
        }
    }
    reset() {
        socket.emit('reset', { "turn": this.state.isBlacksTurn });
    }

    pull() {
        socket.emit('pullback', {});
    }

    give() {
        socket.emit('giveup', {});
    }

    draw() {
        socket.emit('offerdraw', {});
    }

    componentDidUpdate() {
        // 更新的时候触发
        var gamingUser = this.state.gaming;
        var p1 = real.value;
        var p1Rank = rank.value;
        var p1Rep = credit.value;
        var p1, p1Rank, p1Rep, p1Status, p1Win;
        var p2, p2Rank, p2Rep, p2Status, p2Win;

        for (let key in gamingUser) {
            if (gamingUser[key].userName != p1) {
                p2 = gamingUser[key].userName;
                p2Rank = gamingUser[key].rank;
                p2Rep = gamingUser[key].credit;
                p2Status = gamingUser[key].status;
                p2Win = gamingUser[key].win;
            } else {
                p1Status = gamingUser[key].status;
                p1Win = gamingUser[key].win;
            }
        }
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
                                    React.createElement('input', { type: 'submit', value: 'Quit' })
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
                                    React.createElement('input', { type: 'submit', value: 'Quit' })
                                )
                            )
                        )
                    )
                ), document.getElementById('result'));
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
            board,
            React.createElement(Turn, { turn: this.state.isBlacksTurn }),
            React.createElement(Reset, { onClick: () => this.reset() }),
            React.createElement(Pull, { onClick: () => this.pullback() }),
            React.createElement(Give, { onClick: () => this.giveup() }),
            React.createElement(Draw, { onClick: () => this.offerdraw() }),
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
    //横向判断先向左后向右
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
    //竖向判断 先上后下
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
    //   斜向判断  酱紫/斜   先上后下

    rightUp = Math.min(rightUp, rightSide); //判断太靠右边了，就被右边界隔断
    for (let i = num - 14; i >= num - rightUp * 14; i = i - 14) {
        if (arr[i] == target) {
            line++;
        } else {
            break;
        }
    }
    var leftDown, rightDown;
    rightDown = leftDown = 14 - Math.floor(num / 15);
    leftDown = Math.min(leftDown, leftSide); //判断太靠左边了，就被左边界隔断
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
    //   斜向判断   酱紫\斜   先上后下
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
