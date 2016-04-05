Scene.js
============
Scene.js is an Javascript Aniamtion Library

<br>

<img src="demo/img/sweetsearchscreen.png" width="250">



## Demo

http://daybrush.com/Scene.js/sample/circleburst.html



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

## Support Browser
** Default **
* Most Browser(Only IE 9+)
** Transform **
 * IE 9+(Transform 3D 10+, Filter Not Supported)
 * Chrome 4+ (Transform 3D 12+, Filter 18+)
 * Safari 3.2+ (Transform 3D 4+, Filter 6+)
 * Firefox 3.5+ (Transform 3D 10+, Filter 35+)
 * Opera 10.5+ (Transform 3D 15+, Filter 15+)
** Transform 3D **
 * IE 10+
 * Chrome 12+
 * Safari 4+
 * Firefox 10+
 * Opera 15+
** Filter **
 * IE Not Supported
 * Chrome 18+
 * Safari 6+
 * Firefox 35+
 * Opera 15+
 
 
## Usage

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



## Support

Arguments of registerUserMethod function used above are all callback functions.

```javascript
        'FN_AFTER_INSERT_AUTO_WORD'    : fnInsertAutoCompleteWordAjax,
        'FN_AFTER_SELECT_AUTO_WORD'    : fnSelectAutoCompleteWord,
```

#### 1.FN_AFTER_INSERT_AUTO_WORD ####
This callback function will be executed after Ajax response.
<img src="demo/img/sweetsearch_reference_desc_001.jpg" width="530">

**[Example]**
```javascript
	var fnInsertAutoCompleteWordAjax = function(sQuery, aResultData) {
        var result  = "";
        var sHTML   = "";
        var sTemplate = "<li><span>[%sKeyword%]</span></li>";

        sData.items[0].forEach( function(v) {
            result = sTemplate.replace(/\[%sKeyword%\]/, v[0]);       
            sHTML += result;
        });
    }
```

You can use two argument as below.

**[Arguments]**

* sQuery(String) 	: search word.
* aResultData(String) : Ajax(JSONP) response data.

<br>
**[Return]**

* no return value

<br>

#### 2.FN_AFTER_SELECT_AUTO_WORD
This callback function will be executed after selecting auto-complete word list.
<img src="demo/img/sweetsearch_reference_desc_002.jpg" width="530">

After receiving Ajax response, you can implement codes as below.

(e.g. change stype of selected item and submit form to target URL)

**[Example]**
```javascript
	var fnSelectAutoCompleteWord = function(element) {
        element.className += "selectedLI";
        var sQuery = element.innerText;

        //send form.
        myformsubmit();

        return sQuery;
    }
```

**[Arguments]**

* element(HTMLElement) : element that fires an event.

<br>
**[Return]**

* sQuery(String) : selected item.(search query)

<br>

## Options 

**[sAutoCompleteURL]**

: AJAX URL.

**[AjaxRequestType]**

: 'ajax', 'jsonp', 'user'(you make an Ajax method yourself)


<br>
## Use Plugin

Plugin is a child component that parent Component use.
SweetSearch has two plugins.

* 'RecentWordPlugin'
* 'TTViewPlugin'


#### RecentWordPlugin

RecentWordPlugin can show word lists that user searched ago.
RecentWordPlugin uses Localstorage to save data.

You can add a plugin on Component as below:

```javascript

    oSS.onPlugins([
        { 
            'name'      : 'RecentWordPlugin',
            'option'    : {
                'maxList' : 7,
            },
            'userMethod' : {
                'FN_AFTER_INSERT_RECENT_WORD'  : fnInsertRecentSearchWord,
                'FN_AFTER_SELECT_RECENT_WORD'  : fnSelectRecentSearchWord
            }
        }
    ]);

```
<br>
Plugin can also have callback functions.

FN_AFTER_INSERT_RECENT_WORD is similar to [FN_AFTER_INSERT_AUTO_WORD](#1fn_after_insert_auto_word).
FN_AFTER_SELECT_RECENT_WORD is similar to [FN_AFTER_SELECT_AUTO_WORD](#2fn_after_select_auto_word).

<br>

#### TTViewPlugin

TTViewPlugin can show user defined message when response data is empty.

To show error message write as below:

You don't change CSS classnames.<br>(tt-wrap, tt-message, footer-button-wrap, close-layer)

```HTML
    <section class="tt-wrap" style="display:none;">
        <div class="tt-message">no result... ㅜ.ㅜ</div>
         <div class="footer-button-wrap">
            <button class="close-layer">close</button>
        </div>
    </section>
```

You can add TTViewPlugin on Component with RecentWordPlugin as below:

```javascript

    oSS.onPlugins([
        { 
            'name'      : 'RecentWordPlugin',
            'option'    : {
                'maxList' : 7,
            },
            'userMethod' : {
                'FN_AFTER_INSERT_RECENT_WORD'  : fnInsertRecentSearchWord,
                'FN_AFTER_SELECT_RECENT_WORD'  : fnSelectRecentSearchWord
            }
        },
        { 
            'name'      : 'TTViewPlugin',
            'option'    : {},
            'userMethod' : {}
        }
    ]);

```

## Other examples.

#### 1. How to use custom Ajax.
SweetSearch component support Ajax(JSONP) executing as default.
but, You can write your own Ajax function as follows:

```javascript
	var fnMyAjax = function(sQuery, fnCallback) {
        let method = "get";
        let url = "jsonMock/javascript.json?q="+sQuery;
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);

        xhr.addEventListener("load", function() {
          if (xhr.status === 200) {
            var sResult = JSON.parse(xhr.responseText);
            //You must call the callback function(fnCallback) after receiving data.
            if(fnCallback && typeof fnCallback === 'function') fnCallback.call(this,sResult);
          }
        }.bind(this));
        xhr.send();
    }

	var elTarget = document.querySelector(".search-form");
	var htOption = {'AjaxRequestType' : 'user'};

    var oSS = new SweetSearch(elTarget, htOption);
    oSS.registerUserMethod({
        'FN_AFTER_INSERT_AUTO_WORD'    : fnInsertAutoCompleteWordAjax,
        'FN_AFTER_SELECT_AUTO_WORD'    : fnSelectAutoCompleteWord,
        'FN_RUN_AJAX_EXECUTE'          : fnMyAjax
    });
```
