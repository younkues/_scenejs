var _u = Scene.Util = {
	// ex) 100px unit:px, value: 100
	splitUnit: function splitUnit(v) {
		v = v + "";
		var value = v.replace(/[^0-9|\.|\-|e\-|e\+]/g,'');
		value = parseFloat(value);
		var unit = v.replace(value, "") || "";

		return {unit:unit, value:value};
		
	 },
	 arrayToColorObject: function(arr) {
	 	var model = "rgba";
	 	if(arr instanceof PropertyObject) {
	 		arr.setType("color");
		 	arr.setModel(model);
		 	arr.setPrefix(model + "(");
		 	
		 	return arr;
	 	}
	 		
		if(arr.length === 3)
			arr[3] = 1;
		
		

		var object = new PropertyObject(arr, ",");
		object.setType("color")
		object.setModel(model);
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
				colorArray = _color.hexToRGB(_color.hex4to6(v));
			} else if(v.length === 7) {
				colorArray = _color.hexToRGB(v);
			} else {
				colorArray = _color.hexToRGB(v);
			}
			return this.arrayToColorObject(colorArray);
		} else if(v.indexOf("(") !== -1) {		
			colorObject = this.toBracketObject(v);
			colorArray = colorObject.value;
			var length = colorArray.length;
			/*
				문자열을 숫자로 변환한다. 안하게 되면 내적에서 문제가 생긴다.
			*/
		} else {
			return this.arrayToColorObject(colorArray);
		}
		
		if(length === 4)
			colorArray[3] = parseFloat(colorArray[3]);
		else if(length === 3)
			colorArray[3] = 1;
			
			
		colorObject.setType("color");
		var colorModel = colorObject.getModel().toLowerCase();
		
		
		 //rgb hsl model to CHANGE rgba hsla
		 //string -> number
		switch(colorModel) {
		case "rgb":
			this.arrayToColorObject(colorObject);
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
			colorArray = _color.hslToRGB(colorArray);
			return this.arrayToColorObject(colorArray);
		}
		

			

		return colorObject;
	 },
	 toBracketObject: function(a1) {
	 	/*
			[prefix, value, other]
		*/
		var _a1 = a1.split("(");
		var model = _a1[0];
		_a1 = a1;
		_a1 = _a1.replace(model + "(", "").split(")");
		
		var length = _a1.length;
		if(length < 2)
			return a1;
			
			
		var prefix = model +"(", suffix;
		var value = "", arr = [];
		var _value, arrValue, index = 0;
		
		for(var i = 0; i < length - 2; ++i) {
			value += _a1[i] +")";
		}
		value  += _a1[length - 2];
		

		suffix = ")" + _a1[length - 1];
		
		value = value.split(/\s*\,\s*|(\S*\([\s\S]*\))/g);
		length = value.length;

		for(i = 0; i < length; ++i) {
			_value = value[i];
			if(typeof _value === "undefined") {
				++index;
				continue;
			} else if(_value === "") {
				continue;
			}
			arrValue = arr[index];
			arr[index] = arrValue ? arrValue + _value : _value;
		}
		length = arr.length;

		for(i = 0; i < length; ++i) {
			arr[i] = this.stringToObject(arr[i]);
		}
		

		var object = new PropertyObject(arr, ",");
		object.setModel(model);
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
		/*
			컬러 모델이 다르면 내적이 불가능
		*/
		var a1m = a1.model, a2m = a2.model;
		if(a1m !== a2m)
			return this.dot(a1.toValue(), a2.toValue(), b1, b2);
			
		if(a1v.length === 3)
			a1v[3] = 1;
			
		if(a2v.length === 3)
			a2v[3] = 1;
			
		var v = this.dotArray(a1v, a2v, b1, b2);
		var colorModel = a1.getModel();		
		for(var i = 0; i < 3; ++i) {
			v[i] = parseInt(v[i]);
		}

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
	 	try {
		 	var a2type = a2.getType();
		 } catch(e) {
			 // a1 => PropertyObject, a2 => String, Others....
			 return a1;
		 }
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
	 stringToObject: function(a1) {
	 /*
	 	공백을 기준으로 나눈다. 자동으로 양쪽 끝 여백은 매칭하지 않는다.
		 ex 1px solid rgb(1, 2, 3) => ["1px", "solid", "rgb(1, 2, 3)"]
	 */
		if(typeof a1 !== "string")
			return a1;
		//test code
		//ref http://stackoverflow.com/questions/20215440/parse-css-gradient-rule-with-javascript-regex
		///(\S*\(((\([^\)]*\)|[^\)\(]*)*)\)|(\S+(\s*,\s*))|\S+)+/g
	 	var arr = a1.match(/(\S*\([^\)]*\)|(\S+(\s*,\s*))|\S+)+/g);
	 	var result, length;
	 	if(arr && arr.length != 1) {
		 	length = arr.length;
	 		for(var i = 0; i < length; ++i) {
		 		arr[i] = this.stringToObject(arr[i]);
	 		}
	 		result = new PropertyObject(arr, " ");
	 		result.setType("array");
	 		
	 		return result;
		} else if(a1.indexOf("(") != -1) {//괄호가 들어갈 때
			try {
	 			if((a1 = this.toBracketObject(a1)) && _color.models.indexOf(a1.getModel().toLowerCase()) != -1) 
		 			return this.toColorObject(a1);
		 	} catch(e) {
			 	throw new Error("Error : This is an invalid format." + a1);
		 	}
	 		arr = a1.value;
	 		length = arr.length;
	 		for(var i = 0; i < length; ++i) {
		 		arr[i] = this.stringToObject(arr[i]);
	 		}	
	 		
		}else if(a1.indexOf(",") != -1) { //구분자가 ","
	 		result = new PropertyObject(a1, ",");
	 		result.setType("array");
	 		
	 		return result;
	 	} else if(a1.indexOf("#") === 0) {
	 		return this.toColorObject(a1);
	 	}
	 	return a1;
	},
	 /*
		 a1과 a2를 b1과 b2에 대해 내적한다.
		 a2 *  b1 / (b1 + b2) + a1 * b2 / (b1 + b2)
	 */
	dot : function dot(a1, a2, b1, b2) {

		// PropertyObject일 경우 Object끼리 내적을 한다.
	 	if(a1 instanceof PropertyObject)
	 		return this.dotObject(a1, a2, b1, b2);
	 	
	 	
	 	// 0일 경우 0으로 나누는 에러가 생긴다.
	 	if(b1 + b2 == 0)
	 		return a1;
	 	
		// 값과 단위를 나눠준다.	
		var v1 = this.splitUnit(a1);
		var v2 = this.splitUnit(a2);
		var r1 = b1 / (b1 + b2);
		var r2 = 1- r1;
		var v;
		
		// 숫자가 아닐경우 첫번째 값을 반환 b2가 0일경우 두번째 값을 반환
		if(isNaN(v1.value) || isNaN(v2.value)) {
			if(r1 >=1)
				return a2;
			else
				return a1;
		} else {
			v = v1.value * r2 + v2.value * r1;
		}
		
		var unit = v1.unit || v2.unit || false;
		if(unit === false)
			return v;
		
		return v + unit.trim();
	},
	/*
		add Function 
		함수를 추가한다. 점두사 접미사에 붙힐 수 있거나 새로운 함수를 만들 수 있다.
	*/
	addFunction: function (target, name, func, opt) {
		isInFunc = !!target[name];
		if(!isInFunc) {
			target[name] = func;
			return;
		}
		var newfunc = (function(_func, func, chkfunc, _isRV, isRV) {
			return function() {
				var args = arguments;
				var _rv, rv;
				_rv = _func.apply(this, args);
				if(chkfunc && chkfunc(_rv) || !chkfunc) {
					rv = func.apply(this, args);
				}
					
				
				if(_isRV)
					return _rv;
				else
					return rv;
			};
		});
		var _func = target[name];
		var chkfunc = opt.checkFunction;
		var isRV = opt.isReturnValue;
		if(opt.isPrefix)
			target[name] = newfunc(func, _func, chkfunc, isRV, !isRV);
		else
			target[name] = newfunc(_func , func, chkfunc, !isRV, isRV);
	}
};
