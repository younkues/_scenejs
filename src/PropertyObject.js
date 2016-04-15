
var PropertyObject = function(value, separator) {
	/*
		value가 구분자로 인해 Array 또는 Object로 되어 있는 상태
	*/
	this.type = "";
	this.value = (value instanceof Object) ? value : value.split(separator);
	this.separator = separator;
	this.prefix = "";
	this.suffix = "";
	this.model = "";
}

var propertyObjectPrototype = PropertyObject.prototype;
defineGetterSetter(propertyObjectPrototype, "type");
defineGetterSetter(propertyObjectPrototype, "model");
defineGetterSetter(propertyObjectPrototype, "prefix");
defineGetterSetter(propertyObjectPrototype, "suffix");

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
	}

propertyObjectPrototype.toValue = function() {
	return this.prefix + this.join() + this.suffix;
};
