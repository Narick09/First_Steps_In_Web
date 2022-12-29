const http = require('http');
const url = require('url');
const hostname = '127.0.0.1', port = 3000;
const path = require('path');

let express = require('express');
let app = express();

const server = http.createServer(app);
const io = require('socket.io')(server);

const serverMessages = [];
const userNames = {};

app.use(express.static(`static`));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let c = 1;//kostyl
io.sockets.on('connection', function(socket) {
    //serverMessages[socket] = {name: "Неизвестный пользователь"};
    c += 1;
    socket.id = "i" + c;
    const tmpName = "Неизвестный пользователь";
    console.log(tmpName + ' connected');
    Object.keys(userNames).forEach((key) => {
        console.log(key, socket.id);
        socket.emit('addUser', key, userNames[key]);
    });
    userNames[socket.id] = tmpName;
    socket.emit('userConnected', socket.id);
    io.sockets.emit('addUser', socket.id , userNames[socket.id]);
    serverMessages.forEach((el) => {socket.emit('addMes', el);})    

    socket.on('changedName', (val) => {
        io.sockets.emit('updateName', socket.id, val);
        userNames[socket.id] = val;
    });

    socket.on('sendMes', (data) => {
        serverMessages.push(data);
        if(serverMessages.length > 100) serverMessages.shift();
        console.log(data.name, data.message);
        io.sockets.emit('addMes', data);
    });

    socket.on('disconnect', function () {
       console.log('A user disconnected with ', socket.id);
       io.sockets.emit('userDisconnected', userNames[socket.id] || tmpName);//fom list
       io.sockets.emit('delUser', socket.id);
       delete userNames[socket.id];
    });
});



server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});