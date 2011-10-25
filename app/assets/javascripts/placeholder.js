(function (a) {
    function b(f) {
        var g = {},
            m = /^jQuery\d+$/;
        a.each(f.attributes, function (p, t) {
            if (t.specified && !m.test(t.name)) g[t.name] = t.value
        });
        return g
    }
    function e() {
        var f = a(this);
        if (f.val() === f.attr("placeholder") && f.hasClass("placeholder")) f.data("placeholder-password") ? f.hide().next().show().focus() : f.val("").removeClass("placeholder")
    }
    function h() {
        var f, g = a(this),
            m = g,
            p = g.data("placeholder-init");
        if (g.val() === "" || !p && g.val() === g.attr("placeholder")) {
            if (g.is(":password")) {
                if (!g.data("placeholder-textinput")) {
                    try {
                        f = g.clone().attr({
                            type: "text"
                        })
                    } catch (t) {
                        f = a("<input>").attr(a.extend(b(g[0]), {
                            type: "text"
                        }))
                    }
                    f.removeAttr("id").removeAttr("name").data("placeholder-password", true).bind("focus.placeholder", e);
                    g.data("placeholder-textinput", f).before(f)
                }
                g = g.hide().prev().show()
            }
            g.addClass("placeholder").val(g.attr("placeholder"))
        } else g.removeClass("placeholder");
        p || m.data("placeholder-init", true)
    }
    a.fn.placeholder = function () {
        return this.filter(":input[placeholder]").bind("focus.placeholder", e).bind("blur.placeholder", h).trigger("blur.placeholder").end()
    };
    a(function () {
        a("form").bind("submit.placeholder", function () {
            var f = a(".placeholder", this).each(e);
            setTimeout(function () {
                f.each(h)
            }, 10)
        })
    });
    a(window).bind("unload.placeholder", function () {
        a(".placeholder").val("")
    })
})(jQuery);