//Game and board variables
var board;
var game;

//Only allow pieces to be dragged when the board is oriented in their direction
var onDragStart = function (source, piece, position, orientation) {
    if ((orientation === 'white' && piece.search(/^w/) === -1) ||
        (orientation === 'black' && piece.search(/^b/) === -1)) {
        return false;
    }
};

//Init chess game function
var initGame = function (orientation) {
    //Config the board
    var cfg = {
        draggable: true,
        position: 'start',
        onDrop: handleMove,
        onDragStart: onDragStart,
        orientation: orientation,
        dropOffBoard: 'snapback', // this is the default
    };
    //Make the board
    board = new ChessBoard('gameboard', cfg);
    //Make the game to control the board
    game = new Chess();
}

//Create a random ID for the room (will have to check with the server later)
function makeRoomId() {
    var id = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return id;
}

//Show join form when click "Join a room"
$('#btn_show_join_form').on("click", function () {
    $('#join_form').show();
});

//Create new socket
var socket = io();

//This will be the room ID
var room = '';

//When click on join
$('#btn_join').on("click", function () {
    //Take the room ID in the input
    room = $('#room_id').val();
    //Tell the server to make the room
    socket.emit('room_join', room);
});

//When click on create
$('#btn_create').on("click", function () {
    //Make the room ID randomly
    room = makeRoomId();
    //Tell the server to connect to the room
    socket.emit('room_create', room);
});

//Handle the move and send to the server
var handleMove = function (source, target) {
    //The move by player
    var move = game.move({
        from: source,
        to: target,
    });
    //If not null tell the server that the player move the piece at this room
    if (move == null) {
        return 'snapback';
    } else {
        socket.emit("move", {
            move: move,
            room: room
        });
    }
}

//Called when the server call socket.broadcast("move")
socket.on('move', function (msg) {
    game.move(msg);
    board.position(game.fen()); //fen is board layout
});

//Called when the server call socket.broadcast("joined")
socket.on('joined', function (room) {
    //Hide the create or join div
    $('#create_or_join_game').hide();
    //Show the chess board container
    $('#gameboard').show();
    //Show the room info
    $('#room_info').html("You joined room:<b>" + room + "<b>");
    $('#room_info').show();
    //Make the chess board
    initGame('black');
});

//Called when the server call socket.broadcast("join_failed")
socket.on('join_failed', function (room) {
    //Show the room info
    $('#room_info').html("Cant find room id: <b>" + room + "<b>");
    $('#room_info').show();
});

//Called when the server call socket.broadcast("created")
socket.on('created', function (room) {
    //Hide the create or join div
    $('#create_or_join_game').hide();
    //Show the chess board container
    $('#gameboard').show();
    //Show the room info
    $('#room_info').html("Your room id is: <b>" + room + "<b>");
    $('#room_info').show();
    //Make the chess board
    initGame('white');
});