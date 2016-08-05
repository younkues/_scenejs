scenePrototype.play = function play (){
	var self = this;	
	var promise = new Promise(function(resolve, reject) {
		if(self.isStart) {
			//** !! MODIFY CONSTANT
			reject(Error("Already Starting."));
		}
			
		console.log("PLAY");
		self.startTime = self.prevTime = Date.now();
		self.nowTime = this.spendTime = 0;
		
		self.setPlayCount(0);
	
		self.isStart = true;
		self.isFinish = false;
		self.isPause = false;

		self.timerFunction(resolve, reject);
	});
	
	return promise;	
}