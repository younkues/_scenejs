/**
* @class
* @
*/
var Scene = window.Scene = function Scene(items) {
	this.sceneItems = {};
	this._startTime = this._prevTime = this._nowTime = 0;
	this._isStart = this._isFinish = this._isPause = false;
	this.playSpeed = 1;
	this.playCount = 0;
	this.iterationCount = 1;
	/*iterationCount = 1, 2, 3, 4, infinite*/
	this.direction = "normal";
	this.delay = 0;
	/*normal, reverse, alternate, alternate-reverse*/
	
	
	this.name = "";
	this.callbackFunction = {};
	
	if(items)
		this.load(items);

}
var _roles = Scene._roles = [];


Scene.addRole = function(name, plural) {
	var _roles = Scene._roles;

	_roles.push({"name":name, "plural":plural, "capitalize":camelize(" " + name)});
	
	SceneItem.addGetFramePropertyFunction(name);
	SceneItem.addPropertyFunction(name, plural);
	Frame.addPropertyFunction(name, plural);
}

var scenePrototype = Scene.prototype;
defineGetterSetter(scenePrototype, "name");
defineGetterSetter(scenePrototype, "playSpeed");
defineGetterSetter(scenePrototype, "playCount");
defineGetterSetter(scenePrototype, "iterationCount");
defineGetterSetter(scenePrototype, "direction");


scenePrototype.load = function(items) {
	if(!items)
		return this;
	var itemName, sceneItem, item;
	for(itemName in items) {
		if(itemName === "option")
			continue;
		
		item = items[itemName];
		sceneItem = this.newItem(itemName);
		sceneItem.load(item);
	}
	if("option" in items) {
		var options = items.option;
		for(option in options) {
			value = options[option];
			if(option === "timingFunction") {
				for(var i = 0; i < value.length / 3; ++i) {
					this.addTimingFunction(value[3*i + 0], value[3 * i + 1], value[3 * i + 2]);
				}
			} else {
				this[option] = options[option];
			}
		}
	}
	return this;
}
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
scenePrototype.isTimeEnd = function isTimeEnd() {
	var sceneItems = this.sceneItems;
	var item, itemsLength = 0;
	var finishCount = 0;
	var direction = this.direction;
	for(id in sceneItems) {
		++itemsLength;
		item = sceneItems[id];
		if(item.isTimeEnd(direction))
			++finishCount;
			
	}
	return (itemsLength <= finishCount);
}
scenePrototype.setTime = function setTime(time, isPlay) {
	var sceneItems = this.sceneItems;
	var item, itemsLength = 0;
	var finishCount = 0;
	var id;
	for(id in sceneItems) {
		item = sceneItems[id];
		item.setTime(time, isPlay);
	}
	this.trigger("animate", [time]);
	
	
	return this;
};
scenePrototype.trigger = function(name, args) {
	var _callback, length;
	try {
		_callback = this.callbackFunction[name];
		if(_callback) {	
			length = _callback.length;
			for(var i = 0; i < length; ++i) {
				_callback[i].apply(this, args);
			}
		}
	} catch(e) {
		//Not Function
		//No Function
	} 
}
scenePrototype.on = function onAnimate(name, func) {
	this.callbackFunction[name] = this.callbackFunction[name] || [];
	this.callbackFunction[name].push(func);
	
	return this;
}
scenePrototype.tick = function(resolve, reject) {
	var self = this;
	var finishTime = this.getFinishTime();


	if(!self._isStart)
		return;
		

	self._nowTime = Date.now();
	var duration = (self._nowTime - self._startTime) / 1000 * self.getPlaySpeed() -this.delay;

	if(duration < 0)
		return;
		
		
		
	if(this.direction === "reverse")
		duration = finishTime - duration;

	self.setTime(duration, true);


	
	try {
		var isTimeEnd = self.isTimeEnd();
	} catch(e) {
		//console.log(self);
	}
	if(isTimeEnd) {
		var ic = this.getIterationCount(), pc = this.getPlayCount();
		this.finish();
		this.setPlayCount(++pc);
		
		if(this.getFinishTime() <= 0) {	
		} else if(ic === "infinite" || pc < ic) {
			this.play();
			return;
		}

		this.trigger("done");
		if(resolve)
			resolve();
	} else {
		requestAnimFrame(function() {
			self.tick(resolve, reject);
		});
	}
}
scenePrototype.then = function(resolve) {
	this.on("done", resolve);
}
scenePrototype.play = function play (option){
	var self = this;
	var func = function(resolve, reject) {
		if(self._isStart) {
			//** !! MODIFY CONSTANT
			return;
		}
		console.log("PLAY");
		self._startTime = self.prevTime = Date.now() - (option && option.time || 0);
		self.nowTime = this.spendTime = 0;
		
		self.setPlayCount(0);
	
	
		self._isStart = true;
		self._isFinish = false;
		self._isPause = false;

		self.tick(resolve, reject);
	};
	
	if(window.Promise)
		return new Promise(func);
	
	
	func();
	
	return this;	
}
scenePrototype.finish = function stop() {
	console.log("FINISH");
	this._isStart = false;
	this._isFinish = true;
	this._isPause = false;
	this.setPlayCount(0);
}
scenePrototype.stop = function stop() {
	console.log("STOP");
	this._isStart = false;
	this._isFinish = false;
	this._isPause = false;
	this.setPlayCount(0);
}

scenePrototype.isPlay = function() {
	return this._isStart;
}
scenePrototype.isFinish = function() {
	return this._isFinish;
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