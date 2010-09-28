var sys = require("sys"),
	ws = require("./ws");

var clientId = 0;
var clients = [];

Array.prototype.remove = function(e) {
	for (var i = 0; i < this.length; i++)
		if (e == this[i])
			return this.splice(i, 1);
}

function newClient(websocket) {
	clientId++;
	return {id: clientId, socket: websocket};
}

function broadcast(data, from) {
	var str = JSON.stringify(data);
	
	clients.forEach(function (client) {
		if (client != from) {
			try {
				client.socket.write(str);
			} catch (e) {
				clients.remove(client);
			}
		}
	});
}

function sendSetId(client) {
	try {
		client.socket.write(JSON.stringify({id: client.id, action: 'setId'}));
	} catch (e) {
	}
}

ws.createServer(function (websocket) {
	var nc = newClient(websocket);
	clients.push(nc);
	
	websocket.addListener("connect", function (resource) { 
		// emitted after handshake
		var id = nc.id;
		sys.puts('connect: [' + id + '], clients.length: ' + clients.length);
		broadcast({id: id, action: 'connect', length: clients.length});
		sendSetId(nc);
	}).addListener("data", function (data) { 
		// send data to attached clients
		sys.puts('sending data... from(' + nc.id + ') => ' + data);
		var data = JSON.parse(data);
		data.length = clients.length;
		broadcast(data, nc);
	}).addListener("close", function () { 
		// emitted when server or client closes connection
		var id = nc.id;
		sys.puts('close: [' + id + '], clients.length: ' + clients.length);
		clients.remove(nc);
		broadcast({id: id, action: 'close', length: clients.length});
	});
}).listen(parseInt(process.ARGV[2]) || 8001);

