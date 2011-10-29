var ce6 = ce6 || {};
ce6.userPhoto = {
    init: function () {
        $("#upload-avatar").dialog(ce6.userPhoto.uploadDialog).restyleButtons();
        $("#del-photo-dlg").dialog(ce6.userPhoto.delDialog).restyleButtons();
        $("#user-photo-edit").click(ce6.userPhoto.userPhotoEdit);
        $("#user-photo-del").click(ce6.userPhoto.userPhotoDel)
    },
    userPhotoEdit: function () {
      	
        $("#uploaded-photo").attr("src", $("#user-mugshot").attr("src"));
        $("#binaryData").val("");
        $("#upload_msg").hide();
        // $("#upload-avatar").dialog("open").removeData("pic_hash");
        return false
    },
    delDialog: {
        autoOpen: false,
        modal: true,
        width: 450,
        title: "Delete Photo",
        buttons: {
            "Yes, delete anyway": function () {
                $("#user-mugshot").attr("src", profileOwner.defaultPicture);
                ce6.ajaxJson("/profile/delete_user_photo", {}, function (a) {
                    if (!a.rc) {
                        $("#profile-user-detail-username .verified").removeClass("verified").addClass("no-verified");
                        $(".verify-item.photo.v .verified-right").remove();
                        $(".verify-item.photo.v .verified-text").remove();
                        $(".verify-item.photo.v").append("<span class='verify-item-name' id='photo-verify-btn'><a>Add Photo</a>").removeClass("v")
                    }
                    $("#del-photo-dlg").dialog("close");
                    return false
                })
            },
            "No, keep my profile picture": function () {
                $(this).dialog("close")
            }
        }
    },
    userPhotoDel: function () {
        $("#del-photo-dlg").dialog("open");
        return false
    },
    uploadDialog: {
        autoOpen: false,
        modal: true,
        width: 450,
        title: "Edit Photo",
        buttons: {
            Cancel: function () {
                $(this).dialog("close")
            },
            Save: function () {
                    $("#uploadForm form").submit();
                    $(this).dialog("close");
            }
        }
    },
    uploadCallback: function (a) {
        $("#user-photo-loader").addClass("hidden");
        $("#upload_msg").hide();
        $("#uploadForm").show();
        if (a.err) $("#upload_msg").text("*Upload failed, please try again.").show();
        else {
            $("#uploaded-photo").attr("src", a.url).parent().removeClass("hidden");
            $("#upload-avatar").data("pic_hash", a.pic_hash)
        }
    },
    doUpload: function (a) {
        var b = $(a).val().match(/\.(png|jpg|jpeg|gif|tiff)$/i);
        if (b && b.length > 0 && b[1]) {
            a.form.submit();
            $("#uploadForm").hide();
            $("#uploaded-photo").attr("src", "").parent().addClass("hidden");
            $("#user-photo-loader").removeClass("hidden");
            return false
        } else $("#upload_msg").text("*That file type is not supported").show()
    }
};
ce6.profile = {
    init: function () {
        ce6.profile.nextPage = {};
        ce6.profile.ownerSid = $("#profile-widget-container").attr("uid");
        ce6.profile.loadFeeds(ce6.profile.feeds);
        $.timeago.settings.allowFuture = true;
        ce6.profile.buildDialogs();
        ce6.profile.registerHooks();
        $("#profile-tab-container a").live("click", ce6.profile.setTabSelection);
        // profileOwner.is_myself && !profileOwner.is_public && $("#profile-widget-container").sortable({
        //     disabled: true
        // });
        $("#profile-enter-portfolio").click(function () {
            $("#dlg-portfolio").dialog("open");
            if (!$("#profile-portfolio-preview").attr("placeholder")) {
                var a = $("#profile-portfolio-preview").html();
                $("#profile-portfolio-content").val(a);
                $(".nicEdit-main").html(a)
            }
        });
        $("#profile-delete-portfolio").click(function () {
            ce6.confirmDialog("Are you sure to delete your portfolio?", "Delete Portfolio", function () {
                ce6.ajaxJsonPost("/profile/delete_portfolio", {}, function (a) {
                    a.rc == 0 ? window.location.reload() : ce6.notifyBar(a.msg, "error")
                })
            })
        });
        ce6.editor.newEditorInstance("profile-portfolio-content", {
            maxHeight: 278
        });
        if (profileOwner.is_myself && !profileOwner.is_public && !profileOwner.entry_created_count) {
            ce6.ajaxJson("/home/load_contests", {
                page_no: 0,
                page_size: ce6.profile.pageSize,
                sort_key: "contest_created",
                desc: 1,
                show_ended: 0
            }, ce6.profile.appendFallbackContests);
        }
        $("span.visible-icon").click(ce6.profile.setVisibility);
        $('[rel="widget-hyperlink"] .profile-stats-badge, [rel="widget-hyperlink"] .profile-stats-count').not("a").click(function (a) {
            a.preventDefault();
            a = "#" + $(this).parents('[rel="widget-hyperlink"]').attr("anchor");
            $("html,body").animate({
                scrollTop: $(a).offset().top - 50
            }, "slow")
        });
        ce6.profile.initMoveButtons(false);
        $(window).scroll(ce6.profile.adjustLeftRightColumnPos);
        $(window).resize(ce6.profile.adjustLeftRightColumnPos);
        setToolTip(".sel-talent-score", {
            text: "This is Prizes Talent Score. To increase your score, simply participate in contests. The more contests you participate, the higher your score will be!",
            position: "bottom",
            containerStyle: {
                width: "300px"
            },
            distance: 10
        })
    },
    adjustLeftRightColumnPos: function () {
        var a = $(".page-footer").offset().top - $(document).scrollTop(),
            b = $(".profile-3column-left"),
            c = Math.min(60, a - b.height());
        b.css("top", c + "px");
        b = $(".profile-3column-right");
        a = Math.min(60, a - b.height());
        b.css("top", a + "px")
    },
    initMoveButtons: function (a) {
        $(".up-arrow").show().filter(":first").hide();
        $(".down-arrow").show().filter(":last").hide();
        $(".up-arrow").one("click", ce6.profile.buttonUp);
        $(".down-arrow").one("click", ce6.profile.buttonDown);
        a && ce6.profile.widgetSortUpdate()
    },
    buttonUp: function () {
        return ce6.profile.buttonMove($(this), "up")
    },
    buttonDown: function () {
        return ce6.profile.buttonMove($(this), "down")
    },
    buttonMove: function (a, b) {
        a.mouseout();
        var c = a.parent("span").parent("div.profile-widget-action-container").parent("div").parent("div");
        c.clone(true).fadeIn("normal", function () {
            if (b == "down") $(this).insertAfter(c.next());
            else b == "up" && $(this).insertBefore(c.prev());
            $(this).find("span.profile-widget-action-icon").data("tip", null)
        });
        c.fadeOut("slow", function () {
            $(this).remove();
            ce6.profile.initMoveButtons(true)
        });
        return false
    },
    setVisibility: function () {
        var a = $(this),
            b = $(this).parent("span").parent("div.profile-widget-action-container"),
            c = b.parent("div").parent("div"),
            e = c.hasClass("profile-widget-visible");
        b = [{
            widget_type: b.attr("widget_type"),
            key: b.attr("widget_key"),
            visible: !e
        }];
        a.mouseout();
        ce6.ajaxJsonPost("/profile/set_widgets_visibility", {
            widgets: JSON.stringify(b)
        }, function () {
            a.data("tip", null);
            if (e) {
                a.attr("tip-text", "Show this block");
                c.removeClass("profile-widget-visible").addClass("profile-widget-invisible");
                c.css({
                    opacity: 0.5
                })
            } else {
                a.attr("tip-text", "Hide this block");
                c.removeClass("profile-widget-invisible").addClass("profile-widget-visible");
                c.css({
                    opacity: 1
                })
            }
        })
    },
    appendFallbackContests: function (a) {
        feedData = a.feeds;
        $("#fallback-contests-container .loader-container").remove();
        feedData && feedData.length > 0 && ce6.feed.renderFeed(feedData, "fallback-contests-container", null);
        $("#fallback-contests-container").find(".following-contest-feed").last().addClass("profile-bottomless");
        $("#fallback-contests-container").find("a.contest-title, a.contest-prize-badge").attr("logdata", ce6.log_via_cookie.logdata(event_types.profile_no_entry_module_click))
    },
    submitPortfolio: function () {
        $("#profile-portfolio-content").val(ce6.editor.getContentWithAutoLink());
        var a = $("#profile-portfolio-content").val();
        if (a) ce6.ajaxJsonPost("/profile/update_portfolio", {
            content: a
        }, function (b) {
            b.rc == 0 ? window.location.reload() : ce6.notifyBar(b.msg, "error")
        });
        else {
            $("#profile-portfolio-content").error("Please enter your portfolio");
            return false
        }
    },
    widgetSortUpdate: function () {
        for (var a = [], b = $("#profile-widget-container").sortable("toArray"), c = 0; c < b.length; c++) a[c] = {
            widget_type: $("#" + b[c]).attr("widget_type"),
            key: $("#" + b[c]).attr("widget_key"),
            visible: true
        };
        ce6.ajaxJsonPost("/profile/sort_widgets", {
            widgets: JSON.stringify(a)
        })
    },
    setTabSelection: function () {
        var a = $(this).attr("id");
        $(this).siblings("a").removeClass("feed-tab-selected").addClass("feed-tab");
        $(this).siblings("a").find("div.feed-tab-arrow").hide();
        $(this).removeClass("feed-tab").addClass("feed-tab-selected");
        $(this).find("div.feed-tab-arrow").show();
        if (a == "profile-widget-tab") {
            $("#profile-connect-container").hide();
            $("#profile-connect-stats-container").hide();
            $("#profile-userinfo").show();
            $("#profile-user-detail-username").show();
            $("#profile-widget-container").show();
            $("#profile-widget-stats-container").show()
        } else if (a == "profile-connect-tab") {
            $("#profile-widget-container").hide();
            $("#profile-widget-stats-container").hide();
            $("#profile-user-detail-username").hide();
            $("#profile-userinfo").hide();
            $("#profile-connect-container").show();
            $("#profile-connect-stats-container").show()
        }
        ce6.feed.forceEllipsis(a)
    },
    loadFeeds: function (a) {
        allFeeds = a.feeds;
        for (a = 0; a < allFeeds.length; a++) ce6.profile.loadFeedsByType(allFeeds[a].item_type, allFeeds[a])
    },
    loadFeedsByType: function (a, b) {
        ce6.profile.nextPage[a] || (ce6.profile.nextPage[a] = 0);
        if (b) ce6.profile.appendFeedsByType(b);
        else {
            $("#profile-feed-block-" + a).find(".load-more-button").fadeTo("fast", 0.5);
            ce6.ajaxJsonGet("/profile/load_feeds", {
                item_type: a,
                uid: ce6.profile.ownerSid,
                page_no: ce6.profile.nextPage[a],
                page_size: ce6.profile.pageSize
            }, ce6.profile.appendFeeds)
        }
        return false
    },
    appendFeeds: function (a) {
        allFeeds = a.feeds;
        for (a = 0; a < allFeeds.length; a++) ce6.profile.appendFeedsByType(allFeeds[a])
    },
    appendFeedsByType: function (a) {
        var b = a.item_type,
            c = $("#profile-feed-block-" + b);
        c.find(".load-more-container").remove();
        c.find(".left-preloader-bar").hide();
        feedData = a.feeds;
        if (a.feeds.length) ce6.feed.renderFeed(feedData, "user-feed-container-" + b, null, {
            submit: false,
            vote: false
        });
        else a.empty_message && ce6.feed.appendEmptyHint(a.empty_message, "user-feed-container-" + b);
        a.has_more && ce6.feed.appendLoadmoreButtonNoId("user-feed-container-" + b);
        c.find(".load-more-button").one("click", function () {
            ce6.profile.loadFeedsByType(b)
        });
        $("span.timeago").timeago();
        ce6.user.hookFeedUser();
        ce6.profile.nextPage[b] += 1
    },
    registerHooks: function () {
        $(".unfollow").click(ce6.user.unfollow);
        $(".follow").click(ce6.user.follow);
        $("#btn-get-widget").click(ce6.profile.showWidgetDialog)
    },
    buildDialogs: function () {
        $("#dlg-get-widget").dialog({
            autoOpen: false,
            modal: true,
            dialogClass: "dialog-with-cross",
            width: 550,
            height: "auto",
            title: "Profile Widget",
            buttons: {
                Done: function () {
                    $(this).dialog("close")
                }
            }
        }).tabs().restyleButtons();
        $("#dlg-portfolio").dialog({
            autoOpen: false,
            modal: true,
            width: 650,
            height: "auto",
            title: "Your Portfolio",
            open: function () {
                ce6.profile.validatePortfolio()
            },
            buttons: {
                Cancel: function () {
                    $(this).dialog("close")
                },
                Submit: function () {
                    ce6.profile.validatePortfolio() && ce6.profile.submitPortfolio()
                }
            }
        }).tabs().restyleButtons();
        $(".nicEdit-main").live("keyup", ce6.profile.validatePortfolio);
        ce6.profile.submitPortfolioBtn = $("#dlg-portfolio").siblings(".ui-dialog-buttonpane").find("button:last");
        $("#widget-src").click(function () {
            $(this).focus().select()
        })
    },
    validatePortfolio: function () {
        var a = ce6.editor.getPlainContentLength() == 0,
            b = ce6.profile.submitPortfolioBtn;
        if (a) {
            b.addClass("ui-state-disabled");
            return false
        } else {
            b.removeClass("ui-state-disabled");
            return true
        }
    },
    showWidgetDialog: function (a) {
        $("#dlg-get-widget").dialog("open");
        a.preventDefault()
    }
};
$(function () {
    ce6.connectedUser.lastFollowerNid = 0;
    ce6.connectedUser.lastFollowingNid = 0;
    ce6.connectedUser.followerDom = $("#user-connect-container-" + CONNECT_TYPE.FOLLOWER_USER);
    ce6.connectedUser.followingDom = $("#user-connect-container-" + CONNECT_TYPE.FOLLOWING_USER);
    ce6.connectedUser.pageSize = 5;
    ce6.connectedUser.ownerSid = ce6.connectedUser.followerDom.attr("uid");
    ce6.connectedUser.loadFollowerUsers();
    ce6.connectedUser.loadFollowingUsers()
});
ce6.connectedUser = {
    loadFollowerUsers: function (a) {
        a && a.preventDefault();
        ce6.connectedUser.followerDom.find(".load-more-button").fadeTo("fast", 0.5);
        ce6.ajaxHtml("/profile/load_users", {
            nid: ce6.connectedUser.lastFollowerNid,
            page_size: ce6.connectedUser.pageSize,
            direction: 1,
            uid: ce6.connectedUser.ownerSid
        }, ce6.connectedUser.appendFollowerUsers)
    },
    appendFollowerUsers: function (a) {
        var b = ce6.connectedUser.followerDom;
        b.siblings(".left-preloader-bar").remove();
        b.find(".load-more-container").remove();
        b.append(a);
        b.find(".load-more-button").one("click", ce6.connectedUser.loadFollowerUsers);
        b.find(".follow-button button").click(ce6.user.setRelation);
        ce6.connectedUser.lastFollowerNid = b.find(".load-more-button").attr("last_nid")
    },
    loadFollowingUsers: function (a) {
        a && a.preventDefault();
        ce6.connectedUser.followingDom.find(".load-more-button").fadeTo("fast", 0.5);
        ce6.ajaxHtml("/profile/load_users", {
            nid: ce6.connectedUser.lastFollowingNid,
            page_size: ce6.connectedUser.pageSize,
            direction: 0,
            uid: ce6.connectedUser.ownerSid
        }, ce6.connectedUser.appendFollowingUsers)
    },
    appendFollowingUsers: function (a) {
        var b = ce6.connectedUser.followingDom;
        b.siblings(".left-preloader-bar").remove();
        b.find(".load-more-container").remove();
        b.append(a);
        b.find(".load-more-button").one("click", ce6.connectedUser.loadFollowingUsers);
        b.find(".follow-button button").click(ce6.user.setRelation);
        ce6.connectedUser.lastFollowingNid = b.find(".load-more-button").attr("last_nid")
    }
};
$(function () {
    ce6.followingContest.lastRid = 0;
    ce6.followingContest.pageSize = 4;
    ce6.followingContest.dom = $("#user-connect-container-" + CONNECT_TYPE.FOLLOWING_CONTEST);
    ce6.followingContest.ownerSid = ce6.followingContest.dom.attr("uid");
    ce6.followingContest.lastItem = null;
    ce6.followingContest.loadContests();
});
ce6.followingContest = {
    loadContests: function (a) {
        a && a.preventDefault();
        ce6.followingContest.dom.find(".load-more-button").fadeTo("fast", 0.5);
        ce6.ajaxHtml("/profile/load_contests", {
            rid: ce6.followingContest.lastRid,
            page_size: ce6.followingContest.pageSize,
            uid: ce6.followingContest.ownerSid
        }, ce6.followingContest.appendContests)
    },
    appendContests: function (a) {
        ce6.followingContest.dom.siblings(".left-preloader-bar").remove();
        ce6.followingContest.dom.find(".load-more-container").remove();
        ce6.followingContest.dom.append(a);
        var b = function (c) {
                c.ellipsis({
                    ellipsisHtml: "...<a class='see-more'>more</a>"
                })
            };
        ce6.followingContest.dom.find(".contest-preview").each(function () {
            var c = $(this).find(".contest-description, .contest-description-withthumb");
            b(c);
            c.find(".see-more").attr("href", c.attr("url"));
            $(this).find(".img-container img").load(function () {
                b(c);
                c.find(".see-more").attr("href", c.attr("url"))
            })
        });
        ce6.followingContest.dom.find(".load-more-button").one("click", ce6.followingContest.loadContests);
        ce6.followingContest.dom.find(".follow-button button").click(ce6.followingContest.toggleContestFollow);
        ce6.followingContest.lastRid = ce6.followingContest.dom.find(".load-more-button").attr("last_rid")
    },
    toggleContestFollow: function () {
        var a = $(this);
        if (!a.data("disabled")) {
            a.data("disabled", true);
            isFollowed = $(this).attr("followed");
            if (isFollowed == "1") {
                a.removeClass("unfollow").addClass("follow").text("Follow").attr("followed", "0");
                ce6.user.unfollowContest($(this).attr("cid"), function () {
                    a.data("disabled", false)
                })
            } else {
                viewer_logged_in && a.removeClass("follow").addClass("unfollow").text("Unfollow").attr("followed", "1");
                ce6.user.followContest($(this).attr("cid"), function () {
                    a.data("disabled", false)
                }, function () {
                    a.data("disabled", false)
                })
            }
        }
    }
};