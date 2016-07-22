/*
	Frame
*/

var Frame = Scene.Frame = function Frame(sceneItem, time) {
	var _frame = this;
	_frame.sceneItem = sceneItem;
	_frame.transforms = {};
	_frame.properties = {};
	_frame.filters = {};
	_frame.time = time;
}
}


var framePrototype = Frame.prototype;
defineAll(framePrototype, "sceneItem");

var setPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + names);
	var addPropertyName =camelize("add " + name) + "Name";
	framePrototype[setProperty] = addFunction(framePrototype[setProperty], function(property, value) {
		var sceneItem = this.getSceneItem();
		if(sceneItem)
			sceneItem[addPropertyName](property);
			
		return this;
	});
	framePrototype[setProperties] = function(properties) {
		var _frame = this;
		for(var property in properties) {
			_frame[setProperty](property, properties[property]);
		}
		return _frame;
	}
	framePrototype[removeProperty] = addFunction(framePrototype.removeProperty, function(property) {
		var sceneItem = this.getSceneItem();
		if(sceneItem)
			sceneItem[removeProperty + "Name"](property);
			
		return this;
	});

}



// 프레임 복사본을 만든다.
framePrototype.copy = function() {
	var frame = new Frame(this.sceneItem, this.time);
	frame.merge(this);
	
	return frame;
}
//다른 프레임과 합치다.
framePrototype.merge = function(frame) {
	
	var _frame = this;
	var _roles = Scene._roles, length = _roles.length;
	var properties, capital;
	for(var i = 0; i < length; ++i) {
		capital = camelize(" " + _roles[i]["plural"]);
		properties = frame[_roles[i]["plural"]];
		_frame["set" + capital](properties);
	}
}