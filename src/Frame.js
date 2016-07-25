/*
	Frame
*/


var Frame = Scene.Frame = function Frame(sceneItem, time) {
	this.sceneItem = sceneItem;
	this.properties = {};
	this.time = time;

	var _roles = Scene._roles, length = _roles.length;
	for(var i = 0; i < length; ++i) {
		this.properties[_roles[i]["name"]] = {}; //속성의 이름을 가진 배열 초기화
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
	this.properties[name][property] = value;


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
	var getProperty = camelize("get " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + name);
	framePrototype[getProperty] = function(property) {
		return this.get(name, property);

	};
	framePrototype[setProperty] = function(property, value) {
		this.set(name, property, value);
		return this;
	};
	framePrototype[setProperties] = function(properties) {
		this.sets(name, properties);
		return this;
	}
	framePrototype[removeProperty] = addFunction(framePrototype.removeProperty, function(property) {
		this.remove(name, property);
			
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