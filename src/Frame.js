/*
	Frame
	TransitionFrame for Transition
	TemporaryFrame for execute Query or 
	
*/
var defaultProperties = {
	"translate" : "0, 0",
	"opacity" : 1,
	"scale" : "1, 1",
	rotateY :"0deg",
	rotateX : "0deg",
	rotateZ : "0deg",
	rotate : "0deg",
	blur: "0px",
	grayscale : "0%",
	contrast : "0%",
	brightness : "0%",
	invert : "0%",
	saturate : "0%",
	sepia : "0%"
	
}

var Frame = Scene.Frame = function Frame(sceneItem, time) {
	var _frame = this;
	_frame.sceneItem = sceneItem;
	_frame.transforms = {};
	_frame.properties = {};
	_frame.filters = {};
	_frame.time = time;
}
var framePrototype = Frame.prototype;
defineAll(framePrototype, "property", "properties");
defineAll(framePrototype, "sceneItem");
defineAll(framePrototype, "transform", "transforms");
defineAll(framePrototype, "filter", "filters");

var setPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + names);
	var addPropertyName =camelize("add " + name) + "Name";
	framePrototype[setProperty] = addFunction(framePrototype[setProperty], function(property, value) {
		var sceneItem = this.getSceneItem();
		if(sceneItem)
			sceneItem[addPropertyName](property);
			
		return this;
	});
	framePrototype[setProperties] = function(properties) {
		var _frame = this;
		for(var property in properties) {
			_frame[setProperty](property, properties[property]);
		}
		return _frame;
	}
	framePrototype[removeProperty] = addFunction(framePrototype.removeProperty, function(property) {
		var sceneItem = this.getSceneItem();
		if(sceneItem)
			sceneItem[removeProperty + "Name"](property);
			
		return this;
	});

}
setPropertyFunction("property", "properties");
setPropertyFunction("transform", "transforms");
setPropertyFunction("filter", "filters");


// 프레임 복사본을 만든다.
framePrototype.copy = function() {
	var frame = new Frame(this.sceneItem, this.time);
	frame.merge(this);
	
	return frame;
}
//다른 프레임과 합치다.
framePrototype.merge = function(frame) {
	var _frame = this;
	var properties = frame.properties;
	var transforms = frame.transforms;
	var filters = frame.filters;
	
	_frame.setProperties(properties);
	_frame.setTransforms(transforms);
	_frame.setFilters(filters);

}



framePrototype.getCSSObject = function() {
	var transforms = this.transforms, filters = this.filters, properties = this.properties;
	var value;
	var cssObject = {}, cssTransform = "", cssFilter = "";
	/*transform css*/
	for(var transformName in transforms) {
		value = transforms[transformName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			cssTransform += transformName + "(" + value + ")";
			cssTransform += " ";
		} catch(e) {}
	}
	cssObject["transform"] = cssTransform;
	/*filter css*/
	for(var filterName in filters) {
		value = filters[filterName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			cssFilter += filterName + "(" + value + ")";
			cssFilter += " ";
		} catch(e){}
	}
	cssObject["filter"] = cssFilter;
	/*property css*/
	for(var propertyName in properties) {
		value = properties[propertyName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			cssObject[propertyName] = value;
		} catch(e) {}
	}
	return cssObject;
}
/*
	크로스 브라우징 접두사를 추가시켜준다.
*/
var convertCrossBrowserCSSObject = function(cssObject, property) {
	cssObject["-moz-" + property] =
	cssObject["-ms-" + property] =
	cssObject["-o-" + property] =
	cssObject["-webkit-" + property] = cssObject[property];
}
/*
	CSSObject를 cssText로 바꿔준다.
*/
framePrototype.getCSSText = function() {
	var cssObject = this.getCSSObject();
	var cssText = "", value, property;
	convertCrossBrowserCSSObject(cssObject, "transform");
	convertCrossBrowserCSSObject(cssObject, "filter");
	
	for(property in cssObject) {
		cssText += property + ":" + cssObject[property] +";";
	}

	return cssText;
}