Scene.addRole("property", "properties");
Scene.addRole("transform", "transforms");
Scene.addRole("filter", "filters");

scenePrototype._addElement = function(elements) {
	var length = elements.length, i;

	var arr = [];
	for( i = 0; i < length; ++i) {
		arr[i] = this.addElement(elements[i]);
	}
	return arr;
}
scenePrototype.addElement = function(id, element) {
	var length = arguments.length;
	if(length === 0) {
		return;
	} else if(length === 1) {
		element = id;
		id = "";
		
		var type = typeof element;
		
		if(type === "undefined") {
			var item = new SceneItem();
			return this.addItem(id, item);
		}
		else if(type === "string") {
			return this._addElement(document.querySelectorAll(element));
		}
		else if(element instanceof Array || element instanceof NodeList) {
			return this._addElement(element);
		}
	}
	
	_id = element.getAttribute(ATTR_ITEM_ID);
	if(!_id) {
		id = id ? id : "item" + parseInt(Math.random() * 10000);
		element.setAttribute(ATTR_ITEM_ID, id);
	}
	else if(!id)
		id = _id;
	var item = new SceneItem(element);

	return this.addItem(id, item);
}

defineGetterSetter(sceneItemPrototype, "selector");

var _synchronize = sceneItemPrototype.synchronize;
sceneItemPrototype.synchronize = (function(_synchronize) {
	return function(time) {
	var frame = _synchronize.call(this, time);
	
	

	if(!frame)
		return false;


		
		
	var cssText = frame.getCSSText();

	
		
	if(!this.element)
		return false;

	this.element.style.cssText = cssText;
	
	return true;
};})(_synchronize);

/*export CSS STYLE*/
scenePrototype.setFrameToCSSRule = function() {
	var sceneItems = this.sceneItems;
	var sceneItem;
	css = "";
	for(var id in sceneItems) {
		sceneItem = sceneItems[id];
		css += sceneItem.setFrameToCSSRule();
	}

	
	
	
	return css;
}
sceneItemPrototype.setFrameToCSSRule = function(finishTime) {
	if(!this.getSelector())
		return "";
		
	var selectors = this.getSelector().split(","), length = selectors.length;
	var finishTime = finishTime || this.getFinishTime();
	var css = "";

	for(var i = 0; i < length; ++i) {
		css += selectors[i] +"{animation-name:scenejs_animation_" + this.id+ ";";
		css+= "animation-duration:" + finishTime + "s;";
		css +="}";
	}
	
	
	var keyframeCss = "@keyframes scenejs_animation_" + this.id +"{";
	var times = this.times, time;
	legnth = times.length;
	var percentage;
	for(var i = 0; i < legnth; ++i) {
		time = times[i];
		percentage = (time / finishTime * 100) + "% "; 
		keyframeCss += percentage + "{" + this.getFrame(time).getCSSText() + "}\n";
	}
	keyframeCss += "}\n";
	css+= keyframeCss;
	
	return css;
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
			if(typeof value === "undefined")
				continue;
			cssTransform += transformName + "(" + value + ")";
			cssTransform += " ";
		} catch(e) {}
	}
	if(cssTransform)
		cssObject["transform"] = cssTransform;
	/*filter css*/
	for(var filterName in filters) {
		value = filters[filterName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			if(typeof value === "undefined")
				continue;
			cssFilter += filterName + "(" + value + ")";
			cssFilter += " ";
		} catch(e){}
	}
	if(cssFilter)
		cssObject["filter"] = cssFilter;
	/*property css*/
	for(var propertyName in properties) {
		value = properties[propertyName];
		try {
			if(value instanceof Object)
				value = value.toValue();
			if(typeof value === "undefined")
				continue;
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
framePrototype.getCSSText = function(prefix) {
	var cssObject = this.getCSSObject();
	var cssText = "", value, property;
	if(cssObject.transform)
		convertCrossBrowserCSSObject(cssObject, "transform");
	if(cssObject.filter)
		convertCrossBrowserCSSObject(cssObject, "filter");
	
	for(property in cssObject) {
		cssText += property + ":" + cssObject[property] +";";
	}

	return cssText;
}
