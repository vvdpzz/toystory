(function (a) {
    function b() {
        var f;
        f = this;
        f = a(f);
        if (!f.data("timeago")) {
            f.data("timeago", {
                datetime: h.datetime(f)
            });
            var g = a.trim(f.text());
            g.length > 0 && f.attr("title", g)
        }
        f = f.data("timeago");
        isNaN(f.datetime) || a(this).text(e(f.datetime));
        return this
    }
    function e(f) {
        return h.inWords((new Date).getTime() - f.getTime())
    }
    a.timeago = function (f) {
        return f instanceof Date ? e(f) : typeof f == "string" ? e(a.timeago.parse(f)) : e(a.timeago.datetime(f))
    };
    var h = a.timeago;
    a.extend(a.timeago, {
        settings: {
            refreshMillis: 6E4,
            allowFuture: false,
            strings: {
                prefixAgo: null,
                prefixFromNow: null,
                suffixAgo: "ago",
                suffixFromNow: "from now",
                seconds: "less than a minute",
                minute: "about a minute",
                minutes: "%d minutes",
                hour: "about an hour",
                hours: "about %d hours",
                day: "a day",
                days: "%d days",
                month: "about a month",
                months: "%d months",
                year: "about a year",
                years: "%d years",
                numbers: []
            }
        },
        inWords: function (f) {
            function g(k, j) {
                return (a.isFunction(k) ? k(j, f) : k).replace(/%d/i, m.numbers && m.numbers[j] || j)
            }
            var m = this.settings.strings,
                p = m.prefixAgo,
                t = m.suffixAgo;
            if (this.settings.allowFuture) {
                if (f < 0) {
                    p = m.prefixFromNow;
                    t = m.suffixFromNow
                }
                f = Math.abs(f)
            }
            var o = f / 1E3,
                w = o / 60,
                c = w / 60,
                x = c / 24,
                D = x / 365;
            o = o < 45 && g(m.seconds, Math.round(o)) || o < 90 && g(m.minute, 1) || w < 45 && g(m.minutes, Math.round(w)) || w < 90 && g(m.hour, 1) || c < 24 && g(m.hours, Math.round(c)) || c < 48 && g(m.day, 1) || x < 30 && g(m.days, Math.floor(x)) || x < 60 && g(m.month, 1) || x < 365 && g(m.months, Math.floor(x / 30)) || D < 2 && g(m.year, 1) || g(m.years, Math.floor(D));
            return a.trim([p, o, t].join(" "))
        },
        parse: function (f) {
            f = a.trim(f);
            f = f.replace(/\.\d\d\d+/, "");
            f = f.replace(/-/, "/").replace(/-/, "/");
            f = f.replace(/T/, " ").replace(/Z/, " UTC");
            f = f.replace(/([\+-]\d\d)\:?(\d\d)/, " $1$2");
            f = new Date(f);
            f.setTime(f.getTime() - f.getTimezoneOffset() * 60 * 1E3);
            return f
        },
        datetime: function (f) {
            f = a(f).get(0).tagName.toLowerCase() == "time" ? a(f).attr("datetime") : a(f).attr("title");
            return h.parse(f)
        }
    });
    a.fn.timeago = function () {
        var f = this;
        f.each(b);
        var g = h.settings;
        g.refreshMillis > 0 && setInterval(function () {
            f.each(b)
        }, g.refreshMillis);
        return f
    };
    document.createElement("abbr");
    document.createElement("time")
})(jQuery);