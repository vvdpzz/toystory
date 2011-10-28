ce6.feed = (function(){
var self = {
	init: function(){
		self.registerEllipsisHandler();
	},
	hookShowmoreLink: function(){
		$('.submission-area .show-more').click(
			function(){
				$(this).siblings('.submission-area .submission').show();
				ce6.feed.handleTextOverflow();
				$(this).hide();
				return false;
			}
		);
		$('.followed-user-container .show-more').click(
			function(){
				$(this).siblings('.followed-user-container .followed-user-feed').show();
				ce6.feed.handleTextOverflow();
				$(this).hide();
				return false;
			}
		);
		$('.followed-tag-container').each(function(){
				var pTop = $(this).offset().top;
				var cTop = $(this).children('.followed-tag-feed:last').offset().top;
				if (cTop < pTop + 75)
					$(this).next('.selector-more-tag').hide();
			});
		$('.actor-area-tags').each(function(){
				var pLeft = $(this).offset().left;
				var pTop = $(this).offset().top;
				var childrenTag = $(this).children('.tagged-as-block');
				for (var i=0; i<childrenTag.length; i++){
					var cRight = $(childrenTag[i]).offset().left + $(childrenTag[i]).width();
					var cTop = $(childrenTag[i]).offset().top;
					if (cTop > pTop + 20 && cRight > pLeft + 380){
						$(childrenTag[i]).hide();
						$(childrenTag[i]).nextAll('.tagged-as-block').hide();
						$(childrenTag[i]).nextAll('.timestamp').before("<span class='action-words'> and more</span>")
					}
				}
			});
		$('.selector-more-tag.show-more:visible').click(
			function(){
				$(this).siblings('.followed-tag-container').css({'max-height': '1000px','margin-bottom': '8px'});
				$(this).hide();
				return false
			}
		);
	},
	hookFollowContest: function(){
		$('.feed-body a.contest-follow').click(
			function(){
				var elem = $(this);
				if (elem.data('disabled')) return false;
				elem.data('disabled', true);
				if (elem.attr('followed') == '1') {
					elem.text('Follow').addClass('blue').removeClass('gray').attr('followed', '0');
					ce6.user.unfollowContest(elem.attr('cid'), function(){
						elem.data('disabled', false);
					});
				} else {
					if (viewer_logged_in)
						elem.text('Unfollow').addClass('gray').removeClass('blue').attr('followed', '1');
					ce6.user.followContest(elem.attr('cid'), 
						function(data){
							if (data.rc) elem.text('Follow').addClass('blue').removeClass('gray').attr('followed', '0');
							elem.data('disabled', false);
						}, 
						function(){
							elem.data('disabled', false);
						});
				}
				return false;
			}
		);
    },
	handleTextOverflow: function(){
		$('.entry-submitted-row').each(function() {
			var entryDesc = $(this).find('.preview-text, .preview-text-withthumb');
			var seeMore = {ellipsisHtml: "...<a class='see-more'>more</a>"};
			ce6.feed.addToEllipsisQueue(entryDesc, seeMore);
			$(this).find('.entry-img-container img').load(function() {
				entryDesc.data('ellipsisExecuted', false);
				ce6.feed.addToEllipsisQueue(entryDesc, seeMore);
			});
		});
		$('.contest-preview').each(function() {
			var contestDesc = $(this).find('.ellipsis');
			var seeMore = {ellipsisHtml:  "...<a class='see-more' href='" + contestDesc.attr('url') + "'>more</a>"};
			ce6.feed.addToEllipsisQueue(contestDesc, seeMore);
			$(this).find('.img-container img').load(function() {
				contestDesc.data('ellipsisExecuted', false);
				ce6.feed.addToEllipsisQueue(contestDesc, seeMore);
			});
		});
		$('.ellipsis.singleline').each(function() {
			ce6.feed.addToEllipsisQueue($(this), {force: true});
		});
	},
	addToEllipsisQueue : function(elem, option) {
		if (!elem || elem.length == 0) return;
		var top = elem.offset().top;
		if (top < self.visibleOffset) {
			elem.ellipsis(option);
		} else {
			self.ellipsisQueue.push({elem: elem, top: top, option: option});
		}
	},
	forceEllipsis: function(domId) {
		$('.contest-preview').each(function() {
			var contestDesc = $(this).find('.ellipsis');
			contestDesc.data('ellipsisExecuted', false);
			var seeMore = {ellipsisHtml:  "...<a class='see-more' href='" + contestDesc.attr('url') + "'>more</a>"};
			ce6.feed.addToEllipsisQueue(contestDesc, seeMore);
			$(this).find('.img-container img').load(function() {
				contestDesc.data('ellipsisExecuted', false);
				ce6.feed.addToEllipsisQueue(contestDesc, seeMore);
			});
		});
	},
	registerEllipsisHandler : function() {
		self.visibleOffset = $(document).scrollTop() + $(window).height();
		self.ellipsisQueue = [];
		var onChange = function() {
			self.visibleOffset = $(document).scrollTop() + $(window).height();
			var items = $.grep(self.ellipsisQueue, function(item) {
				return item.top < self.visibleOffset;
			})
			$.each(items, function() {
				this.elem.ellipsis(this.option);
			});
			self.ellipsisQueue = $.grep(self.ellipsisQueue, function(item) {
				return item.top < self.visibleOffset;
			}, true);
		}
		$(window).scroll(onChange);
		$(window).resize(onChange);
	},
	removeLastBottomLine: function(){
		$(".feed-non-bottom-line").removeClass('feed-non-bottom-line').addClass('feed-bottom-line');
		$(".home-feed:visible:last").removeClass('feed-bottom-line').addClass('feed-non-bottom-line');
	},
	appendLoadmoreButton: function(divId){
		$("<div class='load-more-container'><button id='load-more-button' class='button lightgray'>More </button></div>").appendTo('#'+divId);
	},
	appendLoadmoreButtonNoId: function(divId){
		$("<div class='load-more-container'><button class='load-more-button button lightgray'>More</button></div>").appendTo('#'+divId);
	},
	appendEmptyHint: function(msg, divId){
		$("<div class='empty-feed-container'>" + msg + "</div>").appendTo('#'+divId);
	},
	renderFeed: function(feedData, divId, cachedStartIndex, needFollow) {
		//currently needFollow.vote and needFollow.submit will be used
		//null passed as default value would be treated as true in this 2 funcs
		//this is caused by differnt requirements in Profile and Home page
		needFollow = needFollow == null ? {} : needFollow;
		currentContestTkn = '';
		consecutiveNum = 0;
		for (var key=0; key<feedData.length; key++){
			d = feedData[key];
			switch (d[0]['type']){
				case FEED_ITEM_TYPE.CONTEST_CREATED:
					translatedData = ce6.feedTranslate.contestCreatedFeed(d);
					if (surface && surface == 'user.profile')
						templateName = ce6.getCompiledTemplate.createdFeedProfile();
					else
						templateName = ce6.getCompiledTemplate.createdFollowContestFeed();
					break;
				case FEED_ITEM_TYPE.FOLLOW_CONTEST:
					translatedData = ce6.feedTranslate.followContestFeed(d);
					templateName = ce6.getCompiledTemplate.createdFollowContestFeed();
					break;
				case FEED_ITEM_TYPE.ENTRY_SUBMITTED:
					translatedData = ce6.feedTranslate.entrySubmittedFeed(d, needFollow.submit);
					if (surface && surface == 'user.profile')
						templateName = ce6.getCompiledTemplate.submittedFeedProfile();
					else
						templateName = ce6.getCompiledTemplate.submittedVotedWonFeed();
					break;
				case FEED_ITEM_TYPE.VOTE:
					translatedData = ce6.feedTranslate.votedFeed(d, needFollow.vote);
					templateName = ce6.getCompiledTemplate.submittedVotedWonFeed();
					break;
				case FEED_ITEM_TYPE.HONORABLE_MENTION:
					translatedData = ce6.feedTranslate.honorableMentionFeed(d);
					if (surface && surface == 'user.profile')
						templateName = ce6.getCompiledTemplate.honorableMentionProfile();
					else
						templateName = ce6.getCompiledTemplate.submittedVotedWonFeed();
					break;
				case FEED_ITEM_TYPE.PICK_WINNER:
					translatedData = ce6.feedTranslate.pickWinnerFeed(d);
					if (surface && surface == 'user.profile')
						templateName = ce6.getCompiledTemplate.wonFeedProfile();
					else
						templateName = ce6.getCompiledTemplate.submittedVotedWonFeed();
					break;
				case FEED_ITEM_TYPE.FOLLOW_USER:
					translatedData = ce6.feedTranslate.followUserFeed(d);
					templateName = ce6.getCompiledTemplate.followUserFeed();
					break;
				case FEED_ITEM_TYPE.FOLLOW_TAG:
					translatedData = ce6.feedTranslate.followTagFeed(d);
					templateName = ce6.getCompiledTemplate.followTagFeed();
					break;
				case FEED_ITEM_TYPE.TAGGED_AS:
					translatedData = ce6.feedTranslate.taggedAsFeed(d);
					templateName = ce6.getCompiledTemplate.taggedAsFeed();
					break;
				default:
					continue;

			}

			var feedHtml = $.tmpl( templateName, translatedData )
			if (feedData[key][0].contest && feedData[key][0].contest.token == currentContestTkn){
				feedHtml.attr('feed-cid', currentContestTkn);
				consecutiveNum += 1;
			}
			else{
				if (consecutiveNum >= 3){
					selectorStr = '[feed-cid='+currentContestTkn+']';
					$(selectorStr).not(selectorStr+':first').hide();
					$(selectorStr+':first').removeClass('feed-bottom-line');
					feedsUnfoldLink = $('<div target-id="'+currentContestTkn+'" class="feed-bottom-line show-more left-align more-contest-feed"><a>More on this contest</a></div>');
					feedsUnfoldLink.appendTo('#'+divId);
					$('[target-id='+currentContestTkn+']').live('click', 
							function(){
								selectorStr = '[feed-cid='+$(this).attr('target-id')+']';
								$(selectorStr).not(selectorStr+':first').show();
								$(selectorStr+':first').addClass('feed-bottom-line');
								$(this).slideUp();
							}
						);
				}
				if (!feedData[key][0].contest){
					currentContestTkn = '';
				}
				else{
					currentContestTkn = feedData[key][0].contest ? feedData[key][0].contest.token : '';
					feedHtml.attr('feed-cid', currentContestTkn);
				}
				consecutiveNum = 1;
			}
			var feedType = feedData[key][0]['type'] || -1;
			if ( feedType == FEED_ITEM_TYPE.ENTRY_SUBMITTED && $('div.home-feed[feed-cid='+currentContestTkn+'][feed-type='+feedType+']:visible').length > 0){
				continue;
			}
			feedHtml.attr('feed-type', feedData[key][0]['type'].toString());
			if (cachedStartIndex && key >= cachedStartIndex)
				feedHtml.hide();
			feedHtml.appendTo("#"+divId);
		}
		this.removeLastBottomLine();
		this.handleTextOverflow();
		this.hookShowmoreLink();
		this.hookFollowContest();
	}
};
return self;})();