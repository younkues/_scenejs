
var Util = Scene.Util = {
	// ex) 100px unit:px, value: 100
	splitUnit: function splitUnit(v) {
		v = v + "";
		var value = parseFloat(v.replace(/[^0-9|\.|\-]/g,''));
		var unit = v.replace(value, "") || "";
		return {unit:unit, value:value};
		
	 },
	 arrayToColorObject: function(model, arr) {
	 	if(arr instanceof PropertyObject) {
		 	arr.getModel() = model;
		 	arr.setPrefix(model + "(");
		 	
		 	return arr;
	 	}
	 		
		if(arr.length === 3)
			arr[3] = 1;
		 
		var object = new PropertyObject(arr, ",");
		object.getModel() = model;
		object.setPrefix(model + "(");
		object.setSuffix(")");
		
		return object;
	 },
	 toColorObject: function(v) {
		var colorArray = [];
		var colorObject;
		if(v.charAt(0) === "#")  {
			if(v.length === 4) {
				colorArray = Color.hexToRGB(Color.hex4to6(v));
			} else if(v.length === 7) {
				colorArray = Color.hexToRGB(v);
			}
		} else if(v.indexOf("(") !== -1) {		
			colorObject = this.toBracketObject(v);
			colorArray = colorObject.value;
			var length = colorArray.length;
			
			/*
				문자열을 숫자로 변환한다. 안하게 되면 내적에서 문제가 생긴다.
			*/
			for(var i = 0; i < length; ++i) {
				colorArray[i] = parseInt(colorArray[i]);
			}
			
			if(length === 3)
				colorArray[3] = 1;
				
				
 			//rgb hsl model to CHANGE rgba hsla				
			var colorModel = colorObject.getModel();
			if(colorModel === "rgb")
				return this.arrayToColorObject("rgba", colorObject);
			else if(colorModel === "hsl")
				return this.arrayToColorObject("hsla", colorObject);
			
			return colorObject;
		} else {
			colorArray = [0, 0, 0, 0];
		}
		return this.arrayToColorObject("rgba", colorArray);
	 },
	 toBracketObject: function(a1) {
	 	/*
			[prefix, value, other]
		*/
		var _a1 = a1.split(/\(|\)/g);
		if(_a1.length < 3)
			return a1;
		
		var prefix = _a1[0] + "(";
		
		var v = _a1[1].trim();
		var suffix = ")";
		var object = new PropertyObject(v, ",");
		object.getModel() = _a1[0];
		object.setPrefix(prefix);
		object.setSuffix(suffix);
		
		return object;
	 },
 	 dotColor: function(a1, a2, b1, b2) {
	 	 /*
	 	 	배열을 PropertyObject로 변환		 	 
	 	 */
 	 	if(a1 instanceof Array)
 	 		return this.dotColor(this.arrayToRGBObject(a1), a2, b1, b2);
		else if(a2 instanceof Array)
			return this.dotColor(a1, this.arrayToRGBObject(a2), b1, b2);
			 	 		
		if(typeof a1 !== "object")
			a1 = this.toColorObject(a1);
		if(typeof a2 !== "object")
			a2 = this.toColorObject(a2);
		

		var a1v = a1.value, a2v = a2.value;
		
		var a1Prefix = a1.getPrefix(), a2Prefix = a2.getPrefix();
		var fromModel, toModel;
		
		try {
			if(a1Prefix !== a2Prefix)
				a2v = Color.change[a2.getModel()][a1.getModel()](a2v);
		} catch (e) {
			//Not Support Model;
		}

		if(a1v.length === 3)
			a1v[3] = 1;
			
		if(a2v.length === 3)
			a2v[3] = 1;
			
		var v = this.dotArray(a1v, a2v, b1, b2);
		
		var object = new PropertyObject(v, ",");
		object.setPrefix(a1.getPrefix());
		object.setSuffix(")");
		
		return object;
			
	 },
	 dotArray: function(a1, a2, b1, b2) {
	 	var obj = {};
	 	var v1, v2;
		for(var n in a1) {
			v1 = a1[n];
			if(!n in _a2)
				obj[n] = v1;
			else
				obj[n] = this.dot(v1, a2[n], b1, b2);
		}	 
		
		return obj;
	 },
	 dotObject: function(a1, a2, b1, b2) {
	 	var _a1 = a1.value;
	 	var _a2 = a2.value;
	 	var obj = this.dotArray(_a1, _a2, b1, b2);
		var object = new PropertyObject(obj, a1.separator);
		object.setPrefix(a1.getPrefix());
		object.setSuffix(a1.getSuffix());
		
		return object;
	 },	 
	 /*
		 a1과 a2를 b1과 b2에 대해 내적한다.
		 a2 *  b1 / (b1 + b2) + a1 * b2 / (b1 + b2)
	 */
	 dot : function dot(a1, a2, b1, b2) {
		 /*
			 문자일 경우 ex) 0px, rgba(0,0), "1, 1", "0 0"
		 */
	 	if(typeof a1 == "string") {
	 		a1 = a1.trim();
	 		if(a1.indexOf("(") != -1) //괄호가 들어갈 때
	 			return this.dot(this.toBracketObject(a1), a2, b1, b2);
	 		else if(a1.indexOf(",") != -1) //구분자가 ","
		 		return this.dot(new PropertyObject(a1, ","), a2, b1,b2);
		 	else if(a1.indexOf(" ") != -1) //구분자가 " "
		 		return this.dot(new PropertyObject(a1, " "), a2, b1,b2);
		 	
	 	}
	 	if(typeof a2 == "string") {
	 		a2 = a2.trim();
	 		if(a2.indexOf("(") != -1)
	 			return this.dot(a1, this.toBracketObject(a2), b1, b2);
	 		else if(a2.indexOf(",") != -1)
		 		return this.dot(a1, new PropertyObject(a2, ","), b1,b2);
		 	else if(a2.indexOf(" ") != -1)
		 		return this.dot(a1, new PropertyObject(a2, " "), b1,b2);
	 	}
	 		
	 		
	 	if(a1 instanceof PropertyObject)
	 		return this.dotObject(a1, a2, b1, b2);

	 	if(b1 + b2 == 0)
	 		return a1;
	 	
	 	/*
		 	값과 단위를 나눠준다.
	 	*/	
		var v1 = this.splitUnit(a1);
		var v2 = this.splitUnit(a2);
		var r1 = b1 / (b1 + b2);
		var r2 = 1- r1;
		var v;
		/*
			숫자가 아닐경우 첫번째 값을 반환 b2가 0일경우 두번째 값을 반환
		*/
		
		if(isNaN(v1.value)) {
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
