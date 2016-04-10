
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
	 		arr.setType("color");
		 	arr.setModel(model);
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
		var colorArray, length;
		var colorObject;
		if(v instanceof PropertyObject) {
			colorObject = v;
			colorArray = colorObject.value;
			var length = colorArray.length;
	 	} else if(v.charAt(0) === "#")  {
			if(v.length === 4) {
				colorArray = Color.hexToRGB(Color.hex4to6(v));
			} else if(v.length === 7) {
				colorArray = Color.hexToRGB(v);
			}
			return this.arrayToColorObject("rgba", colorArray);
		} else if(v.indexOf("(") !== -1) {		
			colorObject = this.toBracketObject(v);
			colorArray = colorObject.value;
			var length = colorArray.length;
			/*
				문자열을 숫자로 변환한다. 안하게 되면 내적에서 문제가 생긴다.
			*/
		} else {
			return this.arrayToColorObject("rgba", colorArray);
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
			this.arrayToColorObject("rgba", colorObject);
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
			colorArray = Color.hslToRGB(colorArray);
			return this.arrayToColorObject("rgba", colorArray);
		}
		

			

		return colorObject;
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
		object.setModel(_a1[0]);
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
		var colorModel = a1.getModel();		
		for(var i = 0; i < 3; ++i) {
			v[i] = parseInt(v[i]);
		}
/*

		switch(colorModel) {
		case "rgba":
			for(var i = 0; i < 3; ++i) {
				v[i] = parseInt(v[i]);
			}
			break;
		case "hsla":
			for(var i = 1; i < 3; ++i) {
				if(v[i].indexOf("%") !== -1)
					v[i] = parseFloat(v[i]) / 100;
			}
		}
		
*/
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
	 	var a2type = a2.getType();
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
	 /*
		 a1과 a2를 b1과 b2에 대해 내적한다.
		 a2 *  b1 / (b1 + b2) + a1 * b2 / (b1 + b2)
	 */
	 stringToObject: function(a1) {
	 	var arr = a1.match(/\S*\([\s\S]*\)|\S+/g);
	 	var result;
	 	if(arr.length != 1) {
		 	var length = arr.length;
	 		for(var i = 0; i < length; ++i) {
		 		arr[i] = this.stringToObject(arr[i]);
	 		}
	 		result = new PropertyObject(arr, " ");
	 		result.setType("array");
	 		
	 		return result;
		} else if(a1.indexOf("(") != -1) {//괄호가 들어갈 때
 			if((a1 = this.toBracketObject(a1)) && Color.models.indexOf(a1.getModel()) != -1) 
	 			return this.toColorObject(a1);
		}else if(a1.indexOf(",") != -1) { //구분자가 ","
	 		var result = new PropertyObject(a1, ",");
	 		result.setType("array");
	 		
	 		return result;
	 	} else if(a1.indexOf("#") === 0) {
	 		return this.toColorObject(a1);
	 	}
	 	return a1;
	},
	dot : function dot(a1, a2, b1, b2) {
		 /*
			 문자일 경우 ex) 0px, rgba(0,0), "1, 1", "0 0"
		 */
/*
	 	if(typeof a1 == "string")
	 		a1 = this.stringToObject(a1.trim());

	 	if(typeof a2 == "string")
	 		a2 = this.stringToObject(a2.trim());
	 		
*/
	 	if(a1 instanceof PropertyObject)
	 		return this.dotObject(a1, a2, b1, b2);
	 	
	 	
	 	// 0일 경우 0으로 나누는 에러가 생긴다.
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
