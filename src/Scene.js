
var Scene = function Scene() {
	this.sceneItems = {};
	this.startTime = this.prevTime = this.nowTime = 0;
	this.isStart = this.isFinish = this.isPause = false;
	this.playSpeed = 1;
	this.playCount = 0;
	this.iterationCount = 1;
	this.name = "";
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
defineGetterSetter(scenePrototype, "name");
defineGetterSetter(scenePrototype, "playSpeed");
defineGetterSetter(scenePrototype, "playCount");
defineGetterSetter(scenePrototype, "iterationCount");
defineGetterSetter(scenePrototype, "direction");

scenePrototype.newItem = function(id) {
	var item = new SceneItem();
	return this.addItem(id, item);
}
scenePrototype.addItem = function(id, sceneItem) {
	sceneItem.setId(id);
	if(this.sceneItems[id])
		return this.sceneItems[id];
		
	this.sceneItems[id] = sceneItem;
	return sceneItem;
}
scenePrototype.getFinishTime = function() {
	var item, id;
	var sceneItems = this.sceneItems;
	var time = 0, _time;
	for(id in sceneItems) {
		item = sceneItems[id];
		_time = item.getFinishTime();
		if( time < _time)
			time = _time;
	}
	return time;
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
	} catch(e) {
		//No Function
	} 
	
	if(isFinish) {
		this.isStart = false;
		this.isFinish = true;
		this.isPause = false;
		var ic = this.getIterationCount(), pc = this.getPlayCount();
		this.setPlayCount(++pc);
		
		if(ic === "infinite" || pc < ic) {
			this.play();
		} else {
		return false;
		}
	}
	
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
	
	this.setPlayCount(0);

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
		
	for(var id in sceneItems) {
		item = sceneItems[id];
		item.addTimingFunction(startTime, endTime, curveArray);
	}
	return this;
}
scenePrototype.setClippingRegion = function(x, y, width, height) {

};