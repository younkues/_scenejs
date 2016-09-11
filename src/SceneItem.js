//element를 바깥으로 빼기
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
}
sceneItemPrototype.set = function(name, time, property, value) {
	var frame;
	
	
	//!! throw error
	if(typeof time !== "number" && isNaN(parseFloat(time)))
		return this;
		
	if(!(frame = this.getFrame(time))) {
		frame = this.newFrame(time);	
	}
	
	frame.set(name, property, value);
	return this;
}
sceneItemPrototype.sets = function(name, time, properties) {
	var frame;
	
	
	//!! throw error
	if(typeof time !== "number" && isNaN(parseFloat(time)))
		return this;
		
	if(!(frame = this.getFrame(time))) {
		frame = this.newFrame(time);	
	}
	
	
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

/*
	getNowFrameByProperty, getNowFrameByTransform, getNowFrameByFilter
	time에 해당하는 Frame을 가져온다.
*/
var getNowFrameByProperty = function(sceneItem, time, property, prevFunc, nextFunc, func) {

	var prevFrame = sceneItem[prevFunc](time, property);
	var nextFrame = sceneItem[nextFunc](time, property);
	
	if(!prevFrame)
		return;
		
	var prevValue = prevFrame[func](property);
	if(typeof prevValue === "undefined")
		return;
		
	if(!nextFrame)
		return prevValue;
		
	var nextValue = nextFrame[func](property);	
	
	if(typeof nextValue === "undefined")
		return prevValue;
	
	var value;
	

	var prevTime = prevFrame.time;
	if(prevTime < 0)
		prevTime = 0;
		
	// 전값과 나중값을 시간에 의해 내적을 한다.

	value = _u.dot(prevValue, nextValue, time - prevTime, nextFrame.time - time);
	
	return value;
}
/*
	getPrevFrameByProperty, getPrevFrameByTransform, getPrevFrameByFilter
	property가 time 이전에 있는 Frame을 가져온다. 없으면 Element의 Style을 기본값으로 설정한다.
*/
var getPrevFrameByProperty = function(sceneItem, time, property, func) {
	var frame;
	var value, tvalue = 0;
	if((frame = sceneItem.getFrame(time)) && (value = frame[func](property)))
		return frame;
		
	var times = sceneItem.times;
	var length = times.length;	
	
	for(var i = times.length - 1; i >=0 ; --i) {
		if(times[i] > time)
			continue;
		
		frame = sceneItem.getFrame(times[i]);
		if(typeof frame[func](property) !== "undefined")
			return frame;
	}
	
	
	if(!sceneItem.element)
		return;
		
	var element = sceneItem.element;
	
	if(func === "getProperty") {
		value = getComputedStyle(element)[property];
		if(value == "auto")
			value = "0";
			
		sceneItem.setProperty(DEFAULT_FRAME_TIME, property, value);
	}

	return sceneItem.getFrame(DEFAULT_FRAME_TIME);
}
/*
	getNextFrameByProperty, getNextFrameByTransform, getNextFrameByFilter
	property가 time 이후에 있는지 확인다.
*/
var getNextFrameByProperty = function(sceneItem, time, property, func) {
	var frame;
	var value, tvalue = 0;
	if((frame = sceneItem.getFrame(time)) && (value = frame[func](property)))
		return frame;
	var times = sceneItem.times;
	var length = times.length;
	
	for(var i = 0; i < length ; ++i ) {
		if(times[i] < time)
			continue;

		frame = sceneItem.getFrame(times[i]);
		if(typeof frame[func](property) !== "undefined")
			return frame;
	}
	return;
}
SceneItem.addGetFramePropertyFunction = function(name) {
	var Property = camelize(" " + name);
	sceneItemPrototype["getNowFrameBy" + Property] = function(time, property) {
		return getNowFrameByProperty(this, time, property, "getPrevFrameBy" + Property, "getNextFrameBy" + Property, "get" + Property);
	}
	sceneItemPrototype["getPrevFrameBy" + Property] = function(time, property) {
		return getPrevFrameByProperty(this, time, property, "get" + Property);
	}
	sceneItemPrototype["getNextFrameBy" +Property] = function(time, property) {
		return getNextFrameByProperty(this, time, property, "get" + Property);
	}
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
	var self = this;
	var times = self.times;
	var names, vNames;
	var frame = new Frame(self, time);
	var value, property;
	var _roles = Scene._roles, length = _roles.length;
	var capital;
	for(var i = 0; i < length; ++i) {
		capital = _roles[i]["capitalize"];
		vNames = self.names[_roles[i]["name"]];
		var nameLength = vNames.length;
		for(var j = 0; j < nameLength; ++j) {
			property = vNames[j];
			value = self["getNowFrameBy" + capital](time, property);
			frame["set" + capital](property, value);	
		}
	}
/*
	for(var i = 0; i < propertyNames.length; ++i) {
		property = propertyNames[i];
		value = this.getNowFrameByProperty(time, property);
		frame.setProperty(property, value);
	}
	for(var i = 0; i < transformNames.length; ++i) {
		transform = transformNames[i];
		value = this.getNowFrameByTransform(time, transform);
		if(typeof value === "undefined")
			continue;
		frame.setTransform(transform, value);
	}
	for(var i = 0; i < filterNames.length; ++i) {
		filter = filterNames[i];
		value = this.getNowFrameByFilter(time, filter);
		frame.setFilter(filter, value);
	}
*/
	return frame;
}
/*
	재생이 끝났는지 확인
*/
sceneItemPrototype.isFinish = function(direction) {
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
	var pushIndex = 0;
	
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
