var DEFAULT_LAYOUT_TIME = 0;
var COLOR_MODEL_RGBA = "rgba";
var COLOR_MODEL_RGB = "rgba";
var COLOR_MODEL_HSL = "hsl";
var COLOR_MODEL_HSLA = "hsla";
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


var Scene = function Scene() {
	this.sceneItems = [];
	this.startTime = this.prevTime = this.nowTime = 0;
	this.isStart = this.isFinish = this.isPause = false;
	this.playSpeed = 1;
}


var scenePrototype = Scene.prototype;

defineGetterSetter(scenePrototype, "playSpeed");

scenePrototype.addItem = function(sceneItem) {
	this.sceneItems.push(sceneItem);
	return sceneItem;
}
scenePrototype.addElement = function(element) {
	var item = new SceneItem(element);
	return this.addItem(item);
}
scenePrototype.synchronize = function synchronize(time, isPlay) {
	var sceneItems = this.sceneItems;
	var item;
	var itemsLength = sceneItems.length;
	var finishCount = 0;
		
	for(var i = 0; i < itemsLength; ++i) {
		item = sceneItems[i];
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
var SceneItem = Scene.SceneItem = function(element) {
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
	this.newFrame(DEFAULT_LAYOUT_TIME);
	if(element) {
		element.setAttribute("role", "item");
		this.addStyleToFrame(DEFAULT_LAYOUT_TIME);
	}
}
var sceneItemPrototype = SceneItem.prototype;

var addPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + names);
	var addPropertyName = camelize("add " + name) + "Name";
	var isInProperty = camelize("isIn " + name);
	var propertyNames = name + "Names";

	/*
		property 이름을 추가한다.
	*/
	sceneItemPrototype[addPropertyName] = function(name) {
		if(this[propertyNames].indexOf(name) != -1)
			return;
		this[propertyNames].push(name);	
		
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
		var index = this[propertyNames].indexOf(property);
		if(index == -1)
			return this;
		
		if(!this[isInProperty](property))
			this.propertyNames.splice(index, 1);
			
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
addPropertyFunction("property", "properties");
addPropertyFunction("transform", "transforms");
addPropertyFunction("filter", "filters");


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
	else if(func === "getFilter") {
		value = defaultProperties[property];
		sceneItem.setFilter(DEFAULT_LAYOUT_TIME, property, value);
	}
	else if(func === "getTransform") {
		value = defaultProperties[property];
		sceneItem.setTransform(DEFAULT_LAYOUT_TIME, property, value);
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
	
	var frame = this.getNowFrame(time);


	if(this.animateFunction)
		this.animateFunction(time);
		
		
	var cssText = frame.getCSSText();
	
	if(!this.element)
		return false;
	
	this.element.style.cssText = cssText;
	
	return true;
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

/*
	Frame
	TransitionFrame for Transition
	TemporaryFrame for execute Query or 
	
*/
var defaultProperties = {
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

var Frame = Scene.Frame = function Frame(sceneItem, time) {
	var _frame = this;
	_frame.sceneItem = sceneItem;
	_frame.transforms = {};
	_frame.properties = {};
	_frame.filters = {};
	_frame.time = time;
}
var framePrototype = Frame.prototype;
defineAll(framePrototype, "property", "properties");
defineAll(framePrototype, "sceneItem");
defineAll(framePrototype, "transform", "transforms");
defineAll(framePrototype, "filter", "filters");

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
setPropertyFunction("property", "properties");
setPropertyFunction("transform", "transforms");
setPropertyFunction("filter", "filters");


// 프레임 복사본을 만든다.
framePrototype.copy = function() {
	var frame = new Frame(this.sceneItem, this.time);
	frame.merge(this);
	
	return frame;
}
//다른 프레임과 합치다.
framePrototype.merge = function(frame) {
	var _frame = this;
	var properties = frame.properties;
	var transforms = frame.transforms;
	var filters = frame.filters;
	
	_frame.setProperties(properties);
	_frame.setTransforms(transforms);
	_frame.setFilters(filters);

}



framePrototype.getCSSObject = function() {
	var transforms = this.transforms, filters = this.filters, properties = this.properties;
	var value;
	var cssObject = {}, cssTransform = "", cssFilter = "";
	/*transform css*/
	for(var transformName in transforms) {
		value = transforms[transformName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			cssTransform += transformName + "(" + value + ")";
			cssTransform += " ";
		} catch(e) {}
	}
	cssObject["transform"] = cssTransform;
	/*filter css*/
	for(var filterName in filters) {
		value = filters[filterName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			cssFilter += filterName + "(" + value + ")";
			cssFilter += " ";
		} catch(e){}
	}
	cssObject["filter"] = cssFilter;
	/*property css*/
	for(var propertyName in properties) {
		value = properties[propertyName];
		try {
			if(value instanceof Object)
				value = value.toValue();
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
/*
	CSSObject를 cssText로 바꿔준다.
*/
framePrototype.getCSSText = function() {
	var cssObject = this.getCSSObject();
	var cssText = "", value, property;
	convertCrossBrowserCSSObject(cssObject, "transform");
	convertCrossBrowserCSSObject(cssObject, "filter");
	
	for(property in cssObject) {
		cssText += property + ":" + cssObject[property] +";";
	}

	return cssText;
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

var PropertyObject = function(value, separator) {
	/*
		value가 구분자로 인해 Array 또는 Object로 되어 있는 상태
	*/
	this.type = "";
	this.value = (value instanceof Object) ? value : value.split(separator);
	this.separator = separator;
	this.prefix = "";
	this.suffix = "";
	this.model = "";
}

var propertyObjectPrototype = PropertyObject.prototype;
defineGetterSetter(propertyObjectPrototype, "type");
defineGetterSetter(propertyObjectPrototype, "model");
defineGetterSetter(propertyObjectPrototype, "prefix");
defineGetterSetter(propertyObjectPrototype, "suffix");

propertyObjectPrototype.join = function() {
		var rv = "", v = "";
		var s = false;
		var arr = this.value, separator = this.separator;
		for(var i in arr) {
			if(s) rv += separator;

			v = arr[i];
			rv += (v instanceof PropertyObject) ? v.toValue() : v;
			s = true;
		}
		return rv;
	}

propertyObjectPrototype.toValue = function() {
	return this.prefix + this.join() + this.suffix;
}

(function() {
	var sp = SceneItem.prototype;
	var properties = ["opacity", "width", "height"];
	l = properties.length;
	for(var i = 0; i < l; ++i) {
		var property = properties[i];
		sp[property] = (function(property) {
			return function(time, value) {
				return this.setProperty(time, property, value);
			};
		})(property);
	}	
	
	var transformProperties = ["scale", "translate", "rotate"];
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

var _u = Scene.Util = {
	// ex) 100px unit:px, value: 100
	splitUnit: function splitUnit(v) {
		v = v + "";
		var value = parseFloat(v.replace(/[^0-9|\.|\-]/g,''));
		var unit = v.replace(value, "") || "";
		return {unit:unit, value:value};
		
	 },
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
		
		var object = new PropertyObject(arr, ",");
		object.setType("color")
		object.setModel(model);
		object.setPrefix(model + "(");
		object.setSuffix(")");
		
		return object;
	 },
	 toColorObject: function(v) {
		var colorArray, length;
		var colorObject;
		if(v instanceof PropertyObject) {
			colorObject = v;
			colorArray = colorObject.value;
			var length = colorArray.length;
	 	} else if(v.charAt(0) === "#")  {
			if(v.length === 4) {
				colorArray = _c.hexToRGB(_c.hex4to6(v));
			} else if(v.length === 7) {
				colorArray = _c.hexToRGB(v);
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
		var colorModel = colorObject.getModel();
		
		
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
			colorArray = _c.hslToRGB(colorArray);
			return this.arrayToColorObject(colorArray);
		}
		

			

		return colorObject;
	 },
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
		

		var object = new PropertyObject(arr, ",");
		object.setModel(model);
		object.setPrefix(prefix);
		object.setSuffix(suffix);
		
		return object;
	 },
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
	 stringToObject: function(a1) {
	 /*
	 	공백을 기준으로 나눈다. 자동으로 양쪽 끝 여백은 매칭하지 않는다.
		 ex 1px solid rgb(1, 2, 3) => ["1px", "solid", "rgb(1, 2, 3)"]
	 */
		if(typeof a1 !== "string")
			return a1;
			
	 	var arr = a1.match(/(\S*\([\s\S]*\)|(\S+(\s*,\s*))|\S+)+/g);
	 	var result, length;
	 	if(arr.length != 1) {
		 	length = arr.length;
	 		for(var i = 0; i < length; ++i) {
		 		arr[i] = this.stringToObject(arr[i]);
	 		}
	 		result = new PropertyObject(arr, " ");
	 		result.setType("array");
	 		
	 		return result;
		} else if(a1.indexOf("(") != -1) {//괄호가 들어갈 때
 			if((a1 = this.toBracketObject(a1)) && _c.models.indexOf(a1.getModel()) != -1) 
	 			return this.toColorObject(a1);
	 		
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
		
		var unit = v1.unit || v2.unit || "";	
		return v + unit.trim();
	}
};

var _c = Scene.Color = {
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
		return [r, g, b];
	},
	cutHex: function(h) {
		return (h.charAt(0)==="#") ? h.substring(1,7):h;
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
		
		console.log(h, rgb);
		var result = [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
	    if(hsl.length > 3)
	    	result[3] = hsl[3];
	    	
	    return result;
	}
};