(function() {
	var StringPrototype = String.prototype;
	StringPrototype.replaceAll = function(from, to) {
		if(!this)
			return "";
		return this.split(from).join(to);
	}
})();
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}
var defineGetterSetter = function(object, name, target) {
	defineGetter(object, name, target);
	defineSetter(object, name, target);	
}
var defineAll = function(object, name, target) {
	defineGetter(object, name, target);
	defineSetter(object, name, target);
	defineRemover(object, name, target);
}
var addFunction = function(func, func2) {
	return  function() {
		return function() {
			func.apply(this, arguments);
			func2.apply(this, arguments);
		}
	}();
}
var defineGetter = function(object, name, target) {
	
	object[camelize("get " + name)] = function(name) {
		return function(obj) {
			return target ? this[target][obj] : this[name];
		}
	}(name);
}
var defineSetter = function(object, name, target) {
	object[camelize("set " + name)] = function(name) {
		return function(v1, v2) {
			if(target)
				this[target][v1] = v2;
			else
				this[name] = v1;
			
			return this;
		}
	}(name);
}
var defineRemover = function(object, name, target) {
	object[camelize("remove " + name)] = function(name) {
		return function(v1) {
			delete this[target][v1];

			return this;
		}
	}(name);
};
var Util = {
	// ex) 100px unit:px, value: 100
	splitUnit: function splitUnit(v) {
		v = v + "";
		var value = parseFloat(v.replace(/[^0-9|\.|\-]/g,''));
		var unit = v.replace(value, "") || "";
		return {unit:unit, value:value};
		
	 },
	 toColorObject: function(v) {
		var rgb = [];
		if(v.charAt(0) === "#")  {
			if(v.length === 4) {
				rgb = hexToRGB(hex4to6(v));
			} else if(v.length === 7) {
				rgb = hexToRGB(v);
			}
		} else if(v.indexOf("rgb(") === 0 || v.indexOf("rgba(") === 0) {
			v = v.replace("rgb(", "");
			v = v.replace("rgba(", "");			
			v = v.replace(")", "");
			v = v.replaceAll(" ", "");
			rgb = v.split(",");
			var length = rgb.length;
			for(var i = 0; i < length; ++i) {
				rgb[i] = parseInt(rgb[i]);
			}
		}
		if(rgb.length === 3)
			rgb[3] = 255;
			
		return rgb;
	 },
	 dotBracket: function(a1, a2, b1, b2) {
		 
	 },
 	 dotColor: function(a1, a2, b1, b2) {
		if(typeof a1 !== "object")
			a1 = this.toColorObject(a1);
		if(typeof a2 !== "object")
			a2 = this.toColorObject(a2);
		
		if(a1.length === 3)
			a1[3] = 255;
		if(a2.length === 3)
			a2[3] = 255;
			
		return this.dotDictionary(a1, a2, b1, b2);
			
	 },
	 dotDictionary: function(a1, a2, b1, b2) {
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
	 // a2 *  b1 / (b1 + b2) + a1 * b2 / (b1 + b2)
	 dot : function dot(a1, a2, b1, b2) {

	 	if(typeof a1 == "string") {
	 		if(a1.indexOf("(") != -1)
	 			return this.dotBracket(a1, a2, b1, b2);
	 		else if(a1.indexOf(",") != -1)
		 		return this.dot(a1.split(","), a2, b1,b2);
		 	
	 	}
	 	if(typeof a2 == "string" && a2.indexOf(",") != -1)
	 		return this.dot(a1, a2.split(","), b1,b2);
	 		
	 		
	 	if(a1 instanceof Object)
	 		return this.dotDictionary(a1, a2, b1, b2);
	 	if(b1 + b2 == 0)
	 		return a1;
	 	
	 			 		
	 		
		var v1 = this.splitUnit(a1);
		var v2 = this.splitUnit(a2);
		var r1 = b1 / (b1 + b2);
		var r2 = 1- r1;
		var v;
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
	},
	join: function(arr, separator) {
		var rv = "";
		var s = false;
		for(var i in arr) {
			if(s) rv += ",";
			rv += arr[i];
			s = true;
		}
		return rv;
	}
};
