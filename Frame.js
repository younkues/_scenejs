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
	this.sceneItem = sceneItem;
	this.transforms = {};
	this.properties = {};
	this.filters = {};
	this.time = time;
}
var FramePrototype = Frame.prototype;
defineAll(FramePrototype, "property", "properties");
defineAll(FramePrototype, "sceneItem");
defineAll(FramePrototype, "transform", "transforms");
defineAll(FramePrototype, "filter", "filters");

Frame.setPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + names);
	var addPropertyName =camelize("add " + name) + "Name";
	FramePrototype[setProperty] = addFunction(FramePrototype[setProperty], function(property, value) {
		var sceneItem = this.getSceneItem();
		if(sceneItem)
			sceneItem[addPropertyName](property);
			
		return this;
	});
	FramePrototype[setProperties] = function(properties) {
		for(var property in properties) {
			this[setProperty](property, properties[property]);
		}
		return this;
	}
	FramePrototype[removeProperty] = addFunction(FramePrototype.removeProperty, function(property) {
		var sceneItem = this.getSceneItem();
		if(sceneItem)
			sceneItem[removeProperty + "Name"](property);
			
		return this;
	});

}
Frame.setPropertyFunction("property", "properties");
Frame.setPropertyFunction("transform", "transforms");
Frame.setPropertyFunction("filter", "filters");


// 프레임 복사본을 만든다.
FramePrototype.copy = function() {
	var frame = new Frame(this.sceneItem, this.time);
	frame.merge(this);
	
	return frame;
}
//다른 프레임과 합치다.
FramePrototype.merge = function(frame) {

	var properties = frame.properties;
	var transforms = frame.transforms;
	var filters = frame.filters;
	
	this.setProperties(properties);
	this.setTransforms(transforms);
	this.setFilters(filters);

}


/* transform */
FramePrototype.translate = function(x, y) {
	x = x || 0;
	y = y || 0;
	this.setTransform("translate", {x:x, y:y});
}
var propertyFunctions = {
	"background-color": function(v) {
		if(typeof v === "object")
			return "rgba(" + parseInt(v[0]) + "," + parseInt(v[1]) + "," + parseInt(v[2]) + "," + v[3]/255 + ")";
		else
			return v;
	}
}
propertyFunctions.color = propertyFunctions["background-color"];

FramePrototype.getCSSObject = function() {
	var transforms = this.transforms, filters = this.filters, properties = this.properties;
	var value;
	var cssObject = {}, cssTransform = "", cssFilter = "";
	/*transform css*/
	for(var transformName in transforms) {
		value = transforms[transformName];
		if(value instanceof Object)
			value = Util.join(value, ",");
		cssTransform += transformName + "(" + value + ")";
		cssTransform += " ";
	}
	cssObject["transform"] = cssTransform;
	/*filter css*/
	for(var filterName in filters) {
		value = filters[filterName];
		cssFilter += filterName + "(" + value + ")";
		cssFilter += " ";
	}
	cssObject["filter"] = cssFilter;
	
	for(var propertyName in properties) {
		value = properties[propertyName];
		if(propertyName in propertyFunctions)
			value = propertyFunctions[propertyName](property);
		cssObject[propertyName] = value;	
	}
	return cssObject;
}
var convertCrossBrowserCSSObject = function(cssObject, property) {
	cssObject["-moz-" + property] =
	cssObject["-ms-" + property] =
	cssObject["-o-" + property] =
	cssObject["-webkit-" + property] = cssObject[property];
}
FramePrototype.getCSSText = function() {
	var cssObject = this.getCSSObject();
	var cssText = "", value, property;
	convertCrossBrowserCSSObject(cssObject, "transform");
	convertCrossBrowserCSSObject(cssObject, "filter");
	
	for(property in cssObject) {
		cssText += property + ":" + cssObject[property] +";";
	}

	return cssText;
}