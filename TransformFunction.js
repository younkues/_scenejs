(function() {
	var sp = SceneItem.prototype;
	var transformProperties = ["scale", "translate", "rotate"];
	var l = transformProperties.length;
	var property;
	for(var i = 0; i < l; ++i) {
		property = transformProperties[i];
		sp[transformProperties[i]] = function(time, value) {
			this.setTransform(time, property, value);
		}
	}
})();