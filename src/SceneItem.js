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
	self.animateFunction;	
	
	self.element = element;
	self.newFrame(DEFAULT_LAYOUT_TIME);
	
	/* !!수정필요 View 속성 Rule로 초기화 필요*/
	if(element) {
		element.setAttribute("role", "item");
		self.addStyleToFrame(DEFAULT_LAYOUT_TIME);
	}
}
var sceneItemPrototype = SceneItem.prototype;
defineGetterSetter(sceneItemPrototype, "element");
defineGetterSetter(sceneItemPrototype, "id");

var addPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + names);
	var addPropertyName = camelize("add " + name) + "Name";
	var isInProperty = camelize("isIn " + name);

	/*
		property 이름을 추가한다.
	*/
	sceneItemPrototype[addPropertyName] = function(propertyName) {

		if(this.names[name].indexOf(propertyName) != -1)
			return;
		this.names[name].push(propertyName);	
		
		return this;
	}

	/*
		해당 시간에 대한 프레임을 찾아 property를 추가
	*/
	sceneItemPrototype[setProperty] = function(time, property, value) {
		var frame;
		if(!(frame = this.getFrame(time))) {
			frame = this.newFrame(time);	
		}
		

		if(typeof value === "string") {
			value = _u.stringToObject(value);
		}
		frame[setProperty](property, value);
		return this;
	}
	/*
		해당 시간에 대한 프레임을 찾아 property들을 추가
	*/
	
	sceneItemPrototype[setProperties] = function(time, properties) {
		for(var property in properties) {
			this[setProperty](time, property, properties[property]);
		}
		return this;
	}
	/*
		property가 어느 시간에도 없을 때 제거한다.
	*/
	sceneItemPrototype[removeProperty] = function(property) {
		var index = this.names[name].indexOf(property);
		if(index == -1)
			return this;
		
		if(!this[isInProperty](property))
			this.names[name].splice(index, 1);
			
		return this;
	}
	/*
		property가 존재하는지 확인
	*/
	sceneItemPrototype[isInProperty] = function(property) {
		var frame, time, frames = this.frames;
		//var count = 0;
		for(time in frames) {
			frame = frames[time];
			if(!frame)
				continue;
			if(typeof frame.getProperty(property) !== "undefined")
				return true;
		}
		return false;
	}
}

sceneItemPrototype.setDefaultTransform = function(time, property) {
	
}
sceneItemPrototype.setDefaultFilter = function(time, property) {
	
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
		sceneItem.setProperty(DEFAULT_LAYOUT_TIME, property, value);
	}

	return sceneItem.getFrame(DEFAULT_LAYOUT_TIME);
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
function addGetFramePropertyFunction(name) {
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
	Element의 현재 Style을 해당 time의 Frame에 저장한다.
*/
sceneItemPrototype.addStyleToFrame = function(time) {
	if(!this.element)
		return this;
	var cssText = this.element.style.cssText;
	var a1 = cssText.split(";");
	var l = a1.length;
	var a2;
	var cssObject = {};
	for(var i =0; i < l; ++i) {
		a2 = a1[i].split(":");
		if(a2.length <= 1)
			continue;
		cssObject[a2[0].trim()] = a2[1].trim();
	}
	this.setProperties(time, cssObject);
	
	return this;
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
sceneItemPrototype.isFinish = function() {
	return this.getFinishTime() <= this.time;
}
/*
	finishTime = times last index
*/
sceneItemPrototype.getFinishTime = function() {
	return this.times.length > 0 ? this.times[this.times.length - 1] : 0;
}


/*
	재생간에 불러낼 함수 지정
*/
sceneItemPrototype.onAnimate = function onAnimate(func) {
	this.animateFunction = func;
	
	return this;
}
/*
	해당 시간에 지정된 Frame으로 Element style 변경
*/
sceneItemPrototype.synchronize = function synchronize(time, isPlay) {
	if(this.getFinishTime() < time)
		time = this.getFinishTime();

	if(this.time == time && time > 0 && isPlay)
		return false;


		
	this.time = time;
	var timingFunctions = this.timingFunctions;
	var length = timingFunctions.length;
	var nowTimingFunction = this.nowTimingFunction;
	
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
		/*Error on TimingFunction*/
	}
	
	frame = this.getNowFrame(time);
	try {
		if(this.animateFunction)
			this.animateFunction(time, frame);
	} catch(e) {
		//No Function
	}
	
	
	return frame;
}


/*
	해당시간에 새로운 Frame을 만든다. 이미 있다면 만들지 않고 병합을 한다.
*/
sceneItemPrototype.addFrame = function(time, frame) {
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
