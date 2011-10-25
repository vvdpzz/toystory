/* 
 * document ready logics
 */
$(function() {
	//setup tooltips
	setToolTip('[tip-text]', {
		containerStyleClass: 'slide-tooltip',
		bgStyleClass: 'slide-tooltip-bg',
		arrowStyleClass: 'pointy-tip'
	});

	//setup placeholder
	$('[placeholder]').placeholder();

	//setup placeholder
	$('.unselectable').unselectable();

	setToolTip('.feed-blind-badge, .blind-badge', {
		text: 'Blind contest is a contest where only the contest creator can see all entries. Individual participants can only see their own entries. All entries will be public when the contest ends.', 
		position: 'bottom', 
		containerStyle: {width: '300px'}
	});

	setToolTip('.feed-verified-only-badge, .verified-only-badge', {
		text: 'This contest is for verified users only. You can get verified from your profile page.', 
		position: 'bottom', 
		containerStyle: {width: '300px'}
	});
});
/*
 * CE6 javascript lib
 */

var ce6 = ce6 || {};

ce6.openVerifyDlg = function() {
	if (surface != 'user.profile') {
		var params = {
			autoOpen: false,
			modal: true,
			title: 'Verify your account',
			dialogClass: 'dialog-with-cross',
			width: 400
		};
		$('#verify-box').dialog(params);
		ce6.userPhoto.init();
		ce6.verifier.init();
		$('#verify-box').dialog('open');
	}
};

ce6.ajaxLink = (function(){
var self = {
	basePath : null,
	startUrlModified: false,
	prevUrl : null,
	click : function() {
		var url = $(this).attr('href');
		History.pushState({}, '', decodeURIComponent(url));
		return false;
	},
	onStateChange : function() {
		var state = History.getState();
		if (state.url == self.prevUrl) return;
		state.data = self.getStateData(state.url);
		//console.log('state', state);
		$(document).trigger('ajaxUrlChange', state);
		self.prevUrl = state.url;
	},
	start : function(urlChangeCallback, stateDataMap) {
		History.init();
		self.stateDataMap = stateDataMap || {};
		$('a[ajax]').live('click', self.click);
		$(document).bind('ajaxUrlChange', function(e, state) {
			urlChangeCallback(state);
		});
		History.Adapter.bind(window,'statechange', self.onStateChange);
		var cleanUrl = self.getCleanUrl();
		if (window.location.href != cleanUrl) 
			self.startUrlModified = true;
		//console.log('cleanUrl', cleanUrl);
		History.replaceState({}, '', decodeURIComponent(cleanUrl));
		self.onStateChange();
	},
	getStateData: function(url) {
		return $.extend({}, self.stateDataMap[ce6.site.urlPath(url)] || {}, ce6.site.urlParams(url));
	},
	getCleanUrl : function() {
		var location = window.location;
		var url = location.href;
		hash = History.getHashByUrl(url);
		if (!hash) return url;
		var hashPath, hashParams = null;
		if (hash.indexOf('?') > -1) {
			hashPath = hash.slice(0, hash.indexOf('?'));
			hashParams = hash.slice(hash.indexOf('?'));
		} else {
			hashPath = hash;
		}
		var path = location.pathname;
		if (hashPath) {
			if (hashPath.match(/^\//)) {
				path = hashPath;
			} else if (hashPath.match(/^\.\//)) {
				path = path.replace(/\/[^\/]*$/, hashPath.replace(/^\.\//, ''));
			} else {
				path = path.replace(/\/?$/, '/' + hashPath);
			}
		}
		var params = hashParams || location.search;
		return History.getRootUrl().replace(/\/$/, '') + path + params.replace(/\??\&_suid.*/,'');
	}
}; return self;
})();

ce6.renderCustomizedStyle = function(){
	$('.notification-feed .notification-detail [user]').addClass('clickable-user');
	$('.notification-feed .notification-detail [contest]').addClass('clickable-contest');
}
ce6.showMessage = function(msg, title, callback) {
	var dlg = $('#dlg-message');
	if (dlg.length == 0) {
		dlg = $('<div>').attr('id', 'dlg-message');
	}
	dlg.empty().append('<p>' + msg + '</p>');
	dlg.dialog({
		modal: true,
		title: title || 'Information',
		buttons: {
			OK: function() {
				if (callback) {
					callback();
				}
				$(this).dialog('close');
			}
		}
	});
}

ce6.confirmDialog = function(msg, title, yesCallback, noCallback) {
	var dlg = $('#dlg-confirm');
	if (dlg.length == 0) {
		dlg = $('<div>').attr('id', 'dlg-confirm');
	}
	dlg.empty().append('<p>' + msg + '</p>');
	dlg.dialog({
		modal: true,
		title: title || 'Confirmation',
		buttons: {
			No: function() {
				if (noCallback) {
					noCallback();
				}
				$(this).dialog('close');
			},
			Yes: function() {
				if (yesCallback) {
					yesCallback();
				}
				$(this).dialog('close');
			}
		}
	}).restyleButtons();
}

/* 
 * injecting a tip bar on the header of the page
 * title - title text displayed at the left side
 * pageComponent - the selector indicates which component the header-tip would be injected to, mostly using $('#page-container')
 * useDefaultClose - whether using default button
 * htContent - inner html string of the header tip
 */
ce6.headerTip = function(title, pageComponent, useDefaultClose, htContent, closeCbName) {
	var htContent = htContent ? htContent : "";
	if (pageComponent == undefined || pageComponent.length == 0)
		return;
	var innerHtml = "<div class='bar-content'><div class='bar-title'>"+title+"</div>" +
			htContent +
			(useDefaultClose ? "<span class='close-btns-area'><a class='close-notify-bar' onclick='ce6.closeHeaderTip();" + closeCbName + "();" + " return false;' href='#'>&nbsp;</a></span>" : "") + 
			"</div>";
	if ($(".header-tip").length > 0){
		$(".header-tip").show().html(innerHtml);
	}
	else{
		$(pageComponent).prepend(
			"<div class='header-tip' id='detail-tutorial-ht'>"+
			innerHtml + 
			"</div>");
	}
}
ce6.closeHeaderTip = function() {
	$('.header-tip').hide();
}

/*
 * set the div component's opacity
 * thisDiv - the exact div highlighted
 * rootDiv - the ancestor div whose children component will be set opacity except for thisDiv
 * opacityValue - opacity value form 0 to 1 applied to divs
 * excludedDiv - some excepted div not set opacity
*/
ce6.setOpacityOutsideDiv = function(thisDiv, rootDiv, maskHeight, maskWidth, opacityValue) {
	opacityValue = opacityValue ? opacityValue : 0.35;
	var highlightRect = {
		l: thisDiv.offset().left,
		t: thisDiv.offset().top,
		r: thisDiv.last('div').offset().left + thisDiv.last('div').outerWidth(),
		b: thisDiv.last('div').offset().top + thisDiv.last('div').outerHeight()
	},
		maskRect = {
		l: rootDiv.offset().left,
		t: rootDiv.offset().top,
		r: rootDiv.offset().left + maskWidth,
		b: rootDiv.offset().top + maskHeight
	};
	var discreteMaskRects = [
			[maskRect.l, maskRect.t, maskRect.r-maskRect.l, highlightRect.t-maskRect.t],
			[maskRect.l, highlightRect.t, highlightRect.l-maskRect.l, maskRect.b-highlightRect.t],
			[highlightRect.l, highlightRect.b, maskRect.r-highlightRect.l, maskRect.b-highlightRect.b],
			[highlightRect.r, highlightRect.t, maskRect.r-highlightRect.r, highlightRect.b-highlightRect.t]
		];
	
	if ($('#highlight0').length == 0){
		$('body').append("<div id='mask0' class='mask-area'></div><div id='mask1' class='mask-area'></div><div id='mask2' class='mask-area'></div><div id='mask3' class='mask-area'></div><div id='highlight0' class='highlight-area'></div>");
	}
	for (var i = 0; i < 4; i++){
		$('#mask'+i).css({
				left:    discreteMaskRects[i][0],
				top:     discreteMaskRects[i][1],
				width:   discreteMaskRects[i][2],
				height:  discreteMaskRects[i][3],
				opacity: 1-opacityValue
			}).show();
	}
	$('#highlight0').css({
				left:   highlightRect.l,
				top:    highlightRect.t,
				width:  highlightRect.r - highlightRect.l,
				height: highlightRect.b - highlightRect.t
			}).show();
}
/*
 * reset all the opacity of div to 1
*/
ce6.resetOpacity = function() {
	$('#highlight0').hide();
	for (var i = 0; i < 4; i++){
		$('#mask'+i).hide();
	}
}

ce6.toSen = function(str) {
	if ('error' == str.toLowerCase())//handle special case that error cls is responding for Oops! wording
		str = '矮油~~';
	else if ('success' == str.toLowerCase())//handle special case that error cls is responding for Oops! wording
		str = 'Success!';
	len = str.length;
	return str.substring(0,1).toUpperCase() + str.substring(1,len).toLowerCase();
}

ce6.notifyBar = function(msgText, notifyType, delay, position) {
	/*
	 * notifyType valid value
	 *	null -- normal
	 *	error
	 *	success
	 *	custom -- any style you want
	 *	
	 *	position: 'above' or 'below' the navbar
	*/
	var msgHtml = '<div class="bar-content"><div class="bar-title">*notify_type*</div><div class="bar-divider"></div><div class="bar-message">*msg*</div></div>';
	msgHtml = msgHtml.replace('*msg*', msgText);

	var realDelay = delay || 10000;
	var showPos = position || 'overlay';
	var container;
	if (showPos == 'above') {
		container = '#top';
	} else if (showPos == 'below') {
		container = '#top_sub';
	} else {
		container = 'body';
	}
	if(notifyType){
		temp = ce6.toSen(notifyType);
		msgHtml = msgHtml.replace('*notify_type*', temp);
		$.notifyBar({
			close: true,
			cls: notifyType, 
			html: msgHtml, 
			delay:realDelay, 
			container:container
			/*
			onBarShown: function(){
					$('#page-layout').animate({'padding-top': '+=24'}, asTime);
				},
			onBarClose: function() {
					$('#page-layout').animate({'padding-top': '-=24'}, asTime);
				}
			*/
			});
	} else {
		$.notifyBar({close:true, html: msgHtml, delay:realDelay, container:container});
	}
}

ce6.showNotify = function(result){
	if (!result['rc']){
		if (!result['msg']) result['msg'] = 'Done';
		ce6.notifyBar(result['msg'], 'success');
	} else {
		if (!result['msg']) result['msg'] = 'Failure';
		ce6.notifyBar(result['msg'], 'error');
	}
}

/*
 * ajax call lib
 */

ce6.ajaxCall = function(url, data, callback, errorCallback, options) {
	data = data || {};
	options = options || {};
	var params = {
		url : url,
		dataType : options.dataType || 'json',
		data : data,
		type : options.type || 'POST',
		cache: false
	};

	if (callback)
		params.success = callback;
	if (errorCallback)
		params.error = errorCallback;	

	$.ajax(params);
}

ce6.ajaxJsonPost = function(url, data, callback, errorCallback) {
	// @data: string
	// ajax forms will pass in serialized params string as data,
	// so not accepting dict here for now
	// TODO: pass in json dict as data in all cases
  // var xsrfTokenParam = 'xsrfToken=' + xsrfToken.weak;
	data = data || '';
	if (typeof(data) != 'string') {
		data = $.param(data);
	} 
  // data = data ? (data + '&' + xsrfTokenParam) : xsrfTokenParam;
	errorCallback = errorCallback || ce6.jsonErrorCallback;
	ce6.ajaxCall(url, data, callback, errorCallback, {
		dataType: 'json',
		type: 'POST'
	});
}

ce6.ajaxJsonGet = function(url, data, callback, errorCallback) {
	errorCallback = errorCallback || ce6.jsonErrorCallback;
	ce6.ajaxCall(url, data, callback, errorCallback, {
		dataType: 'json',
		type: 'GET'
	});
}

// DEPRECATED Please use ajaxJsonPost or ajaxJsonGet
ce6.ajaxJson = ce6.ajaxJsonPost;

ce6.jsonErrorCallback = function(xhr) {
	if (xhr.status == 500) {
		ce6.notifyBar(ce6.constants.texts.errors.serverError, 'error');
	} else if (xhr.status == 403) {
		ce6.notifyBar(ce6.constants.texts.errors.xsrfError, 'error');
	}
}

ce6.ajaxHtml = function(url, data, callback, errorCallback) {
	ce6.ajaxCall(url, data, callback, errorCallback, {
		dataType: 'html',
		type: 'GET'
	});
}

ce6.jsonp = function(url, data, callback) {
	var params = $.param(data);
	if (params)
		url += '?' + params + '&callback=?';
	else
		url += '?callback=?';
	$.getJSON(url, callback);
}

ce6.xreq = function(url, data, callback) {
	var idSuffix = parseInt(Math.random() * 1000000).toString();
	var scriptName = 'xreqCallback' + idSuffix;
	var formId = 'xreq-form-' + idSuffix;
	var iframeId = 'xreq-iframe-' + idSuffix;

	// create callback script
	data['callback'] = scriptName;
	window[scriptName] = function(data) {
		callback(data);
		//delete window[scriptName];
		window[scriptName]=null;
		$('#' + formId).remove();
		$('#' + iframeId).remove();
	};

	// create a form to hold all data
	var form = $("<form method='POST'></form>")
		.attr('id', formId)
		.attr('action', url)
		.attr('target', iframeId);
	form.appendTo($('body'));
	for (var i in data) {
		$("<input type='hidden'></input>").attr('name', i).val(data[i]).appendTo(form);
	}

	// create an iframe for callback
	$("<iframe name='" + iframeId + "' style='display:none;'></iframe>").attr('id', iframeId).appendTo($('body'));	
	form.submit();
}

ce6.xproxyErrorCallback = function(error) {
	if (error.status == 500) {
		ce6.notifyBar(ce6.constants.texts.errors.serverError, 'error');
	} else if (error.status == 403) {
		ce6.notifyBar(ce6.constants.texts.errors.xsrfError, 'error');
	}
}

/*
 * ce6.secureCall is sending a request to prizes.org secure domain.
 * Although the request is sending via https, all data in the request would be encrypted.
 * The response usually comes from prizes.org domain via http. So callback javascript could 
 * operate on returned data.
 * If the returned data is coming from secure domain, the callback function will FAIL.
 */
ce6.secureCall = function(url, data, callback) {
	var secure_url = SECURE_URL_BASE + '/secure/' + url;
	data = data || {};
	data['xsrfToken'] = xsrfToken.weak;
	ce6.xreq(secure_url, data, callback);
}



ce6.switchDiv = function(showID, hideID) {
	$('#'+hideID).hide();
	$('#'+showID).show();
}

ce6.refreshCallouts = function(){
	//load callouts
	setTimeout( 
		function(){
			for (var i=0; i<callouts.length; i++){
				if (callouts[i] != 'homepage_jff_bg') { 
					ce6.callouts.displayCallout(callouts[i]);
				}
			}},
		1000);
}

/*
 * CE6 notification
 */
ce6.fillNotification = function(notif_items) {
	var notif_ul = $('#notification-items');
	for(var i in notif_items){
		var notif_li = $('<li>').attr('class', 'notification-item').text(notif_items[i].content);
		notif_ul.append(notif_li);
	}
}

/*
 * back to toop
 */

ce6.backToTop = {
	threshold: 1500,
	visible: false,
	enableScrollEvent: true,
	init: function() {
		var self = ce6.backToTop;
		var button = $("<a id='backtotop-button'></a>")
			.appendTo($('body'))
			.hide()
			.click(function() {
				self.enableScrollEvent = false;
				$('html, body').animate({scrollTop:0}, 'fast',
				function() {
					self.enableScrollEvent = true;
				});
				button.fadeOut('fast');
				self.visible = false;
			});
		var updatePosition = function() {
			var pos = $(document).width() / 2 + 370;
			button.css({left: pos + 'px'});
		};
		updatePosition();
		$(window).scroll(function() {
			if (!self.enableScrollEvent) return;
			var offset = $(document).scrollTop();
			if (offset > self.threshold && !self.visible) {
				button.fadeIn('fast');
				self.visible = true;
			}
			if (offset < self.threshold && self.visible) {
				button.fadeOut('fast');
				self.visible = false;
			}
		});
		$(window).resize(function() {
			updatePosition();
		});
	}
};

/*
 * CE6 jQuery extension
 */
ce6.dlgOpenDefault = function() {
	// Remove the stupid default button focus
	$(".ui-dialog :button").blur().removeClass('ui-state-focus');
}

ce6.waitingForReady = function(readyFunc) {
	var interval = 300;
	var timeout = 5000;
	if (!ce6.waitingStartTime) 
		ce6.waitingStartTime = new Date();
	var timer = setInterval(function(){
		var timeElapsed = (new Date()) - ce6.waitingStartTime;
		if (readyFunc() || timeElapsed > timeout) {
			clearInterval(timer);
			$(document).trigger('ajaxPageLoaded');
		}
	}, interval);
}

;(function ($) {
	//show error message for form input
	$.fn.extend({
		error : function(args) {
			if (typeof args == 'string') {
				this.addClass('input-error').focus();
				if (!this.prev('div').hasClass('error-msg')) {
					this.before('<div class="error-msg">' + args + '</div>');
				} else if (this.prev('div').text() != args) {
					this.prev('div').text(args);
				}
				return this;
			} else if (typeof args == 'function') {
				args(this);
				return this;
			}
		},
		clearError : function() {
			return this.removeClass('input-error').prev('.error-msg').remove();
		},
		restyleButtons : function() {
			var buttons = this.nextAll('div.ui-dialog-buttonpane').find('button');
			buttons.each(function(index) {
				$(this).addClass('lightgray').css('display', 'inline');
				if (index == buttons.length -1) $(this).addClass('blue').removeClass('lightgray ui-state-default').focus();
			});
		},
		pressEnter: function(handler) {
			$(this).bind('keypress', function(e) {
				if (e.keyCode == 13) handler(this);
			});
		},
		unselectable: function() {
			this.each(function() {
				if (typeof this.onselectstart != 'undefined') {
					// for IE
					this.onselectstart = function() {return false;};
				}
			});
			return this;
		},
		disableButton: function() {
			this.addClass('ui-state-disabled').attr('disabled', 'true');
		},
		enableButton: function() {
			this.removeClass('ui-state-disabled').removeAttr('disabled');
		},
		disableDlgButtons : function() {
			var buttons = this.nextAll('div.ui-dialog-buttonpane').find('button');
			buttons.disableButton();
		},
		enableDlgButtons : function() {
			var buttons = this.nextAll('div.ui-dialog-buttonpane').find('button');
			buttons.enableButton();
		},
		inputVal : function() {
			if (this.val() == this.attr('placeholder'))
				return '';
			else
				return this.val();
	    },
		focusNextInput : function() {
			$(this).blur();
			var nextIdx = $(":input").index(this) + 1;
			$(":input:eq(" + nextIdx  + ")").focus();
		},
		autogrowTextarea : function(options) { 
			this.filter('textarea').each(function(){ 
				var self = $(this), minHeight = self.height(); 
				var shadow = $("<div class='shadow-proxy'></div>").css({
					'width' : self.width(),
					'line-height': self.css('line-height'),
					'font-family': self.css('font-family'),
					'font-size':   self.css('font-size')
				}).appendTo(document.body); 
				var update = function() { 
					var textInput = this.value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/\n/g, '<br/>');
					shadow.html(textInput);
					self.css('height', Math.max(shadow.height() + 20, minHeight));
				}
				update.apply(this); 
				self.change(update).keyup(update).keydown(update); 
			}); 
			
			return this; 
		}
	});
})(jQuery);
