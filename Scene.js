

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
	
	
	if(this.animateFunction)
		this.animateFunction(time, isFinish);
		
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