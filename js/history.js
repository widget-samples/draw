
// implement JSON.clone
JSON.clone = function(obj) {
	return JSON.parse(JSON.stringify(obj));
};

// History Manager using JSLINQ.js
History = function() {
	var MYID = null;
	var items = []; // action fields: id, undo, action, ...
	
	return {
		removeAllOfId: function(id) {
			////alert('removeAllOfId:' + id);
			items = JSLINQ(items).Where(function(item) { return item.id != id; }).ToArray();
			return items;
		},
		addAction: function(action) {
			//alert('addAction:' + action);
			items.push(action);
			return items;
		},
		removeUndid: function(id) {
			//alert('removeUndid:' + id);
			items = JSLINQ(items).Where(function(item) { return item.id == id && item.undo == true; }).ToArray();
			return items;
		},
		undo: function(id) {
			//alert('undo:' + id);
			var last = JSLINQ(items).Last(function(item) { return item.id == id && item.undo == false; });
			if (last)
				last.undo = true;
			return last;
		},
		hasUndo: function(id) {
			//alert('hasUndo:' + id);
			var last = JSLINQ(items).Last(function(item) { return item.id == id && item.undo == false; });
			return last != null;
		},
		redo: function(id) {
			//alert('redo:' + id);
			var lastUndid = JSLINQ(items).First(function(item) { return item.id == id && item.undo == true; });
			if (lastUndid)
				lastUndid.undo = false;
			return lastUndid;
		},
		hasRedo: function(id) {
			//alert('hasRedo:' + id);
			var lastUndid = JSLINQ(items).First(function(item) { return item.id == id && item.undo == true; });
			return lastUndid != null;
		},
		getItems: function() {
			//alert('getItems');
			return items;
		}
	};
}();

