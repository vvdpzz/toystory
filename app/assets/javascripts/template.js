var templates = templates || {};
templates.ce6 = templates.ce6 || {};
templates.ce6.feed = {
    feedWrap: function (a) {
        return "<div class='home-feed feed-bottom-line clearfix'>" + a + "</div>"
    },
    feedWrapProfile: function (a) {
        return "<div class='following-contest-feed clearfix'>" + a + "</div>"
    },
    bodyWrap: function (a) {
        return "<div class='feed-body clearfix'>" + a + "</div>"
    },
    contestWrap: function (a) {
        return "<div class='contest-preview'>" + a + "</div>"
    },
    contestWrapProfile: function (a) {
        return "<div class='clearfix'>\t\t\t\t<div class='profile-feed-title gray'><span>Description</span></div>\t\t\t\t<div class='profile-feed-body'>\t\t\t\t<div class='contest-preview'>" + a + "</div></div></div>"
    },
    contestExtraWrapProfile: function (a) {
        return "<div class='clearfix'>\t\t\t\t<div class='profile-feed-title gray'><span>Extra info</span></div>\t\t\t\t<div class='profile-feed-body'>" + a + "</div></div>"
    },
    submissionWrapProfile: function (a) {
        return "<div class='clearfix'>\t\t\t\t<div class='profile-feed-title gray'><span>Entry</span></div>\t\t\t\t<div class='profile-feed-body'>\t\t\t\t<div class='contest-preview'>" + a + "</div></div></div>"
    },
    bodyWrapWithTimestamp: function (a) {
        return "<div class='feed-body clearfix'>" + a + "<div class='gray'>${time.latestUpdated}</div>\t\t\t\t\t</div>"
    },
    feedBadge: "{{if contest.is_jff}}\t\t\t<a class='jff-feed-badge \t\t\t\t{{if time.overOneDay}} jff-badge-overoneday' \t\t\t\t{{else time.withinOneDay}} jff-badge-withinoneday' \t\t\t\t{{else}} jff-badge-ended' \t\t\t\t{{/if}}\t\t\thref='${contest.url}'>\t\t\t\t{{if time.ended}}\t\t\t\t<div class='ended'>ENDED</div>\t\t\t\t{{else}}\t\t\t\t<div class='time-left {{if (time.timeLeft.length >= 8)}}small-font{{else}}normal-font{{/if}}'>${time.timeLeft}</div>\t\t\t\t{{/if}}\t\t\t</a> \t\t{{else}}\t\t\t{{if time.overOneDay}}<a class='feed-badge badge-overoneday' href='${contest.url}'>\t\t\t{{else time.withinOneDay}}<a class='feed-badge badge-withinoneday' href='${contest.url}'>\t\t\t{{else}}<a class='feed-badge badge-ended' href='${contest.url}'>{{/if}}\t\t\t\t<div class='prize'>$ ${contest.prize}</div>\t\t\t\t{{if time.ended}}\t\t\t\t<div class='ended'>ENDED</div>\t\t\t\t{{else}}\t\t\t\t<div class='time-left-cap'>TIME LEFT</div>\t\t\t\t<div class='time-left {{if (time.timeLeft.length >= 8)}}small-font{{/if}}'>${time.timeLeft}</div>\t\t\t\t{{/if}}\t\t\t\t{{if contest.is_promoted}} \t\t\t\t\t<div class='feed-upgraded-badge'></div> \t\t\t\t{{else}}\t\t\t\t\t{{if contest.blind}} \t\t\t\t\t\t<div class='feed-blind-badge'></div> \t\t\t\t\t{{else}}\t\t\t\t\t\t{{if contest.is_verified_only}} \t\t\t\t\t\t\t<div class='feed-verified-only-badge'></div> \t\t\t\t\t\t{{/if}} \t\t\t\t\t{{/if}} \t\t\t\t{{/if}} \t\t\t</a> \t\t{{/if}}",
    winnerBadge: "{{if contest.is_jff}}\t\t\t<span class='feed-jff-winner-badge'>\t\t\t</span>\t\t{{else}}\t\t\t<span class='feed-winner-badge'>\t\t\t</span>\t\t{{/if}}\t\t",
    honorableMentionBadge: "{{if contest.is_jff}}\t\t\t<span class='feed-jff-hm-badge'>\t\t\t</span>\t\t{{else}}\t\t\t<span class='feed-hm-badge'>\t\t\t</span>\t\t{{/if}}\t\t",
    feedUserIcon: "<a href='${owner.url}' class='feed-user-icon'><img target-width='80' onload='javascript:centralizeLargePic(this);' class='user-icon-img' src='{{if owner.large_pic}}${owner.large_pic}{{else}}${userPic}{{/if}}'/></a>\t\t",
    feedThinActor: "<div class='actor-area in-title'>\t\t{{each(i, a) actor}}\t\t\t{{if (i > 0)}}\t\t\t\t<span>,</span>\t\t\t{{/if}}\t\t\t{{if (6-i > 0)}}\t\t\t\t<span class='actor-block'>\t\t\t\t\t<a href='${a.url}' class='feed-actor-name'>${a.name}</a>\t\t\t\t\t<a class='{{if a.verified}}verified{{/if}}'></a> \t\t\t\t</span>\t\t\t{{/if}}\t\t{{/each}}\t\t<span class='action-words'>${actionWords}</span>\t\t</div>\t\t",
    feedActor: "<div class='actor-area'>\t\t{{each(i, a) actor}}\t\t\t{{if (i > 0)}}\t\t\t\t<span style='margin-right:5px'>,</span>\t\t\t{{/if}}\t\t\t{{if (6-i > 0)}}\t\t\t\t<span class='actor-block'>\t\t\t\t\t{{if a.pic}}<a href='${a.url}' class='feed-actor-img'><img class='submission-user' src='${a.pic}'/></a>\t\t\t\t\t{{else}}<a href='${a.url}' class='feed-actor-img'><img class='submission-user' src='${userPic}'/></a>\t\t\t\t\t{{/if}}\t\t\t\t\t<a href='${a.url}' class='{{if a.verified}}verified feed-actor-vrf{{/if}}'></a> \t\t\t\t\t<a href='${a.url}' class='feed-actor-name'>${a.name}</a>\t\t\t\t</span>\t\t\t{{/if}}\t\t{{/each}}\t\t<span class='action-words'>${actionWords}</span>\t\t<span class='timestamp'>${time.latestUpdated}</span>\t\t</div>\t\t",
    taggedAsAction: "<div class='actor-area actor-area-tags'>\t\t{{if actor}}\t\t\t{{each(i, a) actor}}\t\t\t{{if (i == 0)}}\t\t\t<span class='actor-block'>\t\t\t\t{{if a.pic}}<a href='${a.url}' class='feed-actor-img'><img class='submission-user' src='${a.pic}'/></a>\t\t\t\t{{else}}<a href='${a.url}' class='feed-actor-img'><img class='submission-user' src='${userPic}'/></a>\t\t\t\t{{/if}}\t\t\t\t<a href='${a.url}' class='feed-actor-name'>${a.name}</a>\t\t\t\t<a class='{{if a.verified}}verified{{/if}}'></a> \t\t\t</span>\t\t\t{{/if}}\t\t\t{{/each}}\t\t{{/if}}\t\t<span class='action-words'>${actionWords}</span>\t\t{{each(i, t) tags}}\t\t\t<span class='tagged-as-block tag-block-color' >\t\t\t\t<a class='entry-tag-name' href='${t.url}'>${t.name}</a>\t\t\t</span>\t\t{{/each}}\t\t<span class='timestamp'>${time.latestUpdated}</span>\t\t</div>\t\t",
    feedFollowedFriend: "<div class='followed-user-container'>\t\t{{each(i, f) friend}}\t\t\t<span class='followed-user-feed' {{if (i>=3)}}style='display:none;'{{/if}}>\t\t\t\t{{if f.pic}}<a href='${f.url}' class='profile-feed-user-simage'><img src='${f.pic}' tip-text='${f.name}' tip-effect='slide' /></a>\t\t\t\t{{else}}<a href='${f.url}' class='profile-feed-user-simage'><img src='${f.pic}' tip-text='${f.name}' tip-effect='slide' /></a>\t\t\t\t{{/if}}\t\t\t\t<a class='entry-user-name ellipsis singleline' href='${f.url}'>${f.name}</a>\t\t\t</span>\t\t{{/each}}\t\t{{if (friend.length>3)}}<a href='' class='show-more display-block'>show more</a>{{/if}}\t\t</div>\t\t",
    feedFollowedTag: "<div class='followed-user-container followed-tag-container'>\t\t{{each(i, t) tags}}\t\t\t<span class='followed-tag-feed tag-block-color' >\t\t\t\t<a class='entry-tag-name' href='${t.url}'>${t.name}</a>\t\t\t</span>\t\t{{/each}}\t\t</div>\t\t<a href='' class='selector-more-tag show-more'>show more</a>\t\t",
    feedSubmission: "<div class='submission-area'>\t\t{{each(i, s) submission}}\t\t\t<div class='submission' {{if (i>=2)}}style='display:none;'{{/if}}>\t\t\t\t<div class='submission-title-bar'>\t\t\t\t\t<a href='${s.profileUrl}' class='submission-owner feed-actor-name'>${s.owner}</a><a class='{{if s.verified}}verified{{/if}}'>&nbsp;</a><span class='submission-headline'>&nbsp;${s.headline}</span><span class='submission-vote gray'>${s.votes} vote{{if (s.votes != 1)}}s{{/if}}</span>\t\t\t\t</div>\t\t\t\t<a href='${s.url}'>\t\t\t\t<div class='entry-submitted-row'>\t\t\t\t\t{{if s.thumbnailUrl}}\t\t\t\t\t<div class='entry-img-container'><img src='${s.thumbnailUrl}'/></div>\t\t\t\t\t{{/if}}\t\t\t\t\t<div class='{{if s.thumbnailUrl}}preview-text-withthumb{{else}}preview-text{{/if}} ellipsis multiline truncate unselectable'>${s.text}</div>\t\t\t\t</div>\t\t\t\t</a>\t\t\t</div>\t\t{{/each}}\t\t{{if (submission.length>2)}}<a href='' class='show-more'>show more</a>{{/if}}\t\t</div>",
    feedSubmissionProfile: "<div class='clearfix'>\t\t{{if (contest.blind)}}\t\t\t<div class='submission'>\t\t\t\t<div class='contest-description bind-contest-entry-description'>\t\t\t\tThis is a blind contest, the entry won't be displayed until the contest is over.\t\t\t\t</div>\t\t\t</div>\t\t{{else}}\t\t\t{{each(i, s) submission}}\t\t\t\t<div class='submission' {{if (i>=2)}}style='display:none;'{{/if}}>\t\t\t\t\t{{if (s.thumbnailUrl)}}\t\t\t\t\t<div class='img-container'><div class='border-overlay'><a href='${s.url}'><img class='contest-thumb float-left' src='${s.thumbnailUrl}'/></a></div></div>\t\t\t\t\t{{/if}}\t\t\t\t\t<div class='contest-description{{if s.thumbnailUrl}}-withthumb{{/if}} ellipsis multiline truncate' url='${s.url}'>${s.text}</div>\t\t\t\t</div>\t\t\t{{/each}}\t\t{{/if}}\t\t</div>",
    contestBody: "<div class='contest-description{{if contest.thumbnail_url}}-withthumb{{/if}} ellipsis multiline truncate' url='${contest.url}'>${contest.description}</div>",
    contestTitle: "<a href='${contest.url}' class='contest-title'>${contest.title}</a>\t\t{{if (!time.ended)}}\t\t\t{{if (contest.following)}}\t\t\t\t<a href='#' class='contest-follow gray' cid='${contest.token}' followed='1'>Unfollow</a><span class='contest-entries gray'>&middot;</span>\t\t\t{{else}}\t\t\t\t<a href='#' class='contest-follow blue' cid='${contest.token}' followed='0'>Follow</a><span class='contest-entries gray'>&middot;</span>\t\t\t{{/if}}\t\t{{/if}}\t\t{{if (contest.entry_count == 1)}}\t\t\t<span class='contest-entries gray'>${contest.entry_count} entry</span>\t\t{{else}}\t\t\t<span class='contest-entries gray'>${contest.entry_count} entries</span>\t\t{{/if}}\t\t",
    contestTitleProfile: "<div class='clearfix'>\t\t<div class='profile-feed-title profile-feed-badge-title gray'><span>Contest</span></div>\t\t<div class='profile-feed-body'>\t\t<a class='contest-prize-badge' href='${contest.url}'>\t\t{{if time.overOneDay}}\t\t\t<div class='credits-box-container-sm'>\t\t{{else time.withinOneDay}}\t\t\t<div class='credits-box-container-sm red-badge'>\t\t{{else time.ended}}\t\t\t<div class='credits-box-container-sm grey-badge'>\t\t{{/if}}\t\t<div class='contest-prize'>\t\t{{if (contest.is_jff)}}\t\tFUN\t\t{{else}}\t\t$ ${contest.prize}\t\t{{/if}}\t\t</div></div>\t\t</a>\t\t<a href='${contest.url}' class='contest-title'><span class='profile-feed-badge-title'>${contest.title}</span></a></div>\t\t</div>",
    contestThumbnail: "{{if (contest.thumbnail_url)}}\t\t\t<div class='img-container'><div class='border-overlay'><a href='${contest.url}'><img class='contest-thumb float-left' src='${contest.thumbnail_url}'/></a></div></div>\t\t{{/if}}\t\t",
    contestExtra: "<span><b>${contest.entry_count}</b> \t\t{{if (contest.entry_count == 1)}}\t\t\tentry\t\t{{else}}\t\t\tentries\t\t{{/if}}</span>\t\t{{if (contest.is_jff)}}\t\t&middot; <span><a href='/${ce6.profile.jff_category_url}'>Just For Fun</a></span>\t\t{{else (contest.category_name)}}\t\t&middot; <span><a href='${contest.category_url}'>${contest.category_name}</a></span>\t\t{{/if}}",
    contestWonExtra: "{{if (contest.is_jff)}}\t\t<span class='ui-icons ui-icons-position' id='jff-win-icon'></span>\t\t{{else}}\t\t<span class='ui-icons ui-icons-position' id='winning-icon'></span>\t\t{{/if}}\t\t<span><b>WINNER</b></span> &middot;\t\t<span><b>${contest.entry_count}</b> \t\t{{if (contest.entry_count == 1)}}\t\t\tentry\t\t{{else}}\t\t\tentries\t\t{{/if}}</span>\t\t{{if (contest.is_jff)}}\t\t&middot; <span><a href='/${ce6.profile.jff_category_url}'>Just For Fun</a></span>\t\t{{else (contest.category_name)}}\t\t&middot; <span><a href='${contest.category_url}'>${contest.category_name}</a></span>\t\t{{/if}}",
    honorableMentionExtra: "{{if (contest.is_jff)}}\t\t<span class='ui-icons ui-icons-position' id='jff-honorable-icon'></span>\t\t{{else}}\t\t<span class='ui-icons ui-icons-position' id='honorable-mention-icon'></span>\t\t{{/if}}\t\t<span><b>HONORABLE MENTION</b></span> &middot;\t\t<span><b>${contest.entry_count}</b> \t\t{{if (contest.entry_count == 1)}}\t\t\tentry\t\t{{else}}\t\t\tentries\t\t{{/if}}</span>\t\t{{if (contest.is_jff)}}\t\t&middot; <span><a href='/${ce6.profile.jff_category_url}'>Just For Fun</a></span>\t\t{{else (contest.category_name)}}\t\t&middot; <span><a href='${contest.category_url}'>${contest.category_name}</a></span>\t\t{{/if}}"
};
ce6.feedTranslate = {
    timeTranslate: function (a) {
        time = {};
        if (a[0].contest) {
            secsLeft = a[0].contest.time_ending_left;
            timeLeftStruct = timeAgo.fromSecsToStruct(secsLeft);
            time.timeLeft = timeLeftStruct[0] + " " + timeLeftStruct[1].toUpperCase() + (timeLeftStruct[0] == 1 ? "" : "S");
            if (timeLeftStruct[1] == "day") {
                time.overOneDay = 1;
                time.timeLeft = timeLeftStruct[0] + " DAY" + (timeLeftStruct[0] == 1 ? "" : "S")
            } else if (secsLeft > 0) {
                switch (timeLeftStruct[1]) {
                case "hour":
                    time.timeLeft = timeLeftStruct[0] + " HOUR" + (timeLeftStruct[0] == 1 ? "" : "S");
                    break;
                case "minute":
                    time.timeLeft = timeLeftStruct[0] + " MIN" + (timeLeftStruct[0] == 1 ? "" : "S");
                    break;
                case "second":
                    time.timeLeft = "< 1 MIN";
                    break;
                default:
                    time.timeLeft = "< 1 DAY"
                }
                time.withinOneDay = 1
            } else time.ended = 1
        }
        var b = a[0].time_ago;
        for (d in a) if (a[d].time_ago < b) b = a[d].time_ago;
        time.latestUpdated = timeAgo.fromSecsToStr(b);
        return time
    },
    actorTranslate: function (a, b, e) {
        b = b == null ? "owner" : b;
        e = e == null ? false : e;
        var h = {};
        for (d in a) if (a[d][b]) if (e && a[d][b].following || !e) h[a[d][b].token] = {
            name: a[d][b].name,
            url: a[d][b].url,
            pic: a[d][b].picture,
            verified: a[d][b].verified
        };
        a = [];
        for (d in h) a.push(h[d]);
        return a
    },
    contestTranslate: function (a) {
        return a[0].contest
    },
    submissionTranslate: function (a, b) {
        b = b != null ? b : true;
        var e = {};
        for (d in a) e[a[d].entry.token] = {
            owner: a[d].entry.submitter_name,
            profileUrl: a[d].entry.submitter_url,
            verified: a[d].entry.submitter_verified,
            headline: a[d].entry.submitter_header,
            text: a[d].entry.text,
            votes: a[d].entry.votes,
            url: a[d].entry.url,
            thumbnailUrl: a[d].entry.thumbnail_url,
            following: a[d].owner.following
        };
        var h = [];
        if (b) for (d in e) if (e[d].following) {
            h.push(e[d]);
            delete e[d]
        }
        for (d in e) h.push(e[d]);
        return h
    },
    ownerTranslate: function (a) {
        return a[0].owner
    },
    tagTranslate: function (a) {
        var b = {};
        for (d in a) b[a[d].tag.name] = {
            name: a[d].tag.name,
            url: a[d].tag.url
        };
        a = [];
        for (d in b) a.push(b[d]);
        return a
    },
    followerJudger: function (a) {
        var b = 0;
        for (d in a) a[d].owner.following && b++;
        return {
            followerNum: b,
            othersNum: a.length - b
        }
    },
    contestCreatedFeed: function (a) {
        var b = this.contestTranslate(a),
            e = this.timeTranslate(a);
        a = this.actorTranslate(a);
        return {
            contest: b,
            time: e,
            actor: a,
            actionWords: " created a new contest",
            userPic: "/assets/feed_user.gif"
        }
    },
    followContestFeed: function (a) {
        var b = this.contestTranslate(a),
            e = this.timeTranslate(a);
        a = this.actorTranslate(a);
        return {
            contest: b,
            time: e,
            actor: a,
            actionWords: (a.length > 1 ? " are" : " is") + " now following this contest",
            userPic: "/assets/feed_user.gif"
        }
    },
    entrySubmittedFeed: function (a, b) {
        b = b == null ? true : b;
        var e = this.contestTranslate(a),
            h = this.timeTranslate(a),
            f = this.actorTranslate(a, "owner", b),
            g = this.submissionTranslate(a),
            m = this.followerJudger(a);
        actionWords = b ? m.followerNum ? m.othersNum ? " and " + m.othersNum + " other people submitted entries" : " submitted " + (a.length > 1 ? "entries" : "an entry") : a.length + " new " + (a.length == 1 ? "entry" : "entries") + " submitted in the contest" : "submitted " + (a.length > 1 ? "entries" : "an entry");
        return {
            contest: e,
            time: h,
            actor: f,
            submission: e.blind ? [] : g,
            actionWords: actionWords,
            userPic: "/assets/feed_user.gif"
        }
    },
    votedFeed: function (a, b) {
        b = b == null ? true : b;
        var e = this.contestTranslate(a),
            h = this.timeTranslate(a),
            f = this.actorTranslate(a, "owner", b),
            g = this.submissionTranslate(a);
        return {
            contest: e,
            time: h,
            actor: f,
            submission: g,
            actionWords: " voted for this entry",
            userPic: "/assets/feed_user.gif"
        }
    },
    pickWinnerFeed: function (a) {
        var b = this.contestTranslate(a),
            e = this.timeTranslate(a),
            h = this.submissionTranslate(a),
            f = [],
            g = "";
        if (a[0].winner.following) {
            f = this.actorTranslate(a, "winner");
            g = " won the contest"
        } else if (a[0].owner.following) {
            f = this.actorTranslate(a);
            g = " annouced the winner"
        } else g = "Winner announced for this contest";
        return {
            contest: b,
            time: e,
            actor: f,
            submission: h,
            actionWords: g,
            userPic: "/assets/feed_user.gif"
        }
    },
    honorableMentionFeed: function (a) {
        var b = this.pickWinnerFeed(a),
            e = "";
        a = this.actorTranslate(a, "winner");
        e = " is picked as honorable mention.";
        b.actionWords = e;
        b.actor = a;
        return b
    },
    followUserFeed: function (a) {
        var b = this.timeTranslate(a),
            e = this.ownerTranslate(a),
            h = this.actorTranslate(a);
        a = this.actorTranslate(a, "friend");
        return {
            time: b,
            actor: h,
            owner: e,
            friend: a,
            actionWords: " is now following:",
            userPic: "/assets/feed_user.gif"
        }
    },
    taggedAsFeed: function (a) {
        var b = this.contestTranslate(a),
            e = this.timeTranslate(a),
            h = this.actorTranslate(a, "contest_owner");
        a = this.tagTranslate(a);
        return {
            contest: b,
            time: e,
            actor: h,
            tags: a,
            actionWords: h.length ? " created a contest tagged as " : "Contest tagged as ",
            userPic: "/assets/feed_user.gif"
        }
    },
    followTagFeed: function (a) {
        var b = this.timeTranslate(a),
            e = this.tagTranslate(a),
            h = this.ownerTranslate(a);
        a = this.actorTranslate(a);
        return {
            time: b,
            tags: e,
            owner: h,
            actor: a,
            actionWords: " is now following:"
        }
    }
};
ce6.getCompiledTemplate = {
    f: templates.ce6.feed,
    createdFollowContestFeed: function () {
        if (!ce6.getCompiledTemplate.createdFollowContestFeedCompiled) {
            $.template("createdFollowContestFeed", this.f.feedWrap(this.f.feedBadge + this.f.bodyWrap(this.f.contestTitle + this.f.contestWrap(this.f.contestThumbnail + this.f.contestBody) + this.f.feedActor)));
            ce6.getCompiledTemplate.createdFollowContestFeedCompiled = true
        }
        return "createdFollowContestFeed"
    },
    createdFeedProfile: function () {
        if (!ce6.getCompiledTemplate.createdFeedProfileCompiled) {
            $.template("createdFeedProfile", this.f.feedWrapProfile(this.f.contestTitleProfile + this.f.contestWrapProfile(this.f.contestThumbnail + this.f.contestBody) + this.f.contestExtraWrapProfile(this.f.contestExtra)));
            ce6.getCompiledTemplate.createdFeedProfileCompiled = true
        }
        return "createdFeedProfile"
    },
    taggedAsFeed: function () {
        if (!ce6.getCompiledTemplate.taggedAsFeedCompiled) {
            $.template("taggedAsFeed", this.f.feedWrap(this.f.feedBadge + this.f.bodyWrap(this.f.contestTitle + this.f.contestWrap(this.f.contestThumbnail + this.f.contestBody) + this.f.taggedAsAction)));
            ce6.getCompiledTemplate.taggedAsFeedCompiled = true
        }
        return "taggedAsFeed"
    },
    submittedVotedWonFeed: function () {
        if (!ce6.getCompiledTemplate.entrySubmittedFeedCompiled) {
            $.template("submittedVotedWonFeed", this.f.feedWrap(this.f.feedBadge + this.f.bodyWrap(this.f.contestTitle + this.f.feedActor + this.f.feedSubmission)));
            ce6.getCompiledTemplate.entrySubmittedFeedCompiled = true
        }
        return "submittedVotedWonFeed"
    },
    submittedFeedProfile: function () {
        if (!ce6.getCompiledTemplate.entrySubmittedFeedLiteCompiled) {
            $.template("submittedFeedProfile", this.f.feedWrapProfile(this.f.contestTitleProfile + this.f.submissionWrapProfile(this.f.feedSubmissionProfile) + this.f.contestExtraWrapProfile(this.f.contestExtra)));
            ce6.getCompiledTemplate.entrySubmittedFeedCompiled = true
        }
        return "submittedFeedProfile"
    },
    wonFeedProfile: function () {
        if (!ce6.getCompiledTemplate.wonFeedProfileCompiled) {
            $.template("wonFeedProfile", this.f.feedWrapProfile(this.f.contestTitleProfile + this.f.submissionWrapProfile(this.f.feedSubmissionProfile) + this.f.contestExtraWrapProfile(this.f.contestWonExtra)));
            ce6.getCompiledTemplate.wonFeedProfileCompiled = true
        }
        return "wonFeedProfile"
    },
    honorableMentionProfile: function () {
        if (!ce6.getCompiledTemplate.honorableMentionProfileCompiled) {
            $.template("honorableMentionProfile", this.f.feedWrapProfile(this.f.contestTitleProfile + this.f.submissionWrapProfile(this.f.feedSubmissionProfile) + this.f.contestExtraWrapProfile(this.f.honorableMentionExtra)));
            ce6.getCompiledTemplate.honorableMentionProfileCompiled = true
        }
        return "honorableMentionProfile"
    },
    followUserFeed: function () {
        if (!ce6.getCompiledTemplate.followUserFeedCompiled) {
            $.template("followUserFeed", this.f.feedWrap(this.f.feedUserIcon + this.f.bodyWrapWithTimestamp(this.f.feedThinActor + this.f.feedFollowedFriend)));
            ce6.getCompiledTemplate.followUserFeedCompiled = true
        }
        return "followUserFeed"
    },
    followTagFeed: function () {
        if (!ce6.getCompiledTemplate.followTagFeedCompiled) {
            $.template("followTagFeed", this.f.feedWrap(this.f.feedUserIcon + this.f.bodyWrapWithTimestamp(this.f.feedThinActor + this.f.feedFollowedTag)));
            ce6.getCompiledTemplate.followTagFeedCompiled = true
        }
        return "followTagFeed"
    }
};