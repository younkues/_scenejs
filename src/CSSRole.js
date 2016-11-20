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

scenePrototype.setSelector = function(selectors) {
	var itemName, item;
	for(var selector in selectors) {
		itemName = selectors[selector];
		item = this.getItem(itemName);
		if(!item)
			continue;
			
		item.setSelector(selector);
	}
}
sceneItemPrototype.setSelector = function(selector) {
	this.selector = selector;
	
	this.element = document.querySelectorAll(selector);
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


sceneItemPrototype.init = function() {
	if(this.element) {
		this.element.setAttribute("role", "item");
		this.addStyleToFrame(Scene.DEFAULT_FRAME_TIME);
	}
	this.on("animate", animateFunction);

}

/*
	Element의 현재 Style을 해당 time의 Frame에 저장한다.
*/
sceneItemPrototype.addCSSToFrame = function(time, property) {
	if(!this.element)
		return this;
	var css = this.element.style[property];
	if(typeof css === "undefined")
		css = getComputedStyle(this.element)[property];
	
	
	var frame = this.newFrame(time);
	var value = {};
	value[property] = css;
	console.log(value);
	frame.load(value);	
	
	return this;
}
sceneItemPrototype.addStyleToFrame = function(time) {
	if(!this.element)
		return this;
	var cssText = this.element.style.cssText;
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
}


/*export CSS STYLE*/
scenePrototype.setFrameToCSSRule = function() {
	var sceneItems = this.sceneItems;
	var sceneItem;
	var finishTime = this.getFinishTime();
	var count = this.getIterationCount();
	css = "";
	for(var id in sceneItems) {
		sceneItem = sceneItems[id];
		css += sceneItem.setFrameToCSSRule(finishTime, count);
	}
	
	var style = "<style>" + css +"</style>";
	document.head.insertAdjacentHTML("afterbegin", style);
	return this;
}
var CSS_ANIMATION_RULE = "";
var CSS_ANIMATION_START_RULE = "{selector}.startAnimation{{prefix}animation: scenejs_animation_{id} {time}s {type};{prefix}animation-fill-mode: forwards;{prefix}animation-iteration-count:{count};}"
sceneItemPrototype.setFrameToCSSRule = function(finishTime, count) {
	if(!this.getSelector())
		return "";
		
	var selectors = this.getSelector().split(","), length = selectors.length;
	finishTime = finishTime || this.getFinishTime();
	count = count || 1;
	var css = "";

//**임시
	var id = this.selector.match(/[0-9a-zA-Z]+/g).join("") + this.id;
	var _CSS_ANIMATION_START_RULE = replaceAll(CSS_ANIMATION_START_RULE, "{prefix}", "");
	 _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{time}", finishTime);
	 _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{type}", "linear");
	  _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{count}", count);
	  _CSS_ANIMATION_START_RULE = replaceAll(_CSS_ANIMATION_START_RULE, "{id}", id);
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

})();