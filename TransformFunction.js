(function() {
	var sp = SceneItem.prototype;
	var transformProperties = ["scale", "translate", "rotate"];
	var l = transformProperties.length;

	for(var i = 0; i < l; ++i) {
		var property = transformProperties[i];
		sp[property] = (function(property) {
			return function(time, value) {
				return this.setTransform(time, property, value);
			};
		})(property);
	}
})();