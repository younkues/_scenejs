(function() {
	var sp = SceneItem.prototype;
	var properties = ["opacity", "width", "height"];
	l = properties.length;
	for(var i = 0; i < l; ++i) {
		var property = properties[i];
		sp[property] = (function(property) {
			return function(time, value) {
				return this.setProperty(time, property, value);
			};
		})(property);
	}	
	
	var transformProperties = ["scale", "translate", "rotate"];
	l = transformProperties.length;

	for(var i = 0; i < l; ++i) {
		var property = transformProperties[i];
		sp[property] = (function(property) {
			return function(time, value) {
				return this.setTransform(time, property, value);
			};
		})(property);
	}
})();