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