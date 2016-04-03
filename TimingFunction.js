var TimingFunction = function(_startTime, _endTime, _curveArray) {
	this.startTime = _startTime;
	this.endTime = _endTime;
	this._bezierCurve = Curve.cubicBezier(_curveArray[0],_curveArray[1],_curveArray[2],_curveArray[3]);
}
var timingFunctionPrototype = TimingFunction.prototype;

timingFunctionPrototype.cubicBezier = function(time) {
	var startTime = this.startTime, endTime = this.endTime;
	var dist = endTime - startTime;
	
	if(dist <= 0 || time < startTime || time > endTime)
		return time;
	
	var duration = time - startTime;
	
	var _time = duration / dist;
	return startTime + dist * this._bezierCurve(_time);
}