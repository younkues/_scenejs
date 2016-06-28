
var Scene = function Scene() {
	this.sceneItems = {};
	this.startTime = this.prevTime = this.nowTime = 0;
	this.isStart = this.isFinish = this.isPause = false;
	this.playSpeed = 1;
	this.playCount = 0;
	this.iterationCount = 1;
	/*iterationCount = 1, 2, 3, 4, infinite*/
	this.direction = "normal";
	/*normal, reverse, alternate, alternate-reverse*/
}
var _roles = Scene._roles = [];


Scene.addRole = function(name, plural) {
	var _roles = Scene._roles;

	_roles.push({"name":name, "plural":plural, "capitalize":camelize(" " + name)});
	addPropertyFunction(name, plural);
	addGetFramePropertyFunction(name);

	defineAll(framePrototype, name, plural);	
	setPropertyFunction(name, plural);
}

var scenePrototype = Scene.prototype;

defineGetterSetter(scenePrototype, "playSpeed");
defineGetterSetter(scenePrototype, "playCount");
defineGetterSetter(scenePrototype, "iterationCount");

defineGetterSetter(scenePrototype, "direction");

scenePrototype.newItem = function(id) {
	var item = new SceneItem();
	return this.addItem(id, item);
}
scenePrototype.addItem = function(id, sceneItem) {
	if(this.sceneItems[id])
		return this.sceneItems[id];
		
	this.sceneItems[id] = sceneItem;
	return sceneItem;
}
scenePrototype._addElement = function(elements) {
	var length = elements.length, i;

	var arr = [];
	for( i = 0; i < length; ++i) {
		arr[i] = this.addElement(elements[i]);
	}
	return arr;
}
scenePrototype.addElement = function(id, element) {
	var length = arguments.length;
	if(length === 0) {
		return;
	} else if(length === 1) {
		element = id;
		id = "";
		
		var type = typeof element;
		
		if(type === "undefined") {
			var item = new SceneItem();
			return this.addItem(id, item);
		}
		else if(type === "string") {
			return this._addElement(document.querySelectorAll(element));
		}
		else if(element instanceof Array || element instanceof NodeList) {
			return this._addElement(element);
		}
	}
	
	_id = element.getAttribute(ATTR_ITEM_ID);
	if(!_id) {
		id = id ? id : "item" + parseInt(Math.random() * 10000);
		element.setAttribute(ATTR_ITEM_ID, id);
	}
	else if(!id)
		id = _id;
	var item = new SceneItem(element);

	return this.addItem(id, item);
}
scenePrototype.getItem = function(id) {
	// string(id), object(element)
	var type = typeof id;
	
	
	try {
		//string(id)
		if(type === "string")
			return this.sceneItems[id];
		else
			return this.sceneItems[id.getAttribute(ATTR_ITEM_ID)];
		//element
	} catch(e) {
		//Not Element
	}
	return;
}
scenePrototype.synchronize = function synchronize(time, isPlay) {
	var sceneItems = this.sceneItems;
	var item;
	var itemsLength = 0;
	var finishCount = 0;
		
	for(var id in sceneItems) {
		++itemsLength;
		
		item = sceneItems[id];
		item.synchronize(time, isPlay);
		if(item.isFinish())
			++finishCount;
	}
	var isFinish = (itemsLength <= finishCount);
	
	try {
		if(this.animateFunction)
			this.animateFunction(time, isFinish);
	} catch(e) {}
	if(isFinish)
		return false;
	
	return true;
};
scenePrototype.onAnimate = function onAnimate(func) {
	this.animateFunction = func;
}
scenePrototype.timerFunction = function() {
	if(!this.isStart)
		return;
		
	this.nowTime = Date.now();
	var duration = (this.nowTime - this.startTime) / 1000;
	var isProcess = this.synchronize(duration * this.playSpeed, true);
	if(!isProcess) {
		this.stop();
		return;
	}
	
	requestAnimFrame(this.timerFunction.bind(this));
}
scenePrototype.play = function play (){
	if(this.isStart)
		return this;
		
	console.log("PLAY");
	this.startTime = this.prevTime = Date.now();
	this.nowTime = this.spendTime = 0;

	this.isStart = true;
	this.isFinish = false;
	this.isPause = false;	
	requestAnimFrame(this.timerFunction.bind(this));

	return this;	
}
scenePrototype.stop = function stop() {
	console.log("STOP");
	this.isStart = false;
	this.isFinish = true;
	this.isPause = false;
}

scenePrototype.addTimingFunction = function addTimingFunction(startTime, endTime, curveArray) {
	var sceneItems = this.sceneItems;
	var item;
	var itemsLength = sceneItems.length;
	var finishCount = 0;
		
	for(var i = 0; i < itemsLength; ++i) {
		sceneItems[i].addTimingFunction(startTime, endTime, curveArray);
	}
	return this;
}
scenePrototype.setClippingRegion = function(x, y, width, height) {

};