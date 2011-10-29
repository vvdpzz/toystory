ce6.home = (function() {
	var self = {
	defaultTitle : 'Prizes - Solve Problems. Win Contests. Make Money.',
	nextPage : 0,
	inaccuracyThrshd : 10,
	contestsSortBy : 'contest_created',
	category: 'all',
	descending : true,
	showEndedContests : false,
	waitingTime : 0,
	waitingInterval : 300,
	tabConfig: {
		contests: {
			serverCall: 'loadContestsFromServer',
			appendCall: 'appendContests'
		},
		activities: {
			serverCall: 'loadActivitiesFromServer',
			appendCall: 'appendActivities'
		}
	},
	init : function() {
		$.timeago.settings.allowFuture = true;
		$('span.timeago').timeago();
		ce6.ajaxLink.start(ce6.home.onUrlChange, ce6.home.urlDataMap);
		ce6.backToTop.init();

		// go to leaderboard 
		if($('.side-leaderboard').length){
			$('.side-leaderboard').click(function(){window.location = '/leaderboard/alltime';});
		}
		
		// jff button
		$('.jff-bg-btn-container').click(ce6.home.onCreateJFFContest);
		$('.jff-bg-cancel-btn').click(ce6.home.onCancelJFFBar);

		ce6.home.pageLoaded = true;
		ce6.waitingForReady(ce6.home.isPageReady);

		// promoted jff contest badge hover
		setToolTip('.feed-upgraded-badge', {
			text: 'This Just For Fun contest just got upgraded due to its popularity or topic importance. Prizes.org added <span class="prize-number">prize</span> to its cash prize!', 
			position: 'bottom', 
			containerStyle: {width: '300px'},
			beforeShow: function(badge) {
				var prize = badge.parent().find(':first').html();
				if (badge.data('tip')) badge.data('tip').tip.find('.prize-number').html(prize);
			}
		});
		$('#top-nav li').removeClass();
		$('#nav-home').parent().addClass('active');
	},
	onUrlChange : function(state) {
		var data = state.data;
		var tab = data.tab || 'contests';
		document.title = self.defaultTitle;
		if (tab == 'contests' && data.category != 'all') {
			document.title = data.category == 'just_for_fun' ? 'Just For Fun - Prizes' : (data.category + ' - Prizes');
		}
		if (tab == 'contests') {
			self.selectCategory(data.category);
			self.sortContests(data.sortby || 'contest_created', data.order);
		} else {
			self.selectTab(tab);
		}

		if (prefetchedFeeds && !ce6.ajaxLink.startUrlModified) {
			// for the initial load, we don't need to log page view
			// since it's already done on pageloadfinish function in base.tmpl
			self.loadData(prefetchedFeeds);
			prefetchedFeeds = null;
		} else {
			self.loadData(null, ce6.home.logPageView);
		}
//		ce6.contest_widget.loadTopPrizes(self.category);
	},
	reset: function(container, load_func){
		// $('.left-preloader-bar').show();
		// $('#' + self.contentContainer).empty();
		self.nextPage = 0;
		self.cachedMoreFeeds = 0;
		self.hasMoreFeeds = 0;
		self.showEndedContests = false;
	},
	selectTab: function(tab) {
		self.tab = tab;
		var config = self.tabConfig[tab];
		self.tabContainer = tab + '-tab-container';
		self.contentContainer = tab + '-content-container';
		self.serverCall = self[config.serverCall];
		self.appendCall = self[config.appendCall];
		$('.feed-tab-container').hide();
		$('#' + self.tabContainer).show();
		$('.feed-tab-selected').removeClass('feed-tab-selected').addClass('feed-tab');
		$('.category-tab-selected').removeClass('category-tab-selected').addClass('category-tab');
		$('.feed-tab-arrow, .category-tab-arrow').hide();
		$('#contests-sort-by-prize').show();
		if (tab == 'contests' && self.category != 'all' && self.category != 'just_for_fun') {
			var categoryTab = $('.category-tab[category="' + self.category + '"]');
			categoryTab.removeClass('category-tab').addClass('category-tab-selected');
			categoryTab.find('.category-tab-arrow').show();
		} else if (tab == 'contests' && self.category == 'just_for_fun') {
			$('#jff-contests-tab').removeClass('feed-tab').addClass('feed-tab-selected');
			$('#jff-contests-tab').find('.new-feeds-count').remove();
			$('#jff-contests-tab').find('.feed-tab-arrow').show();
			$('#contests-sort-by-prize').hide();
		} else {
			$('#' + self.tab + '-tab').removeClass('feed-tab').addClass('feed-tab-selected');
			$('#' + self.tab + '-tab').find('.new-feeds-count').remove();
			$('#' + self.tab + '-tab').find('.feed-tab-arrow').show();
		}
		self.reset();
		return false;
    },
	selectCategory: function(name) {
		self.category = name;
		// reset sort options
		self.selectTab('contests');
		if (name == 'just_for_fun') {
			$('#homepage_jff_tab').hide(); // hide callout
			if ($('#jff-contests-tab-container')) {
				$('#jff-contests-tab-container').show();
				ce6.ajaxLog(event_types.jff_contest_module_impression);
			}
		}
		var categoryUrl = $('a[category="' + self.category + '"]').attr('href');
		$('.contests-sort-by a').each(function(){
			$(this).attr('href', ce6.site.updateUrlParam(categoryUrl, {
				sortby: $(this).attr('sortby')
			}));
		});
	},
	sortContests: function(sortby, order) {
		self.contestsSortBy = sortby;
		var elem = $('.contests-sort-by a[sortby=' + sortby + ']');
		if (!order) {
			self.sortOrder = $(elem).attr('default_desc') ? 'desc' : 'asce';
		} else {
			self.sortOrder = order;
		}
		$('.contests-sort-by a').removeClass('sort-key');
		$('.contests-sort-indicator').removeClass('contests-sort-desc contests-sort-asce').hide();
		$(elem).addClass('sort-key');
		if (self.sortOrder == 'desc') {
			$(elem).find('.contests-sort-indicator').addClass('contests-sort-desc').show();
		} else {
			$(elem).find('.contests-sort-indicator').addClass('contests-sort-asce').show();
		}
		var url = $(elem).attr('href');
		$(elem).attr('href', ce6.site.updateUrlParam(url, {
			order:self.sortOrder == 'desc' ? 'asce' : 'desc'
		}));
		self.reset();
		return false;
	},
	onCreateJFFContest: function(e) {
		ce6.ajaxJson('/home/log_create_jff', 
			{},
			function(data) {
				if(viewer_logged_in) {
					window.location = '/create?pre_fill=just_for_fun';
				} else {
					ce6.authDialog.open(function() {
						window.location = '/create?pre_fill=just_for_fun';
					}, null, 'auto', 'Create just for fun contest!');
				}
			}
		);
	},
	onCancelJFFBar: function(e) {
		ce6.ajaxLog(event_types.close_jff_contest_banner);
		// addin cookie
		$.cookie(ce6.cookieControl.name.SHOWJFFBANNER, '1', ce6.cookieControl.oneYearOption); 
		$('#jff-contests-tab-container').remove();
	},
	loadData: function(data, callback) {
		if (self.cachedMoreFeeds > 0){
			$('#' + self.contentContainer).children().show();
			self.cachedMoreFeeds = 0;
			if (!self.hasMoreFeeds)
				$(".load-more-container").remove()
			ce6.feed.removeLastBottomLine();
			ce6.feed.handleTextOverflow();
			if(callback) callback();
			return false;
		}
		$("#load-more-button").fadeTo('fast', 0.5);
		self.onLoadDataComplete = callback; 
		if (data) {
			self.appendCall(data);
		} else {
			if (self.loadDataXhr) self.loadDataXhr.abort();
			self.loadDataXhr = self.serverCall();
		}
		return false;
	},
	loadActivitiesFromServer : function() {
		return ce6.ajaxJsonGet('/home/load_activities', 
			{
				'page_no': self.nextPage,
				'page_size':self.feedsBeforeAgg
			}, 
			self.appendCall
		);
	},
	loadContestsFromServer : function() {
		return ce6.ajaxJson('/home/load_contests', 
			{
				'page_no': self.nextPage,
				'page_size':self.pageSize,
				'sort_key':self.contestsSortBy,
				'desc': self.sortOrder == 'desc' ? 1 : 0,
				'category' : self.category,
				'show_ended' : self.showEndedContests ? 1 : 0
			}, 
			self.appendCall
		);
	},
	appendActivities : function(result) {
		var container = self.contentContainer;
		feedData = result['feeds'];
		if (feedData.length - self.pageSize > ce6.home.inaccuracyThrshd){
			self.cachedMoreFeeds = feedData.length - ce6.home.pageSize;
			ce6.feed.renderFeed(feedData, container, self.pageSize);
		}
		else
			ce6.feed.renderFeed(feedData, container);
		self.hasMoreFeeds = result.has_more_feeds;
		if (self.nextPage == 0 && result['feeds'].length == 0) {
			ce6.feed.appendEmptyHint(result['empty_message'], container);
		}
		self.nextPage += 1;
		self.onAppendData();
    },
	appendContests : function(result) {
		var container = self.contentContainer;
		feedData = result['feeds'];
		activeContests = [];
		endedContests = [];
		$.each(feedData, function(idx, val) {
			if (val[0].contest.time_ending_left > 0)
				activeContests.push(val);
			else
				endedContests.push(val);
		});
		if (self.nextPage == 0 && activeContests.length == 0) {
			ce6.feed.appendEmptyHint(result['empty_message'], container);
		}
		ce6.feed.renderFeed(activeContests, container);
		if (endedContests.length > 0 && $('.ended-contest-divider').length == 0)
			self.appendEndedContestsDivider(container);
		ce6.feed.renderFeed(endedContests, container);
		self.removeFeedBottomLineAboveDivider();
		self.hasMoreFeeds = result.has_more_feeds;
		self.nextPage = result.next_page;
		self.showEndedContests = result.show_ended;

		self.onAppendData();
	},
	onAppendData : function(result) {
	    $(".load-more-container").remove();
		$('.left-preloader-bar').hide();
		if (self.cachedMoreFeeds > 0 || self.hasMoreFeeds)
			ce6.feed.appendLoadmoreButton(self.contentContainer);
		$("#load-more-button").bind('click', function() {
			self.loadData();
		});
		$('span.timeago').timeago();
		ce6.user.hookFeedUser();
		self.bindAuthDlg();
		//setup verified badge funciton
		if (self.onLoadDataComplete) {
			self.onLoadDataComplete();
			self.onLoadDataComplete = null;
		}
		self.loadDataXhr = null;
    },
	appendEndedContestsDivider : function(container) {
		$('#'+container).append("<div class='horizontal-divider ended-contest-divider'><span>ENDED CONTESTS</span></div>");
	},
	removeFeedBottomLineAboveDivider : function() {
		$('.horizontal-divider').prev().removeClass('feed-bottom-line').addClass('feed-non-bottom-line');
    },
	bindAuthDlg: function(){
		$('.sign-in-link').click(this.signIn);
		$('.sign-up-link').click(this.signUp);
	},
	signIn: function(){
		ce6.authDialog.open(null, null, 1);
	},
	signUp: function(){
		ce6.authDialog.open(null, null, 0);
	},
	// checkCookieTask:function() {
	// 	var cookieCtrl = ce6.cookieControl;
	// 	if($.cookie('showerror')){
	// 		var msg = $.cookie('showerror');
	// 		ce6.cookieControl.delCookie('showerror');
	// 		///$.cookie('showerror', '');
	// 		ce6.notifyBar(msg, 'error');
	// 	}else if($.cookie(cookieCtrl.name.SHOWCONGRATULATION)){
	// 		//delete control cookie
	// 		cookieCtrl.delCookie(cookieCtrl.name.SHOWCONGRATULATION);
	// 		ce6.notifyBar('Congratulations! You\'re now a member of Prizes.org! Start voting, submitting or creating your own contests!', 'success');
	// 	}
	// },
	onClickInviteFriend: function() {
		if(viewer_logged_in) {
			window.location = '/invite';
		} else {
			ce6.authDialog.open(function() {
				window.location = '/invite';
			}, null, 'auto', 'Sign in to win $100!');
		}
	},
	onClickVerifyAccount: function() {
		if(viewer_logged_in) {
			window.location = '/profile';
		} else {
			ce6.authDialog.open(function() {
				window.location = '/profile';
			}, null, 'auto', 'Sign in to win $100!');
		}
	},
	logPageView:function() {
		ce6.ajaxJsonPost('/home/log_page_view', {
			'tab': self.tab,
			'category' : self.category
		});
	},
		isPageReady: function() {
				return self.pageLoaded;
			}
};
return self;})();
