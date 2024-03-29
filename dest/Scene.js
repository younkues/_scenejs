(function() {
(function() {
	var StringPrototype = String.prototype;
	StringPrototype.replaceAll = function(from, to) {
		if(!this)
			return "";
		return this.split(from).join(to);
	}
})();
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}
var defineGetter = function(object, name, target) {
	
	object[camelize("get " + name)] = function(name) {
		return function(obj) {
			return target ? this[target][obj] : this[name];
		}
	}(name);
}
var defineSetter = function(object, name, target) {
	object[camelize("set " + name)] = function(name) {
		return function(v1, v2) {
			if(target)
				this[target][v1] = v2;
			else
				this[name] = v1;
			
			return this;
		}
	}(name);
}
var defineRemover = function(object, name, target) {
	object[camelize("remove " + name)] = function(name) {
		return function(v1) {
			delete this[target][v1];

			return this;
		}
	}(name);
};
/*
	GetterSetter 함수를 만들어준다.
*/
var defineGetterSetter = function(object, name, target) {
	defineGetter(object, name, target);
	defineSetter(object, name, target);	
}
/*
	GetterSetterRemover 함수를 만들어준다.
*/
var defineAll = function(object, name, target) {
	defineGetter(object, name, target);
	defineSetter(object, name, target);
	defineRemover(object, name, target);
}
var addFunction = function(func, func2) {
	return  function() {
		return function() {
			func.apply(this, arguments);
			func2.apply(this, arguments);
		}
	}();
}
/*
	replace 확장버전
*/
function replaceAll(text, from, to) {
	if(!text)
		return "";
	return text.split(from).join(to);
}
/**
     * create a Scene, Control SceneItem, Speed & Count, Play & Stop
     * @class Scene
     * @param {Object} [sceneItems={}] load sceneItem as JSON.
     * @example
var scene = new Scene({
    "item1" : {
        0 : {width: "30px", height: "20px", property:value},
        2 : {width: "50px", property:value},
        6.5:{height: "200px", property:value},
    },
    "item2" : {
        0 : {transform:{scale:0.5}, property:value},
        2 : {transform:{scale:1.5, rotate:"0deg"}, width: "50px", property:value},
        6.5: {transform:{scale:1, rotate:"50deg"}, width: "10px", property:value},
    },
});
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
	/*normal, reverse, alternate, alternate-reverse*/	
	this.delay = 0;
	this.fillMode= "none";
	//default: none // forwards

	
	
	this.name = "";
	this.callbackFunction = {};
	
	if(items)
		this.load(items);

}
var _roles = Scene._roles = [];

Scene.Timeline = function(json) {
	return new Scene().loadTimeline(json);
}
Scene.addRole = function(name, plural) {
	var _roles = Scene._roles;

	_roles.push({"name":name, "plural":plural, "capitalize":camelize(" " + name)});
	
	//SceneItem.addGetFramePropertyFunction(name);
	SceneItem.addPropertyFunction(name, plural);
	Frame.addPropertyFunction(name, plural);
}

var scenePrototype = Scene.prototype;
defineGetterSetter(scenePrototype, "name");
defineGetterSetter(scenePrototype, "playSpeed");
defineGetterSetter(scenePrototype, "playCount");
defineGetterSetter(scenePrototype, "iterationCount");
defineGetterSetter(scenePrototype, "direction");
defineGetterSetter(scenePrototype, "fillMode");


/**
     * load sceneItem as JSON.
     * @method Scene#load
     * @param {Object} sceneItems sceneItem.
     * @return {Scene} a Instance.
     * @example
scene.load({
    "item1" : {
        0 : {width: "30px", height: "20px", property:value},
        2 : {width: "50px", property:value},
        6.5:{height: "200px", property:value},
    },
    "item2" : {
        0 : {transform:{scale:0.5}, property:value},
        2 : {transform:{scale:1.5, rotate:"0deg"}, width: "50px", property:value},
        6.5: {transform:{scale:1, rotate:"50deg"}, width: "10px", property:value},
    }
});
     */
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

scenePrototype.loadTimeline = function(times) {
	if(!times)
		return this;
	
	var json = {}, time, items, item;
	for(time in times) {
		items = times[time];
		for(item in items) {
			if(!(item in json))
				json[item] = {};
			
			json[item][time] = items[item];
		}
	}
	if("option" in times) {
		json.option = times.option;
	}
	return this.load(json);	
}

/**
     * add Item in Scene
     * @method Scene#newItem
     * @param {String} id sceneItem ID.
     * @return {SceneItem} SceneItem new Item.
     * @example
var sceneItem = scene.newItem("item1");
     */
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

scenePrototype.copyFrame = function(fromTime, toTime) {
	var sceneItems = this.sceneItems;
	var item;
			
	for(var id in sceneItems) {	
		item = sceneItems[id];
		item.copyFrame(fromTime, toTime);
	}
	return this;
}

/**
* get Finish Time of a Scene.
* @method Scene#getFinishTime
* @return {Number} time Scene's Running Time.
*/
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
/**
* get Item in Scene.
* @method Scene#getItem
* @param {String} itemID SceneItem ID.
* @return {SceneItem} SceneItem getItem in Scene.
*/
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
			this.setPlayCount(pc);
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
var DEFAULT_FRAME_TIME = Scene.DEFAULT_FRAME_TIME = 0;
var COLOR_MODEL_RGBA = "rgba";
var COLOR_MODEL_RGB = "rgba";
var COLOR_MODEL_HSL = "hsl";
var COLOR_MODEL_HSLA = "hsla";
var ATTR_ITEM_ID = "item-id";
var ANIMATION_PLAY_STATE = ["idle", "pending", "paused", "running", "finished"];
var FILL_MODE = ["none", "forwards", "backwards", "both", "auto" ];
var PLAY_DIRECTION = ["normal", "reverse", "alternate", "alternate-reverse"];
Scene.EASE = [.25,.1,.25,1];
Scene.EASE_IN = [.42,0,1,1];
Scene.EASE_IN_OUT = [.42,0,.58,1];
/**
* Add & Manage Frame
* @class
* @name Scene.SceneItem
*/
var SceneItem = Scene.SceneItem = function(element) {
	var self = this;
	self.id = "";
	self.element = element;
	self.time = 0;
	self.times = [];
	self.frames = {};// 프레임의 모음
	self.names = {};
	
	var _roles = Scene._roles, length = _roles.length;
	for(var i = 0; i < length; ++i) {
		self.names[_roles[i]["name"]] = []; //속성의 이름을 가진 배열 초기화
	}
	
	self.timingFunctions = [];
	self.nowTimingFunction;
	this.callbackFunction = {};
	
	self.element = element;
	self.newFrame(DEFAULT_FRAME_TIME);
	
	/* !!수정필요 View 속성 Rule로 초기화 필요*/
	this.init();
}

var sceneItemPrototype = SceneItem.prototype;



defineGetterSetter(sceneItemPrototype, "element");
defineGetterSetter(sceneItemPrototype, "id");



sceneItemPrototype.init = function() {
	
}

/**
     * load Frame as JSON.
     * @method Scene.SceneItem#load
     * @param {Object} frames frames.
     * @return {SceneItem} a Instance.
     * @example
sceneItem1.load({
    0 : {width: "30px", height: "20px", property:value},
    2 : {width: "50px", property:value},
    6.5:{height: "200px", property:value},
});
     */
sceneItemPrototype.load = function(item) {
	var time, properties, frame;
	for(time in item) {
		properties = item[time];
		time = parseFloat(time);
		if(isNaN(time))
			continue;			
		frame = this.newFrame(time);
		frame.load(properties);
		
	}
	if("option" in item) {
		var option, value, options = item.option;
		for(option in options) {
			value = options[option];
			if(option === "timingFunction") {
				for(var i = 0; i < value.length / 3; ++i) {
					this.addTimingFunction(value[3*i + 0], value[3 * i + 1], value[3 * i + 2]);
				}
				continue;
			}
			
			this[option] = options[option];
		}
	}
	
	return this;
}
sceneItemPrototype.set = function(name, time, property, value) {
	var frame;
	
	
	//!! throw error
	if(typeof time !== "number" && isNaN(parseFloat(time)))
		return this;
		
	frame = this.newFrame(time);	

	
	frame.set(name, property, value);
	return this;
}
sceneItemPrototype.sets = function(name, time, properties) {
	var frame;
	
	
	//!! throw error
	if(typeof time !== "number" && isNaN(parseFloat(time)))
		return this;
		
	frame = this.newFrame(time);
	
	
	frame.sets(name, properties);
	return this;
}
sceneItemPrototype.isIn = function(name, property) {
	var frame, time, frames = this.frames;
	//var count = 0;
	for(time in frames) {
		frame = frames[time];
		if(!frame)
			continue;
			
		if(typeof frame.get(name, property) !== "undefined")
			return true;
	}
	return false;	
}
sceneItemPrototype.remove = function(name, time, property) {
	var index = this.names[name].indexOf(property);
	if(index == -1)
		return this;
	
	var frame = this.getFrame(time);
	if(!frame)
		return this;
		
	frame.remove(name, property);

	return this;	
}
sceneItemPrototype.get = function(name, time, property) {
	var frame;
	if(!(frame = this.frames[time]))
		return;
	
	return frame.get(name, property);
}
sceneItemPrototype.addName = function(name, propertyName) {
	if(this.names[name].indexOf(propertyName) != -1)
		return;
	this.names[name].push(propertyName);	
	
	return this;
}
sceneItemPrototype.removeName = function(name, property) {
	if(!this.isIn(name, property))
		this.names[name].splice(index, 1);
}



SceneItem.addPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var getProperty = camelize("get " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + name);
	var addPropertyName = camelize("add " + name) + "Name";
	var isInProperty = camelize("isIn " + name);

	/*
		property 이름을 추가한다.
	*/
	sceneItemPrototype[addPropertyName] = function(propertyName) {
		this.addName(name,propertyName);
	}
	/*
		해당 시간에 대한 프레임을 찾아 property에 대한 값을 가져온다.
	*/
	sceneItemPrototype[getProperty] = function(time, property, value) {
		return this.get(name, time, property);
	}
	/*
		해당 시간에 대한 프레임을 찾아 property를 추가
	*/
	sceneItemPrototype[setProperty] = function(time, property, value) {
		this.set(name, time, property, value);
		return this;
	}
	//해당 시간에 대한 프레임을 찾아 property들을 추가
	sceneItemPrototype[setProperties] = function(time, properties) {
		this.sets(name, time, properties);
		return this;
	}
	//property가 어느 시간에도 없을 때 제거한다.
	sceneItemPrototype[removeProperty] = function(time, property) {
		this.remove(name, time, property);
		return this;
	}
	/*
		property가 존재하는지 확인
	*/
	sceneItemPrototype[isInProperty] = function(property) {
		return this.isIn(name, property);
	}
}

sceneItemPrototype.getNowValue = function(name, time, property) {
	var times = this.times, length = times.length, finishTime = this.getFinishTime();
	
    if(length === 0)
		return;
    
	// index : length = time : this.getFinishTime()
	var index = parseInt(finishTime > 0 ? time * length / finishTime : 0) , right = length - 1, left = 0;
    
    if(index < 0)
        index = 0;
    else if(index > right)
        index = right;
    
    if(time < times[right]) {
        //Binary Search
        while (left < right) {
            if( (left === index  || right === index ) && (left +1 === right)) {
                break;
            } else if (times[index] > time) {
                right = index;
            } else if (times[index] < time) {
                left = index;
            } else {
                left = right = index;
                break;
            }
            index = parseInt((left + right) / 2);
        }
    } else {
        left = index = right;
    }
    var prevTime = times[left], nextTime = times[right];
    if(time < prevTime)
        return;

    var prevFrame = this.frames[prevTime];
    var nextFrame = this.frames[nextTime];
    
    
    
    for(var i = left; i >= 0; --i) {
        prevFrame = this.frames[times[i]];
        prevTime = times[i];
        if(typeof prevFrame.get(name, property) !== "undefined")
            break;
    }
    for(var i = right; i < length; ++i) {
        nextFrame = this.frames[times[i]];
        nextTime = times[i];
        if(typeof nextFrame.get(name, property) !== "undefined")
            break;
    }
    
    
		
	var prevValue = prevFrame.get(name, property);
	if(typeof prevValue === "undefined")
		return;
		
	if(!nextFrame)
		return prevValue;
		
	var nextValue = nextFrame.get(name, property);	
	
	if(typeof nextValue === "undefined")
		return prevValue;
	
	var value;
	
	
	if(prevTime < 0)
		prevTime = 0;
		
	// 전값과 나중값을 시간에 의해 내적을 한다.

	value = _u.dot(prevValue, nextValue, time - prevTime, nextFrame.time - time);
	
	return value;
}

/*
	해당 time이 몇번째에 지정되어있는지 확인
*/
sceneItemPrototype.getTimeIndex = function(time) {
	return this.times.indexOf(time);
}
/*
	Frame과 Frame 사이를 시간에 대해 내적해서 얻은 Frame을 얻어냄
*/
sceneItemPrototype.getNowFrame = function(time) {
	var times = this.times;
	var names, propertyNames, nameLength;
	var frame = new Frame(this, time);
	var value, property;
	var _roles = Scene._roles,
        length = _roles.length,
        role, roleName;
	var capital;
	for(var i = 0; i < length; ++i) {
        role = _roles[i];
		capital = role.capitalize;
        roleName = role.name;
        
		propertyNames = this.names[roleName];
		nameLength = propertyNames.length;
		for(var j = 0; j < nameLength; ++j) {
			property = propertyNames[j];
			value = this.getNowValue(roleName, time, property);
            
            if(typeof value === "undfined")
                continue;
            
			frame.set(roleName, property, value);	
		}
	}
	return frame;
}
/*
	재생이 끝났는지 확인
*/
sceneItemPrototype.isTimeEnd = function(direction) {
	if(direction == "reverse")
		return this.time == 0;
		
	return this.getFinishTime() <= this.time;
}
/*
	finishTime = times last index
*/
sceneItemPrototype.getFinishTime = function() {
	return this.times.length > 0 ? this.times[this.times.length - 1] : 0;
}

sceneItemPrototype.trigger = function(name, args) {
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

/*
	재생간에 불러낼 Callback 함수 지정
*/
sceneItemPrototype.on = function onAnimate(name, func) {
	this.callbackFunction[name] = this.callbackFunction[name] || [];
	this.callbackFunction[name].push(func);
	
	return this;
}
/*
	해당 시간에 지정된 Frame으로 Element style 변경
*/
sceneItemPrototype.setTime = function setTime(time, isPlay) {
	if(this.getFinishTime() < time)
		time = this.getFinishTime();
	else if(time < 0)
		time = 0;
		
		
	if(this.time == time && time > 0 && isPlay)
		return this;

		
	this.time = time;
	var timingFunctions = this.timingFunctions;
	var length = timingFunctions.length;
	var nowTimingFunction = this.nowTimingFunction;
	var _callback;
	
	
	
	//시간이 벗어나거나 TimingFunction이 미지정일시 해당 시간에 만족하는 TimingFunction을 찾는다.
	if(nowTimingFunction && (nowTimingFunction.endTime < time || time < nowTimingFunction.startTime) || length > 0  && !nowTimingFunction ) {
		nowTimingFunction = this.nowTimingFunction = 0;
		for(var i = 0; i < length; ++i) {
			if(timingFunctions[i].startTime <= time && time <= timingFunctions[i].endTime) {
				nowTimingFunction = this.nowTimingFunction = timingFunctions[i];
				break;
			}
		}
	}
	
	
	try {
		if(nowTimingFunction)
			time = nowTimingFunction && nowTimingFunction.cubicBezier(time) || time;
	} catch(e) {
	}
	
	frame = this.getNowFrame(time);
	
	this.trigger("animate", [time, frame]);
	
	
	
	return this;
}


/*
	해당시간에 새로운 Frame을 만든다. 이미 있다면 만들지 않고 병합을 한다.
*/
sceneItemPrototype.addFrame = function(time, frame) {
	//if String Error "5" > "10"
	time = parseFloat(time);
	
	//ctrace("--- addFrame", time + "s");
	//해당 시간에 프레임이 있는지 확인 없으면 추가 있으면 에러 제공
	
	//해당 프레임이 이미 존재하면 합친다. 
	
	
	var _frame = this.getFrame(time);
	if(_frame) {
		_frame.merge(frame);
		return this;
	}
	
	frame.setSceneItem(this);
	
	var times = this.times;
	var length = times.length;
	var pushIndex = 0 , left = 0, right = length - 1;
	
	//추가 시킬 위치를 찾는 중 정렬
	for(var i = 0; i < length; ++i) {
		pushIndex = i + 1;
		if(times[i] > time) {
			pushIndex = i;
			break;
		}
	}
    
	this.times.splice(pushIndex,0, time);
	this.frames[time] = frame;
	frame.time = time;
	
	return this;
}
sceneItemPrototype.newFrame = function(time) {
	
	var frame = this.getFrame(time);
	if(frame)
		return frame;
		
	frame = new Frame(this, time);
	this.addFrame(time, frame);
	
	return frame;
}
sceneItemPrototype.setFrame = function(time, frame) {
	//해당 시간에 프레임이 있는지 확인 없으면 추가 addFrame
	//this.frames
	frame.time = time;
	if(this.getFrame(time))
		this.frames[time] = frame;
	else
		this.addFrame(time, frame);
		
	return this;
}
sceneItemPrototype.getFrame = function(time) {
	return this.frames[time];
}
sceneItemPrototype.removeFrame = function(time) {
	this.frames[time].setSceneItem(null);
	var index = this.getTimeIndex(time);
	if(index < 0)
		return this;
	this.times.splice(index, 1);
	delete this.frames[time];
	
	return this;
}

sceneItemPrototype.copyFrame = function(fromTime, toTime) {
	var frame = this.getFrame(fromTime);
	if(!frame)
		return this;
		
	var copyFrame = frame.copy();
	this.setFrame(toTime, copyFrame);	
	return this;
}




sceneItemPrototype.addTimingFunction = function(startTime, endTime, curveArray) {

	var timingFunctions = this.timingFunctions;
	var length = timingFunctions.length;
	var pushIndex = 0;
	
	//추가 시킬 위치를 찾는 중 정렬
	for(var i = 0; i < length; ++i) {
		pushIndex = i + 1;
		if(timingFunctions[i].startTime > startTime) {
			pushIndex = i;
			break;
		}
	}
	var timingFunction = new TimingFunction(startTime, endTime, curveArray);
	this.timingFunctions.splice(pushIndex,0, timingFunction);
		
}
/**
* Set Property & get CSSText
* @class
* @name Scene.Frame
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



/**
* load Frames as JSON.
* @method Scene.Frame#load
     * @param {Object} properties properties.
     * @return {this} a Instance.
     * @example
frame1.load({width: "30px", height: "20px", property:value});
     */
framePrototype.load = function(properties) {
	var self = this;
	var _util = Scene.Util;
	var property, p2;
	var value;
	var value2;
	for(property in properties) {
		value = properties[property];
		if(property in this.properties) {
			if(typeof value === "object") {
				for(p2 in value) {
					this.set(property, p2, value[p2]);
				}
			} else {
				value = _util.stringToObject(value);
				if(typeof value !== "object")
					continue;
					
				if(value.type !== "array") {
					this.set(property, value.model, value.value.join(value.separator));
					continue;
				}
				
				value.each(function(v, i) {
					if(typeof value !== "object")
						return;
						
					self.set(property, v.model, v.value.join(v.separator));
				});
					
			}
			continue;
		} 
		this.set("property", property, value);
	}
	
	return this;	
}

/**
* set property in frame
* @method Scene.Frame#set
     * @param {String} role ex) "property", "transform", "filter"
     * @param {String} property
     * @param {String|Object} value
     * @return {this} a Instance.
     * @example
frame1.set("property", "opacity", 0.5);
frame1.set("property", "background", "#333");
frame1.set("transform", "rotate", "10deg");
frame1.set("filter", "brightness", "30%");
     */
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
	
	/**
* get property in frame
* @method Scene.Frame#getProperty
     * @param {String} property
     * @return {String|Number|Object} propertyValue.
     * @example
frame1.getProperty("opacity")
     */
	/**
* get transform property in frame
* @method Scene.Frame#getTransform
     * @param {String} property
     * @return {String|Number|Object} propertyValue.
     * @example
frame1.getTrasnform("rotate")
     */
	/**
* get filter property in frame
* @method Scene.Frame#getFilter
     * @param {String} property
     * @return {String|Number|Object} propertyValue.     
     * @example
frame1.getFilter("brightness")
     */
	framePrototype[getProperty] = function(property) {
		return this.get(name, property);
	};
	/**
* set property in frame
* @method Scene.Frame#setProperty
     * @param {String} property
     * @param {String|Number|Object} value
     * @return {this} a Instance.
     * @example
frame1.setProperty("opacity", 0.5)
     */
	/**
* set transform in frame
* @method Scene.Frame#setTransform
     * @param {String} property
     * @param {String|Number|Object} value
     * @return {this} a Instance.
     * @example
frame1.setTrasnform(rotate", "10deg")
     */
	/**
* set filter in frame
* @method Scene.Frame#setFilter
     * @param {String} property
     * @param {String|Number|Object} value
     * @return {this} a Instance.
     * @example
frame1.setFilter("brightness", "50%")
     */
	framePrototype[setProperty] = function(property, value) {
		this.set(name, property, value);
		return this;
	};
	
	/**
* set properties in frame
* @method Scene.Frame#setProperties
     * @param {Object} values
     * @return {this} a Instance.
     * @example
frame1.setProperties({opacity:0.5, background:"#f55"});
     */
	/**
* set transforms in frame
* @method Scene.Frame#setTransforms
     * @param {Object} values
     * @return {this} a Instance.
     * @example
frame1.setTrasnforms({rotate:"10deg", scale:"1,5"});
     */
	/**
* set filters in frame
* @method Scene.Frame#setFilters
     * @param {Object} values
     * @return {this} a Instance.
     * @example
frame1.setFilter({"brightness": "50%", grayscale:"30%"});
     */
	framePrototype[setProperties] = function(properties) {
		this.sets(name, properties);
		return this;
	}
	framePrototype[removeProperty] = addFunction(framePrototype.removeProperty, function(property) {
		this.remove(name, property);
			
		return this;
	});

}



	/**
* Make a copy of frame.
* @method Scene.Frame#copy
     * @return {Frame} a copy of frame.
     * @example
var frame2 = frame1.copy()
     */
framePrototype.copy = function() {
	var frame = new Frame(this.sceneItem, this.time);
	frame.merge(this);
	
	return frame;
}

	/**
	* Merge with other frame.
	* @method Scene.Frame#merge
    * @param {Frame} frame to merge.
    * @return {this} a Instance.
    * @example
frame1.merge(frame2);
     */
framePrototype.merge = function(frame) {
	
	var _frame = this;
	var _roles = Scene._roles, length = _roles.length;
	var properties, capital;
	for(var i = 0; i < length; ++i) {
		properties = frame.properties[_roles[i]["name"]];
		_frame.sets(_roles[i]["name"], properties);
	}
	
	return this;
}



var Curve = {
	_bezier : function(x1, y1, x2, y2) {
		function cubic(_x1, _x2, t) {
			var t2 = 1-t;
			/*
				Bezier Curve Formula
			*/
			return t* t* t + 3 * t * t * t2 * _x2 + 3 * t * t2 * t2 * _x1;
		}
		/*
			x = f(t)
			x를 통해 역함수를 구하는 과정
		*/
		function solveFromX(x) {
			// x  0 ~ 1
			// t 0 ~ 1
			var t = x, _x= x, dx = 1;
			while(Math.abs(dx) > 1 / 1000) {
				 /*예상 t초에 의한 _x값*/
				_x = cubic(x1, x2, t);
				dx = _x - x;
				// 차이가 미세하면 그 값을 t로 지정
				if(Math.abs(dx) < 1 / 1000)
					return t;
					
				t -= dx / 2; 
			}
			return t;
		}
		return function(x) {
			if(x >= 1)
				x = 1;
			else if(x <= 0)
				x = 0;
			var _x = solveFromX(x);
			return cubic(y1, y2, _x);
		}
	},
	cubicBezier : function(x1, y1, x2, y2) {
		return this._bezier(x1, y1, x2, y2);
	}
}
/*
	애니메이션이 해당 시간대에 어떤 TimingFunction을 사용할건지 지정한다.
*/
var TimingFunction = function(_startTime, _endTime, _curveArray) {
	this.startTime = _startTime;
	this.endTime = _endTime;
	this._bezierCurve = Curve.cubicBezier(_curveArray[0],_curveArray[1],_curveArray[2],_curveArray[3]);
}
var timingFunctionPrototype = TimingFunction.prototype;

timingFunctionPrototype.cubicBezier = function(time) {
	var startTime = this.startTime, endTime = this.endTime;
	var dist = endTime - startTime;
	/*
		해당 시간대가 아닌 경우 time을 반환
	*/
	if(dist <= 0 || time < startTime || time > endTime)
		return time;
	
	var duration = time - startTime;
	
	var _time = duration / dist;
	return startTime + dist * this._bezierCurve(_time);
}
/**
     * Make String to Property Object for the dot product
     * @class
     * @name Scene.PropertyObject
     * @param {String|Array} value This value is in the array format ..
     * @param {String} separator Array separator.
     * @example
var obj1 = new Scene.PropertyObject("1,2,3", ",");
var obj2 = new Scene.PropertyObject([1,2,3], " ");
var obj3 = new Scene.PropertyObject("1$2$3", "$");

//rgba(100, 100, 100, 0.5)
var obj4 = new Scene.PropertyObject([100,100,100,0.5], {
	"separator" : ",",
	"prefix" : "rgba(",
	"suffix" : ")"
});
     */

var PropertyObject = Scene.PropertyObject = function PropertyObject(value, options) {
	/*
		value가 구분자로 인해 Array 또는 Object로 되어 있는 상태
	*/
	this.prefix = "";
	this.suffix = "";
	this.model = "";
	this.type = "";
	
	if(typeof options === "object") {
		for(var key in options) {
			this[key] = options[key];
		}
	} else {
		this.separator = options
	}
	this.separator = typeof this.separator === "undefined" ? "," : this.separator;
	this.value = (value instanceof Object) ? value : value.split(this.separator);

}

var propertyObjectPrototype = PropertyObject.prototype;


defineGetterSetter(propertyObjectPrototype, "type");
defineGetterSetter(propertyObjectPrototype, "model");
defineGetterSetter(propertyObjectPrototype, "prefix");
defineGetterSetter(propertyObjectPrototype, "suffix");


/**
     * Make Property Object's array to String
     * @method Scene.PropertyObject#join
	 * @return {String} Join the elements of an array into a string
     * @example
//rgba(100, 100, 100, 0.5)
var obj4 = new Scene.PropertyObject([100,100,100,0.5], {
	"separator" : ",",
	"prefix" : "rgba(",
	"suffix" : ")"
});

obj4.join();  // =>   "100,100,100,0.5"
     */

propertyObjectPrototype.join = function() {
	var rv = "", v = "";
	var s = false;
	var arr = this.value, separator = this.separator;
    if(typeof arr.join === "function")
        return arr.join(separator);
    
	for(var i in arr) {
		if(s) rv += separator;

		v = arr[i];
		rv += (v instanceof PropertyObject) ? v.toValue() : v;
		s = true;
	}
	return rv;
};


/**
     * executes a provided function once per array element.
     * @method Scene.PropertyObject#each
     * @param {Function} callback Function to execute for each element, taking three arguments
     * @param {All} [callback.currentValue] The current element being processed in the array.
     * @param {Number} [callback.index] The index of the current element being processed in the array.
     * @param {Array} [callback.array] the array.
	 * @return {String} Join the elements of an array into a string
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach|MDN Array.forEach()} reference to MDN document.
     * @example
//rgba(100, 100, 100, 0.5)
var obj4 = new Scene.PropertyObject([100,100,100,0.5], {
	"separator" : ",",
	"prefix" : "rgba(",
	"suffix" : ")"
});

obj4.join();  // =>   "100,100,100,0.5"
     */

propertyObjectPrototype.each = function(func) {
	var arr = this.value;
	for(var i in arr) {
		func(arr[i], i, arr);
	}
}
/**
     * Make Property Object to String
     * @method Scene.PropertyObject#toValue
	 * @return {String} Make Property Object to String
     * @example
//rgba(100, 100, 100, 0.5)
var obj4 = new Scene.PropertyObject([100,100,100,0.5], {
	"separator" : ",",
	"prefix" : "rgba(",
	"suffix" : ")"
});

obj4.toValue();  // =>   "rgba(100,100,100,0.5)"
     */
propertyObjectPrototype.toValue = function() {
	return this.prefix + this.join() + this.suffix;
};


(function() {
	var sp = SceneItem.prototype;
	var properties = ["opacity", "width", "height","left", "top"];
	l = properties.length;
	for(var i = 0; i < l; ++i) {
		var property = properties[i];
		sp[property] = (function(property) {
			return function(time, value) {
				return this.setProperty(time, property, value);
			};
		})(property);
	}	
	
	var transformProperties = ["scale", "translate", "rotate", "skew", "translateX", "translateY"];
	l = transformProperties.length;

	for(var i = 0; i < l; ++i) {
		var property = transformProperties[i];
		sp[property] = (function(property) {
			return function(time, value) {
				return this.setTransform(time, property, value);
			};
		})(property);
	}
})();
/** 
	* @namespace Scene.Util
 */
var _u = Scene.Util = {
	// ex) 100px unit:px, value: 100
	/**
		* Divide the unit of text.
		* @function Scene.Util#splitUnit
		* @param {String|Number} value ex) "10px", "350", "-4em"
		* @return {Object} unit, value
		* @example
Util.splitUnit("10px"); // {unit:"px", value:10}
Util.splitUnit("-4em"); // {unit:"em", value:-4}
Util.splitUnit("350"); // {unit:"", value:350}	
	*/
	splitUnit: function splitUnit(v) {
		v = v + "";
        try {
            var value = v.match(/([0-9]|\.|\-|e\-|e\+)+/g, "")[0]

            var unit = v.replace(value, "") || "";

            value = parseFloat(value);


            return {unit:unit, value:value};
        } catch(e) {
            return {unit:v}
        }
	 },
	/**
		* convert array to PropertyObject[type=color].
		* default model "rgba"
		* @function Scene.Util#arrayToColorObject
		* @param {Array|PropertyObject} value ex) [0, 0, 0, 1]
		* @return {PropertyObject} PropertyObject[type=color]
		* @example
	Util.arrayToColorObject([0, 0, 0])
	// => PropertyObject(type="color", model="rgba", value=[0, 0, 0, 1], separator=",")
	*/
	 arrayToColorObject: function(arr) {
	 	var model = "rgba";
	 	if(arr instanceof PropertyObject) {
	 		arr.setType("color");
		 	arr.setModel(model);
		 	arr.setPrefix(model + "(");
		 	
		 	return arr;
	 	}
	 		
		if(arr.length === 3)
			arr[3] = 1;
		
		
		var object = new PropertyObject(arr, {
			separator : ",",
			type : "color",
			model : model,
			prefix : model + "(",
			suffix : ")"
		});
		
		return object;
	 },
 /**
	* convert text with parentheses to PropertyObject[type=color].
	* If the values are not RGBA model, change them RGBA mdoel.
	* @function Scene.Util#toColorObject
	* @param {String|PropertyObject} value ex) "rgba(0,0,0,1)"
	* @return {PropertyObject} PropertyObject[type=color]
	* @example
Util.toColorObject("rgba(0, 0, 0,1)")
// => PropertyObject(type="color", model="rgba", value=[0, 0, 0,1], separator=",")
*/
	 toColorObject: function(v) {
		var colorArray, length;
		var colorObject;
		if(v instanceof PropertyObject) {
			colorObject = v;
			colorArray = colorObject.value;
			var length = colorArray.length;
	 	} else if(v.charAt(0) === "#")  {
			if(v.length === 4) {
				colorArray = _color.hexToRGB(_color.hex4to6(v));
			} else if(v.length === 7) {
				colorArray = _color.hexToRGB(v);
			} else {
				colorArray = _color.hexToRGB(v);
			}
			return this.arrayToColorObject(colorArray);
		} else if(v.indexOf("(") !== -1) {		
			colorObject = this.toBracketObject(v);
			colorArray = colorObject.value;
			var length = colorArray.length;
			/*
				문자열을 숫자로 변환한다. 안하게 되면 내적에서 문제가 생긴다.
			*/
		} else {
			return this.arrayToColorObject(colorArray);
		}
		
		if(length === 4)
			colorArray[3] = parseFloat(colorArray[3]);
		else if(length === 3)
			colorArray[3] = 1;
			
			
		colorObject.setType("color");
		var colorModel = colorObject.getModel().toLowerCase();
		
		
		 //rgb hsl model to CHANGE rgba hsla
		 //string -> number
		switch(colorModel) {
		case "rgb":
			this.arrayToColorObject(colorObject);
		case "rgba":
			for(var i = 0; i < 3; ++i) {
				colorArray[i] = parseInt(colorArray[i]);
			}
			break;
		case "hsl":
		case "hsla":
			for(var i = 1; i < 3; ++i) {
				if(colorArray[i].indexOf("%") !== -1)
					colorArray[i] = parseFloat(colorArray[i]) / 100;
			}
			// hsl, hsla to rgba
			colorArray = _color.hslToRGB(colorArray);
			return this.arrayToColorObject(colorArray);
		}
		

			

		return colorObject;
	 },
	 /**
	* convert text with parentheses to PropertyObject.
	* @function Scene.Util#toBracketObject
	* @param {String} value ex) "rgba(0,0,0,1)"
	* @return {PropertyObject} PropertyObject
	* @example
Util.toBracketObject("abcde(0, 0, 0,1)")
// => PropertyObject(model="abcde", value=[0, 0, 0,1], separator=",")
*/
	 toBracketObject: function(a1) {
	 	/*
			[prefix, value, other]
		*/
		var _a1 = a1.split("(");
		var model = _a1[0];
		_a1 = a1;
		_a1 = _a1.replace(model + "(", "").split(")");
		
		var length = _a1.length;
		if(length < 2)
			return a1;
			
			
		var prefix = model +"(", suffix;
		var value = "", arr = [];
		var _value, arrValue, index = 0;
		
		for(var i = 0; i < length - 2; ++i) {
			value += _a1[i] +")";
		}
		value  += _a1[length - 2];
		

		suffix = ")" + _a1[length - 1];
		
		value = value.split(/\s*\,\s*|(\S*\([\s\S]*\))/g);
		length = value.length;

		for(i = 0; i < length; ++i) {
			_value = value[i];
			if(typeof _value === "undefined") {
				++index;
				continue;
			} else if(_value === "") {
				continue;
			}
			arrValue = arr[index];
			arr[index] = arrValue ? arrValue + _value : _value;
		}
		length = arr.length;

		for(i = 0; i < length; ++i) {
			arr[i] = this.stringToObject(arr[i]);
		}
		

		var object = new PropertyObject(arr, {
			separator : ",",
			model : model,
			prefix: prefix,
			suffix: suffix
		});		
		return object;
	 },
	 /**
	* The dot product of PropertyObject(type=color)
	* If the values are not RGBA model, change them RGBA mdoel.
	* @function Scene.Util#dotColor
	* @param {PropertyObject|String} a1 value1
	* @param {PropertyObject|String} a2 value2
	* @param {Number} b1 b1 ratio
	* @param {Number} b2 b2 ratio
	* @return {PropertyObject} PropertyObject(type=color).
	* @example
var colorObject = ......; //PropertyObject(type=color, model="rgba", value=[254, 254, 254, 1]);
Util.dotColor("#000",  colorObject, 0.5, 0.5);
// "#000" => PropertyObject(type=color, model="rgba", value=[0, 0, 0, 1]);
// return => PropertyObject(type=color, model="rgba", value=[127, 127, 127, 1]);
	*/
 	 dotColor: function(a1, a2, b1, b2) {
	 	 /*
	 	 	배열을 PropertyObject로 변환		 	 
	 	 */
/*
 	 	if(a1 instanceof Array)
 	 		a1 = this.arrayToRGBObject(a1);
		
		if(a2 instanceof Array)
			a2 = this.arrayToRGBObject(a2);
			 	 
*/		
		if(!(a1 instanceof PropertyObject))
			a1 = this.toColorObject(a1);
			
		if(!(a2 instanceof PropertyObject))
			a2 = this.toColorObject(a2);
		

		var a1v = a1.value, a2v = a2.value;
		/*
			컬러 모델이 다르면 내적이 불가능
		*/
		var a1m = a1.model, a2m = a2.model;
		if(a1m !== a2m)
			return this.dot(a1.toValue(), a2.toValue(), b1, b2);
			
		if(a1v.length === 3)
			a1v[3] = 1;
			
		if(a2v.length === 3)
			a2v[3] = 1;
			
		var v = this.dotArray(a1v, a2v, b1, b2);
		var colorModel = a1.getModel();		
		for(var i = 0; i < 3; ++i) {
			v[i] = parseInt(v[i]);
		}

		var object = new PropertyObject(v, ",");
		object.setType("color");
		object.setModel(colorModel);
		object.setPrefix(a1.getPrefix());
		object.setSuffix(")");
		
		return object;
			
	 },
	 /**
	* The dot product of Arrays
	* @function Scene.Util#dotArray
	* @param {Array} a1 value1
	* @param {Array} a2 value2
	* @param {Number} b1 b1 ratio
	* @param {Number} b2 b2 ratio
	* @return {Array|Object} Array.
	* @example
Util.dotArray([0, 0, 0, 1],[50, 50, 50, 1],0.5, 0.5);
// => [25, 25, 25, 1]
	*/
	 dotArray: function(a1, a2, b1, b2) {
	 	var obj = {};
	 	var v1, v2;
	 				
		for(var n in a1) {
			v1 = a1[n];
			if(!n in a2)
				obj[n] = v1;
			else
				obj[n] = this.dot(v1, a2[n], b1, b2);
		}	 
		
		return obj;
	 },
	 /**
	* The dot product of Objects
	* @function Scene.Util#dotObject
	* @param {PropertyObject} a1 value1
	* @param {PropertyObject} a2 value2
	* @param {Number} b1 b1 ratio
	* @param {Number} b2 b2 ratio
	* @return {PropertyObject} Array with Separator.
	* @example
Util.dotObject(PropertyObject(["1px", "solid", rgba(0, 0, 0, 1)]),
		PropertyObject(["9px", "solid", rgba(50, 50, 50, 1)]),
		0.5, 0.5);
// => PropertyObject(["5px", "solid", rgba(25, 25, 25, 1)])
	*/
	 dotObject: function(a1, a2, b1, b2) {
		 var a1type = a1.getType();
	 	if(a1type === "color")
	 		return this.dotColor(a1, a2, b1, b2);
	 		
	 	var _a1 = a1.value;
	 	var _a2 = a2.value;
	 	try {
		 	var a2type = a2.getType();
		 } catch(e) {
			 // a1 => PropertyObject, a2 => String, Others....
			 return a1;
		 }
	 	if(a1type === "array" && a2type !== "array")
	 		_a2 = {0:a2};
	 	else if(a1type !== "array" && a2type === "array")
	 		_a1 = {0:a1};
	 		
	 	var obj = this.dotArray(_a1, _a2, b1, b2);
		var object = new PropertyObject(obj, a1.separator);
		object.setPrefix(a1.getPrefix());
		object.setSuffix(a1.getSuffix());
		
		return object;
	 },
	 /**
	* convert CSS Value to PropertyObject
	* @function Scene.Util#stringToObject
	* @param {String} value it's text contains the array.
	* @return {String} Not Array, Not Separator, Only Number & Unit
	* @return {PropertyObject} Array with Separator.
	* @see referenced regular expression {@link http://stackoverflow.com/questions/20215440/parse-css-gradient-rule-with-javascript-regex}
	* @example
Util.stringToObject("1px solid #000");
// => PropertyObject(["1px", "solid", rgba(0, 0, 0, 1)])
	*/
	 stringToObject: function(a1) {
	 /*
	 	공백을 기준으로 나눈다. 자동으로 양쪽 끝 여백은 매칭하지 않는다.
		 ex 1px solid rgb(1, 2, 3) => ["1px", "solid", "rgb(1, 2, 3)"]
	 */
		if(typeof a1 !== "string")
			return a1;
		//test code
		//ref http://stackoverflow.com/questions/20215440/parse-css-gradient-rule-with-javascript-regex
		//   /(\S*\(((\([^\)]*\)|[^\)\(]*)*)\)|(\S+(\s*,\s*))|\S+)+/g
	 	var arr = a1.match(/(\S*\(((\([^\)]*\)|[^\)\(]*)*)\)|(\S+(\s*,\s*))|\S+)+/g);
	 	var result, length;
	 	if(arr && arr.length != 1) {
		 	length = arr.length;
	 		for(var i = 0; i < length; ++i) {
		 		arr[i] = this.stringToObject(arr[i]);
	 		}
	 		result = new PropertyObject(arr, " ");
	 		result.setType("array");
	 		
	 		return result;
		} else if(a1.indexOf("(") != -1) {//괄호가 들어갈 때
			try {
	 			if((a1 = this.toBracketObject(a1)) && _color.models.indexOf(a1.getModel().toLowerCase()) != -1) 
		 			return this.toColorObject(a1);
		 	} catch(e) {
			 	throw new Error("Error : This is an invalid format." + a1);
		 	}
	 		arr = a1.value;
	 		length = arr.length;
	 		for(var i = 0; i < length; ++i) {
		 		arr[i] = this.stringToObject(arr[i]);
	 		}	
	 		
		}else if(a1.indexOf(",") != -1) { //구분자가 ","
	 		result = new PropertyObject(a1, ",");
	 		result.setType("array");
	 		
	 		return result;
	 	} else if(a1.indexOf("#") === 0) {
	 		return this.toColorObject(a1);
	 	}
	 	return a1;
	},
	 /*
		 a1과 a2를 b1과 b2에 대해 내적한다.
		 a2 *  b1 / (b1 + b2) + a1 * b2 / (b1 + b2)
	 */
	 /**
	* The dot product of a1 and a2 for the b1 and b2.
	* @function Scene.Util#dot
	* @param {String|Number|PropertyObject} a1 value1
	* @param {String|Number|PropertyObject} a2 value2
	* @param {Number} b1 b1 ratio
	* @param {Number} b2 b2 ratio
	* @return {String} Not Array, Not Separator, Only Number & Unit
	* @return {PropertyObject} Array with Separator.
	* @example
Util.dot(1, 3, 0.3, 0.7);
// => 1.6
	*/
	dot : function dot(a1, a2, b1, b2) {

		// PropertyObject일 경우 Object끼리 내적을 한다.
	 	if(a1 instanceof PropertyObject)
	 		return this.dotObject(a1, a2, b1, b2);
	 	
	 	
	 	// 0일 경우 0으로 나누는 에러가 생긴다.
	 	if(b1 + b2 == 0)
	 		return a1;
	 	
		// 값과 단위를 나눠준다.	
		var v1 = this.splitUnit(a1);
		var v2 = this.splitUnit(a2);
		var r1 = b1 / (b1 + b2);
		var r2 = 1- r1;
		var v;
		
		// 숫자가 아닐경우 첫번째 값을 반환 b2가 0일경우 두번째 값을 반환
		if(isNaN(v1.value) || isNaN(v2.value)) {
			if(r1 >=1)
				return a2;
			else
				return a1;
		} else {
			v = v1.value * r2 + v2.value * r1;
		}
		
		var unit = v1.unit || v2.unit || false;
		if(unit === false)
			return v;
		
		return v + unit.trim();
	},
	/*
		add Function 
		함수를 추가한다. 점두사 접미사에 붙힐 수 있거나 새로운 함수를 만들 수 있다.
	*/
	addFunction: function (target, name, func, opt) {
		isInFunc = !!target[name];
		if(!isInFunc) {
			target[name] = func;
			return;
		}
		var newfunc = (function(_func, func, chkfunc, _isRV, isRV) {
			return function() {
				var args = arguments;
				var _rv, rv;
				_rv = _func.apply(this, args);
				if(chkfunc && chkfunc(_rv) || !chkfunc) {
					rv = func.apply(this, args);
				}
					
				
				if(_isRV)
					return _rv;
				else
					return rv;
			};
		});
		var _func = target[name];
		var chkfunc = opt.checkFunction;
		var isRV = opt.isReturnValue;
		if(opt.isPrefix)
			target[name] = newfunc(func, _func, chkfunc, isRV, !isRV);
		else
			target[name] = newfunc(_func , func, chkfunc, !isRV, isRV);
	}
};
var _color = Scene.Color = {
	models : ["rgb", "rgba", "hsl", "hsla"],
	nameToRGB : function(name){
		var rgb = this.rgbCodes[name];
		if(!rgb)
			rgb = this.rgbCodes["black"];
			
		var arr = rgb.split(",");
		
		for(var i = 0; i < 3; ++i)
			arr[i] = parseInt(arr[i]);
			
		return arr;
		
	},
	hexToRGB : function(h) {
		h = this.cutHex(h);
		var r = parseInt(h.substring(0,2), 16);
		var g = parseInt(h.substring(2,4), 16);
		var b = parseInt(h.substring(4,6), 16);
		var a = parseInt(h.substring(6,8), 16) / 255;
		if(isNaN(a))
			a = 1;
			
		return [r, g, b, a];
	},
	cutHex: function(h) {
		return (h.charAt(0)==="#") ? h.substring(1,9):h;
	},
	hex4to6: function(h) {
		var r = h.charAt(1);
		var g = h.charAt(2);
		var b = h.charAt(3);
		var arr = [r, r, g, g, b, b];
		
		return arr.join("");
	},
	/*
		reference to http://www.rapidtables.com/convert/color/rgb-to-hsl.htm
	*/
	rgbToHSL : function(rgb) {
		var r = rgb[0] / 255, g = rgb[1] / 255, b= rgb[2] / 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;
	    var d = max - min;	
	    if(d === 0){
	        h = s = 0; // achromatic
	    }else{

	        s = d / (1- Math.abs(2 * l - 1));
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	    }

	    var result = [h * 60, s, l];
	    if(rgb.length > 3)
	    	result[3] = rgb[3];
	    	
	    return result;
	},
	hslToRGB : function(hsl) {
		var h = hsl[0], s = hsl[1], l = hsl[2];
		if( h < 0)
			h = h + parseInt((Math.abs(h) + 360) / 360) * 360;
			
		h = h % 360;
		var c = (1- Math.abs(2 * l - 1)) * s;
		var x = c * (1 - Math.abs((h/60) % 2 - 1));
		var m = l - c / 2;
		var rgb;
		if(h < 60)
			rgb = [c, x, 0];
		else if (h < 120)
			rgb = [x, c, 0];
		else if(h < 180)
			rgb = [0, c, x];
		else if(h < 240)
			rgb = [0, x, c];
		else if(h < 300)
			rgb = [x, 0, c];
		else if(h < 360)
			rgb = [c, 0, x];
		
		var result = [Math.round((rgb[0] + m) * 255), Math.round((rgb[1] + m) * 255), Math.round((rgb[2] + m) * 255)];
	    if(hsl.length > 3)
	    	result[3] = hsl[3];
	    
	    return result;
	}
};
(function() {
var _defaultProperties = Frame._defaultProperties = {
	"translate" : "0, 0",
	"opacity" : 1,
	"scale" : "1, 1",
	rotateY :"0deg",
	rotateX : "0deg",
	rotateZ : "0deg",
	rotate : "0deg",
	blur: "0px",
	grayscale : "0%",
	contrast : "0%",
	brightness : "0%",
	invert : "0%",
	saturate : "0%",
	sepia : "0%"
}
	
Scene.addRole("property", "properties");
Scene.addRole("transform", "transforms");
Scene.addRole("filter", "filters");
defineGetterSetter(sceneItemPrototype, "selector");
defineGetterSetter(sceneItemPrototype, "element");



/**
     * set selector to connect sceneItem and Element
     * @method Scene#setSelector
     * @param {Object|String} selectors selectors key=selector, value = itemName.
     * @param {String} [itemName] sceneItem name to connect.
     * @return {Scene} a Instance.
     * @example
scene.setSelector({
	"#id .class" : "item1",
	".class2" : "item2"
});

scene.setSelector(".class3", "item3");
     */
scenePrototype.setSelector = function(selectors, itemName) {
	var item;
	if(typeof selectors === "string") {
		item = this.getItem(itemName);
		if(!item)
			return this;
			
		item.setSelector(selectors);
		return this;
	}
	
	for(selector in selectors) {
		itemName = selectors[selector];
		item = this.getItem(itemName);
		if(!item)
			continue;
			
		item.setSelector(selector);
	}
	return this;
}

/**
     * set selector to connect sceneItem and Element
     * @method Scene.SceneItem#setSelector
     * @param {String} selector
     * @return {SceneItem} a Instance.
     * @example
sceneItem.setSelector("#id .class");
     */
sceneItemPrototype.setSelector = function(selector) {
	this.selector = selector;
	
	this.element = document.querySelectorAll(selector);
	
	return this;
}
function animateFunction(time, frame) {
	var cssText = frame.getCSSText();
	var element = this.element;
	if(!element)
		return;
	
	if(element instanceof NodeList) {
		var length = element.length;
		
		for(var i = 0; i < length; ++i) {
			element[i].style.cssText = cssText;
		}
		
		return;
	}
	element.style.cssText = cssText;
}

scenePrototype._addElement = function(elements) {
	var length = elements.length, i;

	var arr = [];
	for( i = 0; i < length; ++i) {
		arr[i] = this.addElement(elements[i]);
	}
	return arr;
}

/**
     * add Element and connect sceneItem and element.
     * @method Scene#addElement
     * @param {String|NodeList} id
     * @param {Element|NodeList} element
     * @return {SceneItem} new SceneItem.
     * @example
scene1.addElement("#id .class");
scene1.addElement(document.querySelectorAll(".item1"));


scene1.addElement("item1", document.querySelector(".item1"));
scene1.addElement("item2", document.querySelectorAll(".item2"));
     */
scenePrototype.addElement = function(id, element) {
	var length = arguments.length;
	if(length === 0) {
		return;
	} else if(length === 1) {
		element = id;
		id = "";
		
		var type = typeof element;
		
		if(!element) {
			return;
		} else if(type === "string") {
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


sceneItemPrototype.init = function() {
	if(this.element) {
		this.element.setAttribute("role", "item");
		this.addStyleToFrame(Scene.DEFAULT_FRAME_TIME);
	}
	this.on("animate", animateFunction);

}



/**
     * save current style of the element in the frame at that time.
     * @method Scene#addCSSToFrame
     * @param {Number} time set frame in time.
     * @param {String} property get element's property.
     * @return {SceneItem} a Instance.
     * @example
sceneItem.addCSSToFrame(0, "background-color");
// set 0s Frame Property element's background-color 
     */
sceneItemPrototype.addCSSToFrame = function(time, property) {
	var element = this.element;
	if(element instanceof NodeList)
		element = element[0];
		
	if(!element)
		return this;
		
		
		
	var css = element.style[property];
	if(typeof css === "undefined" || css === "")
		css = getComputedStyle(element)[property];
	
	
	var frame = this.newFrame(time);
	var value = {};

	value[property] = css;
	

	frame.load(value);
	
	return this;
}
sceneItemPrototype.addStyleToFrame = function(time) {
	var element = this.element;
	
	if(element instanceof NodeList)
		element = element[0];
		
	if(!element)
		return this;

	var cssText = element.style.cssText;
	var a1 = cssText.split(";");
	var l = a1.length;
	var a2;
	var cssObject = {}, value;
	for(var i =0; i < l; ++i) {
		a2 = a1[i].split(":");
		if(a2.length <= 1)
			continue;
			
		value = a2[1].trim();
		cssObject[a2[0].trim()] = value;
	}
	this.setProperties(time, cssObject);
	
	return this;
}

scenePrototype.playCSS = function play (){
	if(this.isStart)
		return this;
		
	this.startTime = this.prevTime = Date.now();
	this.nowTime = this.spendTime = 0;
	
	this.setPlayCount(0);

	this.isStart = true;
	this.isFinish = false;
	this.isPause = false;	

	var sceneItems = this.sceneItems;
	var item;
	var selector;
	var elements, i, length;
	
	for(var id in sceneItems) {
		item = sceneItems[id];
		selector = item.getSelector();
		elements = document.querySelectorAll(selector);
		length = elements.length;
		for(i = 0; i < length; ++i) {
			elements[i].className += " startAnimation";
		}
	}
	return this;	
}
scenePrototype.stopCSS = function stop() {
	console.log("STOP");
	this.isStart = false;
	this.isFinish = true;
	this.isPause = false;
	
	var sceneItems = this.sceneItems;
	var item;
	var selector;
	var elements, i, length;
	for(var id in sceneItems) {
		item = sceneItems[id];
		selector = item.getSelector();
		elements = document.querySelectorAll(selector);
		length = elements.length;
		for(i = 0; i < length; ++i) {
			elements[i].className = replaceAll(elements[i].className , "startAnimation" ,"");
		}
	}
	
	return this;
}


/*export CSS STYLE*/
scenePrototype.exportCSS = function() {
	var sceneItems = this.sceneItems;
	var sceneItem;
	var finishTime = this.getFinishTime();
	css = "";
	for(var id in sceneItems) {
		sceneItem = sceneItems[id];
		css += sceneItem.exportCSSRule(this, finishTime);
	}
	
	var style = "<style>" + css +"</style>";
	document.head.insertAdjacentHTML("afterbegin", style);
	return this;
}
var CSS_ANIMATION_RULE = "";
var CSS_ANIMATION_START_RULE = "{selector}.startAnimation{{prefix}animation: scenejs_animation_{id} {time}s {type};{prefix}animation-fill-mode: {fillMode};{prefix}animation-iteration-count:{count};}";

sceneItemPrototype.exportCSSRule = function(scene, finishTime) {
	if(!this.getSelector())
		return "";
		
	var selectors = this.getSelector().split(","), length = selectors.length;
	finishTime = finishTime || this.getFinishTime();
	var css = "";

//**임시
	var id = this.selector.match(/[0-9a-zA-Z]+/g).join("") + this.id;
	var _CSS_ANIMATION_START_RULE = replaceAll(CSS_ANIMATION_START_RULE, "{prefix}", "");
	 _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{time}", finishTime);
	 _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{type}", "linear");
	  _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{id}", id);
	  _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{count}", scene.iterationCount || 1);
	  _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{fillMode}", scene.fillMode);
	for(var i = 0; i < length; ++i) {
		css += replaceAll(_CSS_ANIMATION_START_RULE, "{selector}", selectors[i]);
	}
	
	
	var keyframeCss = "@keyframes scenejs_animation_" + id +"{";
	var times = this.times, time;
	legnth = times.length;
	var percentage;
	for(var i = 0; i < legnth; ++i) {
		time = times[i];
		percentage = (time / finishTime * 100) + "% "; 
		keyframeCss += percentage + "{" + this.getNowFrame(time).getCSSText() + "}\n";
	}
	keyframeCss += "}\n";
	css+= keyframeCss;
	
	return css;
}



/**
     * get CSSObject
     * @method Scene.Frame#getCSSObject
     * @return {object} CSSObject
     * @example
sceneItem.getFrame(0.5).getCSSObject()
//ex => {"background" :"#fff", transform: "scale(1) rotate(30deg)"}
     */
framePrototype.getCSSObject = function() {
	var transforms = this.properties["transform"], filters = this.properties["filter"], properties = this.properties["property"];
	var value;
	var cssObject = {}, cssTransform = "", cssFilter = "";
	/*transform css*/
	for(var transformName in transforms) {
		value = transforms[transformName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			if(typeof value === "undefined")
				continue;
			cssTransform += transformName + "(" + value + ")";
			cssTransform += " ";
		} catch(e) {}
	}
	if(cssTransform)
		cssObject["transform"] = cssTransform;
	/*filter css*/
	for(var filterName in filters) {
		value = filters[filterName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			if(typeof value === "undefined")
				continue;
			cssFilter += filterName + "(" + value + ")";
			cssFilter += " ";
		} catch(e){}
	}
	if(cssFilter)
		cssObject["filter"] = cssFilter;
	/*property css*/
	for(var propertyName in properties) {
		value = properties[propertyName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			if(typeof value === "undefined")
				continue;
			cssObject[propertyName] = value;
		} catch(e) {}
	}
	return cssObject;
}
/*
	크로스 브라우징 접두사를 추가시켜준다.
*/
var convertCrossBrowserCSSObject = function(cssObject, property) {
	cssObject["-moz-" + property] =
	cssObject["-ms-" + property] =
	cssObject["-o-" + property] =
	cssObject["-webkit-" + property] = cssObject[property];
}



/**
     * get cssText // convert CSSObject to cssText 
     * @method Scene.Frame#getCSSText
     * @return {String} cssText
     * @example
sceneItem.getFrame(0.5).getCSSText()
//ex => "background:#fff; transform:scale(1) rotate(30deg);"
*/
framePrototype.getCSSText = function() {
	var cssObject = this.getCSSObject();
	var cssText = "", value, property;
	if(cssObject.transform)
		convertCrossBrowserCSSObject(cssObject, "transform");
	if(cssObject.filter)
		convertCrossBrowserCSSObject(cssObject, "filter");
	
	for(property in cssObject) {
		cssText += property + ":" + cssObject[property] +";";
	}

	return cssText;
}

})();
})();