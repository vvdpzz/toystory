/*
 New BSD License <http://creativecommons.org/licenses/BSD/>
*/
(function (a) {
    var b = a.History = a.History || {},
        e = a.jQuery;
    if (typeof b.Adapter !== "undefined") throw Error("History.js Adapter has already been loaded...");
    b.Adapter = {
        bind: function (h, f, g) {
            e(h).bind(f, g)
        },
        trigger: function (h, f) {
            e(h).trigger(f)
        },
        onDomLoad: function (h) {
            e(h)
        }
    }
})(window);
/*
 New BSD License <http://creativecommons.org/licenses/BSD/>
 Public Domain
 @author Benjamin Arthur Lupton <contact@balupton.com>
 @author James Padolsey <https://gist.github.com/527683>
 Public Domain
 @author Benjamin Arthur Lupton <contact@balupton.com>
*/
(function (a, b) {
    var e = a.console || b,
        h = a.document,
        f = a.navigator,
        g = a.amplify || false,
        m = a.setTimeout,
        p = a.clearTimeout,
        t = a.setInterval,
        o = a.clearInterval,
        w = a.JSON,
        c = a.History = a.History || {},
        x = a.history;
    w.stringify = w.stringify || w.encode;
    w.parse = w.parse || w.decode;
    if (typeof c.init !== "undefined") throw Error("History.js Core has already been loaded...");
    c.init = function () {
        if (typeof c.Adapter === "undefined") return false;
        typeof c.initCore !== "undefined" && c.initCore();
        typeof c.initHtml4 !== "undefined" && c.initHtml4();
        return true
    };
    c.initCore = function () {
        if (typeof c.initCore.initialized !== "undefined") return false;
        else c.initCore.initialized = true;
        c.options = c.options || {};
        c.options.hashChangeInterval = c.options.hashChangeInterval || 100;
        c.options.safariPollInterval = c.options.safariPollInterval || 500;
        c.options.doubleCheckInterval = c.options.doubleCheckInterval || 500;
        c.options.storeInterval = c.options.storeInterval || 1E3;
        c.options.busyDelay = c.options.busyDelay || 250;
        c.options.debug = c.options.debug || false;
        c.options.initialTitle = c.options.initialTitle || h.title;
        c.intervalList = [];
        c.clearAllIntervals = function () {
            var k, j = c.intervalList;
            if (typeof j !== "undefined" && j !== null) {
                for (k = 0; k < j.length; k++) o(j[k]);
                c.intervalList = null
            }
        };
        c.Adapter.bind(a, "beforeunload", c.clearAllIntervals);
        c.Adapter.bind(a, "unload", c.clearAllIntervals);
        c.debug = function () {
            c.options.debug && c.log.apply(c, arguments)
        };
        c.log = function () {
            var k = !(typeof e === "undefined" || typeof e.log === "undefined" || typeof e.log.apply === "undefined"),
                j = h.getElementById("log"),
                l, n, s;
            if (k) {
                n = Array.prototype.slice.call(arguments);
                l = n.shift();
                typeof e.debug !== "undefined" ? e.debug.apply(e, [l, n]) : e.log.apply(e, [l, n])
            } else l = "\n" + arguments[0] + "\n";
            n = 1;
            for (s = arguments.length; n < s; ++n) {
                var A = arguments[n];
                if (typeof A === "object" && typeof w !== "undefined") try {
                    A = w.stringify(A)
                } catch (F) {}
                l += "\n" + A + "\n"
            }
            if (j) {
                j.value += l + "\n-----\n";
                j.scrollTop = j.scrollHeight - j.clientHeight
            } else k || alert(l);
            return true
        };
        c.getInternetExplorerMajorVersion = function () {
            return c.getInternetExplorerMajorVersion.cached = typeof c.getInternetExplorerMajorVersion.cached !== "undefined" ? c.getInternetExplorerMajorVersion.cached : function () {
                for (var k = 3, j = h.createElement("div"), l = j.getElementsByTagName("i");
                (j.innerHTML = "<!--[if gt IE " + ++k + "]><i></i><![endif]--\>") && l[0];);
                return k > 4 ? k : false
            }()
        };
        c.isInternetExplorer = function () {
            return c.isInternetExplorer.cached = typeof c.isInternetExplorer.cached !== "undefined" ? c.isInternetExplorer.cached : Boolean(c.getInternetExplorerMajorVersion())
        };
        c.emulated = {
            pushState: !Boolean(a.history && a.history.pushState && a.history.replaceState && !(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i.test(f.userAgent) || /AppleWebKit\/5([0-2]|3[0-2])/i.test(f.userAgent))),
            hashChange: Boolean(!("onhashchange" in a || "onhashchange" in h) || c.isInternetExplorer() && c.getInternetExplorerMajorVersion() < 8)
        };
        c.enabled = !c.emulated.pushState;
        c.bugs = {
            setHash: Boolean(!c.emulated.pushState && f.vendor === "Apple Computer, Inc." && /AppleWebKit\/5([0-2]|3[0-3])/.test(f.userAgent)),
            safariPoll: Boolean(!c.emulated.pushState && f.vendor === "Apple Computer, Inc." && /AppleWebKit\/5([0-2]|3[0-3])/.test(f.userAgent)),
            ieDoubleCheck: Boolean(c.isInternetExplorer() && c.getInternetExplorerMajorVersion() < 8),
            hashEscape: Boolean(c.isInternetExplorer() && c.getInternetExplorerMajorVersion() < 7)
        };
        c.isEmptyObject = function (k) {
            for (var j in k) return false;
            return true
        };
        c.cloneObject = function (k) {
            if (k) {
                k = w.stringify(k);
                k = w.parse(k)
            } else k = {};
            return k
        };
        c.baseUrl = h.location.href.replace(/[#?].*/, "");
        c.getRootUrl = function () {
            var k = h.location.protocol + "//" + (h.location.hostname || h.location.host);
            if (h.location.port) k += ":" + h.location.port;
            k += "/";
            return k
        };
        c.getBaseHref = function () {
            var k = h.getElementsByTagName("base"),
                j = null;
            j = "";
            if (k.length === 1) {
                j = k[0];
                j = j.href.replace(/[^\/]+$/, "")
            }
            if (j = j.replace(/\/+$/, "")) j += "/";
            return j
        };
        c.getBaseUrl = function () {
            return c.getBaseHref() || c.getBasePageUrl() || c.getRootUrl()
        };
        c.getPageUrl = function () {
            return ((c.getState(false, false) || {}).url || h.location.href).replace(/\/+$/, "")
        };
        c.getBasePageUrl = function () {
            return h.location.href.replace(/[#\?].*/, "").replace(/[^\/]+$/, function (k) {
                return /[^\/]$/.test(k) ? "" : k
            }).replace(/\/+$/, "") + "/"
        };
        c.getFullUrl = function (k, j) {
            var l = k,
                n = k.substring(0, 1);
            j = typeof j === "undefined" ? true : j;
            /[a-z]+\:\/\//.test(k) || (l = n === "/" ? c.getRootUrl() + k.replace(/^\/+/, "") : n === "#" ? c.getPageUrl().replace(/#.*/, "") + k : n === "?" ? c.getPageUrl().replace(/[\?#].*/, "") + k : j ? c.getBaseUrl() + k.replace(/^(\.\/)+/, "") : c.getBasePageUrl() + k.replace(/^(\.\/)+/, ""));
            return l.replace(/\#$/, "")
        };
        c.getShortUrl = function (k) {
            k = k;
            var j = c.getRootUrl();
            if (c.emulated.pushState) k = k.replace(c.baseUrl + "/", "").replace(c.baseUrl, "");
            k = k.replace(j, "/");
            return k = k.replace(/^(\.\/)+/g, "./").replace(/\#$/, "")
        };
        c.store = g ? g.store("History.store") || {} : {};
        c.store.idToState = c.store.idToState || {};
        c.store.urlToId = c.store.urlToId || {};
        c.store.stateToId = c.store.stateToId || {};
        c.idToState = c.idToState || {};
        c.stateToId = c.stateToId || {};
        c.urlToId = c.urlToId || {};
        c.storedStates = c.storedStates || [];
        c.savedStates = c.savedStates || [];
        c.getState = function (k, j) {
            if (typeof k === "undefined") k = true;
            if (typeof j === "undefined") j = true;
            var l = c.getLastSavedState();
            if (!l && j) l = c.createStateObject();
            if (k) {
                l = c.cloneObject(l);
                l.url = l.cleanUrl || l.url
            }
            return l
        };
        c.getIdByState = function (k) {
            var j = c.extractId(k.url);
            if (!j) {
                var l = c.getStateString(k);
                if (typeof c.stateToId[l] !== "undefined") j = c.stateToId[l];
                else if (typeof c.store.stateToId[l] !== "undefined") j = c.store.stateToId[l];
                else {
                    for (;;) {
                        j = String(Math.floor(Math.random() * 1E3));
                        if (typeof c.idToState[j] === "undefined" && typeof c.store.idToState[j] === "undefined") break
                    }
                    c.stateToId[l] = j;
                    c.idToState[j] = k
                }
            }
            return j
        };
        c.normalizeState = function (k) {
            if (!k || typeof k !== "object") k = {};
            if (typeof k.normalized !== "undefined") return k;
            if (!k.data || typeof k.data !== "object") k.data = {};
            var j = {};
            j.normalized = true;
            j.title = k.title || "";
            j.url = c.getFullUrl(c.unescapeString(k.url || h.location.href));
            j.hash = c.getShortUrl(j.url);
            j.data = c.cloneObject(k.data);
            j.id = c.getIdByState(j);
            j.cleanUrl = j.url.replace(/\??\&_suid.*/, "");
            j.url = j.cleanUrl;
            k = !c.isEmptyObject(j.data);
            if (j.title || k) {
                j.hash = c.getShortUrl(j.url).replace(/\??\&_suid.*/, "");
                /\?/.test(j.hash) || (j.hash += "?");
                j.hash += "&_suid=" + j.id
            }
            j.hashedUrl = c.getFullUrl(j.hash);
            if ((c.emulated.pushState || c.bugs.safariPoll) && c.hasUrlDuplicate(j)) j.url = j.hashedUrl;
            return j
        };
        c.createStateObject = function (k, j, l) {
            k = {
                data: k,
                title: j,
                url: l
            };
            return k = c.normalizeState(k)
        };
        c.getStateById = function (k) {
            k = String(k);
            return c.idToState[k] || c.store.idToState[k] || b
        };
        c.getStateString = function (k) {
            k = {
                data: c.normalizeState(k).data,
                title: k.title,
                url: k.url
            };
            return w.stringify(k)
        };
        c.getStateId = function (k) {
            return c.normalizeState(k).id
        };
        c.getHashByState = function (k) {
            return c.normalizeState(k).hash
        };
        c.extractId = function (k) {
            return ((k = /(.*)\&_suid=([0-9]+)$/.exec(k)) ? String(k[2] || "") : "") || false
        };
        c.isTraditionalAnchor = function (k) {
            return !/[\/\?\.]/.test(k)
        };
        c.extractState = function (k, j) {
            var l = null;
            j = j || false;
            var n = c.extractId(k);
            if (n) l = c.getStateById(n);
            if (!l) {
                var s = c.getFullUrl(k);
                if (n = c.getIdByUrl(s) || false) l = c.getStateById(n);
                if (!l && j && !c.isTraditionalAnchor(k)) l = c.createStateObject(null, null, s)
            }
            return l
        };
        c.getIdByUrl = function (k) {
            return c.urlToId[k] || c.store.urlToId[k] || b
        };
        c.getLastSavedState = function () {
            return c.savedStates[c.savedStates.length - 1] || b
        };
        c.getLastStoredState = function () {
            return c.storedStates[c.storedStates.length - 1] || b
        };
        c.hasUrlDuplicate = function (k) {
            var j = false;
            return j = (j = c.extractState(k.url)) && j.id !== k.id
        };
        c.storeState = function (k) {
            c.urlToId[k.url] = k.id;
            c.storedStates.push(c.cloneObject(k));
            return k
        };
        c.isLastSavedState = function (k) {
            var j = false;
            if (c.savedStates.length) {
                k = k.id;
                j = c.getLastSavedState().id;
                j = k === j
            }
            return j
        };
        c.saveState = function (k) {
            if (c.isLastSavedState(k)) return false;
            c.savedStates.push(c.cloneObject(k));
            return true
        };
        c.getStateByIndex = function (k) {
            var j = null;
            return j = typeof k === "undefined" ? c.savedStates[c.savedStates.length - 1] : k < 0 ? c.savedStates[c.savedStates.length + k] : c.savedStates[k]
        };
        c.getHash = function () {
            return c.unescapeHash(h.location.hash)
        };
        c.unescapeString = function (k) {
            k = k;
            for (var j;;) {
                j = a.unescape(k);
                if (j === k) break;
                k = j
            }
            return k
        };
        c.unescapeHash = function (k) {
            k = c.normalizeHash(k);
            return k = c.unescapeString(k)
        };
        c.normalizeHash = function (k) {
            return k.replace(/[^#]*#/, "").replace(/#.*/, "")
        };
        c.setHash = function (k, j) {
            if (j !== false && c.busy()) {
                c.pushQueue({
                    scope: c,
                    callback: c.setHash,
                    args: arguments,
                    queue: j
                });
                return false
            }
            var l = c.escapeHash(k);
            c.busy(true);
            var n = c.extractState(k, true);
            if (n && !c.emulated.pushState) c.pushState(n.data, n.title, n.url, false);
            else if (h.location.hash !== l) if (c.bugs.setHash) {
                n = c.getPageUrl();
                c.pushState(null, null, n + "#" + l, false)
            } else h.location.hash = l;
            return c
        };
        c.escapeHash = function (k) {
            k = c.normalizeHash(k);
            k = a.escape(k);
            c.bugs.hashEscape || (k = k.replace(/\%21/g, "!").replace(/\%26/g, "&").replace(/\%3D/g, "=").replace(/\%3F/g, "?"));
            return k
        };
        c.getHashByUrl = function (k) {
            k = String(k).replace(/([^#]*)#?([^#]*)#?(.*)/, "$2");
            return k = c.unescapeHash(k)
        };
        c.setTitle = function (k) {
            var j = k.title;
            if (!j) {
                var l = c.getStateByIndex(0);
                if (l && l.url === k.url) j = l.title || c.options.initialTitle
            }
            try {
                h.getElementsByTagName("title")[0].innerHTML = j.replace("<", "&lt;").replace(">", "&gt;").replace(" & ", " &amp; ")
            } catch (n) {}
            h.title = j;
            return c
        };
        c.queues = [];
        c.busy = function (k) {
            if (typeof k !== "undefined") c.busy.flag = k;
            else if (typeof c.busy.flag === "undefined") c.busy.flag = false;
            if (!c.busy.flag) {
                p(c.busy.timeout);
                var j = function () {
                        if (!c.busy.flag) for (var l = c.queues.length - 1; l >= 0; --l) {
                            var n = c.queues[l];
                            if (n.length !== 0) {
                                n = n.shift();
                                c.fireQueueItem(n);
                                c.busy.timeout = m(j, c.options.busyDelay)
                            }
                        }
                    };
                c.busy.timeout = m(j, c.options.busyDelay)
            }
            return c.busy.flag
        };
        c.fireQueueItem = function (k) {
            return k.callback.apply(k.scope || c, k.args || [])
        };
        c.pushQueue = function (k) {
            c.queues[k.queue || 0] = c.queues[k.queue || 0] || [];
            c.queues[k.queue || 0].push(k);
            return c
        };
        c.queue = function (k, j) {
            if (typeof k === "function") k = {
                callback: k
            };
            if (typeof j !== "undefined") k.queue = j;
            c.busy() ? c.pushQueue(k) : c.fireQueueItem(k);
            return c
        };
        c.clearQueue = function () {
            c.busy.flag = false;
            c.queues = [];
            return c
        };
        c.stateChanged = false;
        c.doubleChecker = false;
        c.doubleCheckComplete = function () {
            c.stateChanged = true;
            c.doubleCheckClear();
            return c
        };
        c.doubleCheckClear = function () {
            if (c.doubleChecker) {
                p(c.doubleChecker);
                c.doubleChecker = false
            }
            return c
        };
        c.doubleCheck = function (k) {
            c.stateChanged = false;
            c.doubleCheckClear();
            if (c.bugs.ieDoubleCheck) c.doubleChecker = m(function () {
                c.doubleCheckClear();
                c.stateChanged || k();
                return true
            }, c.options.doubleCheckInterval);
            return c
        };
        c.safariStatePoll = function () {
            var k = c.extractState(h.location.href);
            if (!c.isLastSavedState(k)) {
                k || c.createStateObject();
                c.Adapter.trigger(a, "popstate");
                return c
            }
        };
        c.back = function (k) {
            if (k !== false && c.busy()) {
                c.pushQueue({
                    scope: c,
                    callback: c.back,
                    args: arguments,
                    queue: k
                });
                return false
            }
            c.busy(true);
            c.doubleCheck(function () {
                c.back(false)
            });
            x.go(-1);
            return true
        };
        c.forward = function (k) {
            if (k !== false && c.busy()) {
                c.pushQueue({
                    scope: c,
                    callback: c.forward,
                    args: arguments,
                    queue: k
                });
                return false
            }
            c.busy(true);
            c.doubleCheck(function () {
                c.forward(false)
            });
            x.go(1);
            return true
        };
        c.go = function (k, j) {
            var l;
            if (k > 0) for (l = 1; l <= k; ++l) c.forward(j);
            else if (k < 0) for (l = -1; l >= k; --l) c.back(j);
            else throw Error("History.go: History.go requires a positive or negative integer passed.");
            return c
        };
        c.saveState(c.storeState(c.extractState(h.location.href, true)));
        if (g) {
            c.onUnload = function () {
                var k = g.store("History.store") || {},
                    j;
                k.idToState = k.idToState || {};
                k.urlToId = k.urlToId || {};
                k.stateToId = k.stateToId || {};
                for (j in c.idToState) if (c.idToState.hasOwnProperty(j)) k.idToState[j] = c.idToState[j];
                for (j in c.urlToId) if (c.urlToId.hasOwnProperty(j)) k.urlToId[j] = c.urlToId[j];
                for (j in c.stateToId) if (c.stateToId.hasOwnProperty(j)) k.stateToId[j] = c.stateToId[j];
                c.store = k;
                g.store("History.store", k)
            };
            c.intervalList.push(t(c.onUnload, c.options.storeInterval));
            c.Adapter.bind(a, "beforeunload", c.onUnload);
            c.Adapter.bind(a, "unload", c.onUnload)
        }
        if (c.emulated.pushState) {
            var D = function () {};
            c.pushState = c.pushState || D;
            c.replaceState = c.replaceState || D
        } else {
            c.onPopState = function (k) {
                c.doubleCheckComplete();
                var j = c.getHash();
                if (j) {
                    if (k = c.extractState(j || h.location.href, true)) c.replaceState(k.data, k.title, k.url, false);
                    else {
                        c.Adapter.trigger(a, "anchorchange");
                        c.busy(false)
                    }
                    return c.expectedStateId = false
                }
                j = false;
                k = k || {};
                if (typeof k.state === "undefined") if (typeof k.originalEvent !== "undefined" && typeof k.originalEvent.state !== "undefined") k.state = k.originalEvent.state || false;
                else if (typeof k.event !== "undefined" && typeof k.event.state !== "undefined") k.state = k.event.state || false;
                k.state = k.state || false;
                (j = k.state ? c.getStateById(k.state) : c.expectedStateId ? c.getStateById(c.expectedStateId) : c.extractState(h.location.href)) || (j = c.createStateObject(null, null, h.location.href));
                c.expectedStateId = false;
                if (c.isLastSavedState(j)) {
                    c.busy(false);
                    return false
                }
                c.storeState(j);
                c.saveState(j);
                c.setTitle(j);
                c.Adapter.trigger(a, "statechange");
                c.busy(false);
                return true
            };
            c.Adapter.bind(a, "popstate", c.onPopState);
            c.pushState = function (k, j, l, n) {
                if (c.getHashByUrl(l) && c.emulated.pushState) throw Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
                if (n !== false && c.busy()) {
                    c.pushQueue({
                        scope: c,
                        callback: c.pushState,
                        args: arguments,
                        queue: n
                    });
                    return false
                }
                c.busy(true);
                var s = c.createStateObject(k, j, l);
                if (c.isLastSavedState(s)) c.busy(false);
                else {
                    c.storeState(s);
                    c.expectedStateId = s.id;
                    x.pushState(s.id, s.title, s.url);
                    c.Adapter.trigger(a, "popstate")
                }
                return true
            };
            c.replaceState = function (k, j, l, n) {
                if (c.getHashByUrl(l) && c.emulated.pushState) throw Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
                if (n !== false && c.busy()) {
                    c.pushQueue({
                        scope: c,
                        callback: c.replaceState,
                        args: arguments,
                        queue: n
                    });
                    return false
                }
                c.busy(true);
                var s = c.createStateObject(k, j, l);
                if (c.isLastSavedState(s)) c.busy(false);
                else {
                    c.storeState(s);
                    c.expectedStateId = s.id;
                    x.replaceState(s.id, s.title, s.url);
                    c.Adapter.trigger(a, "popstate")
                }
                return true
            };
            c.bugs.safariPoll && c.intervalList.push(t(c.safariStatePoll, c.options.safariPollInterval));
            if (f.vendor === "Apple Computer, Inc." || (f.appCodeName || "") === "Mozilla") {
                c.Adapter.bind(a, "hashchange", function () {
                    c.Adapter.trigger(a, "popstate")
                });
                c.getHash() && c.Adapter.onDomLoad(function () {
                    c.Adapter.trigger(a, "hashchange")
                })
            }
        }
    }
})(window);
/*
 New BSD License <http://creativecommons.org/licenses/BSD/>
*/
(function (a) {
    var b = a.document,
        e = a.setTimeout || e,
        h = a.clearTimeout || h,
        f = a.setInterval || f,
        g = a.History = a.History || {};
    if (typeof g.initHtml4 !== "undefined") throw Error("History.js HTML4 Support has already been loaded...");
    g.initHtml4 = function () {
        if (typeof g.initHtml4.initialized !== "undefined") return false;
        else g.initHtml4.initialized = true;
        g.enabled = true;
        g.savedHashes = [];
        g.isLastHash = function (m) {
            var p = g.getHashByIndex();
            return m === p
        };
        g.saveHash = function (m) {
            if (g.isLastHash(m)) return false;
            g.savedHashes.push(m);
            return true
        };
        g.getHashByIndex = function (m) {
            var p = null;
            return p = typeof m === "undefined" ? g.savedHashes[g.savedHashes.length - 1] : m < 0 ? g.savedHashes[g.savedHashes.length + m] : g.savedHashes[m]
        };
        g.discardedHashes = {};
        g.discardedStates = {};
        g.discardState = function (m, p, t) {
            var o = g.getHashByState(m);
            g.discardedStates[o] = {
                discardedState: m,
                backState: t,
                forwardState: p
            };
            return true
        };
        g.discardHash = function (m, p, t) {
            g.discardedHashes[m] = {
                discardedHash: m,
                backState: t,
                forwardState: p
            };
            return true
        };
        g.discardedState = function (m) {
            m = g.getHashByState(m);
            return g.discardedStates[m] || false
        };
        g.discardedHash = function (m) {
            return g.discardedHashes[m] || false
        };
        g.recycleState = function (m) {
            var p = g.getHashByState(m);
            g.discardedState(m) && delete g.discardedStates[p];
            return true
        };
        if (g.emulated.hashChange) {
            g.hashChangeInit = function () {
                g.checkerFunction = null;
                var m = "";
                if (g.isInternetExplorer()) {
                    var p = b.createElement("iframe");
                    p.setAttribute("id", "historyjs-iframe");
                    p.style.display = "none";
                    b.body.appendChild(p);
                    p.contentWindow.document.open();
                    p.contentWindow.document.close();
                    var t = "",
                        o = false;
                    g.checkerFunction = function () {
                        if (o) return false;
                        o = true;
                        var w = g.getHash() || "",
                            c = g.unescapeHash(p.contentWindow.document.location.hash) || "";
                        if (w !== m) {
                            m = w;
                            if (c !== w) {
                                t = w;
                                p.contentWindow.document.open();
                                p.contentWindow.document.close();
                                p.contentWindow.document.location.hash = g.escapeHash(w)
                            }
                            g.Adapter.trigger(a, "hashchange")
                        } else if (c !== t) {
                            t = c;
                            g.setHash(c, false)
                        }
                        o = false;
                        return true
                    }
                } else g.checkerFunction = function () {
                    var w = g.getHash();
                    if (w !== m) {
                        m = w;
                        g.Adapter.trigger(a, "hashchange")
                    }
                    return true
                };
                g.intervalList.push(f(g.checkerFunction, g.options.hashChangeInterval));
                return true
            };
            g.Adapter.onDomLoad(g.hashChangeInit)
        }
        if (g.emulated.pushState) {
            g.onHashChange = function (m) {
                var p = g.getHashByUrl(m && m.newURL || b.location.href);
                m = null;
                if (g.isLastHash(p)) {
                    g.busy(false);
                    return false
                }
                g.doubleCheckComplete();
                g.saveHash(p);
                if (p && g.isTraditionalAnchor(p)) {
                    g.Adapter.trigger(a, "anchorchange");
                    g.busy(false);
                    return false
                }
                m = g.extractState(g.getFullUrl(p || b.location.href, false), true);
                if (g.isLastSavedState(m)) {
                    g.busy(false);
                    return false
                }
                g.getHashByState(m);
                if (p = g.discardedState(m)) {
                    g.getHashByIndex(-2) === g.getHashByState(p.forwardState) ? g.back(false) : g.forward(false);
                    return false
                }
                g.pushState(m.data, m.title, m.url, false);
                return true
            };
            g.Adapter.bind(a, "hashchange", g.onHashChange);
            g.pushState = function (m, p, t, o) {
                if (g.getHashByUrl(t)) throw Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
                if (o !== false && g.busy()) {
                    g.pushQueue({
                        scope: g,
                        callback: g.pushState,
                        args: arguments,
                        queue: o
                    });
                    return false
                }
                g.busy(true);
                var w = g.createStateObject(m, p, t),
                    c = g.getHashByState(w),
                    x = g.getState(false);
                x = g.getHashByState(x);
                var D = g.getHash();
                g.storeState(w);
                g.expectedStateId = w.id;
                g.recycleState(w);
                g.setTitle(w);
                if (c === x) {
                    g.busy(false);
                    return false
                }
                if (c !== D && c !== g.getShortUrl(b.location.href)) {
                    g.setHash(c, false);
                    return false
                }
                g.saveState(w);
                g.Adapter.trigger(a, "statechange");
                g.busy(false);
                return true
            };
            g.replaceState = function (m, p, t, o) {
                if (g.getHashByUrl(t)) throw Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
                if (o !== false && g.busy()) {
                    g.pushQueue({
                        scope: g,
                        callback: g.replaceState,
                        args: arguments,
                        queue: o
                    });
                    return false
                }
                g.busy(true);
                var w = g.createStateObject(m, p, t),
                    c = g.getState(false),
                    x = g.getStateByIndex(-2);
                g.discardState(c, w, x);
                g.pushState(w.data, w.title, w.url, false);
                return true
            };
            g.getHash() && !g.emulated.hashChange && g.Adapter.onDomLoad(function () {
                g.Adapter.trigger(a, "hashchange")
            })
        }
    }
})(window);