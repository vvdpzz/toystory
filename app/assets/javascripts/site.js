ce6.site = {
	url : function(method, params) {
		params = params || {};
		url_args = $.param(params);
		return 'http://' + BASE_DOMAIN + '/' + method + (url_args?'?'+url_args:'');
    },
	redirect : function(method, params) {
		if (method.indexOf('http://')==0)
			window.location.href = method;
		else
			window.location.href = this.url(method, params);
    },
	urlPath : function(url) {
		return url.split(/\?/)[0];
	},
	urlHash : function(){
		var p = window.location.hash.substr(1).split(/\&/), l = p.length, kv, r = {};
		while (l--) {
			kv = p[l].split(/\=/);
			r[kv[0]] = kv[1] || ''; //if no =value just set it as empty str
		}
		return r;
	},
	urlParams : function(url){
		url = url || window.location.href;
		if (url.indexOf('?') == -1)
			return {};
		var query = url.split(/\?/)[1];
		var p = query.split(/\&/), l = p.length, kv, r = {};
		while (l--) {
			kv = p[l].split(/\=/);
			r[kv[0]] = kv[1] || ''; //if no =value just set it as empty str
		}
		return r;
	},
	updateUrlParam : function(url, params) {
		var oldParams = ce6.site.urlParams(url);
		var urlBase = url;
		if (url.indexOf('?') > -1) {
			urlBase = url.split(/\?/)[0];
		}
		return urlBase + '?' + $.param($.extend(oldParams, params));
	},
	reloadWithoutParams : function(excludeParams){
		var safePath = window.location.pathname;
		var p = this.urlParams();
		for(var i in excludeParams){
		   delete p[excludeParams[i]]
		}
		var ps = $.param(p);
		if(ps){
			safePath += '?'+ps;
		}
		window.location.href = safePath;
    },
	cleanReload : function(){
		//remove some functonal param when reload page
		var paramsClean = ['xsrc'];
		this.reloadWithoutParams(paramsClean);
    },
	staticUrl: function(path) {
		return 'http://' + VER_DOMAIN + '/version/' + VER_ID + path
    }
}
