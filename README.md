Scene.js
============
Scene.js is an Javascript Aniamtion Library. Make Your Homepage Dynamic.
<br>

<img src="model/model.png">

## Component
* **Scene** : Control SceneItem, Speed & Count, Play & Stop
* **Scene.SceneItem** : Add & Manage Frame
* **Scene.Frame** : Set Property & get CSSText
* **Scene.TimingFunction** : Set Transition Timing Function in Scene time zone.
	+ ex) sceneItem.addTimingFunction(startTime, endTime, ease);
* **Scene.Util** : dot product with array, object, number, color, PropertyObject
* **Scene.PropertyObject** : Make String to Property Object for the dot product
	+ ex) Util.stringToObject("rgba(200, 100, 20, 10)") to {prefix: "rgba(", suffix: ")", arr: [200,100, 20,10], separator: ","}
	+ ex) Util.stringToObject("a b c d") to {prefix: "", suffix: "", arr: ["a","b", "c", "d"], separator: " "}

* **Scene.Curve** : Make Transition Function with Bezier Curve.
* **Scene.Color** : Convert RGB, HSL HEX4, HEX6 to RGBA Model.
	+ ex) Color.hexToRGB("#123456") to [18, 52, 86]
	+ ex) Color.hslToRGB([240, 0.5, 0.5]) to [63, 63, 191]

## Support Browser
**Default**

|Internet Explorer|Chrome|FireFox|Safari|Opera|
|---|---|---|---|---|
|9+|(yes)|(yes)|(yes)|(yes)|
**Transform**

|Internet Explorer|Chrome|FireFox|Safari|Opera|
|---|---|---|---|---|
|9+|4+|3.5+|3.2+|10.5+|
**Transform 3D**

|Internet Explorer|Chrome|FireFox|Safari|Opera|
|---|---|---|---|---|
|10+|12+|10+|4+|15+|
**Filter**

|Internet Explorer|Chrome|FireFox|Safari|Opera|
|---|---|---|---|---|
|X|18+|35+|6+|15+|


## Demo
http://daybrush.com/Scene.js/sample/circleburst.html


## How to use?

Only load Scene,js

```HTML
<script src="Scene.js"></script>

```
 
Ready to start using Scene.js! Scene.js has Scene namespace and can be used as below example.

```javascript
var element = document.querySelector(".sample")
var scene = new Scene();
var sceneItem = scene.addElement(element); // add Item

sceneItem.setProperty(time, property, value);
// width margin padding height ....


sceneItem.setTransform(time, name, value);
//translate, scale, rotate, skew ....

sceneItem.setFilter(time, name, value);
//blur, brightness, contrast, drop-shadow, grayscale, hue-rotate, invert, opacity, saturate, sepia

var ease= [.42,0,.58,1];
sceneItem.addTimingFunction(startTime, endTime, ease);

scene.play();
        
```

or

```javascript
var scene = new Scene({
	"item1" : {
		0 : {width: "30px", height: "20px", property:value},
		2 : {width: "50px", property:value},
		6.5:{height: "200px", property:value},
	},
	"item2" : {
		0 : {transform:{scale:0.5}, property:value},
		2 : {transform:{scale:1.5, rotate:"0deg"}, width: "50px", property:value},
		6.5: {transform:{scale:1, rotate:"50deg"}, width: "10px", property:value},
	},
});

scene.setSelector({
	"item1" : ".item1",
	"item2" : ".item2",
});

//scene.playCSS(); set CSS Rule to Play
//scene.stopCSS();


scene.play();

```


