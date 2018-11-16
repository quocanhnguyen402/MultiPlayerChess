var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var port = process.env.PORT || 6969;

//Array to store rooms
var rooms_nr_client = [];

//Setup socket server
var io = require('socket.io')(http);
io.on('connection', function (socket) {

    socket.on('room_create', function (room) {
        console.log("Room " + room +" created");
        result = socket.join(room);
        rooms_nr_client.push(room);
        socket.emit('created', room);
    });

    socket.on('room_join', function (room) {
        console.log(rooms_nr_client);
        console.log(room);
        var have_room = false;
        for (let index = 0; index < rooms_nr_client.length; index++) {
            if (room == rooms_nr_client[index]) {
                have_room = true;
                break;
            }
        }
        console.log(have_room);
        if (have_room) {
            console.log("New connection at room " + room);
            socket.join(room);
            socket.emit('joined',room);
        } else {
            socket.emit('join_failed',room);
        }
    });

    socket.on('move', function (data) {
        var room = data.room;
        var move = data.move;
        socket.in(room).emit('move', move);
    });
});

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/chess_game_page.html');
});

http.listen(port, function () {
    console.log("Listening on * " + port);
});