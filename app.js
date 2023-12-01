var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
const port  = process.env.PORT || 4444;

app.use('/', express.static(__dirname + '/public'));

var usernames = {};
var pairCount = 0, id, clientsno, pgmstart=0,varCounter;
var scores = {};

server.listen(port);
console.log("Listening to 4444")
console.log("Conexion establecida !")

//Route
app.get('/',function (req,res){
	res.sendFile(__dirname + '/index.html');
});
io.sockets.on('connection', function(socket){
	console.log("Se ha conectado un nuevo jugador!");

	socket.on('addClient', function(username){
		socket.username = username;
		usernames[username] = username;
		scores[socket.username] = 0;
		varCounter = 0
		//var id = Math.round((Math.random() * 1000000));
		pairCount++;
		if(pairCount === 1 || pairCount >=3){
			id = Math.round((Math.random() * 1000000));
			socket.room = id;
			pairCount = 1;
			console.log(pairCount + " " + id);
			socket.join(id);
			pgmstart = 1;
		} else if (pairCount === 2){
        	console.log(pairCount + " " + id);
        	socket.join(id);
        	pgmstart = 2;
    	}
		
		console.log(username + " śe unió a "+ id);

		socket.emit('updatechat', 'SERVER', 'Te has conectado! <br> Espera a que otro jugador entre...',id);
		
		socket.broadcast.to(id).emit('updatechat', 'SERVER', username + ' has joined to this game !',id);

		
		if(pgmstart ==2){
			fs.readFile(__dirname + "/lib/questions.json", "Utf-8", function(err, data){
				jsoncontent = JSON.parse(data);
				io.sockets.in(id).emit('sendQuestions',jsoncontent);
				
			});
		console.log(username + " śe unió a "+ id);
			//io.sockets.in(id).emit('game', "haaaaai");
		} else {
			console.log("Player1");

		}




  
	});


	socket.on('result', function (usr,rst) {
		
				io.sockets.in(rst).emit('viewresult',usr);
				//io.in(id).emit('viewresult',usr);
				//console.log("Mark = "+usr);
				//console.log(id);	

	});


	
	
	socket.on('disconnect', function(){
		
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		//io.sockets.in(id).emit('updatechat', 'SERVER', socket.username + ' has disconnected',id);
		socket.leave(socket.room);
	});
});


