(function (a) {
    var b = {
        button: null,
        menu: null
    },
        e = function (f, g, m) {
            f.click(function (p) {
                if (b.menu != g) {
                    h();
                    f.removeClass("inactive-menu").addClass("active-menu");
                    g.show();
                    var t = g.data("onMenuShow");
                    t && t(g);
                    b.button = f;
                    b.menu = g
                } else h();
                p.stopPropagation()
            });
            m = m || {};
            m.onMenuShow && g.data("onMenuShow", m.onMenuShow);
            m.onMenuHide && g.data("onMenuHide", m.onMenuHide)
        },
        h = function () {
            if (b.button) {
                b.button.removeClass("active-menu").addClass("inactive-menu");
                b.menu.hide();
                var f = b.menu.data("onMenuHide");
                f && f(b.menu)
            }
            b.button = b.menu = null
        };
    a(document).click(h);
    a.fn.extend({
        toggleMenu: function (f, g) {
            e(a(this), f, g);
            return this
        }
    })
})(jQuery);