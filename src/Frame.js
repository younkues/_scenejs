/**
* Set Property & get CSSText
* @class
* @name Scene.Frame
*/
var Frame = Scene.Frame = function Frame(sceneItem, time) {
	this.sceneItem = sceneItem;
	this.properties = {};
	this.time = time;

	var _roles = Scene._roles, length = _roles.length;
	for(var i = 0; i < length; ++i) {
		this.properties[_roles[i]["name"]] = {}; //속성의 이름을 가진 배열 초기화
	}
}


var framePrototype = Frame.prototype;
defineAll(framePrototype, "sceneItem");



/**
* load Frames as JSON.
* @method Scene.Frame#load
     * @param {Object} properties properties.
     * @return {this} a Instance.
     * @example
frame1.load({width: "30px", height: "20px", property:value});
     */
framePrototype.load = function(properties) {
	var self = this;
	var _util = Scene.Util;
	var property, p2;
	var value;
	var value2;
	for(property in properties) {
		value = properties[property];
		if(property in this.properties) {
			if(typeof value === "object") {
				for(p2 in value) {
					this.set(property, p2, value[p2]);
				}
			} else {
				value = _util.stringToObject(value);
				if(typeof value !== "object")
					continue;
					
				if(value.type !== "array") {
					this.set(property, value.model, value.value.join(value.separator));
					continue;
				}
				
				value.each(function(v, i) {
					if(typeof value !== "object")
						return;
						
					self.set(property, v.model, v.value.join(v.separator));
				});
					
			}
			continue;
		} 
		this.set("property", property, value);
	}
	
	return this;	
}

/**
* set property in frame
* @method Scene.Frame#set
     * @param {String} role ex) "property", "transform", "filter"
     * @param {String} property
     * @param {String|Object} value
     * @return {this} a Instance.
     * @example
frame1.set("property", "opacity", 0.5);
frame1.set("property", "background", "#333");
frame1.set("transform", "rotate", "10deg");
frame1.set("filter", "brightness", "30%");
     */
framePrototype.set = function(name, property, value) {
	if(!this.properties[name])
		return this;
		
	
	if(typeof value === "string") {
		value = _u.stringToObject(value);
	}
	this.properties[name][property] = value;


	var sceneItem = this.getSceneItem();
	if(sceneItem)
		sceneItem.addName(name, property);

	return this;
}

framePrototype.sets = function(name, properties) {
	for(var property in properties) {
		this.set(name, property, properties[property]);
	}
	return this;
}
framePrototype.remove = function(name, property) {
	if(!this.properties[name])
		return this;
		

	delete this.properties[name][property];
	
	var sceneItem = this.getSceneItem();
	if(sceneItem)
		sceneItem.removeName(name, property);
			
	return this;
}
framePrototype.get = function(name, property) {
	if(!this.properties[name])
		return;
	
	return this.properties[name][property];
}
//setProperty, setProperties
//setTransform, setTransforms
//setFilter, setFilters
Frame.addPropertyFunction = function(name, names) {
	var setProperty = camelize("set " + name);
	var getProperty = camelize("get " + name);
	var setProperties = camelize("set " + names);
	var removeProperty = camelize("remove " + name);
	
	/**
* get property in frame
* @method Scene.Frame#getProperty
     * @param {String} property
     * @return {String|Number|Object} propertyValue.
     * @example
frame1.getProperty("opacity")
     */
	/**
* get transform property in frame
* @method Scene.Frame#getTransform
     * @param {String} property
     * @return {String|Number|Object} propertyValue.
     * @example
frame1.getTrasnform("rotate")
     */
	/**
* get filter property in frame
* @method Scene.Frame#getFilter
     * @param {String} property
     * @return {String|Number|Object} propertyValue.     
     * @example
frame1.getFilter("brightness")
     */
	framePrototype[getProperty] = function(property) {
		return this.get(name, property);
	};
	/**
* set property in frame
* @method Scene.Frame#setProperty
     * @param {String} property
     * @param {String|Number|Object} value
     * @return {this} a Instance.
     * @example
frame1.setProperty("opacity", 0.5)
     */
	/**
* set transform in frame
* @method Scene.Frame#setTransform
     * @param {String} property
     * @param {String|Number|Object} value
     * @return {this} a Instance.
     * @example
frame1.setTrasnform(rotate", "10deg")
     */
	/**
* set filter in frame
* @method Scene.Frame#setFilter
     * @param {String} property
     * @param {String|Number|Object} value
     * @return {this} a Instance.
     * @example
frame1.setFilter("brightness", "50%")
     */
	framePrototype[setProperty] = function(property, value) {
		this.set(name, property, value);
		return this;
	};
	
	/**
* set properties in frame
* @method Scene.Frame#setProperties
     * @param {Object} values
     * @return {this} a Instance.
     * @example
frame1.setProperties({opacity:0.5, background:"#f55"});
     */
	/**
* set transforms in frame
* @method Scene.Frame#setTransforms
     * @param {Object} values
     * @return {this} a Instance.
     * @example
frame1.setTrasnforms({rotate:"10deg", scale:"1,5"});
     */
	/**
* set filters in frame
* @method Scene.Frame#setFilters
     * @param {Object} values
     * @return {this} a Instance.
     * @example
frame1.setFilter({"brightness": "50%", grayscale:"30%"});
     */
	framePrototype[setProperties] = function(properties) {
		this.sets(name, properties);
		return this;
	}
	framePrototype[removeProperty] = addFunction(framePrototype.removeProperty, function(property) {
		this.remove(name, property);
			
		return this;
	});

}



	/**
* Make a copy of frame.
* @method Scene.Frame#copy
     * @return {Frame} a copy of frame.
     * @example
var frame2 = frame1.copy()
     */
framePrototype.copy = function() {
	var frame = new Frame(this.sceneItem, this.time);
	frame.merge(this);
	
	return frame;
}

	/**
	* Merge with other frame.
	* @method Scene.Frame#merge
    * @param {Frame} frame to merge.
    * @return {this} a Instance.
    * @example
frame1.merge(frame2);
     */
framePrototype.merge = function(frame) {
	
	var _frame = this;
	var _roles = Scene._roles, length = _roles.length;
	var properties, capital;
	for(var i = 0; i < length; ++i) {
		properties = frame.properties[_roles[i]["name"]];
		_frame.sets(_roles[i]["name"], properties);
	}
	
	return this;
}


