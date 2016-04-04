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