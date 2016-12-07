var _color = Scene.Color = {
	models : ["rgb", "rgba", "hsl", "hsla"],
	nameToRGB : function(name){
		var rgb = this.rgbCodes[name];
		if(!rgb)
			rgb = this.rgbCodes["black"];
			
		var arr = rgb.split(",");
		
		for(var i = 0; i < 3; ++i)
			arr[i] = parseInt(arr[i]);
			
		return arr;
		
	},
	hexToRGB : function(h) {
		h = this.cutHex(h);
		var r = parseInt(h.substring(0,2), 16);
		var g = parseInt(h.substring(2,4), 16);
		var b = parseInt(h.substring(4,6), 16);
		var a = parseInt(h.substring(6,8), 16) / 255;
		if(isNaN(a))
			a = 1;
			
		return [r, g, b, a];
	},
	cutHex: function(h) {
		return (h.charAt(0)==="#") ? h.substring(1,9):h;
	},
	hex4to6: function(h) {
		var r = h.charAt(1);
		var g = h.charAt(2);
		var b = h.charAt(3);
		var arr = [r, r, g, g, b, b];
		
		return arr.join("");
	},
	/*
		reference to http://www.rapidtables.com/convert/color/rgb-to-hsl.htm
	*/
	rgbToHSL : function(rgb) {
		var r = rgb[0] / 255, g = rgb[1] / 255, b= rgb[2] / 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;
	    var d = max - min;	
	    if(d === 0){
	        h = s = 0; // achromatic
	    }else{

	        s = d / (1- Math.abs(2 * l - 1));
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	    }

	    var result = [h * 60, s, l];
	    if(rgb.length > 3)
	    	result[3] = rgb[3];
	    	
	    return result;
	},
	hslToRGB : function(hsl) {
		var h = hsl[0], s = hsl[1], l = hsl[2];
		if( h < 0)
			h = h + parseInt((Math.abs(h) + 360) / 360) * 360;
			
		h = h % 360;
		var c = (1- Math.abs(2 * l - 1)) * s;
		var x = c * (1 - Math.abs((h/60) % 2 - 1));
		var m = l - c / 2;
		var rgb;
		if(h < 60)
			rgb = [c, x, 0];
		else if (h < 120)
			rgb = [x, c, 0];
		else if(h < 180)
			rgb = [0, c, x];
		else if(h < 240)
			rgb = [0, x, c];
		else if(h < 300)
			rgb = [x, 0, c];
		else if(h < 360)
			rgb = [c, 0, x];
		
		var result = [Math.round((rgb[0] + m) * 255), Math.round((rgb[1] + m) * 255), Math.round((rgb[2] + m) * 255)];
	    if(hsl.length > 3)
	    	result[3] = hsl[3];
	    
	    return result;
	}
};