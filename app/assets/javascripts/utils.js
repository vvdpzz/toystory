var serdes = serdes || {
	makeStaticUrl: function(filename) {
		var sep = '';
		if (filename.charAt(0) != '/') {
			sep = '/';
		}
		var cmd = '/version/' + /*VER_ID +*/ sep + filename;
		return 'http://' + /*VER_DOMAIN +*/ cmd;
	}
}

var stringutil = {
	cut: function(text, maxLength) {
		if (text.length < maxLength)
			return text;
		else
			return text.slice(0, maxLength - 3) + '...';
	}
}

var timeAgo = timeAgo || {
	timeUnit: [[86400, 'day'], [3600, 'hour'], [60, 'minute']],
	fromSecsToStr : function(secs){
		secs = parseInt(secs);
		for (var i = 0; i < 3; i++){
			remainder = parseInt(secs/this.timeUnit[i][0]);
			secs = secs - remainder*this.timeUnit[i][0];
			if (remainder > 1){
				return remainder + ' ' + this.timeUnit[i][1] + 's ago';
			} else if (remainder == 1){
				return remainder + ' ' + this.timeUnit[i][1] + ' ago';
			}
		}
		if (secs > 1 ) {
			return secs + ' seconds ago';
		} else {
			return secs + ' second ago'; 
		}
	},
	fromSecsToStruct : function(secs){
		for (var i = 0; i < 3; i++){
			remainder = parseInt(secs/this.timeUnit[i][0]);
			secs = secs - remainder*this.timeUnit[i][0];
			if (remainder >= 1)
				return [remainder, this.timeUnit[i][1]];
		}
		return [secs, 'second'];
	}
}

var Clock = function(time) {
	this.time = time || new Date();
};

Clock.prototype = {
	_formatNumberLen: function(i, len) {
		var i = '' + i;
		len = len | 2;
		while (i.length < len) {
			i = '0' + i;
		}
		return i;
	},
	getSecStr: function() {
		return this._formatNumberLen(this.time.getSeconds());
	},
	getMinStr: function() {
		return this._formatNumberLen(this.time.getMinutes());
	},
	getHourStr: function() {
		var hour = this.time.getHours();
		return this._formatNumberLen(hour > 11 ? hour - 12 : hour);
	},
	getNoonStr: function() {
		return this.time.getHours() > 11 ? 'PM' : 'AM';
	},
	twelveFormat: function() {
		return this.getHourStr() + ':' + this.getMinStr() + ':' + this.getSecStr() + ' ' + this.getNoonStr();
	}
};

var htmlEscape = function(txt) {
	return txt.replace(/&/g,'&amp;').                                         
		replace(/>/g,'&gt;').                                           
		replace(/</g,'&lt;').                                           
		replace(/"/g,'&quot;')              
}

var smartUnescape = function(html) {
       var htmlNode = document.createElement('div');
       htmlNode.innerHTML = html;
       if (htmlNode.innerText) {
               return htmlNode.innerText; // IE
       }
       return htmlNode.textContent; // FF
}

var parseOptions = function(options, defaultOptions) {
	return $.extend({}, defaultOptions, options);
}

//prototype change
String.prototype.replaceAll = function(str1, str2){
	return this.split(str1).join(str2)
}
