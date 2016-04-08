var Color = Scene.Color = {
	hexToRGB : function(h) {
		h = this.cutHex(h);
		var r = parseInt(h.substring(0,2), 16);
		var g = parseInt(h.substring(2,4), 16);
		var b = parseInt(h.substring(4,6), 16);
		return [r, g, b];
	},
	cutHex: function(h) {
		return (h.charAt(0)==="#") ? h.substring(1,7):h;
	},
	hex4to6: function(h) {
		var r = h.charAt(1);
		var g = h.charAt(2);
		var b = h.charAt(3);
		var arr = [r, r, g, g, b, b];
		
		return arr.join("");
	},
	rgbToHSV : function(rgb) {
		
	},
	hsvToRGB : function(hex) {
		
	},
	change: {
		rgb : {},
		hex : {},
		hsv : {}
	}
};
Color["rgb"]["hsv"] = function(rgb) { return Color.rgbToHSV(rgb);}
Color["hsv"]["rgb"] = function(hsv) { return Color.hsvToRGB(hsv);}
Color["hex"]["rgb"] = function(hex) { return Color.hexToRGB(hex);}