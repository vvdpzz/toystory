notifyBarTimeoutVar = null;
jQuery.notifyBar = function (a) {
    (function (b) {
        var e = notifyBarNS = {};
        notifyBarNS.shown = false;
        a || (a = {});
        notifyBarNS.html = a.html || "Your message here";
        notifyBarNS.delay = a.delay || 2E3;
        notifyBarNS.onHoverDelay = a.onHoverDelay || 2E3;
        notifyBarNS.animationSpeed = a.animationSpeed || 200;
        notifyBarNS.jqObject = a.jqObject;
        notifyBarNS.container = a.container || "body";
        notifyBarNS.cls = a.cls || "";
        notifyBarNS.close = a.close || false;
        notifyBarNS.onHover = false;
        if (notifyBarNS.jqObject) {
            e = notifyBarNS.jqObject;
            notifyBarNS.html = e.html()
        } else e = jQuery("<div></div>").addClass("jquery-notify-bar").addClass(notifyBarNS.cls).attr("id", "__notifyBar");
        e.html(notifyBarNS.html).hide();
        var h = e.attr("id");
        switch (notifyBarNS.animationSpeed) {
        case "slow":
            asTime = 600;
            break;
        case "normal":
            asTime = 400;
            break;
        case "fast":
            asTime = 200;
            break;
        default:
            asTime = notifyBarNS.animationSpeed
        }
        b(notifyBarNS.container).prepend(e);
        var f = function () {
                e.attr("id") == "__notifyBar" ? jQuery("#" + h).slideUp(asTime, function () {
                    jQuery("#" + h).remove()
                }) : jQuery("#" + h).slideUp(asTime);
                a.onBarClose && a.onBarClose();
                clearTimeout(notifyBarTimeoutVar);
                return false
            };
        if (notifyBarNS.close) {
            e.find("div:first").append(jQuery("<a href='#' class='notify-bar-close'></a>"));
            jQuery(".notify-bar-close").click(f)
        }
        if (b(".jquery-notify-bar:visible").length > 0) b(".jquery-notify-bar:visible").stop().slideUp(asTime, function () {
            e.stop().slideDown(asTime)
        });
        else {
            e.slideDown(asTime);
            a.onBarShown && a.onBarShown()
        }
        e.click(function () {
            f()
        });
        e.hover(function () {
            notifyBarNS.onHover = true
        }, function () {
            notifyBarNS.onHover = false
        });
        var g = function () {
                notifyBarNS.onHover ? setTimeout(g, notifyBarNS.onHoverDelay) : f()
            };
        clearTimeout(notifyBarTimeoutVar);
        notifyBarTimeoutVar = setTimeout(g, notifyBarNS.delay + asTime)
    })(jQuery)
};