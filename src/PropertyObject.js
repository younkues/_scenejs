/**
     * Make String to Property Object for the dot product
     * @class
     * @name Scene.PropertyObject
     * @param {String|Array} value This value is in the array format ..
     * @param {String} separator Array separator.
     * @example
var obj1 = new Scene.PropertyObject("1,2,3", ",");
var obj2 = new Scene.PropertyObject([1,2,3], " ");
var obj3 = new Scene.PropertyObject("1$2$3", "$");

//rgba(100, 100, 100, 0.5)
var obj4 = new Scene.PropertyObject([100,100,100,0.5], {
	"separator" : ",",
	"prefix" : "rgba(",
	"suffix" : ")"
});
     */

var PropertyObject = Scene.PropertyObject = function PropertyObject(value, options) {
	/*
		value가 구분자로 인해 Array 또는 Object로 되어 있는 상태
	*/
	this.prefix = "";
	this.suffix = "";
	this.model = "";
	this.type = "";
	
	if(typeof options === "object") {
		for(var key in options) {
			this[key] = options[key];
		}
	} else {
		this.separator = options
	}
	this.separator = typeof this.separator === "undefined" ? "," : this.separator;
	this.value = (value instanceof Object) ? value : value.split(this.separator);

}

var propertyObjectPrototype = PropertyObject.prototype;


defineGetterSetter(propertyObjectPrototype, "type");
defineGetterSetter(propertyObjectPrototype, "model");
defineGetterSetter(propertyObjectPrototype, "prefix");
defineGetterSetter(propertyObjectPrototype, "suffix");


/**
     * Make Property Object's array to String
     * @method Scene.PropertyObject#join
	 * @return {String} Join the elements of an array into a string
     * @example
//rgba(100, 100, 100, 0.5)
var obj4 = new Scene.PropertyObject([100,100,100,0.5], {
	"separator" : ",",
	"prefix" : "rgba(",
	"suffix" : ")"
});

obj4.join();  // =>   "100,100,100,0.5"
     */

propertyObjectPrototype.join = function() {
	var rv = "", v = "";
	var s = false;
	var arr = this.value, separator = this.separator;
	for(var i in arr) {
		if(s) rv += separator;

		v = arr[i];
		rv += (v instanceof PropertyObject) ? v.toValue() : v;
		s = true;
	}
	return rv;
};


/**
     * executes a provided function once per array element.
     * @method Scene.PropertyObject#each
     * @param {Function} callback Function to execute for each element, taking three arguments
     * @param {All} [callback.currentValue] The current element being processed in the array.
     * @param {Number} [callback.index] The index of the current element being processed in the array.
     * @param {Array} [callback.array] the array.
	 * @return {String} Join the elements of an array into a string
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach|MDN Array.forEach()} reference to MDN document.
     * @example
//rgba(100, 100, 100, 0.5)
var obj4 = new Scene.PropertyObject([100,100,100,0.5], {
	"separator" : ",",
	"prefix" : "rgba(",
	"suffix" : ")"
});

obj4.join();  // =>   "100,100,100,0.5"
     */

propertyObjectPrototype.each = function(func) {
	var arr = this.value;
	for(var i in arr) {
		func(arr[i], i, arr);
	}
}
/**
     * Make Property Object to String
     * @method Scene.PropertyObject#toValue
	 * @return {String} Make Property Object to String
     * @example
//rgba(100, 100, 100, 0.5)
var obj4 = new Scene.PropertyObject([100,100,100,0.5], {
	"separator" : ",",
	"prefix" : "rgba(",
	"suffix" : ")"
});

obj4.toValue();  // =>   "rgba(100,100,100,0.5)"
     */
propertyObjectPrototype.toValue = function() {
	return this.prefix + this.join() + this.suffix;
};

