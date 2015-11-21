var http = require('http');
var fs = require('fs');

var game = {Xplayer : null, Oplayer : null, waitingPlayer : null, board : '.........', turn : null, end : false};

function checkWin (board, player)
{
	if(board[0] == player && board[1] == player && board[2] == player)
	{
		io.sockets.emit('to_client', player + ' has won the game!');
		game.turn = null;
		game.end = true;
	}
	if(board[3] == player && board[4] == player && board[5] == player)
	{
		io.sockets.emit('to_client', player + ' has won the game!');
		game.turn = null;
		game.end = true;
	}
	if(board[6] == player && board[7] == player && board[8] == player)
	{
		io.sockets.emit('to_client', player + ' has won the game!');
		game.turn = null;
		game.end = true;
	}
	if(board[0] == player && board[3] == player && board[6] == player)
	{
		io.sockets.emit('to_client', player + ' has won the game!');
		game.turn = null;
		game.end = true;
	}
	if(board[1] == player && board[4] == player && board[7] == player)
	{
		io.sockets.emit('to_client', player + ' has won the game!');
		game.turn = null;
		game.end = true;
	}
	if(board[2] == player && board[5] == player && board[8] == player)
	{
		io.sockets.emit('to_client', player + ' has won the game!');
		game.turn = null;
		game.end = true;
	}
	if(board[0] == player && board[4] == player && board[8] == player)
	{
		io.sockets.emit('to_client', player + ' has won the game!');
		game.turn = null;
		game.end = true;
	}
	if(board[6] == player && board[4] == player && board[2] == player)
	{
		io.sockets.emit('to_client', player + ' has won the game!');
		game.turn = null;
		game.end = true;
	}
}

function checkDraw(board)
{
	var full = true;

	for(i = 0 ; i < 9 ; i++)
	{
		if(board[i] == '.')
			full = false;
	}

	if(full)
	{
		io.sockets.emit('to_client', 'The game is a draw!');
		game.end = true;
	}
}

var server = http.createServer(function (request, response)
{
	fs.readFile('tictactoe.html', 'utf-8', function (error, data)
	{
		response.writeHead(200, {'Content-Type': 'text/html'})
		response.end(data);
	});
}).listen(8000);

var io = require('socket.io')(server);

io.sockets.on('connection', function (socket)
{	
	if(game.waitingPlayer != null)
	{
		io.sockets.emit('to_client', 'Make a move');
			
		if(game.waitingPlayer == game.Oplayer)
		{
			game.Xplayer = socket;
			game.turn = game.Oplayer;
		}
		else
		{
			game.Oplayer = socket;
			game.turn = game.Xplayer;
		}
		game.waitingPlayer = null;
	}
	else
	{
		io.sockets.emit('to_client', 'Waiting for second player');
		game.waitingPlayer = socket;
		game.Xplayer = socket;
		game.turn = game.Xplayer;
		game.board = '.........';
	}
	
	socket.on('to_server', function (data)
	{
		if(game.waitingPlayer != null)
			io.sockets.emit('to_client', 'Waiting for second player');
		else
		{
			if(game.turn == socket)
			{
				if(game.board[data] == '.')
				{
					newBoard = '';
					for(i = 0 ; i < 9 ; i++)
					{
						if(data == i)
						{
							if(socket == game.Xplayer)
								newBoard = newBoard + 'X';
							else
								newBoard = newBoard + 'O';
						}
						else
						{
							if(game.board[i] == '.')
								newBoard = newBoard + '.';
							else
								newBoard = newBoard + game.board[i];
						}
					}

					game.board = newBoard;
					console.log(game.board);
					io.sockets.emit('to_client', game.board);

					if(game.turn == game.Xplayer)
						game.turn = game.Oplayer;
					else
						game.turn = game.Xplayer;

					io.sockets.emit('to_client', 'Make a move');

					checkWin(game.board, 'X');
					if(game.end == true)
					{
						game.Xplayer.disconnect();
						game.Oplayer.disconnect();
					}
					else
					{
						checkWin(game.board, 'Y');
						if(game.end == true)
						{
							game.Xplayer.disconnect();
							game.Oplayer.disconnect();
						}
						else
						{
							checkDraw(game.board);
							if(game.end == true)
							{
								game.Xplayer.disconnect();
								game.Oplayer.disconnect();
							}
						}
					}
				}
				else
				{
					io.sockets.emit('to_client', 'That slot is filled');
				}
				
			}
			else if(game.turn == null)
			{
				io.sockets.emit('to_client', 'The game has ended');
			}
			else
			{
				if(game.turn == game.Xplayer)
					io.sockets.emit('to_client', 'It is X\'s turn');
				else
					io.sockets.emit('to_client', 'It is O\'s turn');
			}
		}
		
	});

	socket.on('disconnect', function () 
	{
		if(socket == game.Xplayer)
		{
			console.log('Xplayer disconnected!');
			if(game.Oplayer != null)
    			game.waitingPlayer = game.Oplayer;
    		else
    		{
    			game.Oplayer = null;
    			console.log('Both players disconnected');
    			game.waitingPlayer = null;
    			game.end = false;
    		}
    		game.Xplayer = null;
    	}
    	else
    	{
    		console.log('Oplayer disconnected!');
    		if(game.Xplayer != null)
    			game.waitingPlayer = game.Xplayer;
    		else
    		{
    			game.Xplayer = null;
    			console.log('Both players disconnected');
    			game.waitingPlayer = null;
    			game.end = false;
    		}
    		game.Oplayer = null;
  		}
    	io.sockets.emit('to_client', 'Disconnected');

    	game.board = '.........';
  	});
});


