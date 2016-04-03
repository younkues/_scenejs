var Curve = {
	_bezier : function(x1, y1, x2, y2) {
		function cubic(_x1, _x2, t) {
			var t2 = 1-t;
			return t* t* t + 3 * t * t * t2 * _x2 + 3 * t * t2 * t2 * _x1;
		}
		function solveFromX(x) {
			// x  0 ~ 1
			// t 0 ~ 1
			var t = x, _x= x, dx = 1;
			while(Math.abs(dx) > 1 / 1000) {
				_x = cubic(x1, x2, t); //예상 t초에 의한 _x값
				dx = _x - x;// 에상t초에 의한 _x와 실제x의 차이
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