
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
scenePrototype.setClippingRegion = function(x, y, width, height) {
	if(x === false) {
		return;
	}
	/*
		<div class="SCENE" clip="x,y,width,height">
			<div class="SCENE_CLIPPING_REGION" style="clip:rect(y, x+ width, y+height, x)">
			</div>
		</div>
	*/
	/*
		scene의 첫번째 childnode가 SCENE_CLIPPING_REGION이어야 하고
		유일한 노드여야 한다.
		
		아니면 노드에러.
		
		SCENE_CLIPPING_REGION는 SCENE_CLIPPING_REGION라는 무언가를 나타내야겠음 !문제!
	*/
	var elementScene = this.element;
	if(!elementScene)
		return;
	/*
		
		overflow:hidden;
		clip:rect(0, width, height, 0);
	*/
	var elementClippingRegion;
	var isClipping = !!elementScene.getAttribute("clip"); //이미 clip을 지정되어있으면 true, 아니면 false
	
	if(!isClipping) {
		//clip설정이 안되어 있다면 한번만 SCENE_CLIPPING_REGION을 추가한다.
		var html = elementScene.innerHTML;
		html = "<div class=\"SCENE_CLIPPING_REGION\">" + html + "</div>";
		elementScene.innerHTML = html;
		elementScene.setAttribute("clip", x + "," + y + "," + width + "," + height);
		
	}
	elementClippingRegion = elementScene.children[0];
	/*
	position:absolute;
	clip: rect(y, x+width, y+height, x);
	transform: translate(-x, -y);
	*/
};
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
/* 	var ease = Curve.cubicBezier(0.48,0.01,0.25,1); */
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