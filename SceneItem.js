var SceneItem = function(element) {
	this.element = element;
	this.time = 0;
	this.times = [];
	this.frames = {};// 프레임의 모음
	this.transformNames =[]; // 트랜스폼이 적용된 이름들
	this.propertyNames = [];
	this.filterNames = [];
	this.timingFunctions = [];
	this.nowTimingFunction;
	this.animateFunction;	
	
	this.element = element;
	if(element)
		element.setAttribute("role", "item");
		
	this.newFrame(-1);
}
var sceneItemPrototype = SceneItem.prototype;



var addPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + names);
	var addPropertyName = camelize("add " + name) + "Name";
	var isInProperty = camelize("isIn " + name);
	var propertyNames = name + "Names";

	//property 이름을 추가한다.
	sceneItemPrototype[addPropertyName] = function(name) {
		if(this[propertyNames].indexOf(name) != -1)
			return;
		this[propertyNames].push(name);	
		
		return this;
	}
	//sceneItem.setProperty(4, "top", "40px");
	//해당 시간에 대한 프레임을 찾아 property를 추가
	sceneItemPrototype[setProperty] = function(time, property, value) {
		var frame;
		if(!(frame = this.getFrame(time))) {
			frame = this.newFrame(time);	
		}
		frame[setProperty](property, value);
		return this;
	}
	//해당 시간에 대한 프레임을 찾아 property들을 추가
	sceneItemPrototype[setProperties] = function(time, properties) {
		var frame;
		if(!(frame = this.getFrame(time))) {
			frame = this.newFrame(time);	
		}
		frame[setProperties](properties);
		
	
		return this;
	}
	//property가 어느 시간에도 없을 때 제거한다.
	sceneItemPrototype[removeProperty] = function(property) {
		var index = this[propertyNames].indexOf(property);
		if(index == -1)
			return this;
		
		if(!this[isInProperty](property))
			this.propertyNames.splice(index, 1);
			
		return this;
	}
	//property가 여기에 존재하지 않은지 확인
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
addPropertyFunction("property", "properties");
addPropertyFunction("transform", "transforms");
addPropertyFunction("filter", "filters");



//property functions
var getNowFrameByProperty = function(sceneItem, time, property, prevFunc, nextFunc, func) {

	var prevFrame = sceneItem[prevFunc](time, property);
	var nextFrame = sceneItem[nextFunc](time, property);
	
	if(!prevFrame)
		return;
		
	var prevValue = prevFrame[func](property);
	
	if(!nextFrame)
		return prevValue;
		
	var nextValue = nextFrame[func](property);	
	
	if(typeof nextValue === "undefined")
		return prevValue;
	
	var value;
	

	var prevTime = prevFrame.time;
	if(prevTime < 0)
		prevTime = 0;
		
	if(property.indexOf("color") != -1)
			value = Util.dotColor(prevValue, nextValue, time - prevTime, nextFrame.time - time);
	else
		value = Util.dot(prevValue, nextValue, time - prevTime, nextFrame.time - time);
	return value;
}
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
		sceneItem.setProperty(-1, property, value);
	}
	else if(func === "getFilter") {
		value = defaultProperties[property];
		sceneItem.setFilter(-1, property, value);
	}
	else if(func === "getTransform") {
		value = defaultProperties[property];
		sceneItem.setTransform(-1, property, value);
	}
	return sceneItem.getFrame(-1);
}
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
function getFramePropertyFunction(name) {
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

getFramePropertyFunction("property");
getFramePropertyFunction("transform");
getFramePropertyFunction("filter");

sceneItemPrototype.getTimeIndex = function(time) {
	return this.times.indexOf(time);
}
sceneItemPrototype.getNowFrame = function(time) {
	var times = this.times;
	var propertyNames = this.propertyNames;
	var transformNames = this.transformNames;
	var filterNames = this.filterNames;
	var frame = new Frame(this, time);
	var value, property, transform, filter;
	for(var i = 0; i < propertyNames.length; ++i) {
		property = propertyNames[i];
		value = this.getNowFrameByProperty(time, property);
		frame.setProperty(property, value);
	}
	for(var i = 0; i < transformNames.length; ++i) {
		transform = transformNames[i];
		value = this.getNowFrameByTransform(time, transform);
		frame.setTransform(transform, value);
	}
	for(var i = 0; i < filterNames.length; ++i) {
		filter = filterNames[i];
		value = this.getNowFrameByFilter(time, filter);
		frame.setFilter(filter, value);
	}
	return frame;
}
sceneItemPrototype.isFinish = function() {
	return this.getFinishTime() <= this.time;
}
sceneItemPrototype.getFinishTime = function() {
	return this.times.length > 0 ? this.times[this.times.length - 1] : 0;
}
sceneItemPrototype.onAnimate = function onAnimate(func) {
	this.animateFunction = func;
}
sceneItemPrototype.synchronize = function synchronize(time, isPlay) {
	if(this.getFinishTime() < time)
		time = this.getFinishTime();

	if(this.time == time && time > 0 && isPlay)
		return false;


		
	this.time = time;
	var timingFunctions = this.timingFunctions;
	var length = timingFunctions.length;
	var nowTimingFunction = this.nowTimingFunction;
	if(nowTimingFunction && (nowTimingFunction.endTime < time || time < nowTimingFunction.startTime) || length > 0  && !nowTimingFunction ) {
		nowTimingFunction = this.nowTimingFunction = 0;
		for(var i = 0; i < length; ++i) {
			if(timingFunctions[i].startTime <= time && time <= timingFunctions[i].endTime) {
				nowTimingFunction = this.nowTimingFunction = timingFunctions[i];
				break;
			}
		}
	}
	time = nowTimingFunction && nowTimingFunction.cubicBezier(time) || time;
	var frame = this.getNowFrame(time);


	if(this.animateFunction)
		this.animateFunction(time);
		
		
	var cssText = frame.getCSSText();
	
	if(!this.element)
		return false;
	
	this.element.style.cssText = cssText;
	//console.log("synchronize", cssText);
	
	return true;
}



/*프레임 기본속성 함수*/

//해당시간에 새로운 프레임을 만든다. 이미 있다면 만들지 않는다.
//해당 시간에 프레임을 추가한다 이미 있으면 추가하지 않는다.
sceneItemPrototype.addFrame = function(time, frame) {
	//ctrace("--- addFrame", time + "s");
	//해당 시간에 프레임이 있는지 확인 없으면 추가 있으면 에러 제공
	
	//해당 프레임이 이미 존재하면 합친다. 
	var _frame = this.getFrame(time);
	if(_frame) {
		_frame.merge(frame);
		return;
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
	
	return frame;
}
sceneItemPrototype.newFrame = function(time) {
	
	var frame = this.getFrame(time);
	if(frame)
		return frame;
		
	frame = new Frame(this, time);
	return this.addFrame(time, frame);
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
	if(index == -1)
		return;
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
