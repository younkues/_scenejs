Scene.js
============
Scene.js is an Javascript Aniamtion Library

<br>

<img src="model/model.png">

## Component
* **Scene** : @@@
* **SceneItem** : @@@
* **Frame** : @@@
* **TimingFunction** : @@@
* **Util** : @@@
* **PropertyObject** : @@@
* **Curve** : @@@


## Support Browser
**Default**

|Internet Explorer|Chrome|FireFox|Safari|Opera|
|---|---|---|---|---|
|9+|Latest|Latest|Latest|Latest|
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


## Usage

```HTML
<script src="scene.all.js"></script>


or

<script src="Util.js"></script>
<script src="Scene.js"></script>
<script src="SceneItem.js"></script>
<script src="Frame.js"></script>
<script src="Curve.js"></script>
<script src="TimingFunction.js"></script>
<script src="PropertyFunction.js"></script>
<script src="PropertyObject.js"></script>


```
 
## Example

```javascript
var element = document.querySelect(".sample")
var scene = new Scene();
var sceneItem = scene.addElement(element); // add Item

sceneItem.setProperty(time, property, value);
// width margin padding height ....


sceneItem.setTransform(time, name, value);
//translate, scale, rotate, skew ....

sceneItem.setFilter(time, name, value);
//blur, brightness, contrast, drop-shadow, grayscale, hue-rotate, invert, opacity, saturate, sepia

scene.play();
        
```
