(function() {
var _defaultProperties = Frame._defaultProperties = {
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
	
Scene.addRole("property", "properties");
Scene.addRole("transform", "transforms");
Scene.addRole("filter", "filters");
defineGetterSetter(sceneItemPrototype, "selector");
defineGetterSetter(sceneItemPrototype, "element");



/**
     * set selector to connect sceneItem and Element
     * @method Scene#setSelector
     * @param {Object|String} selectors selectors key=selector, value = itemName.
     * @param {String} [itemName] sceneItem name to connect.
     * @return {Scene} a Instance.
     * @example
scene.setSelector({
	"#id .class" : "item1",
	".class2" : "item2"
});

scene.setSelector(".class3", "item3");
     */
scenePrototype.setSelector = function(selectors, itemName) {
	var item;
	if(typeof selectors === "string") {
		item = this.getItem(itemName);
		if(!item)
			return this;
			
		item.setSelector(selectors);
		return this;
	}
	
	for(selector in selectors) {
		itemName = selectors[selector];
		item = this.getItem(itemName);
		if(!item)
			continue;
			
		item.setSelector(selector);
	}
	return this;
}

/**
     * set selector to connect sceneItem and Element
     * @method Scene.SceneItem#setSelector
     * @param {String} selector
     * @return {SceneItem} a Instance.
     * @example
sceneItem.setSelector("#id .class");
     */
sceneItemPrototype.setSelector = function(selector) {
	this.selector = selector;
	
	this.element = document.querySelectorAll(selector);
	
	return this;
}
function animateFunction(time, frame) {
	var cssText = frame.getCSSText();
	var element = this.element;
	if(!element)
		return;
	
	if(element instanceof NodeList) {
		var length = element.length;
		
		for(var i = 0; i < length; ++i) {
			element[i].style.cssText = cssText;
		}
		
		return;
	}
	element.style.cssText = cssText;
}

scenePrototype._addElement = function(elements) {
	var length = elements.length, i;

	var arr = [];
	for( i = 0; i < length; ++i) {
		arr[i] = this.addElement(elements[i]);
	}
	return arr;
}

/**
     * add Element and connect sceneItem and element.
     * @method Scene#addElement
     * @param {String|NodeList} id
     * @param {Element|NodeList} element
     * @return {SceneItem} new SceneItem.
     * @example
scene1.addElement("#id .class");
scene1.addElement(document.querySelectorAll(".item1"));


scene1.addElement("item1", document.querySelector(".item1"));
scene1.addElement("item2", document.querySelectorAll(".item2"));
     */
scenePrototype.addElement = function(id, element) {
	var length = arguments.length;
	if(length === 0) {
		return;
	} else if(length === 1) {
		element = id;
		id = "";
		
		var type = typeof element;
		
		if(!element) {
			return;
		} else if(type === "string") {
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


sceneItemPrototype.init = function() {
	if(this.element) {
		this.element.setAttribute("role", "item");
		this.addStyleToFrame(Scene.DEFAULT_FRAME_TIME);
	}
	this.on("animate", animateFunction);

}



/**
     * save current style of the element in the frame at that time.
     * @method Scene#addCSSToFrame
     * @param {Number} time set frame in time.
     * @param {String} property get element's property.
     * @return {SceneItem} a Instance.
     * @example
sceneItem.addCSSToFrame(0, "background-color");
// set 0s Frame Property element's background-color 
     */
sceneItemPrototype.addCSSToFrame = function(time, property) {
	var element = this.element;
	if(element instanceof NodeList)
		element = element[0];
		
	if(!element)
		return this;
		
		
		
	var css = element.style[property];
	if(typeof css === "undefined" || css === "")
		css = getComputedStyle(element)[property];
	
	
	var frame = this.newFrame(time);
	var value = {};

	value[property] = css;
	

	frame.load(value);
	
	return this;
}
sceneItemPrototype.addStyleToFrame = function(time) {
	var element = this.element;
	
	if(element instanceof NodeList)
		element = element[0];
		
	if(!element)
		return this;

	var cssText = element.style.cssText;
	var a1 = cssText.split(";");
	var l = a1.length;
	var a2;
	var cssObject = {}, value;
	for(var i =0; i < l; ++i) {
		a2 = a1[i].split(":");
		if(a2.length <= 1)
			continue;
			
		value = a2[1].trim();
		cssObject[a2[0].trim()] = value;
	}
	this.setProperties(time, cssObject);
	
	return this;
}

scenePrototype.playCSS = function play (){
	if(this.isStart)
		return this;
		
	this.startTime = this.prevTime = Date.now();
	this.nowTime = this.spendTime = 0;
	
	this.setPlayCount(0);

	this.isStart = true;
	this.isFinish = false;
	this.isPause = false;	

	var sceneItems = this.sceneItems;
	var item;
	var selector;
	var elements, i, length;
	
	for(var id in sceneItems) {
		item = sceneItems[id];
		selector = item.getSelector();
		elements = document.querySelectorAll(selector);
		length = elements.length;
		for(i = 0; i < length; ++i) {
			elements[i].className += " startAnimation";
		}
	}
	return this;	
}
scenePrototype.stopCSS = function stop() {
	console.log("STOP");
	this.isStart = false;
	this.isFinish = true;
	this.isPause = false;
	
	var sceneItems = this.sceneItems;
	var item;
	var selector;
	var elements, i, length;
	for(var id in sceneItems) {
		item = sceneItems[id];
		selector = item.getSelector();
		elements = document.querySelectorAll(selector);
		length = elements.length;
		for(i = 0; i < length; ++i) {
			elements[i].className = replaceAll(elements[i].className , "startAnimation" ,"");
		}
	}
	
	return this;
}


/*export CSS STYLE*/
scenePrototype.exportCSS = function() {
	var sceneItems = this.sceneItems;
	var sceneItem;
	var finishTime = this.getFinishTime();
	css = "";
	for(var id in sceneItems) {
		sceneItem = sceneItems[id];
		css += sceneItem.exportCSSRule(this, finishTime);
	}
	
	var style = "<style>" + css +"</style>";
	document.head.insertAdjacentHTML("afterbegin", style);
	return this;
}
var CSS_ANIMATION_RULE = "";
var CSS_ANIMATION_START_RULE = "{selector}.startAnimation{{prefix}animation: scenejs_animation_{id} {time}s {type};{prefix}animation-fill-mode: {fillMode};{prefix}animation-iteration-count:{count};}";

sceneItemPrototype.exportCSSRule = function(scene, finishTime) {
	if(!this.getSelector())
		return "";
		
	var selectors = this.getSelector().split(","), length = selectors.length;
	finishTime = finishTime || this.getFinishTime();
	var css = "";

//**임시
	var id = this.selector.match(/[0-9a-zA-Z]+/g).join("") + this.id;
	var _CSS_ANIMATION_START_RULE = replaceAll(CSS_ANIMATION_START_RULE, "{prefix}", "");
	 _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{time}", finishTime);
	 _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{type}", "linear");
	  _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{id}", id);
	  _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{count}", scene.iterationCount || 1);
	  _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{fillMode}", scene.fillMode);
	for(var i = 0; i < length; ++i) {
		css += replaceAll(_CSS_ANIMATION_START_RULE, "{selector}", selectors[i]);
	}
	
	
	var keyframeCss = "@keyframes scenejs_animation_" + id +"{";
	var times = this.times, time;
	legnth = times.length;
	var percentage;
	for(var i = 0; i < legnth; ++i) {
		time = times[i];
		percentage = (time / finishTime * 100) + "% "; 
		keyframeCss += percentage + "{" + this.getNowFrame(time).getCSSText() + "}\n";
	}
	keyframeCss += "}\n";
	css+= keyframeCss;
	
	return css;
}



/**
     * get CSSObject
     * @method Scene.Frame#getCSSObject
     * @return {object} CSSObject
     * @example
sceneItem.getFrame(0.5).getCSSObject()
//ex => {"background" :"#fff", transform: "scale(1) rotate(30deg)"}
     */
framePrototype.getCSSObject = function() {
	var transforms = this.properties["transform"], filters = this.properties["filter"], properties = this.properties["property"];
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



/**
     * get cssText // convert CSSObject to cssText 
     * @method Scene.Frame#getCSSText
     * @return {String} cssText
     * @example
sceneItem.getFrame(0.5).getCSSText()
//ex => "background:#fff; transform:scale(1) rotate(30deg);"
*/
framePrototype.getCSSText = function() {
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

})();