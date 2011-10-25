var setToolTip = function (a, b) {
        $(a).live("mouseover", function () {
            var e = $(this);
            e.data("tip") || e.data("tip", new ExtendableTip(e, b));
            b.beforeShow && b.beforeShow($(this));
            e.data("tip") && e.data("tip").show()
        }).live("mouseout", function () {
            var e = $(this).data("tip");
            e && e.hide()
        })
    };

function ExtendableTip(a, b) {
    this.settings = $.extend({
        offsetX: 0,
        offsetY: 0,
        containerStyleClass: "tooltip-container",
        containerStyle: {},
        bgStyleClass: "tooltip-bg",
        bgStyle: {},
        text: a.attr("tip-text"),
        arrowStyleClass: "tooltip-arrow",
        arrowStyle: {},
        distance: 0
    }, b);
    this.target = a;
    this.offset = parseInt(a.attr("tip-offset")) || 5;
    this.position = b.position || a.attr("tip-position") || "top";
    if ("top bottom left right".indexOf(this.position) == -1) this.position = "top";
    this.shown = false;
    this.enabled = true;
    this.addedToDOM = false;
    this.tip = $("<div></div>").addClass(this.settings.containerStyleClass).css(this.settings.containerStyle);
    this.bg = $("<div></div>").addClass(this.settings.bgStyleClass).html(this.settings.text).css(this.settings.bgStyle);
    this.arrow = $("<span></span>").addClass(this.settings.arrowStyleClass).css(this.settings.arrowStyle);
    this.tip.append(this.bg).append(this.arrow);
    var e = a.attr("tip-effect") || "fade";
    this.effect = new {
        fade: FadeEffect
    }[e](this)
}
ExtendableTip.prototype = {
    enable: function () {
        this.enabled = true
    },
    disable: function () {
        this.shown && this.hide();
        this.enabled = false
    },
    show: function () {
        if (this.enabled) if (!this.shown) {
            if (!this.addedToDOM) {
                $("body").append(this.tip);
                this.addedToDOM = true
            }
            var a = this.position,
                b = this.getOffset(a);
            if (!this.hasSpace(b.top, b.left)) {
                a = this.reverse(a);
                b = this.getOffset(a)
            }
            if (this.settings.offsetX) b.left += this.settings.offsetX;
            if (this.settings.offsetY) b.top += this.settings.offsetY;
            this.tip.css({
                top: b.top,
                left: b.left
            });
            this.tipPos = b;
            this.arrow.removeClass().addClass(this.settings.arrowStyleClass).addClass(this.settings.arrowStyleClass + "-" + a);
            this.effect.show(b);
            this.shown = true
        }
    },
    hide: function () {
        this.effect.hide(this.tipPos);
        this.shown = false
    },
    reverse: function (a) {
        return {
            top: "bottom",
            bottom: "top",
            left: "right",
            right: "left"
        }[a]
    },
    getOffset: function (a) {
        var b = 0,
            e = 0,
            h = this.target.offset();
        if (a == "top" || a == "bottom") {
            b = a == "top" ? -this.offset - this.tip.outerHeight() - this.settings.distance : this.target.outerHeight() + this.offset + this.settings.distance;
            e = this.target.outerWidth() / 2 - this.tip.outerWidth() / 2
        } else {
            b = this.target.outerHeight() / 2 - this.tip.outerHeight() / 2;
            e = a == "left" ? -this.offset - this.tip.outerWidth(-this.settings.distance) : this.target.outerWidth() + this.offset + this.settings.distance
        }
        return {
            left: h.left + e,
            top: h.top + b
        }
    },
    hasSpace: function (a, b) {
        var e = $(window).scrollTop(),
            h = $(window).scrollLeft(),
            f = e + $(window).height(),
            g = h + $(window).width(),
            m = a + this.tip.outerHeight(),
            p = b + this.tip.outerWidth();
        return a > e && m < f && b > h && p < g
    }
};

function FadeEffect(a) {
    this.tip = a.tip
}
FadeEffect.prototype = {
    show: function () {
        this.tip.stop().css("opacity", 1).fadeIn("fast")
    },
    hide: function () {
        this.tip.stop().css("opacity", 1).fadeOut("fast")
    }
};
(function (a) {
    var b = function () {
            function e(f) {
                var g = {
                    data: [],
                    heatmap: f
                };
                this.max = 1;
                this.get = function (m) {
                    return g[m]
                };
                this.set = function (m, p) {
                    g[m] = p
                }
            }
            function h(f) {
                var g = {
                    radiusIn: 20,
                    radiusOut: 40,
                    element: {},
                    canvas: {},
                    acanvas: {},
                    ctx: {},
                    actx: {},
                    visible: true,
                    width: 0,
                    height: 0,
                    max: false,
                    gradient: false,
                    opacity: 180,
                    debug: false
                };
                this.store = new e(this);
                this.get = function (m) {
                    return g[m]
                };
                this.set = function (m, p) {
                    g[m] = p
                };
                this.configure(f);
                this.init()
            }
            e.prototype = {
                addDataPoint: function (f, g) {
                    if (!(f < 0 || g < 0)) {
                        var m = this.get("heatmap"),
                            p = this.get("data");
                        p[f] || (p[f] = []);
                        p[f][g] || (p[f][g] = 0);
                        p[f][g] += arguments.length < 3 ? 1 : arguments[2];
                        this.set("data", p);
                        if (this.max < p[f][g]) {
                            this.max = p[f][g];
                            m.get("actx").clearRect(0, 0, m.get("width"), m.get("height"));
                            for (var t in p) for (var o in p[t]) m.drawAlpha(t, o, p[t][o])
                        } else m.drawAlpha(f, g, p[f][g])
                    }
                },
                setDataSet: function (f) {
                    var g = this.get("heatmap"),
                        m = [],
                        p = f.data,
                        t = p.length;
                    g.clear();
                    for (this.max = f.max; t--;) {
                        f = p[t];
                        g.drawAlpha(f.x, f.y, f.count);
                        m[f.x] || (m[f.x] = []);
                        m[f.x][f.y] || (m[f.x][f.y] = 0);
                        m[f.x][f.y] = f.count
                    }
                    this.set("data", m)
                },
                exportDataSet: function () {
                    var f = this.get("data"),
                        g = [];
                    for (var m in f) if (m !== undefined) for (var p in f[m]) p !== undefined && g.push({
                        x: parseInt(m, 10),
                        y: parseInt(p, 10),
                        count: f[m][p]
                    });
                    return {
                        max: this.max,
                        data: g
                    }
                },
                generateRandomDataSet: function (f) {
                    var g = this.get("heatmap"),
                        m = g.get("width");
                    g = g.get("height");
                    var p = {},
                        t = Math.floor(Math.random() * 1E3 + 1);
                    p.max = t;
                    for (var o = []; f--;) o.push({
                        x: Math.floor(Math.random() * m + 1),
                        y: Math.floor(Math.random() * g + 1),
                        count: Math.floor(Math.random() * t + 1)
                    });
                    p.data = o;
                    this.setDataSet(p)
                }
            };
            h.prototype = {
                configure: function (f) {
                    if (f.radius) var g = f.radius,
                        m = parseInt(g / 2, 10);
                    this.set("radiusIn", m || 15);
                    this.set("radiusOut", g || 40);
                    this.set("element", f.element instanceof Object ? f.element : document.getElementById(f.element));
                    this.set("visible", f.visible);
                    this.set("max", f.max || false);
                    this.set("gradient", f.gradient || {
                        0.45: "rgb(0,0,255)",
                        0.55: "rgb(0,255,255)",
                        0.65: "rgb(0,255,0)",
                        0.95: "yellow",
                        1: "rgb(255,0,0)"
                    });
                    this.set("opacity", parseInt(255 / (100 / f.opacity), 10) || 180);
                    this.set("width", f.width || 0);
                    this.set("height", f.height || 0);
                    this.set("debug", f.debug)
                },
                init: function () {
                    var f = document.createElement("canvas"),
                        g = document.createElement("canvas"),
                        m = this.get("element");
                    this.initColorPalette();
                    this.set("canvas", f);
                    this.set("acanvas", g);
                    f.width = g.width = m.style.width.replace(/px/, "") || this.getWidth(m);
                    this.set("width", f.width);
                    f.height = g.height = m.style.height.replace(/px/, "") || this.getHeight(m);
                    this.set("height", f.height);
                    f.style.position = g.style.position = "absolute";
                    f.style.top = g.style.top = "0";
                    f.style.left = g.style.left = "0";
                    f.style.zIndex = 1E6;
                    if (!this.get("visible")) f.style.display = "none";
                    this.get("element").appendChild(f);
                    this.get("debug") && document.body.appendChild(g);
                    this.set("ctx", f.getContext("2d"));
                    this.set("actx", g.getContext("2d"))
                },
                initColorPalette: function () {
                    var f = document.createElement("canvas");
                    f.width = "1";
                    f.height = "256";
                    var g = f.getContext("2d"),
                        m = g.createLinearGradient(0, 0, 1, 256),
                        p = this.get("gradient");
                    for (var t in p) m.addColorStop(t, p[t]);
                    g.fillStyle = m;
                    g.fillRect(0, 0, 1, 256);
                    this.set("gradient", g.getImageData(0, 0, 1, 256).data);
                    delete f;
                    delete m;
                    delete g
                },
                getWidth: function (f) {
                    var g = f.offsetWidth;
                    if (f.style.paddingLeft) g += f.style.paddingLeft;
                    if (f.style.paddingRight) g += f.style.paddingRight;
                    return g
                },
                getHeight: function (f) {
                    var g = f.offsetHeight;
                    if (f.style.paddingTop) g += f.style.paddingTop;
                    if (f.style.paddingBottom) g += f.style.paddingBottom;
                    return g
                },
                colorize: function (f, g) {
                    var m = this.get("width"),
                        p = this.get("radiusOut"),
                        t = this.get("height"),
                        o = this.get("actx"),
                        w = this.get("ctx");
                    p = p * 2;
                    if (f + p > m) f = m - p;
                    if (f < 0) f = 0;
                    if (g < 0) g = 0;
                    if (g + p > t) g = t - p;
                    m = o.getImageData(f, g, p, p);
                    t = m.data;
                    o = t.length;
                    p = this.get("gradient");
                    for (var c = this.get("opacity"), x = 3; x < o; x += 4) {
                        var D = t[x],
                            k = D * 4;
                        if (k) {
                            t[x - 3] = p[k];
                            t[x - 2] = p[k + 1];
                            t[x - 1] = p[k + 2];
                            t[x] = D < c ? D : c
                        }
                    }
                    m.data = t;
                    w.putImageData(m, f, g)
                },
                drawAlpha: function (f, g, m) {
                    var p = this.get("radiusIn"),
                        t = this.get("radiusOut"),
                        o = this.get("actx");
                    this.get("max");
                    p = o.createRadialGradient(f, g, p, f, g, t);
                    f = f - t;
                    g = g - t;
                    t = 2 * t;
                    p.addColorStop(0, "rgba(0,0,0," + (m ? m / this.store.max : "0.1") + ")");
                    p.addColorStop(1, "rgba(0,0,0,0)");
                    o.fillStyle = p;
                    o.fillRect(f, g, t, t);
                    this.colorize(f, g)
                },
                toggleDisplay: function () {
                    var f = this.get("visible");
                    this.get("canvas").style.display = f ? "none" : "block";
                    this.set("visible", !f)
                },
                getImageData: function () {
                    return this.get("canvas").toDataURL()
                },
                clear: function () {
                    var f = this.get("width"),
                        g = this.get("height");
                    this.store.set("data", []);
                    this.get("ctx").clearRect(0, 0, f, g);
                    this.get("actx").clearRect(0, 0, f, g)
                },
                cleanup: function () {
                    this.get("element").removeChild(this.get("canvas"));
                    delete this
                }
            };
            return {
                create: function (f) {
                    return new h(f)
                },
                util: {
                    mousePosition: function (f) {
                        var g, m;
                        if (f.layerX) {
                            g = f.layerX;
                            m = f.layerY
                        } else if (f.offsetX) {
                            g = f.offsetX;
                            m = f.offsetY
                        }
                        if (typeof g != "undefined") return [g, m]
                    }
                }
            }
        }();
    a.h337 = a.heatmapFactory = b
})(window);