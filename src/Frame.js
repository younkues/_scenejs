/*
	Frame
*/


var Frame = Scene.Frame = function Frame(sceneItem, time) {
	var _frame = this;
	_frame.sceneItem = sceneItem;
	_frame.properties = {};
	_frame.time = time;
	
	for(var i = 0; i < length; ++i) {
		self.properties[_roles[i]["name"]] = {}; //속성의 이름을 가진 배열 초기화
	}
}


var framePrototype = Frame.prototype;
defineAll(framePrototype, "sceneItem");


framePrototype.load = function(properties) {
	var property;
	for(property in properties) {
		
	}
}
framePrototype.set = function(name, property, value) {
	if(!this.properties[name])
		return this;
		
	
	if(typeof value === "string") {
		value = _u.stringToObject(value);
	}
	this.properties[name] = value;


	var sceneItem = this.getSceneItem();
	if(sceneItem)
		sceneItem.addName(name, property);

	return this;
}
framePrototype.sets = function(name, properties) {
	for(var property in properties) {
		this.set(name, property, properties[property]);
	}
	return this;
}
framePrototype.remove = function(name, property) {
	if(!this.properties[name])
		return this;
		

	delete this.properties[name][property];
	
	var sceneItem = this.getSceneItem();
	if(sceneItem)
		sceneItem.removeName(name, property);
			
	return this;
}
framePrototype.get = function(name, property) {
	if(!this.properties[name])
		return;
	
	return this.properties[name][property];
}
//setProperty, setProperties
//setTransform, setTransforms
//setFilter, setFilters
Frame.addPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + names);
	var addPropertyName =camelize("add " + name) + "Name";
	framePrototype[setProperty] = function(property, value) {
			
		return this;
	};
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