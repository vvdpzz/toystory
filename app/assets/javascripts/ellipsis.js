(function (a) {
    a.fn.ellipsis = function (b) {
        b = b || {};
        var e = b.ellipsisHtml || "...",
            h = document.documentElement.style;
        if (b.ellipsisHtml || b.force || !("textOverflow" in h || "OTextOverflow" in h)) return a(this).each(function () {
            var f = a(this);
            if (!f.data("ellipsisExecuted")) {
                f.data("ellipsisExecuted", true);
                b.forceRefreshHtml && f.data("originalText", null);
                if (f.css("overflow") == "hidden") {
                    var g = f.hasClass("truncate");
                    f.data("originalText") && f.html(f.data("originalText"));
                    var m = f.html(),
                        p = f.hasClass("multiline"),
                        t = parseInt(f.css("max-width")) > 0 ? parseInt(f.css("max-width")) : f.width(),
                        o = parseInt(f.css("max-height")) > 0 ? parseInt(f.css("max-height")) : f.height(),
                        w = function () {
                            return x.height() > o
                        },
                        c = function () {
                            return x.width() > t
                        };
                    w = p ? w : c;
                    var x = a(this.cloneNode(true)).hide().css({
                        position: "absolute",
                        width: p ? t : "auto",
                        height: p ? "auto" : o,
                        overflow: "visible",
                        "max-width": "none",
                        "max-height": "none"
                    });
                    f.after(x);
                    p = function (l) {
                        l = m.substr(0, l);
                        if (g) l = l.substr(0, l.lastIndexOf(" "));
                        x.html(l + e)
                    };
                    if (m.length > 0 && w()) {
                        c = 0;
                        for (var D = m.length; c < D - 1;) {
                            var k = parseInt((c + D) / 2);
                            p(k);
                            if (w()) D = k;
                            else c = k
                        }
                        p(c)
                    }
                    f.html(x.html());
                    f.data("originalText", m);
                    x.remove();
                    if (b.enableUpdating == true) {
                        var j = f.width();
                        f.one("resize", function () {
                            if (f.width() != j) {
                                f.data("ellipsisExecuted", false);
                                f.html(m);
                                f.ellipsis(b)
                            }
                        })
                    }
                }
            }
        })
    }
})(jQuery);