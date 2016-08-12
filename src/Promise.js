scenePrototype.then = function(resolve) {
		
}
scenePrototype.play = function play (){
	var self = this;
	var promise = new Promise(function(resolve, reject) {
		if(self._isStart) {
			//** !! MODIFY CONSTANT
			reject(Error("Already Starting."));
			return;
		}
			
		console.log("PLAY");
		self._startTime = self.prevTime = Date.now();
		self.nowTime = this.spendTime = 0;
		
		self.setPlayCount(0);
	
	
		self._isStart = true;
		self._isFinish = false;
		self._isPause = false;

		self.tick(resolve, reject);
	});
	
	return promise;	
}
