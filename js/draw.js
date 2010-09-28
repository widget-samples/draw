
// Draw module
Draw = function() {
	var color = '#000000';
	var lineWidth = 1;
	var canvas = null;
	var context = null;
	var tool = null;
	var actionData = null;
	
	// pencil tool
	var PencilAction = {
		onStart: function(x, y) {
			// set color and lineWidth
			context.strokeStyle = color;
			context.lineWidth = lineWidth;
			
			// initialize a line data
			actionData = {
				id: Client.getMyId(),
				action: 'pencil',
				undo: false,
				lineWidth: lineWidth,
				color: color,
				data: [{x: x, y: y}]
			}
			
			context.beginPath();
			context.moveTo(x, y);
		},
		onMove: function(x, y) {
			context.lineTo(x, y);
			context.stroke();
			
			actionData.data.push({x: x, y: y});		// add a (x,y) to actionData
		},
		onEnd: function(x, y) {
			context.closePath();
			
			var myId = Client.getMyId();
			if (History.hasRedo(myId))
				History.removeUndid(myId);
			
			actionData.data.push({x: x, y: y});		// add a (x,y) to actionData
			History.addAction(actionData);			// add to History
			Client.send(actionData);				// send the action to server
			actionData = null;
		},
		drawItem: function(item) {
			drawLines(item.color, item.lineWidth, item.data);
		}
	};
	
	// erase tool
	var EraseAction = {
		onStart: function(x, y) {
			// set color and lineWidth
			var ERASE_WIDTH = 10;
			context.strokeStyle = '#FFFFFF';
			context.lineWidth = ERASE_WIDTH;
			
			// initialize a line data
			actionData = {
				id: Client.getMyId(),
				action: 'erase',
				undo: false,
				lineWidth: ERASE_WIDTH,
				color: '#FFFFFF',
				data: [{x: x, y: y}]
			}
			
			context.beginPath();
			context.moveTo(x, y);
		},
		onMove: function(x, y) {
			context.lineTo(x, y);
			context.stroke();
			
			actionData.data.push({x: x, y: y});		// add a (x,y) to actionData
		},
		onEnd: function(x, y) {
			context.closePath();
			
			var myId = Client.getMyId();
			if (History.hasUndo(myId))
				History.removeUndid(myId);
			
			actionData.data.push({x: x, y: y});		// add a (x,y) to actionData
			History.addAction(actionData);			// add to History
			Client.send(actionData);				// send the action to server
			actionData = null;
		},
		drawItem: function(item) {
			drawLines(item.color, item.lineWidth, item.data);
		}
	};
	
	var TOOLS = [
		['pencil', PencilAction],
		['erase', EraseAction],
	];
	
	// mouse event listener
	function onMouseCanvas(ev) {
		if (ev.layerX || ev.layerX == 0) {
			// for Firefox
			ev._x = ev.layerX;
			ev._y = ev.layerY;
		}
		else if (ev.offsetX || ev.offsetX == 0) {
			// for Opera
			ev._x = ev.offsetX;
			ev._y = ev.offsetY;
		}
		
		// call specific event handler for type
		var func = tool[ev.type];
		if (func) {
			func(ev);
		}
	}
	
	// touch event listener
	function onTouchCanvas(ev) {
		ev.preventDefault();
		var touch = ev.touches[0];
		
		// call specific event handler for type
		var func = tool[ev.type];
		if (func) {
			func(touch);
		}
	}
	
	// action wrapper for action
	function ActionListener(action) {
		var listener = this;
		this.started = false;
		
		this.mousedown = function(ev) {
			listener.started = true;
			action.onStart(ev._x, ev._y);
		};
		this.mousemove = function(ev) {
			if (listener.started) {
				action.onMove(ev._x, ev._y);
			}
		};
		this.mouseup = function(ev) {
			if (listener.started) {
				action.onEnd(ev._x, ev._y);
				listener.started = false;
			}
		};
		this.touchstart = function(ev) {
			listener.started = true;
			action.onStart(ev.pageX, ev.pageY);
		};
		this.touchmove = function(ev) {
			if (listener.started) {
				action.onMove(ev.pageX, ev.pageY);
			}
		};
		this.touchend = function(ev) {
			if (listener.started) {
				action.onEnd(ev.pageX, ev.pageY);
				listener.started = false;
			}
		};
	}
	
	// draw lines
	function drawLines(color, lineWidth, data) {
		if (data.length > 0) {
			var preLineWidth = context.lineWidth;
			var preColor = context.strokeStyle;
			
			context.beginPath();
			context.lineWidth = lineWidth;
			context.strokeStyle = color;
			context.moveTo(data[0].x, data[0].y);
			for (var i = 1; i < data.length; i++) {
				context.lineTo(data[i].x, data[i].y);
				context.stroke();
			}
			context.closePath();
			
			context.lineWidth = preLineWidth;
			context.strokeStyle = preColor;
		}
	}
	
	// public variables & methods..
	return {
		initialize: function() {
			canvas = document.getElementById('drawCanvas');
			if (!canvas) {
				alert('Cannot find Canvas object.');
				return;
			}
			if (!canvas.getContext) {
				alert('Cannot find Drawing Context');
				return;
			}
			context = canvas.getContext('2d');
			if (!context) {
				alert('Cannot call getContext() of Canvas');
				return;
			}
			
			// set tool <= pencil
			Draw.changeTool('pencil');
			
			// Add mouse event listeners..
			canvas.addEventListener('mousedown', onMouseCanvas, false);
			canvas.addEventListener('mousemove', onMouseCanvas, false);
			canvas.addEventListener('mouseup',   onMouseCanvas, false);
			
			// Add touch event listener
			canvas.addEventListener('touchstart', onTouchCanvas, false);
			canvas.addEventListener('touchmove',  onTouchCanvas, false);
			canvas.addEventListener('touchend',   onTouchCanvas, false);
		},
		changeColor: function(hexColor) {
			color = hexColor;
		},
		getColor: function() {
			return color;
		},
		changeLineWidth: function(width) {
			lineWidth = width;
			context.lineWidth = width;
		},
		changeTool: function(toolName) {
			var selectedTool = null;
			for (var i in TOOLS) {
				if (TOOLS[i][0] == toolName) {
					selectedTool = TOOLS[i][1];
					break;
				}
			}
			
			if (selectedTool != null)
				tool = new ActionListener(selectedTool);
			
			return selectedTool != null;
		},
		draw: function(item) {
			var drawFunction = null;
			for (var i in TOOLS) {
				if (TOOLS[i][0] == item.action) {
					drawFunction = TOOLS[i][1].drawItem;
					break;
				}
			}
			
			if (drawFunction != null)
				drawFunction(item);
		},
		drawAll: function() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			var items = History.getItems();
			for (var i in items) {
				if (items[i].undo == false)
					Draw.draw(items[i]);
			}
		}
	};
}();

