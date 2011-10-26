var switchTo5x=true;//shareThis used this variable

ce6.show = {
	nextPage : 0,
	pageSize : 10,
	charLimit: {
		title: 75,
		contest: 4000,
		comment: 1000,
		entry:  6000
	},
	addBR: function(content) {
		return content.replace(/\n/g, "<br>");
	},
	removeBR: function(content) {
		return content.replace(/<br>/g, "\n");
	},
	wordLeft: function(content, element) {
		if (element == "comment") {
			result = ce6.show.charLimit.comment - content.length;
		} else if (element == "contest") {
			tx = content.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ');
			tx = $.trim(tx);
			result = ce6.show.charLimit.contest - tx.length;
			result = result - ce6.editor.getContentImgSrc().length;
		} else if (element == "entry") {
			tx = content.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ');
			tx = $.trim(tx);
			result = ce6.show.charLimit.entry - tx.length;
			result = result - ce6.editor.getContentImgSrc().length;
		} else if (element == "title") {
			result = ce6.show.charLimit.title - content.length;
		} else {
			result = 0;
		}
		return result;
	},
	showCount: function(count, element_id) {
		$('#'+element_id).html(count);
		if (count < 0) {
			$('#'+element_id).removeClass('gray').addClass('red');
		} else {
			$('#'+element_id).removeClass('red').addClass('gray');
		}
	},
	checkTitleCount: function(content) {
		count = ce6.show.wordLeft(content, 'title');
		ce6.show.showCount(count, "title-edit-count");
		return count;
	},
	checkContestCount: function(content) {
		count = ce6.show.wordLeft(content, 'contest');
		ce6.show.showCount(count, "contest-edit-count");
		return count;
	},
	checkEntryCount: function(content) {
		count = ce6.show.wordLeft(content, 'entry');
		ce6.show.showCount(count, "entry-edit-count");
		return count;
	},
	checkEntryDlgCount: function(content) {
		// disable the feature now, but might enable
		count = ce6.show.wordLeft(content, 'entry');
		ce6.show.showCount(count, "entry-dlg-count");
		return count;
	},
	init: function() {
		ce6.ajaxLink.start(ce6.show.onUrlChange);

		this.countdown();	
		/*
		 *Initialize UI
		 */
		if (ce6.show.tinymce_type == "submitter") {
			ce6.editor.newEditorInstance('entry-content', {maxHeight: 273});
		} else if (ce6.show.tinymce_type == "creator") {
			ce6.editor.newEditorInstance('contest-edit-content', {maxHeight: 259});
			$('.nicEdit-main').live('keyup', function(e){
				var tx = ce6.editor.currentEditorInstance().getContent();
				ce6.show.checkContestCount($.trim(tx));
			});
		}
		$('#nav-create-contest').click(this.checkBeforeCreateContest);

		$('#onboarding-dlg').dialog(this.onboardingDialog).restyleButtons();
		$('#dlg-new-entry').dialog(this.newEntryDialog).restyleButtons();
		$('#dlg-new-entry-save').dialog(this.newEntrySaveDialog).restyleButtons();
		$('#dlg-get-widget').dialog(this.widgetDialog).tabs().restyleButtons();

		$('#dlg-pick-winner').dialog(this.pickWinnerDialog).restyleButtons();
		$('#dlg-category').dialog(ce6.show.category.categoryDlg).restyleButtons();
		$('#dlg-eliminate').dialog(ce6.show.flag.eliminateDlg).restyleButtons();
		

		/*
		 *Binding Events
		 */

		/* widget code dialog */
		$('#widget-width').change(ce6.widget.onSettingsChanged);
		$('#widget-max-entries').change(ce6.widget.onSettingsChanged);
		$('#widget-title').change(ce6.widget.onSettingsChanged);
		$('#widget-hide-title').change(function(e) {
			$('#widget-title').prop('disabled', $(e.target).prop('checked'));
			ce6.widget.onSettingsChanged(e);
		});
		$('.widget-colors').miniColors({
			change: function(hex, rgb) {
				ce6.widget.onThemeChanged();
			}
		});
		ce6.widget.onSettingsChanged(null, false);
		/* end widget code dialog */

		// click event for static element
		$('#follow-contest-link').click(ce6.show.toggleFollowContest);
		$('#report-link').click(function(){
			ce6.reportDialog.open({type:'report', cid:ce6.show.contestToken});
			return false;
		});

		$('button#share-contest').click(this.shareContest);
		$('#share-button-email').click(this.shareButtonEmailClicked);
		$('#referral-button-email').click(this.referralButtonEmailClicked);
		$('.refer-now-box').click(this.referContest);
		$('.referral-text').hover(
			function(){$('#referral-tips').show();},
			function(){$('#referral-tips').hide();}
		);

		// set tooltip for favorite and eliminate hint
		setToolTip('.fav-symbol span', {
			text: 'The contest creator has chosen this entry a favorite.', 
			position: 'bottom', 
			distance: 8,
			containerStyle: {width: '200px'}
		});
		setToolTip('.eli-symbol span', {
			text: 'The contest creator has eliminated this entry.', 
			position: 'bottom', 
			distance: 8,
			containerStyle: {width: '200px'}
		});

		$('#grab-widget').click(this.openWidgetDialog);
		$('#widget-src').click(function(){
			$(this).focus().select();
		});

		$('#enter-submission-button').click(this.enterSubmission);
		
		// edit title
		$('#title-edit-container').hide();
		$('#title-edit-link').click(ce6.show.updateContest.onTitleEdit);

		// edit contest
		$('#contest-edit-container').hide();
		$('#contest-edit-link').click(ce6.show.updateContest.onEdit);

		// end it now
		$('#end-now-link').click(ce6.show.endItNow);
		setToolTip('span.end-now-tip', {
			text: 'If you\'ve already decided on the winner, you may end the contest now and get the copyright of the winning entry!', 
			position: 'bottom', 
			distance: 8,
			containerStyle: {width: '200px'}
		});
		// edit rules
		$('#rules-edit-link').click(ce6.show.updateRules.onEdit);

		// bind button clicks for dynamic-loaded content
		$('button.vote-up').live('click', this.vote);
		$('button.pick-winner').live('click', this.selectWinner);

		// add follow user function
		$('a.follow, a.unfollow').click(ce6.user.setRelation);

		// add send msg function
		$('a.send-msg').click(ce6.user.sendPrivateMessage);

		// extend contest event
		$('#contestended-extend').click(ce6.show.onExtendContest);
		$('#home-link').click(ce6.show.onHomeLink);
		$('.help-link').click(ce6.show.onHelpLink);

		// bind flag link
		$('a.entry-flag').live('click', ce6.show.flag.onClickFlag);
		$('a.entry-star').live('click', ce6.show.flag.onClickStar);
		$('a.entry-eliminate').live('click', ce6.show.flag.onClickEliminate);
		$('a.entry-share').live('click', ce6.show.flag.onClickShare);
		$('a.entry-more-voter').live('click', ce6.show.voter.onClickMoreVoter);
		$('#dlg-more-voter a.close').live('click', ce6.show.voter.closeMoreVoter);
		$('button.follow').live('click', ce6.show.voter.follow);
		$('button.unfollow').live('click', ce6.show.voter.unfollow);
		$('#btn-flag-improve').live('click', ce6.show.flag.flagShowInput);
		$('#btn-flag-inappropriate').live('click', ce6.show.flag.flagShowInput);
		$('#btn-flag-duplicate').live('click', ce6.show.flag.flagShowInput);
		$('#btn-flag-spam').live('click', ce6.show.flag.flagShowInput);
		$('button.btn-entry-flag-confirm').live('click', ce6.show.flag.setFlagged);
		$('button.btn-entry-flag-cancel').live('click', ce6.show.flag.hideDlg);
		$('.selector-adm-del').live('click',
			function(){
				s = prompt('Delete the entry and send email, type "A" for type A email and type flagged reason for type B email', 'A');
				s = s === null ? '' : s.toLowerCase();
				if ( s.length > 0 ){
					ce6.ajaxJson('/show/admin_delete_entry',
						{
							eid: $(this).parents('[token]').attr('token'),
							type: s == 'a' ? 'a' : 'b',
							reason: s == 'a' ? '' : s
						},
						function(result){ce6.showNotify(result);setTimeout(window.location.reload(), 2000);});
				}
				return false;
			}
		);

		// bind pick winner 
		ce6.show.pickWinnerPanel.bindClickEvent();

		//scroll bind
		$(window).scroll(ce6.show.floatVoteBtn);

		$('body').click(ce6.show.flag.hide);

		ce6.show.checkNotifyCookieTask(ce6.show.checkPopupCookieTask());
		ce6.show.loadTutorial();
		ce6.show.comment.expandComment();
		// edit entry
		$('#entry-edit-container').hide();
		ce6.show.entryBindEvents();
	
		if (ce6.show.tinymce_type == "editer") {
			ce6.editor.newEditorInstance('entry-edit-content', {maxHeight: 280});
		}

		ce6.refreshCallouts();

		//logging
		this.logContestViewed();

		//timeago
		$.timeago.settings.allowFuture = true;
		$('span.timeago').timeago();

		// Bind comment events
		ce6.show.comment.bindEvents();

		//category
		$('#new-category-btn').click(ce6.show.category.createCategory);
		$('.category-checkbox-container :radio').bind('change', ce6.show.category.change);
		$('.delete-category-link').click(ce6.show.category.removeCategory);


		setToolTip('.upgraded-badge', {
			text: 'This Just For Fun contest just got upgraded due to its popularity or topic importance. Prizes.org added <span class="prize-number">prize</span> to its cash prize!', 
			position: 'bottom', 
			containerStyle: {width: '300px'},
			beforeShow: function(badge) {
				var prize = badge.parent().find('.detail-prize-num').html();
				if (badge.data('tip')) badge.data('tip').tip.find('.prize-number').html(prize);
			}
		});

		//back to top
		ce6.backToTop.init();
		ce6.show.pageLoaded = true;
		ce6.waitingForReady(ce6.show.isPageReady);

		//share slide
		$('#share-button-email').click(this.contestEmailShare);
		$('#fb-referral-share').click(this.shareFBRefer);
		this.loadShareThisScript();
		this.onResize();
		$(window).resize(this.onResize);

		// share the jff promote dlg
		if (ce6.show.promote_share) {
			ce6.show.jffPromoteShareDlg();
		}

		if(SHARE_CLICKED) {
			ce6.ajaxLog(SHARE_CLICKED, {'contest_id':ce6.show.contestToken});
		}
		// init auto save
		ce6.show.autoSave.init();
		
		setToolTip('.talent-score-badge', {
			text: 'This is Prizes Talent Score. To increase your score, simply participate in contests. The more contests you participate, the higher your score will be!', 
			position: 'bottom', 
			containerStyle: {width: '300px'},
			distance: 10
		});
    },
	onResize: function() {
		var w = $(window).width();
		if (w<=1180) {
			$('#share-buttons-container').removeClass('share-button-area-vertical').addClass('share-button-area-horizontal');
			$('#share-buttons-container span.share-button').css('display', 'inline-block');
			$('#share-buttons-container').css('top', '0').css('left', '0');
		} else {
			var l = (w - 1180)/2 + 10;
			$('#share-buttons-container').removeClass('share-button-area-horizontal').addClass('share-button-area-vertical');
			$('#share-buttons-container span.share-button').css('display', 'block');
			$('#share-buttons-container').css('top', '138px').css('left', l + 'px');

		}
	},
	contestEmailShare: function() {
		var	shareAction = function(){
			ce6.emailShareDialog.open({
				contest_tkn : ce6.show.contestToken,
				type: 'contest'
			});
		};
		if (viewer_logged_in) {
			shareAction();
		}else{
			ce6.authDialog.open(shareAction, null, 'auto', ce6.authDialog.onDemandTitle);
		}
	},
	loadShareThisScript: function() {
		$.getScript('http://w.sharethis.com/button/buttons.js', function(data, textStatus){
			stLight.options({
				publisher:'2db4bf0c-abba-46f8-bd15-bb9dbf786bed'
				});
		});

		(function() {
			var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
			po.src = 'https://apis.google.com/js/plusone.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
			})();
	},

	onUrlChange: function(state) {
		data = state.data;
		var tab = data.tab || 'sort-by-favor';
		ce6.show.sort.changeMethod(tab);
		ce6.show.sort.setOrder(data.order || ce6.show.sort.defaultOrder(tab));
		if (tab == 'sort-by-alpha') {
			ce6.show.sort.changeInitial(data.initial);
		}
		if (data.page) {
			var page = parseInt(data.page);
			ce6.show.pagination.setPageNo(page - 1);
		}
		if (prefetchedEntries) {
			ce6.show.pagination.loadEntries(prefetchedEntries);
			prefetchedEntries = null;
		} else {
			ce6.show.pagination.loadEntries();
		}
	},

	checkBeforeCreateContest: function() {
		if (IS_SUSPENDED == 1){
			ce6.notifyBar(SUSPENDED_MSG, 'error');
			return false;
		}

		return true;
	},

	floatVoteBtn: function(){
		//float pick winner panel
		var pkWinner = $('.win-cand:visible');
		var voteBtnOffset = 0;
		if (pkWinner.length > 0){
			//var upperDiv = $('#contest-pagination-top:visible').length ? 
			//				$('#contest-pagination-top') : ($('#entries-alpha-sort:visible').length ? 
			//						$('#entries-alpha-sort') : $('#entries-sort'));
			
			var upperDiv = $('.contest-bottom-shadow');
			var originalTop = upperDiv.offset().top + upperDiv.outerHeight() - $(window).scrollTop();
			//var originalPosAttr = pkWinner.css('position');
			if (originalTop < 40){
				pkWinner.css({position:'fixed', top:'42px'});
				voteBtnOffset = pkWinner.outerHeight();
			}
			else{
				pkWinner.css({position:'relative', top:'0'});
			}
			//if (originalPosAttr != pkWinner.css('position')){
				ce6.show.pickWinnerPanel.restart();
			//}
		}
		//float vote button
		var allSubmission = $('.submission');
		for (var i=0; i < allSubmission.length; i++){
			var submission = $(allSubmission[i]);
			var top = submission.offset().top - $(window).scrollTop();
			var bottom = submission.offset().top + submission.height() - $(window).scrollTop();
			var voteBtn = submission.children('.entry-votes');
			if (top < (40 + voteBtnOffset)){
				if (bottom > (175 + voteBtnOffset)){
					voteBtn.css({position:'fixed', top:((50 + voteBtnOffset) + 'px')});
				}
				else{
					voteBtn.css({position:'relative', top: submission.height() - 125 < 0 ? 0 : submission.height() - 125 });
				}
			}
			else{
				voteBtn.css({position:'relative', top:'0'});
			}
		}
	},

	endItNow: function(){
		var yesCb = function(){
			ce6.ajaxJson('/contest/end_now', 
				{
					cid: ce6.show.contestToken
				},
				function(data) {
					if (data.rc == 0){
						window.location.reload();
					} else {
						ce6.notifyBar(data.msg, 'error');
					}
				}
			);
		};
		var noCb = function(){
		};
		ce6.confirmDialog('Are you sure that you\'ve decided on the winner and want to end the contest now?', 
			'End Contest Now', yesCb, noCb);
	},

	countdown: function(){
		var s = parseInt($('#time-num3').html(), 10);
		var m = parseInt($('#time-num2').html(), 10);
		var h = parseInt($('#time-num1').html(), 10);
		if (!s && !m && !h){
			ce6.show.timeup();
			return
		}
		countdownIntervalId = setInterval(
				function(){
					var s = parseInt($('#time-num3').html(), 10);
					var m = parseInt($('#time-num2').html(), 10);
					var h = parseInt($('#time-num1').html(), 10);
					if (1 == s && 0 == m && 0 == h){
						clearInterval(countdownIntervalId);
						ce6.show.timeup();
					}
					if ( 0 == s){
						s = 59;
						m = 0 == m ? 59 : m-1;
						h = 59 == m ? h-1 : h;
					}
					else{
						s = s - 1;
					}
					s = s < 10 ? '0'+s:''+s;
					m = m < 10 ? '0'+m:''+m;
					h = h < 10 ? '0'+h:''+h;

					$('#time-num3').html(s);
					$('#time-num2').html(m);
					$('#time-num1').html(h);
				}, 1000);
	},
	logContestViewed : function() {
		ce6.ajaxLog(event_types.contest_viewed, {
			contest_id : this.contestToken,
			creator_sid : this.contestDetail.creatorToken,
			source_link : logging_objs.link_all_contests
		});
    },

	loadTutorial: function() {
		/*
		 *Load tutorial
		 */
		ce6.tutorial.init();
		// onboarding dialog 
		$('#dlg-tutorial-finished').dialog(ce6.show.tutorialFinishedDialog).restyleButtons();
		$('#dlg-tutorial').dialog(ce6.show.tutorialDialog).restyleButtons();
		// onboarding panel click event
		$('button.onboarding-info-signup').click(
			function(){ ce6.authDialog.open(); }
		);
		$('.onboarding-info-tutorial').click(ce6.show.startTutorial);

		//check contest ended and detail_tutored, show Tour Marketplace header tip
		if ($('#enter-submission-button').length && !ce6.show.detailTutored){
			ce6.show.tutorialTopBar();
		}
	},

	entryBindEvents: function() {
		$('#entry-edit-link').click(ce6.show.updateEntry.onEdit);
		$('#entry-withdraw').click(ce6.show.withdraw);
	},
	entryUnBindEvents: function() {
		$('#entry-edit-link').unbind('click');
		$('#entry-withdraw').unbind('click');
		$('#entry-edit-save').unbind('click');
		$('#entry-edit-cancel').unbind('click');
	},
	timeup: function(){
		$('#time-num3').html("00");
		$('#time-num2').html("00");
		$('#time-num1').html("00");
		
	},

	vote: function() {
		if (IS_SUSPENDED==1) {
			ce6.notifyBar(SUSPENDED_MSG, 'error');
			return;
		}
		var cur_btn = $(this);
		var voteAction = function(){
			ce6.ajaxJson('/show/vote_entry', 
				{
				eid: cur_btn.attr('token'),
				cid: ce6.show.contestToken
				},
				function(data) {
					if(data.rc == 0){
						ce6.notifyBar(data.msg, 'success');
						//disable vote button
						cur_btn.removeClass().addClass('vote-disabled').text('Voted');
						var votes = parseInt($('.selector-votes-detail').html(), 10) + 1;
						// update the votes
						token = cur_btn.attr('token');
						votes = data.votes;
						$('#entry-votes-count-'+token).html(votes);
					} else {
						ce6.showNotify(data);
					}
				}
			);
		};
		var voteActionWithReload = function(){
			ce6.ajaxJson('/show/vote_entry', 
				{
				eid: cur_btn.attr('token'),
				cid: ce6.show.contestToken
				},
				function(data) {
					if(data.rc == 0){
						$.cookie(ce6.cookieControl.name.SHOWVOTESUCCESS, data.msg, ce6.cookieControl.shortOption); 
					}else{
						$.cookie(ce6.cookieControl.name.SHOWVOTEFAILURE, data.msg, ce6.cookieControl.shortOption); 
					}
					//reload page
					window.location.reload();
				}
			);
		};

		var ec = new pcookie();
		ec.get(PCOOKIE_NAME, function(val, b) {
			if(val != undefined){
				$.cookie('pcookie_vis_sig', val);
			}else{
				$.cookie('pcookie_vis_sig', '');
				ec.set(PCOOKIE_NAME, '');
			}
			if (viewer_logged_in) {
				voteAction();
			}else{
				ce6.authDialog.open(voteActionWithReload, null, 'auto', ce6.authDialog.onDemandTitle);
			}
		});
	},

	selectWinner: function() {
		if ($(this).data('disabled'))
			return;

		$(this).data('disabled', true);
		var entryToken = $(this).attr('token');
		var entryId = '#entry_' + entryToken;
		var winnerName = $($(entryId + ' .entry-user-name')[0]).html();
		var winnerPic = $(entryId + ' .entry-user-simage img').attr('src');
		ce6.show.pickWinnerPanel.winnerName = winnerName;
		$('.picked-winner-name').html(winnerName);
		$('.picked-winner-img').attr('src', winnerPic);

		$('#dlg-pick-winner').data('eid', entryToken).dialog('open');
		return false;
	},

	withdraw: function() {
		var elem = $(this);	
		if (elem.data('disabled')) return;
		elem.data('disabled', true);	

		var yesCb = function() {
			ce6.ajaxJson('/show/withdraw_entry', 
				{
					eid: elem.attr('token'),
					cid: ce6.show.contestToken
				},
				function(data) {
					if (data.rc == 0){
						ce6.site.reloadWithoutParams(['show_submit_entry']);
					} else {
						ce6.notifyBar(data.msg, 'error');
					}
				}
			);
		};

		var noCb = function() {
			elem.data('disabled', false);	
		};

		ce6.confirmDialog('All votes on your entry will be lost. Are you sure you want to withdraw this entry?', 
			'Withdraw entry', yesCb, noCb);
		return false;
    },

	enterSubmission : function() {
		if (IS_SUSPENDED == 1) {
			ce6.notifyBar(SUSPENDED_MSG, 'error');
		} else if (ce6.show.contestDetail.requireVerified && !viewer.verified && viewer.token) {
			var noCb = function() {
				//nothing
			};
			var yesCb = function() {
				//go to profile
				ce6.site.redirect('profile');
			};

			ce6.confirmDialog('Sorry, the contest creator only allows verified users to participate in this contest.<br>Click <b>YES</b> to get verified.', 
				'Get verified to participate', yesCb, noCb);
		} else {
			//open submission dialog whatever user login or not
			$('#dlg-new-entry').dialog('open');
			$('#dlg-new-entry-error').html("");
			$('#dlg-new-entry-error').hide();
			setTimeout(function(){$('.nicEdit-main')[0].focus();}, 50);
			ce6.show.autoSave.enable = true;
		}
	},

	submitNewEntry : function(cid) {
		if (!ce6.editor.presubmit())
			return false;
		$('#entry-content').val(ce6.editor.getContentWithAutoLink());
		var content = $('#entry-content').val();

		if (!content) {
			$('#entry-content').error('Please input entry content');
			return false;
		} else {
			$('#entry-content').clearError();
		}
		count = ce6.show.wordLeft(content, 'entry');
		if (count<0) {
			count = -count;
			$('#dlg-new-entry-error').html("You've exceeded the character limit. "+count+ " less, please");
			$('#dlg-new-entry-error').show();
			return false;
		} else if (count == ce6.show.charLimit.entry) {
			$('#dlg-new-entry-error').html("Please add your entry.");
			$('#dlg-new-entry-error').show();
			return false;
		} else {
			$('#dlg-new-entry-error').html("");
			$('#dlg-new-entry-error').hide();
		}
		
		$('#dlg-new-entry').disableDlgButtons();

		var submitAction = function(){
			var ec = new pcookie();
			ec.set(PCOOKIE_NAME, $.cookie(VIS_COOKIE_NAME));
			ce6.ajaxJson('/contest/add_entry', $('#add-entry-form').serialize(),
				function(data) {
					if (data.rc == 0){
						$.cookie(ce6.cookieControl.name.SHOWSUBMISSIONSHARE, data.eid, ce6.cookieControl.shortOption); 
						$('#dlg-new-entry').dialog('close');
						ce6.doubleClick.log(ce6.doubleClick.events.submitEntry);
						ce6.mediaPlex.log(ce6.mediaPlex.events.submitEntry);
						window.location.reload();
					}else{
						var msg = data.msg;

						//referrer conflict err
						if(data.referrer){
							msg = ce6.constants.texts.translate(msg, data.referrer); 
							$('.referrer-fullname').text(data.referrer.fullname);
							$('.referrer-firstname').text(data.referrer.firstname);
						}
						ce6.notifyBar(msg, 'error');

						//close the auth dialog if it opened
						ce6.authDialog.close();
						$('#dlg-new-entry').enableDlgButtons();
					}
				},
				function(data) {
					$('#dlg-new-entry').enableDlgButtons();
				}
			);
		};

		if (viewer_logged_in) {
			submitAction();
		}else{
			ce6.authDialog.open(
				submitAction, 
				function(){
					$('#dlg-new-entry').enableDlgButtons();
				}, 
				'auto', ce6.authDialog.onDemandTitle);
		}
	},

	referContest: function() {
		ce6.ajaxLog(event_types.refer_button_clicked, {contest_id:ce6.show.contestToken});
		if(viewer_logged_in){
			$('.referral-buttons').show('fast');
		}else{
			ce6.authDialog.open(
				function(){
					$.cookie(ce6.cookieControl.name.SHOWREFERSHARE, '1', ce6.cookieControl.shortOption); 
					window.location.reload();
				},null, 
				'auto', 'Sign in to start referring friends!');
		}
	},

	shareFBRefer: function() {
		fbFeed.method = 'feed';
		fbFeed.link = referral_fb_link;
		FB.ui(fbFeed, function(response) {})
	},

	openWidgetDialog: function() {
		$('#dlg-get-widget').dialog('open');
	},

	shareContest: function() {
		var shareDialogOpts = {
			type: 'userContest',
			title:ce6.show.contestDetail.title,
			prize:ce6.show.contestDetail.prize,
			url:ce6.show.contestDetail.shortUrl,
			tweetUrl:ce6.show.contestDetail.tweetUrl,
			contestToken:ce6.show.contestToken
		};
		ce6.shareDialog.open(shareDialogOpts);
	},

	onLinkedinShareSuccess: function() {
		if(console){
			console.log('Linkedin Share SUCCESS');
		}
	},

	shareContestByTwitter: function() {
		var selected = $(this).attr('tabindex');
		if (viewer_logged_in){
			ce6.shareFb(selected);
		}else if(!ce6.show.muteFeed){
			var redirect_to = 'http://twitter.com/share?url='+$(this).attr('url')+'&text='+$(this).attr('tweet');
			$.oauthpopup({
				path: redirect_to
				});
		}
	},

	jffPromoteShareDlg: function() {
		var shareDialogOpts = {
			type: 'jff_promote',
			title:ce6.show.contestDetail.title,
			prize:ce6.show.contestDetail.prize,
			url:ce6.show.contestDetail.shortUrl,
			tweetUrl:ce6.show.contestDetail.tweetUrl,
			contestToken:ce6.show.contestToken
		};
		ce6.shareDialog.open(shareDialogOpts);
	},

	checkNotifyCookieTask:function(ignore) {
		var cookieCtrl = ce6.cookieControl;
		if($.cookie(cookieCtrl.name.SHOWFLAGGED)){
			var eid = $.cookie(cookieCtrl.name.SHOWFLAGGED);
			$('.entry-flag[token=' + eid + ']').text('Flagged').addClass('entry-flagged').removeClass('entry-flag');
			cookieCtrl.delCookie(cookieCtrl.name.SHOWFLAGGED);
			ce6.notifyBar('Entry flagged.', 'success');
		}
		if($.cookie(cookieCtrl.name.SHOWCONGRATULATION)){
			//delete control cookie
			cookieCtrl.delCookie(cookieCtrl.name.SHOWCONGRATULATION);
			if(!ignore){ 
				ce6.notifyBar('Congratulations, You\'re now a member of Prizes.org! Start voting, submitting or creating your own contests!', 'success');
			}
		}else if($.cookie(cookieCtrl.name.SHOWEDITCONTESTERROR)) {
			var errorMsg = $.cookie(cookieCtrl.name.SHOWEDITCONTESTERROR)
			cookieCtrl.delCookie(cookieCtrl.name.SHOWEDITCONTESTERROR);
			ce6.notifyBar(errorMsg, 'error');
		}else if($.cookie(cookieCtrl.name.SHOWCONTESTEXTEND)) {
			var successMsg = "Contest extended for 7 days!";
			cookieCtrl.delCookie(cookieCtrl.name.SHOWCONTESTEXTEND);
			ce6.notifyBar(successMsg, 'success');
		}else if($.cookie(cookieCtrl.name.SHOWVOTESUCCESS)) {
			var msg = $.cookie(cookieCtrl.name.SHOWVOTESUCCESS);
			cookieCtrl.delCookie(cookieCtrl.name.SHOWVOTESUCCESS);
			ce6.notifyBar(msg, 'success');
		}else if($.cookie(cookieCtrl.name.SHOWVOTEFAILURE)) {
			var msg = $.cookie(cookieCtrl.name.SHOWVOTEFAILURE);
			cookieCtrl.delCookie(cookieCtrl.name.SHOWVOTEFAILURE);
			ce6.notifyBar(msg, 'error');
		}else if($.cookie(cookieCtrl.name.SHOWPICKWINNER)) {
		}
	},

	checkPopupCookieTask:function() {
		var selected = $('#sns-connect-status [require="0"]').index();
		var shareDialogOpts = {
			contestToken: this.contestToken,
			title:this.contestDetail.title,
			prize:this.contestDetail.prize,
			url:this.contestDetail.shortUrl,
			tweetUrl:this.contestDetail.tweetUrl
		};
		var ignoreOthers = false;
		var cookieCtrl = ce6.cookieControl;
		if($.cookie(cookieCtrl.name.SHOWFBSHARE)){
			//delete control cookie
			cookieCtrl.delCookie(cookieCtrl.name.SHOWFBSHARE);
			shareDialogOpts.close = function (event, ui) {
				ce6.notifyBar("You can show off your contest on your own blog or website. Grab the contest widget code now!", 'success');
				ce6.callouts.displayCallout('get_contest_widget');
			};
			//open share dialog for entry
			if (ce6.show.is_jff) {
				shareDialogOpts.type = 'jff_contest';
				ce6.notifyBar("Your contest has been created! Now select a category to help others find your contest once it's upgraded!", 'success');
			} else {
				shareDialogOpts.type = 'contest';
				ce6.notifyBar("Your contest has been created! Now select a category to help others find your contest!", 'success');
			}
			ce6.show.category.initCategoryDlg(shareDialogOpts);
			
			ignoreOthers = true;
		}else if($.cookie(cookieCtrl.name.SHOWREFERSHARE)){
			//delete control cookie
			cookieCtrl.delCookie(cookieCtrl.name.SHOWREFERSHARE);
			$('.refer-now-box').click();
			ignoreOthers = true;
		}else if($.cookie(cookieCtrl.name.SHOWSUBMISSIONSHARE)){
			var entryToken = $.cookie(ce6.cookieControl.name.SHOWSUBMISSIONSHARE);
			//delete control cookie
			cookieCtrl.delCookie(cookieCtrl.name.SHOWSUBMISSIONSHARE);

			//open share dialog for entry
			if (ce6.show.is_jff) {
				shareDialogOpts.type = 'jff_new_entry';
			} else {
				shareDialogOpts.type = 'new_entry';
			}
			shareDialogOpts.entryToken = entryToken;
			ce6.shareDialog.open(shareDialogOpts);
			if (is_farseer)
				ce6.notifyBar("Entry submitted! Your talent score has increased by <font style='color:white;font-weight:bold;text-shadow:0 1px 2px #333333;'>+5 </font>! Get votes on Facebook and Twitter now!", 'success');
			else
				ce6.notifyBar("Thanks for submitting! Get votes on Facebook or Twitter now!", 'success'); 
			ignoreOthers = true;
		}else if(!viewer_logged_in && $.cookie(cookieCtrl.name.SHOWTUTORIAL) != '1'){
			// disable onboarding for a while
			if ($('#enter-submission-button').length){
				ce6.show.tutorialTopBar();
			}
			return;

			//no submit btn will skip the tutorial
			if ($('#enter-submission-button').length){
				$('#onboarding-dlg').dialog('open');
				ce6.ajaxLog(event_types.onboarding_dialog_impression, {has_start : 1});
			}else{
				$('#onboarding-dlg').dialog("option", 'buttons', 
					{Close:function(){ 
						ce6.logButtonClicked(logging_objs.btn_onboarding_close); 
						$(this).dialog('close');
					}}
				).dialog('open');
				ce6.ajaxLog(event_types.onboarding_dialog_impression, {has_start : 0});
			}
			//add control cookie
			$.cookie(cookieCtrl.name.SHOWTUTORIAL, '1', ce6.cookieControl.oneYearOption); 

		}
		return ignoreOthers;
	 },

	tutorialLayout: {margin: 20, arrowOffset: 50},
	showTutorialDlg: function(x, y, nextStep, dir, textContent){
		var left, top, scroll = 0;
		switch (dir){
			case 'L':
				left = x + ce6.show.tutorialLayout.margin;
				top = y - ce6.show.tutorialLayout.arrowOffset;
				$('#arrow-tutorial').attr('class', 'pointy-arrow pointy-arrow-left');
				break;
			case 'R':
				left = x - 320 - ce6.show.tutorialLayout.margin;
				top = y - ce6.show.tutorialLayout.arrowOffset;
				$('#arrow-tutorial').attr('class', 'pointy-arrow pointy-arrow-right');
				break;
			case 'U':
				left = x - ce6.show.tutorialLayout.arrowOffset;
				top = y + ce6.show.tutorialLayout.margin;
				$('#arrow-tutorial').attr('class', 'pointy-arrow pointy-arrow-top');
				break;
			default:
				left = x + ce6.show.tutorialLayout.margin;
				top = y - ce6.show.tutorialLayout.arrowOffset;
				break;
		}
		if (top + 200 > $(window).height() + $(window).scrollTop()){
			var scroll = (y - $(window).height() + 300) < ($(document).height()-$(window).height()) ?  (y - ($(window).height() - 300)) : ($(document).height()-$(window).height());
			$(window).scrollTop(scroll);
			top = top - scroll;
		}
		else if(top < 0) {
			var prominent_offset = $(window).height() / 3 < ($(window).scrollTop()+y) ? $(window).height() / 3 : ($(window).scrollTop()+y); 
			var scroll = y - prominent_offset;
			$(window).scrollTop(scroll);
			top = top - scroll;
		}
		$('#ctt-tutorial').html("<strong>"+textContent.title+"</strong>"+ 
					"<p>" + 
						textContent.content.replace('$X', '$'+ce6.show.contestDetail.prize) + 
					"</p>");
		$('#dlg-tutorial').dialog({position: [left, top]});
		var dialog_buttons = {};
		dialog_buttons[textContent.button] = function(){
				$(window).scrollTop(0);
				$(this).dialog("close");
				ce6.show.tutorialStep(nextStep);	
		};
		$('#dlg-tutorial').dialog(
				{buttons: dialog_buttons}
			).restyleButtons();
		$('#dlg-tutorial').dialog('open');
	},
	startTutorial : function(){
		/* init some contest and user data in js */
		ce6.show.promptSignUp = !viewer_logged_in;
		
		var stepsHtml = ce6.tutorial.generateStepsHtml(['Learn', 'Enter', 'Vote', 'Referral', 'Follow', 'More']);
		ce6.headerTip('How to win $$$', $('#page-container'), false, stepsHtml);
		if (!viewer_logged_in){
			$(".onboarding-info-panel").hide();
		}
		ce6.tutorial.setTutorialConfig(ce6.tutorial.detailTutorial);
		ce6.ajaxLog(event_types.tour_started);
		ce6.show.tutorialStep(0);
		$('#sample-entry-container').show();
		$('.callout-bg').hide();
	},
	tutorialStep : function(step){
		ce6.resetOpacity();
		$('#dlg-tutorial').dialog('close');
		
		var tutorialConfig = ce6.tutorial.getDisplayConfig(step);
		if (!tutorialConfig){
			$('#sample-entry-container').hide();
			ce6.closeHeaderTip();
			ce6.ajaxLog(event_types.tour_finished,
				{step_id_on_finish : ce6.show.tutorialStepId});
			return;
		}
		if (tutorialConfig.finishedCb){
			$('#sample-entry-container').hide();
			ce6.closeHeaderTip();
			tutorialConfig.finishedCb(null);
			var index = (ce6.show.contestDetail.numEntries ? 0 : 2) + (ce6.show.promptSignUp ? 0 : 1);
			var detailTutorialFinishedConfig = ce6.tutorial.detailTutorialFinished[index];
			$('#ctt-tutorial-finished').html(
				detailTutorialFinishedConfig.content.replace('$X', '$'+ce6.show.contestDetail.prize)
			);
			$('#dlg-tutorial-finished').dialog({title: detailTutorialFinishedConfig.title, buttons: detailTutorialFinishedConfig.buttons}).restyleButtons();
			$('#dlg-tutorial-finished').dialog('open');
			ce6.ajaxLog(event_types.tour_finished,
				{step_id_on_finish : ce6.show.tutorialStepId});
			return;
		}
		ce6.tutorial.goNextStep(step);
		fakeDiv = {offset: function(){return {left:0, top:tutorialConfig.rootDiv.offset().top - 10}}};
		ce6.setOpacityOutsideDiv(tutorialConfig.lightDivSet, fakeDiv, $(document).height(), $(document).width());
		ce6.show.showTutorialDlg(tutorialConfig.pointX, tutorialConfig.pointY, step+1, tutorialConfig.dir, tutorialConfig.textContent);
		ce6.show.tutorialStepId = step;
		ce6.ajaxLog(event_types.tour_step_completed,
			{step_id : step});
		return;
	},

	logShareDialogClick : function(isShare) {
		ce6.ajaxLog(event_types.fb_dialog_button_clicked, {
			confirm_share : (isShare ? 1 : 2),
			page_id : pageId
		});
	},

	toggleFollowContest: function() {
		var elem = $(this);
		if (elem.data('disabled')) return;
		elem.data('disabled', true);
		if (elem.hasClass('unfollow-contest')) {
			elem.text('Follow Contest').addClass('follow-contest').removeClass('unfollow-contest');
			ce6.user.unfollowContest(ce6.show.contestToken, function(){
				elem.data('disabled', false);
			});
		} else {
			if (viewer_logged_in)
				elem.text('Unfollow Contest').addClass('unfollow-contest').removeClass('follow-contest');
			ce6.user.followContest(ce6.show.contestToken, 
				function(data){
					if (data.rc) elem.text('Follow Contest').addClass('follow-contest').removeClass('unfollow-contest');
					elem.data('disabled', false);
				},
				function(){
					elem.data('disabled', false);
				});
		}
    },

	onHomeLink: function() {
		ce6.site.redirect('home');
	},

	onHelpLink: function() {
		ce6.reportDialog.open({type:'support', cid:ce6.show.contestToken});
		return false
	},

	onExtendContest: function() {
		params = {
			cid: ce6.show.contestToken
		}
		ce6.ajaxJson('/show/extend_contest',
			params,
			function(data) {
				if (data.rc == 0){
					$.cookie(ce6.cookieControl.name.SHOWCONTESTEXTEND, params.cid, ce6.cookieControl.shortOption);
					window.location.reload();
				}
				else{
					ce6.notifyBar(data.msg, 'error');
				}
			}
		);
	},

	isPageReady: function() {
		return self.pageLoaded && ce6.contest_widget.loadCompleted();
	 }
};

ce6.show.newEntryDialog = {
	autoOpen: false,
	modal: true,
	width: 650,
	height: 'auto',
	resizable: false,
	title: 'Your Contest Entry',
	dialogClass: 'no-opacity-disabled', 
	buttons: {
		Discard: function() {
			$(this).dialog('close');
			if (viewer_logged_in) {
				ce6.show.autoSave.enable = false;
				$('#dlg-new-entry-save').dialog('open');
			}
		},
		Submit: function() {
			ce6.show.autoSave.enable = false;
			ce6.show.submitNewEntry();
		}
	},
	open: function() {
		// fix the stupid default button focus issue
		$('.ui-dialog-buttonpane :tabbable').blur().removeClass('ui-state-focus');
		var content = $('#entry-content').val();
		if (!content) {
			content = "";
		}
	//	ce6.show.checkEntryDlgCount(content);
	},
	close: function() {
	}
};

ce6.show.newEntrySaveDialog = {
	autoOpen: false,
	modal: true,
	width: 350,
	height: 'auto',
	resizable: false,
	title: 'Are you sure?',
	buttons: {
		'Yes, discard': function() {
			$(this).dialog('close');
			$('.nicEdit-main').html('');
			ce6.show.autoSave.discard();
		},
		'No, keep the draft': function() {
			$(this).dialog('close');
			var content = ce6.editor.getContentWithAutoLink();
			ce6.show.autoSave.save(content);
		}
	}
};

ce6.show.onboardingDialog = {
	autoOpen: false,
	modal: true,
	width: 942,
	height: 530,
	resizable: false,
	dialogClass: 'dialog-without-title',
	buttons: {
		Close: function() {
			$(this).dialog('close');
			ce6.show.tutorialTopBar();
			ce6.logButtonClicked(logging_objs.btn_onboarding_close); 
		},
		'Take a quick tour!': function() {
			$(this).dialog('close');
			ce6.show.startTutorial();
			ce6.logButtonClicked(logging_objs.btn_onboarding_start); 
		}
	}
};

ce6.show.tutorialTopBar = function() {
	ce6.headerTip("Get started!",
			$('#page-container'),
			true,
			"<div class='bar-divider'></div><div class='bar-message'>Learn how to create, enter & vote on awesome contests for a chance to win real cash prizes!</div><button class='onboarding-info-signup header-tip-button' onclick='ce6.show.startTutorial(); return false;'>Start Tutorial</button>",
			'ce6.tutorial.closeDetailTutorial');
};

ce6.show.widgetDialog = {
	autoOpen: false,
	modal: true,
	dialogClass: 'dialog-with-cross',
	width: 550,
	height: 'auto',
	title: 'Contest Widget',
	buttons: {
		Done: function() {
			$(this).dialog('close');
		}
	}
}

ce6.show.pickWinnerDialog = {
	autoOpen: false,
	open: ce6.dlgOpenDefault,
	modal: true,
	width: 360,
	resizable: false,
	title: 'Pick Winner',
	buttons: {
		Cancel: function() {
			$(this).dialog('close');
			var eid = $(this).data('eid');
			var entryId = '#entry_' + eid;
			$(entryId + ' .pick-winner-sel').data('disabled', false);
		},
		'Pick as winner': function() {
			$('#dlg-pick-winner').disableDlgButtons();
			var params = {
				eid: $(this).data('eid'),
				cid: ce6.show.contestToken,
				ask_delivery: 0
			};
			ce6.ajaxJson('/show/select_winner', 
				params,
				function(data) {
					if (data.rc == 0){
						$('#dlg-pick-winner').dialog('close');
						if (!data.is_jff) {
							$.cookie(ce6.cookieControl.name.SHOWPICKWINNER, params.eid, ce6.cookieControl.shortOption); 
						}
						ce6.show.pickWinnerPanel.winnerEntryTkn = params.eid;
						ce6.show.pickWinnerPanel.pickWinnerCb();
						//window.location = data.contest_url;
					}
					else{
						ce6.notifyBar(data.msg, 'error');
						$('#dlg-pick-winner').dialog('close');
						$('#dlg-pick-winner').enableDlgButtons();
						var entryId = '#entry_' + params.eid;
						$(entryId + ' .pick-winner').data('disabled', false);
					}
				}
			);
		}
	}
};

ce6.show.tutorialFinishedDialog = {
	autoOpen: false,
	modal: true,
	width: 310,
	resizable: false,
	title: 'Tutorial Title',
	buttons: {
		Next: function() {
			$(this).dialog('close');
		}
	}
};

ce6.show.tutorialDialog = {
	autoOpen: false,
	modal: false,
	width: 310,
	resizable: false,
	closeOnEscape: false,
	title: 'Tutorial Title',
	buttons: {
		Next: function() {
			$(this).dialog('close');
		}
	},
	open: function(){
		$('.ui-dialog').css({overflow: 'visible'});
		$('.ui-dialog-titlebar').hide();
		$('.ui-dialog-buttonpane').addClass('tutorial-cust-dlgfooter');
		if (!$.browser.msie)
			//$('.ui-dialog').css({border:'8px solid',
			//					 'border-color': '#909090',
			//					 overflow: 'visible'});
			$('.ui-dialog').css({overflow: 'visible'});
		else{
			$('.ui-dialog').css('background', '');
			$('.ui-dialog').css('background-color', '#909090');
		}
	},
	beforeClose: function(){
		$('.ui-dialog').css({overflow: 'hidden'});
		$('.ui-dialog-titlebar').show();
		$('.ui-dialog-buttonpane').removeClass('tutorial-cust-dlgfooter');
		if (!$.browser.msie)
			//$('.ui-dialog').css({border:'8px solid transparent',
			//					 overflow: 'hidden'});
			$('.ui-dialog').css({overflow: 'hidden'});
		else{
			$('.ui-dialog').css({'background': 'url(/ce6/images/bg-mask.png) left top', 'background-image': '','background-attachment': '', 'background-position': '', 'background-repeat': '', 'z-index':1002});
		}
	}
};

ce6.show.updateRules = {
	bindEditEvents: function() {
		$('#rules-edit-save').click(ce6.show.updateRules.onEditSave);
		$('#rules-edit-cancel').click(ce6.show.updateRules.onEditCancel);
		$('#rules_100').change(function(){
			if ($(this).prop('checked'))
				$('#additional-rule').show();
			else
				$('#additional-rule').hide();
		});
	},
	unBindEditEvents: function() {
		$('#rules-edit-save').unbind('click');
		$('#rules-edit-cancel').unbind('click');
		$('#rules_100').unbind('change');
	},
	onEdit: function() {
		$('#rules-edit-link').hide();
		$('.submission-rules ul:first').hide();
		$('.submission-rules ul:last').show();
		ce6.show.updateRules.bindEditEvents();
		var rl = ce6.show.contestDetail.rulesList;
		var displayAddRule = false;
		$('.checkbox-list input[type=checkbox]').prop('checked', false);
		for (var i=0; i<rl.length; i++){
			$('#rules_'+rl[i]).prop('checked', true);
			if (rl[i] == 100) displayAddRule = true;
		}
		if (displayAddRule){
			$('#additional-rule').show();
			$('#additional-rule').val(ce6.show.contestDetail.customizedRuleMsg);
		}
		else{
			$('#additional-rule').hide();
		}
		return false;
	},
	onEditCancel: function() {
		$('#rules-edit-link').show();
		$('.submission-rules ul:first').show();
		$('.submission-rules ul:last').hide();
		ce6.show.updateRules.unBindEditEvents();
		return false;
	},
	onEditSave: function() {
		if ($.trim($('#additional-rule').val()).length == 0 || $('#additional-rule').val() == $('#additional-rule').attr('placeholder')){
			$('#additional-rule').val('').hide();
			$('#rules_100').prop('checked', false);
		}
		allCheckedRules = $('.checkbox-list input[type=checkbox]:checked');
		var checkedList = [];
		for (var i=0; i<allCheckedRules.length; i++){
			checkedList.push(parseInt($(allCheckedRules[i]).attr('id').slice(6), 10));
		}
		ce6.show.updateRules.unBindEditEvents();
		ce6.ajaxJson('/show/update_rules',
				{
					cid: ce6.show.contestToken,
					'rules_list': '['+checkedList.join(',')+']',
					'customized_rule' : $('#additional-rule:visible').val() || ''
				},
				function(result){
					if (!result.rc){
						var ul1 = $('.submission-rules ul:first');
						var submissionrules = $('.submission-rules')
						ul1.html('');
						ce6.show.contestDetail.rulesList = [];
						for (var i=0; i<allCheckedRules.length; i++){
							if ($(allCheckedRules[i]).attr('id') != 'rules_100'){
								$('<li>'+$(allCheckedRules[i]).next('label').html()+'</li>').appendTo(ul1);
								ce6.show.contestDetail.rulesList.push(parseInt($(allCheckedRules[i]).attr('id').slice(6), 10));
							}
							else{
								var li = $('<li></li>').text($('#additional-rule').val());
								li.appendTo(ul1);
								ce6.show.contestDetail.rulesList.push(100);
							}
						}
						ce6.show.contestDetail.customizedRuleMsg = $('#additional-rule:visible').val();
						$('.submission-rules ul:first').show();
						$('.submission-rules ul:last').hide();
						$('#rules-edit-link').show();
					}
					else{
						ce6.showNotify(result);
						$('.submission-rules ul:first').show();
						$('.submission-rules ul:last').hide();
						ce6.show.updateRules.unBindEditEvents();
					}
				});
	}
}

ce6.show.updateContest = {
	bindEditEvents: function() {
		$('#contest-edit-save').click(ce6.show.updateContest.onEditSave);
		$('#contest-edit-cancel').click(ce6.show.updateContest.onEditCancel);
	},
	unBindEditEvents: function() {
		$('#contest-edit-save').unbind('click');
		$('#contest-edit-cancel').unbind('click');
	},
	bindTitleEditEvents: function() {
		$('#title-edit-save').click(ce6.show.updateContest.onTitleEditSave);
		$('#title-edit-cancel').click(ce6.show.updateContest.onTitleEditCancel);
		$('#title-edit-content').keyup(ce6.show.updateContest.onTitleEditKeyUp)
	},
	unBindTitleEditEvents: function() {
		$('#title-edit-save').unbind('click');
		$('#title-edit-cancel').unbind('click');
		$('#title-edit-content').unbind('keyup');
	},
	onEdit: function() {
		$('.contest-detail-content').hide();
		$('#contest-edit-container').show();
		ce6.show.updateContest.bindEditEvents();
		
		var content = $('.contest-detail-text').html();
		ce6.show.checkContestCount(content);
		$('#contest-edit-content').val(content);
		$('.nicEdit-main').html(content);
		$('.contest-video-preview').hide();
		setTimeout(function(){$('.nicEdit-main')[0].focus();}, 50);
		return false;
	},
	onEditSave: function() {
		if (!ce6.editor.presubmit())
			return
		$('#contest-edit-content').val(ce6.editor.getContentWithAutoLink());
		var content = $.trim($('#contest-edit-content').val());
		count = ce6.show.checkContestCount(content);
		if (count<0) {
			ce6.notifyBar('Contest is only allowed '+ ce6.show.charLimit.contest +' characters', 'error');
			return;
		} else if (count == ce6.show.charLimit.contest) {
			ce6.notifyBar('Contest can not be empty', 'error');
			return;
		}
		params = {
			cid: ce6.show.contestToken,
			description: content
		}
		ce6.show.updateContest.unBindEditEvents();
		ce6.ajaxJson('/show/update_contest', 
			params,
			function(data) {
				ce6.show.updateContest.bindEditEvents();
				if (data.rc == 0){
					window.location.reload();
				}
				else{
					if (parseInt(data.rc / 100) ==2) {
						$.cookie(ce6.cookieControl.name.SHOWEDITCONTESTERROR, data.msg, ce6.cookieControl.shortOption); 
						window.location.reload();
					} else {
						ce6.notifyBar(data.msg, 'error');
					}
				}
			}
		);
	},
	onEditCancel: function() {
		$('.contest-detail-content').show();
		$('#contest-edit-container').hide();
		$('.contest-video-preview').show();
		ce6.show.updateContest.unBindEditEvents();
		return false;
	},
	onTitleEdit: function() {
		$('#detail-title-text').hide();
		$('#title-edit-link').hide();
		$('#title-edit-container').show();
		$('.contest-extend-info').hide();
		ce6.show.updateContest.bindTitleEditEvents();
		
		var content = $('#detail-title-text').text();
		ce6.show.checkTitleCount(content);
		$('#title-edit-content').val($('#detail-title-text').text());
	},
	onTitleEditSave: function() {
		var content = $.trim($('#title-edit-content').val());
		count = ce6.show.checkTitleCount(content);
		if (count<0) {
			ce6.notifyBar('Title is only allowed '+ ce6.show.charLimit.title +' characters', 'error');
			return;
		}
		params = {
			cid: ce6.show.contestToken,
			title: content
		}
		ce6.show.updateContest.unBindTitleEditEvents();
		ce6.ajaxJson('/show/update_contest', 
			params,
			function(data) {
				if (data.rc == 0){
					$('#detail-title-text').show();
					$('#title-edit-link').show();
					$('#title-edit-container').hide();
					$('.contest-extend-info').show();
					$('#detail-title-text').html(htmlEscape(content));
					ce6.show.contestDetail.title = content;
				}
				else{
					ce6.show.updateContest.bindTitleEditEvents();
					ce6.notifyBar(data.msg, 'error');
				}
			}
		);
	},
	onTitleEditCancel: function() {
		ce6.show.updateContest.unBindTitleEditEvents();
		$('#detail-title-text').show();
		$('#title-edit-link').show();
		$('#title-edit-container').hide();
		$('.contest-extend-info').show();
		return;
	},
	onTitleEditKeyUp: function() {
		var content = $.trim($('#title-edit-content').val());
		ce6.show.checkTitleCount(content);
		return;
	}
};

ce6.show.updateEntry = {
	entry_token: 0,
	bindEditEvents: function() {
		$('#entry-edit-save').click(ce6.show.updateEntry.onEditSave);
		$('#entry-edit-cancel').click(ce6.show.updateEntry.onEditCancel);
	},
	unBindEditEvents: function() {
		$('#entry-edit-save').unbind('click');
		$('#entry-edit-cancel').unbind('click');
	},
	onEdit: function() {
		token = $(this).attr('token');
		$('#entry-edit-container').show();
		$('#entry-submitted-row-'+token).hide();
		$('#entry-edit-area-'+token).hide();
		ce6.show.updateEntry.entry_token = token;

		// Enable Save and Cancel button
		ce6.show.entryUnBindEvents();
		// Disable Edit and Withdraw button
		ce6.show.updateEntry.bindEditEvents();
		
		var content = $('#entry-text-'+token).html();
	//	ce6.show.checkEntryCount(content);
		$('#entry-edit-content').val(content);
		$(this).parents('.submission').find('.entry-function').hide();
		$('.nicEdit-main').html(content);
		$('#entry-edit-error-msg').html("");
		$('#entry-edit-error-msg').hide();
		setTimeout(function(){$('.nicEdit-main')[0].focus();}, 50);
		return false;
	},
	onEditSave: function() {
		if (!ce6.editor.presubmit())
			return
		$('#entry-edit-content').val(ce6.editor.getContentWithAutoLink());
		var content = $.trim($('#entry-edit-content').val());
		count = ce6.show.wordLeft(content, 'entry');
		if (count<0) {
			count = -count;
			$('#entry-edit-error-msg').html("You've exceeded the character limit. "+count+ " less, please");
			$('#entry-edit-error-msg').show();
			return false;
		} else if (count == ce6.show.charLimit.entry) {
			$('#entry-edit-error-msg').html("Entry can not be empty.");
			$('#entry-edit-error-msg').show();
			return false;
		} else {
			$('#entry-edit-error-msg').html("");
			$('#entry-edit-error-msg').hide();
		}
		params = {
			cid: ce6.show.contestToken,
			eid: ce6.show.updateEntry.entry_token,
			content: content
		}
		// unbind events to avoid double click
		ce6.show.updateEntry.unBindEditEvents();
		ce6.ajaxJson('/show/update_entry', 
			params,
			function(data) {
				ce6.show.updateEntry.bindEditEvents();
				if (data.rc == 0){
					window.location.reload();
				}
				else{
					ce6.notifyBar(data.msg, 'error');
				}
			}
		);
	},
	onEditCancel: function() {
		var token = ce6.show.updateEntry.entry_token;
		$('#entry-edit-container').hide();
		$('#entry-submitted-row-'+token).show();
		$('#entry-edit-area-'+token).show();
		$(this).parents('.submission').find('.entry-function').show();
		// Enable Edit and Withdraw button
		ce6.show.entryBindEvents();
		// Disable Save and Cancel button
		ce6.show.updateEntry.unBindEditEvents();
		return false;
	}
};

ce6.show.flag = { 
	entry_token: '',
	getFlagDialog: function() {
		if ($('#dropdown-flag-dlg').length) {
			return $('#dropdown-flag-dlg');
		} else {
			return $(' \
				<ul id="dropdown-flag-dlg"> \
					<li class="top-line">&nbsp;</li> \
					<li><a id="btn-flag-inappropriate">Inappropriate content</a></li> \
					<li><a id="btn-flag-improve">Need improvement</a></li> \
					<li><a id="btn-flag-duplicate">Duplicate entry</a></li> \
					<li><a id="btn-flag-spam">Spam</a></li> \
				</ul> \
				');
		}
	},
	onClickFlag: function(e) {
		$('.entry-flag.active').removeClass('active');
		if (ce6.show.flag.entry_token == $(this).attr('token')) {
			// Hide the flag dialog
			ce6.show.flag.entry_token = '';
			ce6.show.flag.getFlagDialog().hide();
			return;
		}
		ce6.show.flag.entry_token = $(this).attr('token');
		$(this).addClass('active');
		var dlg = ce6.show.flag.getFlagDialog();
		dlg.appendTo($('body')).show();
		dlg.css({left: $(this).offset().left, top: $(this).offset().top + $(this).height()});
	},
	showDlg: function(txt) {
		$('.entry-flag.active').parents('.entry-detail').children('.entry-flag-dlg').show();
		$('.entry-flag.active').parents('.entry-detail').find('.entry-flag-txt').text(txt);
		ce6.show.flag.getFlagDialog().hide();
		ce6.show.flag.entry_token = '';
		$('.entry-flag.active').removeClass('active');
	},
	hideDlg: function() {
		$(this).parents('.entry-flag-dlg').hide();
	},
	flagShowInput: function() { 
		ce6.show.flag.showDlg($(this).text());
	},
	flagInappro: function() {
		ce6.show.flag.showDlg($(this).text());
	},
	flagDupl: function() {
		ce6.show.flag.showDlg($(this).text());
	},
	setFlagged: function() {
		if (!viewer_logged_in){
			ce6.show.flag.current = $(this);
			ce6.authDialog.open(ce6.show.flag.asyncSetFlagged, null);
			return
		}
		var dlg = $(this).parents('.entry-flag-dlg');
		ce6.ajaxJson(
			'/report/report', 
			{
			eid: $(this).parents('.submission').attr('token'),
			cid: ce6.show.contestToken,
			flag_cat: dlg.find('.entry-flag-txt').text(),
			message: dlg.find('.entry-flag-value').val()
			},
			function(data) {
				if (data.rc == 0){
				} else {
					ce6.notifyBar(data.msg, 'error');
					return;
				}
			}
		);
		dlg.hide();
		$(this).parents('.entry-detail').find('.entry-flag').text('Flagged').addClass('entry-flagged').removeClass('entry-flag');
	},
	asyncSetFlagged: function(){
		if (!ce6.show.flag.current)
			return
		var current = ce6.show.flag.current;
		var dlg = current.parents('.entry-flag-dlg');
		var eid = current.parents('.submission').attr('token');
		ce6.ajaxJson(
			'/report/report', 
			{
			eid: eid,
			cid: ce6.show.contestToken,
			flag_cat: dlg.find('.entry-flag-txt').text(),
			message: dlg.find('.entry-flag-value').val()
			},
			function(data){ 
				if (data.rc == 0){
					$.cookie(ce6.cookieControl.name.SHOWFLAGGED, eid, ce6.cookieControl.shortOption); 
					window.location.reload(); 
				} else {
					ce6.notifyBar(data.msg, 'error');
					return;
				}
			}
		);
		dlg.hide();
		current.parents('.entry-detail').find('.entry-flag').text('Flagged').addClass('entry-flagged').removeClass('entry-flag');
		ce6.show.flag.current = null;
	},
	_setFavorite: function(btnObj){
		btnObj.text('Unfavorite').addClass('disabled');
		btnObj.siblings('.entry-eliminate').text('Eliminate').removeClass('disabled');
		btnObj.parents('.submission').removeClass('eliminate').addClass('favorite');
	},
	_setEliminated: function(btnObj){
		btnObj.text('Uneliminate').addClass('disabled');
		btnObj.siblings('.entry-star').text('Favorite').removeClass('disabled');
		btnObj.parents('.submission').removeClass('favorite').addClass('eliminate');
	},
	_setNormal: function(btnObj){
		var parent = btnObj.parent();
		parent.children('.entry-eliminate').text('Eliminate').removeClass('disabled');
		parent.children('.entry-star').text('Favorite').removeClass('disabled');
		btnObj.parents('.submission').removeClass('favorite').removeClass('eliminate');
	},
	onClickStar: function() {
		$('.entry-flag.active').removeClass('active');
		ce6.show.flag.getFlagDialog().hide();
		if ($(this).hasClass('disabled')) {
			ce6.show.flag._setNormal($(this));
			//$(this).text('Favorite').removeClass('disabled');
			//$(this).parents('.submission').removeClass('favorite');
			ce6.ajaxJson(
				'/show/remove_star', 
				{eid: $(this).parents('.submission').attr('token')}
			);
		} else {
			ce6.show.flag._setFavorite($(this));
			//$(this).text('Unfavorite').addClass('disabled');
			//$(this).parents('.submission').addClass('favorite').removeClass('eliminate');
			ce6.ajaxJson(
				'/show/add_star', 
				{eid: $(this).parents('.submission').attr('token')}
			);
		}
	},
	_eliminateCallback: function(eliBtnObj){
		ce6.show.flag._setEliminated(eliBtnObj);
		ce6.ajaxJson(
			'/show/eliminate_entry', 
			{eid: eliBtnObj.parents('.submission').attr('token')}
		);
		eliBtnObj.siblings('.show-add-comment').trigger("click");
		ce6.show.flag.lastEliminatedEid = eliBtnObj.parents('.submission').attr('token');
	},
	onClickEliminate: function() {
		$('.entry-flag.active').removeClass('active');
		ce6.show.flag.getFlagDialog().hide();
		if ($(this).hasClass('disabled')) {
			ce6.show.flag._setNormal($(this));
			//$(this).text('Eliminate').removeClass('disabled');
			//$(this).parents('.submission').removeClass('eliminate');
			ce6.ajaxJson(
				'/show/recovery_entry', 
				{eid: $(this).parents('.submission').attr('token')}
			);
		} else {
			$('#dlg-eliminate').data('currentBtn', $(this));
			$('#dlg-eliminate').dialog('open');
		}
	},
	onClickShare: function() {
		var entryID = $(this).parents('.submission').attr('token');
		var shareDialogOpts = {
			title:ce6.show.contestDetail.title,
			prize:ce6.show.contestDetail.prize,
			url:ce6.show.contestDetail.shortUrl,
			tweetUrl:ce6.show.contestDetail.tweetUrl,
			contestToken:ce6.show.contestToken,
			entryToken:entryID
		};
		$('#dlg-all-share').data('eid', entryID);
		shareDialogOpts.type = 'entry_share';
		ce6.shareDialog.open(shareDialogOpts);
	},
	hide: function(e){
		if (!$(e.target).parents('#dropdown-flag-dlg').length){
			$('.entry-flag.active').removeClass('active');
			ce6.show.flag.entry_token = '';
			ce6.show.flag.getFlagDialog().hide();
		}
	},
	eliminateDlg: {
		autoOpen: false,
		modal: true,
		width: 340,
		height: 'auto',
		resizable: false,
		title: 'Eliminate Confirmation',
		close: function(){
		
			if ($(this).data('currentBtn') && $(this).data('confirmed')){
				ce6.show.flag._eliminateCallback($(this).data('currentBtn'));
				$(this).data('confirmed', false);
				ce6.notifyBar('Entry eliminated. Please include comments to help the submitter improve on future entries!', 'success');
			}
		},
		buttons: {
			Cancel: function() {
			
				$(this).dialog('close');
			},
			Yes: function(){
				$(this).data('confirmed', true);
				$(this).dialog('close');
			}
		} 
	}
};

ce6.show.voter = {
	moreVoterDialog: {
		autoOpen: false,
		modal: false,
		width: 400,
		resizable: false,
		closeOnEscape: false,
		title: 'All voters',
		open: function(){
			$(this).css({'padding-bottom': 0});
		},
		beforeClose: function(){
		}
	},
	onClickMoreVoter: function() {
		ce6.ajaxJson('/show/get_voters', 
			{
			eid: $(this).parents('.submission').attr('token'),
			cid: ce6.show.contestToken
			},
			function(data) {
				if(data.rc == 0){
					var tmpl = ' \
						<div class="voter-item"> \
							<a href="${url}" class="voter-mimage"> \
								<img src="${large_pic}"> <span class="{{if verified}}verified{{/if}}"></span>\
							</a> \
							<div class="voter-detail"> \
								{{if following}} \
									<button class="unfollow voter-follow" followed="1" uid="${token}">Unfollow</button> \
								{{else}} \
									<button class="follow voter-follow" followed="0" uid="${token}">Follow</button> \
								{{/if}} \
								<a href="${url}" class="voter-name">${name} </a> \
								<span class="voter-desc">${desc}</span>{{if desc && loc}}<span style="margin:0 3px;" class="gray">&middot;</span>{{/if}}<span class="voter-desc">${loc}</span>\
							</div> \
						</div> \
					';
					$('#all-voters').empty();
					$.tmpl(tmpl, data['voters']).appendTo($('#all-voters'));
					$('#dlg-more-voter').dialog(ce6.show.voter.moreVoterDialog).restyleButtons();
					$('#dlg-more-voter').dialog('open');
				} else {
					ce6.notifyBar(data.msg, 'error');
				}
			}
		);
	},
	closeMoreVoter: function() {
		$('#dlg-more-voter').dialog('close');
		return false
	},
	follow: function() {
		$(this).removeClass('follow').addClass('unfollow').text('Unfollow');
		ce6.user.followUser($(this).attr('uid'), undefined, ce6.show.voter.closeMoreVoter);
	},
	unfollow: function() {
		$(this).removeClass('unfollow').addClass('follow').text('Follow');
		ce6.user.unfollowUser($(this).attr('uid'));
	}
};

ce6.show.pagination = (function() {
var self = {
	hide: function() {
		$("#contest-pagination").empty().hide();
		$("#contest-pagination").data('current_page', 0);
		$("#contest-pagination-top").empty().hide();
		$("#contest-pagination-top").data('current_page', 0);
	},
	loadEntries: function(prefetchedEntries) {
		// $("#load-more-button").fadeTo('fast', 0.5);
		if (self.getPageNo() >0) {
			$(window).scrollTop($('#entries-sort').position().top);
		}
		ce6.show.flag.getFlagDialog().hide();
		$(".left-preloader-bar").show();
		$("#contest-entries-bottom").hide();
		$("#entries-container").empty();
		self.hide();
		if (!prefetchedEntries) {
			ce6.ajaxJson('/show/get_entries', 
				{
					'cid': ce6.show.contestToken,
					'page_no': self.pageNo, 
					'page_size': self.page_size,
					'sort_key': ce6.show.sort.getKey(), 
					'desc': ce6.show.sort.order == 'desc' ? 1 : 0,
					'alpha_filter': ce6.show.sort.initial || '', 
					'exclude' : ce6.show.excludedList
				}, 
				self.appendEntries
			);
		} else {
			self.appendEntries(prefetchedEntries);
		}
		return false
	},
	gotoPage: function(pageNo) {
		ce6.show.pagination.loadEntries(pageNo);
		return false
	},
	appendEntries: function(data) {
		$(".left-preloader-bar").hide();
		$("#entries-container").empty().html(data['entries']);
		if (!data['total_size'] || !$("#entries-container .submission").length) {
			ce6.editor.filterHtmlStyle($('.contest-detail-text'));
			ce6.editor.filterHtmlStyle($('.preview-text .unselectable'));
			ce6.show.pickWinnerPanel.decorateEntries();
			if (data.empty_favorites){
				$("#contest-entries-bottom").show();
				return;
			}
			self.hide();
			return;
		}
		$("#contest-entries-bottom").show();
		if (data['total_size'] > self.page_size) {
			var pageLink = ce6.site.updateUrlParam(window.location.href, {page:'__num__'});
			$("#contest-pagination, #contest-pagination-top").show()
			.pagination(data['total_size'], 
				{
					items_per_page: self.page_size, 
					current_page: data['page_no'], 
					prev_text: 'previous', 
					next_text: 'next', 
					link_to: pageLink,
					callback: self.gotoPage
				}
			);
		}
		//scroll to the target entry specified in url
		if(ce6.show.contestDetail.targetEntryIdtkn && $('#entry_'+ce6.show.contestDetail.targetEntryIdtkn).length > 0){
			var entry = $('#entry_'+ce6.show.contestDetail.targetEntryIdtkn);
			var scrollTop = entry.offset().top;
			$(window).scrollTop(scrollTop - 50);//50 for top div's space
			entry.addClass('hightlighted-submission');
			ce6.show.contestDetail.targetEntryIdtkn = null;
			setTimeout(function() { entry.animate({'background-color': 'white'}, 1000); }, 3000);
		}
		ce6.editor.filterHtmlStyle($('.contest-detail-text'));
		ce6.editor.filterHtmlStyle($('.preview-text .unselectable'));
		ce6.show.pickWinnerPanel.decorateEntries();
	},
	gotoPage : function(pageNo, container, target) {
		ce6.ajaxLink.click.apply(target);
		return false;
    },
	setPageNo : function(pageNo) {
		self.pageNo = pageNo;
		$("#contest-pagination").data('current_page', pageNo);
		$("#contest-pagination-top").data('current_page', pageNo);
	},
	getPageNo : function() {
		return $("#contest-pagination").data('current_page');
	}
};
return self;})();

ce6.show.sort =(function() {
	var self = {
	changeMethod: function(tab) {
		self.tab = tab;
		var elem = $('#' + tab);
		if (tab == 'sort-by-alpha') {
			self.alphaSortClick(elem);
		} else {
			self.normalSortClick(elem);
		}
		ce6.show.pagination.setPageNo(0);
	},
	getKey: function() {
		return self.tabToSortKey[self.tab];
	},
	normalSortClick: function(obj) {
		$('.alpha-sort-item.active').removeClass('active');
		$('#entries-alpha-sort').hide();
		$('.sort-item.active').removeClass('active');
		obj.addClass('active');
	},
	alphaSortClick: function(obj) {
		$('#entries-alpha-sort').show();
		if (!obj.hasClass('active')) {
			$('.sort-item.active').removeClass('active');
			obj.addClass('active');
		}
	},
	canFlipOrder : function(tab) {
		var obj = $('#' + tab);
		return obj.attr('default-order') && !obj.attr('keep-order');
    },
	defaultOrder : function(tab) {
		var obj = $('#' + tab);
		return obj.attr('default-order');
    },
	setOrder: function(order) {
		self.order = order;
		if (self.canFlipOrder(self.tab)) {
			var obj = $('#' + self.tab);
			if (order == 'desc') {
				obj.removeClass('ascend');
			} else {
				obj.addClass('ascend');
			}
			var url = obj.attr('href');
			obj.attr('href', ce6.site.updateUrlParam(url, {order: (order == 'desc') ? 'asce' : 'desc'}));
		}
	},
	changeInitial: function(initial) {
		self.initial = initial;
		if (initial) {
			var elem = $('.alpha-sort-item[initial='+initial + ']');
			$('.alpha-sort-item.active').removeClass('active');
			elem.addClass('active');
			ce6.show.pagination.setPageNo(0);
		}
	}
	};
	return self;})();

ce6.show.comment = (function(ce6) {
	var my = {};

	my.max_chars = 0;

	my.bindEvents = function() {
		$('.btn-comment-confirm').live('click', my.clickPost);
		$('.btn-comment-cancel').live('click', my.cancelPost);
		$('.comment a.reply').live('click', my.reply);
		$('.show-add-comment').live('click', my.showAdd);
		$('.remove-replier').live('click', my.removeReplier);
		$('.view-all-comments').live('click', my.viewAll);
		$('.view-creator-comments').live('click', my.viewCreator);
		$('.collapse-comments').live('click', my.clickCollapse);
		$('.comments textarea').live('focus', my.expandInput);
		$('.comments textarea').live('blur', my.collapseInput);
		$('.comment-bottom a.delete-tab').live('click', my.del);
	};

	my.getContainer = function(obj) {
		var submission = obj.parents('.submission')
		return submission.length ? submission : obj.parents('.contest'); 
	};

	my.showAdd = function() {
		my.getContainer($(this)).find('.comments').show().find('textarea').focus();
		if ($(this).is('div.show-add-comment')) {
			$(this).remove();
		}
		return false;
	};

	my.expandInput = function() {
		$(this).addClass('active').parents('.comment-form').find('.comment-buttons').show();
	};

	my.collapseInput = function() {
		if (!$(this).val()) {
			my.doCollapseInput($(this));
		}
		return false;
	};

	my.doCollapseInput = function(obj) {
		obj.removeClass('active').parents('.comment-form').find('.comment-buttons').hide();
	};

	my.fetch = function(data, callback) {
		ce6.ajaxJson('/show/get_comments', data, callback);
		return false;
	};

	my.switchCategory = function(container, selection) {
		if(selection == 'all') {
			container.find('.view-all-comments').hide();
			container.find('.collapse-comments').show();
		} else {
			container.find('.view-all-comments').show();
			container.find('.collapse-comments').hide();
		}
		if(selection == 'creator') {
			container.find('.view-creator-comments').addClass('active');
		} else {
			container.find('.view-creator-comments').removeClass('active');
		}
		container.data('disable', false);
	};

	my.viewCreator = function() {
		if ($(this).hasClass('active')) {
			return false;
		}
		var container = my.getContainer($(this));
		var category = container.find('.comments-category');
		if (category.data('disable')) {
			return false;
		}
		category.data('disable', true);

		var pdata = container.is('.submission') ? {eid: container.attr('token')} : {cid: ce6.show.contestToken}; 
		pdata.creator_only = 1;
		my.fetch(pdata, function(data) {
			container.find('.comments-cnt').text(data.cnt);
			container.find('.comment').remove();
			$(data.comments).insertBefore(container.find('.comment-form'));
			my.switchCategory(category, 'creator');
			container.find('.comment[uid=""]').text('No comments from the creator yet.');
		});
		return false;
	};

	my.viewAll = function() {
		var container = my.getContainer($(this));
		var category = container.find('.comments-category');
		if (category.data('disable')) {
			return false;
		}
		category.data('disable', true);
		var pdata = container.is('.submission') ? {eid: container.attr('token')} : {cid: ce6.show.contestToken}; 
		my.fetch(pdata, function(data) {
			container.find('.comments-cnt').text(data.cnt);
			container.find('.comment').remove();
			$(data.comments).insertBefore(container.find('.comment-form'));
			my.switchCategory(category, 'all');
		});
		return false;
	};

	my.clickCollapse = function() {
		var container = my.getContainer($(this));
		my.collapseComments(container, function() {});
		return false;
	};

	my.collapseComments = function(container, callback) {
		var category = container.find('.comments-category');
		if (category.data('disable')) {
			return false;
		}
		category.data('disable', true);
		if (container.find('.view-creator-comments').hasClass('active')) {
			var pdata = container.is('.submission') ? {eid: container.attr('token')} : {cid: ce6.show.contestToken}; 
			pdata.count = 2;
			my.fetch(pdata, function(data) {
				container.find('.comments-cnt').text(data.cnt);
				container.find('.comment').remove();
				$(data.comments).insertBefore(container.find('.comment-form'));
				my.switchCategory(category, 'colla');
				callback();
			});
		} else {
			var comments = container.find('.comment');
			comments.slice(0, comments.length-2).remove();
			my.switchCategory(category, 'colla');
			callback();
		}
	};

	my.clickPost = function() {
		var form = $(this).parents('.comment-form');
		if (form.data('disable')) {
			return false;
		}
		form.data('disable', true);
		var container = my.getContainer($(this));
		if (container.find('.view-creator-comments').hasClass('active')) {
			my.collapseComments(container, function() {
				my.doPost(container);
			});
		} else {
			my.doPost(container);
		}
		return false;
	};

	my.doPost = function(container) {
		var data = container.is('.submission') ? {eid: container.attr('token')} : {cid: ce6.show.contestToken};
		var form = container.find('.comment-form');
		data.uid = form.find('.reply').is(':visible') ? form.data('uid') : '';
		data.text = $.trim(form.find('textarea').val());
		if (!data.text) {
			ce6.notifyBar('Please input your comment.', 'error');
			container.find('.comment-form').data('disable', false);
			return false;
		} else if (data.text.length > my.max_chars) {
			ce6.notifyBar('Your comment exceeds ' + my.max_chars + ' characters. Please split it into two comments.', 'error');
			container.find('.comment-form').data('disable', false);
			return false;
		}
		data.send_notification = ce6.show.flag.lastEliminatedEid && ce6.show.flag.lastEliminatedEid == data.eid ? 0 : 1;
		ce6.show.flag.lastEliminatedEid = null;
		if (!viewer_logged_in) {
			ce6.authDialog.open(
				function() { 
					ce6.ajaxJson('/show/post_comment', data, function(rdata) {
						window.location.reload();
					});
				},
				function() {
					container.find('.comment-form').data('disable', false);
				}, 
				'auto', ce6.authDialog.onDemandTitle
			);
		} else {
			ce6.ajaxJson('/show/post_comment', data, function(rdata) {
				my.afterPost(container, rdata);
			});
		}
	};

	my.afterPost = function(container, data) {
		if (data.rc) {
			ce6.notifyBar(data.msg, 'error');
			container.find('.comment-form').data('disable', false);
			return false;
		} else {
			my.doCollapseInput(container.find('.comments textarea').val(''));
			container.find('.comment[uid=""]').remove();
			$(data.comments).insertBefore(container.find('.comment-form'));
			container.find('.comment-form').data('disable', false);
			container.find('.comments-cnt').text(parseInt(container.find('.comments-cnt').text(), 10) + 1);
			return false;
		}
	};

	my.cancelPost = function() {
		my.doCollapseInput($(this).parents('.comment-form').find('textarea').val(''));
		return false;
	};

	my.del = function() {
		var button = $(this);
		if (button.data('disable')) {
			return false;
		}
		button.data('disable', true);
		var container = my.getContainer($(this));
		var comment = $(this).parents('.comment');
		var pdata = container.is('.submission') ? {eid: container.attr('token')} : {cid: ce6.show.contestToken};
		pdata.id_tkn = comment.attr('id_tkn');
		ce6.ajaxJson('/show/del_comment', pdata, function(rdata) {
			if (rdata.rc == 0) {
				comment.remove();
				container.find('.comments-cnt').text(parseInt(container.find('.comments-cnt').text(), 10) - 1);
			} else {
				ce6.notifyBar(rdata.msg, 'error');
			}
			button.data('disable', false);
			return false;
		});
	};

	my.reply = function() {
		var comment = $(this).parents('.comment');
		var form = comment.parents('.comments').find('.comment-form');
		form.find('.reply-name').text(comment.find('.commenter').text());
		form.data('uid', comment.attr('uid'));
		form.find('.reply').show();
		return false;
	};

	my.removeReplier = function() {
		$(this).parents('.comments').find('.comment-form .reply').hide();
		return false;
	};

	my.expandComment = function() {
		var container = [];
		if(ce6.show.contestDetail.targetEntryIdtkn){
			if ($('#entry_'+ce6.show.contestDetail.targetEntryIdtkn).length > 0) {
				container = $('#entry_'+ce6.show.contestDetail.targetEntryIdtkn);
			}
		}

		if (container.length) {
			var category = container.find('.comments-category');
			if (category.data('disable')) {
				return false;
			}
			category.data('disable', true);
			var pdata = container.is('.submission') ? {eid: container.attr('token')} : {cid: ce6.show.contestToken}; 
			my.fetch(pdata, function(data) {
				container.find('.comment').remove();
				$(data.comments).insertBefore(container.find('.comment-form'));
				my.switchCategory(category, 'all');
				container.find('.comments').show().find('textarea');
			});
		}
	};

	return my;
})(ce6);

ce6.show.category = {
	createCategory: function() {
		var name = $('#new-category-input').inputVal();
		ce6.ajaxJsonPost('/show/apply_new_category', {
			name: name,
			contest_id: ce6.show.contestToken
		}, function(data) {
			var newCategory = $("<input name='category-admin' type='radio'>" + name + "</input>").attr('token', data.token).prop('checked', true);
			var deleteLink = $("<a class='delete-category-link'>delete</a>").attr('token', data.token);
			
			$("<p></p>").append(newCategory).append(deleteLink).appendTo($('.category-checkbox-container'));
			newCategory.bind('change', ce6.show.category.change);
			deleteLink.click(ce6.show.category.removeCategory);
			$('#new-category-input').val('').focus();
		});
	},
	change: function() {
		ce6.ajaxJsonPost('/show/assign_category', {
			contest_id: ce6.show.contestToken,
			category_id : $(this).attr('token')
		});
	},
	removeCategory: function() {
		var parent = $(this).parent();
		ce6.ajaxJsonPost('/show/remove_category', {
			category_id : $(this).attr('token')
		}, function(data) {
			$('#uncategorized-radio').prop('checked', true);
			parent.remove();
		});
		return false;
	},
	toggleCategoryBtn: function(categoryBtn) {
		var name = ce6.show.category.getSelectedCategory();
		if (name) 
			categoryBtn.enableButton();
		else
			categoryBtn.disableButton();
	},
	getSelectedCategory: function() {
		return $('#dlg-category input:checked').val() ||
			$('#other-category-list').val() ||
			$.trim($('#suggest-category-input').inputVal());
	},
	creatorAddCategory: function() {
		var name = ce6.show.category.getSelectedCategory();
		ce6.ajaxJsonPost('/show/creator_add_category_to_contest', {
			contest_id: ce6.show.contestToken,
			cat_name : name
		});
		$('#dlg-category').data('notCancel', true);
		$('#dlg-category').dialog('close');
	},
	initCategoryDlg: function(shareDialogOpts){
		ce6.show.category.AddCategoryBtn = $('#dlg-category').next().children().children('button:last');
		ce6.show.category.AddCategoryBtn.disableButton();
		$('#dlg-category').data('closeCbParams', shareDialogOpts).dialog('open').restyleButtons();
		$('#dlg-category .category-option').change(function(){
			$('#other-category-list').attr('disabled', 'disabled');
			$('#suggest-category-input').hide();
			ce6.show.category.AddCategoryBtn.enableButton();
		});
		$('#dlg-category #other-category').change(function(){
			$('#other-category-list').removeAttr('disabled');
			if ($('#other-category-list').val() == "")
				$('#suggest-category-input').show().focus();
			ce6.show.category.toggleCategoryBtn(ce6.show.category.AddCategoryBtn);
		});

		$('#dlg-category #suggest-category-input').keyup(function(){
			ce6.show.category.toggleCategoryBtn(ce6.show.category.AddCategoryBtn);
		});

		// load data
		ce6.ajaxJsonGet('/show/get_other_category_names', {}, function(data){
			var categoryList = $('#other-category-list');
			$('#other-category-list').empty();
			$.each(data.names, function(idx, val){
				$('<option class="other-category-option"></option>').val(unescape(val)).html(val).appendTo(categoryList);
			});
			$('<option class="suggest-category-option" value="">Suggest new category...</option>').appendTo(categoryList);

			$('#dlg-category #other-category-list').change(function(){
				if ($('#other-category-list').val() == "") {
					$('#suggest-category-input').show().focus();
				} else {
					$('#suggest-category-input').hide();
				}
				ce6.show.category.toggleCategoryBtn(ce6.show.category.AddCategoryBtn);
			});
		});
	},
	categoryDlg: {
		autoOpen: false,
		modal: true,
		width: 340,
		height: 'auto',
		dialogClass: 'dialog-with-cross',
		resizable: false,
		title: 'Help others find your contest!',
		beforeClose: function(){
			var msg = ($(this).data('notCancel') ? "You've selected a category for this contest! " : '') + "Promote it by sharing it with friends on Facebook or Twitter!";
			ce6.notifyBar(msg, 'success');
			ce6.shareDialog.open($('#dlg-category').data('closeCbParams'));
		},
		buttons: {
			'Add category': function() {
				ce6.show.category.creatorAddCategory();
			}
		}
	}
};

ce6.show.pickWinnerPanel = {
	bindClickEvent: function(){
		$('.pick-winner-sel').live('click', ce6.show.selectWinner);
		$('.pick-hm-sel').live('click', ce6.show.pickWinnerPanel.pickAsHm);
		$('.win-user-block .close').click(ce6.show.pickWinnerPanel.clickCross);
		$('.win-cand-title .reset').click(ce6.show.pickWinnerPanel.skip);
		$('.win-cand-title .confirm').click(ce6.show.pickWinnerPanel.confirm).disableButton();
	},
	pickWinnerCb: function(){
		var self = this;
		$('.pick-winner-sel').remove();
		$('.win-cand').show();
		var pickWinnerMsg = "You've announced " + 
			(self.winnerName ? (self.winnerName + " as ") : " ") + 
			"the winner! Now pick two Honorable Mentions to recognize other good works!";
		ce6.notifyBar(pickWinnerMsg, 'success');
		ce6.show.floatVoteBtn();
		self.decorateEntries();
		self.glowShineCount = 0;
		self.restart();
	},
	decorateEntries: function(){
		var self = ce6.show.pickWinnerPanel;
		self._resetAllPickBtn();
		if (self.winnerEntryTkn){
			if ($('.winner-badge').length == 0){
				var entryRow = $('#entry-submitted-row-' + self.winnerEntryTkn + ' .preview-text');
				entryRow.addClass('entry-min-height');
				if (ce6.show.is_jff) {
					entryRow.prepend($('<div class="jff-winner-badge"></div>'));
				} else {
					entryRow.prepend($('<div class="winner-badge"></div>'));
				}
			}
			$('#entry_' + self.winnerEntryTkn + ' .entry-pick-winner').remove();
		}
	},
	resetPos: function(){
		$('.win-cand').css({position: 'relative', top: 0});
	},
	findAvailableHm: function(){
		var self = ce6.show.pickWinnerPanel;
		if (self.hmEntryTkn1 && self.hmEntryTkn2)
			return 0
		if (!self.hmEntryTkn1)
			return 1
		else
			return 2
	},
	pickAsHm: function(){
		var self = ce6.show.pickWinnerPanel;
		var entryTkn = $(this).parents('.submission').attr('id').substring(6);
		var availableHm = self.findAvailableHm();
		if (0 == availableHm){
		}
		else if (self._pickedAlready(entryTkn) > -1){
			return
		}
		else{
			self['hmEntryTkn'+availableHm] = entryTkn;
			self._fillBlock($('#hm-cand-'+availableHm), entryTkn);
		}
		self._resetAllPickBtn();
	},
	pickAsWinner: function(){
		var self = ce6.show.pickWinnerPanel;
		var entryTkn = $(this).parents('.submission').attr('id').substring(6);
		if (self._pickedAlready(entryTkn) > -1){
			return
		}
		if (!self.winnerEntryTkn){
			self.winnerEntryTkn = entryTkn;
			var winnerCand = $('#winner-cand');
			self._fillBlock(winnerCand, entryTkn);
		}
		self._resetAllPickBtn();
	},
	clickCross: function(){
		var self = ce6.show.pickWinnerPanel;
		var parentBlock = $(this).parent();
		self._resetBlock(parentBlock);
		var id = parentBlock.attr('id');
		if ('winner-cand' == id)
			$('.win-cand-title .confirm').disableButton();
		self._resetAllPickBtn();
		return false
	},
	resetAll: function(){
		var self = ce6.show.pickWinnerPanel;
		$('.win-user-block').each(function(){
				self._resetBlock($(this));
			});
		self._resetAllPickBtn();
	},
	skip: function(){
		var self = ce6.show.pickWinnerPanel;
		self.confirm(null, true);
	},
	confirm: function(e, noHmIds){
		var self = ce6.show.pickWinnerPanel;
		var params = {
			cid: ce6.show.contestToken,
			hm_ids: JSON.stringify([self.hmEntryTkn1, self.hmEntryTkn2])
		};
		if (noHmIds)
			delete params['hm_ids']
		ce6.ajaxJson('/show/select_honorable_mention', 
				params,
				function(data) {
					if (data.rc == 0){
						$('#dlg-pick-winner').dialog('close');
						$.cookie(ce6.cookieControl.name.SHOWPICKWINNER, params.eid, ce6.cookieControl.shortOption); 
						window.location = data.contest_url;
					}
					else{
						ce6.notifyBar(data.msg, 'error');
						$('#dlg-pick-winner').dialog('close');
						$('#dlg-pick-winner').enableDlgButtons();
						var entryId = '#entry_' + params.eid;
						$(entryId + ' .pick-winner').data('disabled', false);
					}
				}
			);
	},
	restart: function(){
		var self = ce6.show.pickWinnerPanel;
		
		$('.hm-glow-effect').stop();
		$('.hm-glow-effect').css({
				'background-position': '0px 0px',
				width: 660,
				height: 97,
				opacity: 1
			});
		self.glowFadeIn();
	},
	glowFadeIn: function(){
		var self = ce6.show.pickWinnerPanel;
		if (self.glowShineCount > 5){
			$('.hm-glow-effect').remove();
			return
		}
		$('.hm-glow-effect').fadeIn(1000, ce6.show.pickWinnerPanel.glowFadeOut);
	},
	glowFadeOut: function(){
		var self = ce6.show.pickWinnerPanel;
		self.glowShineCount++;
		$('.hm-glow-effect').fadeOut(1000, ce6.show.pickWinnerPanel.glowFadeIn);
	},
	_pickedAlready: function(entryTkn){
		var self = ce6.show.pickWinnerPanel;
		if (self.winnerEntryTkn && self.winnerEntryTkn == entryTkn)
			return 0
		if ((self.hmEntryTkn1 && self.hmEntryTkn1 == entryTkn) || (self.hmEntryTkn2 && self.hmEntryTkn2 == entryTkn))
			return 1
		return -1
	},
	_pickedAlreadySelector: function(selector){
		var self = ce6.show.pickWinnerPanel;
		return $('#entry_' + self.winnerEntryTkn + ' ' + selector + ', ' + 
				 '#entry_' + self.hmEntryTkn1 + ' ' + selector + ', ' + 
				 '#entry_' + self.hmEntryTkn2 + ' ' + selector)
	},
	_resetAllPickBtn: function(){
		var self = ce6.show.pickWinnerPanel;
		if (self.winnerEntryTkn)
			$('.pick-hm-sel').show();
		self._disableAllPickWinnerBtn();
		self._disableAllPickHmBtn();
		if (!self.winnerEntryTkn){
			self._enableAllPickWinnerBtn(self._pickedAlreadySelector('.pick-winner-sel'));
		}
		if (!(self.hmEntryTkn1 && self.hmEntryTkn2)){
			self._enableAllPickHmBtn(self._pickedAlreadySelector('.pick-hm-sel'));
		}
		if (!self.hmEntryTkn1 && !self.hmEntryTkn2){
			$('.win-cand-title .confirm').disableButton();
		}
		else{
			$('.win-cand-title .confirm').enableButton();
		}
	},
	_disableAllPickWinnerBtn: function(){
		$('.pick-winner-sel').disableButton();
	},
	_enableAllPickWinnerBtn: function(excludedSelector){
		var self = ce6.show.pickWinnerPanel;
		$('.pick-winner-sel').not(excludedSelector).enableButton();
	},
	_disableAllPickHmBtn: function(){
		$('.pick-hm-sel').disableButton();
	},
	_enableAllPickHmBtn: function(excludedSelector){
		var self = ce6.show.pickWinnerPanel;
		$('.pick-hm-sel').not(excludedSelector).enableButton();
	},
	_fillBlock: function(block, entryTkn){
		var self = ce6.show.pickWinnerPanel;
		block.addClass('filled').removeClass('empty');
		var submitterPicSrc = $('#entry_' + entryTkn +' .entry-user img').attr('src');
		var submitterName = $('#entry_' + entryTkn +' .entry-user .entry-user-name').html();
		block.children('img').attr('src', submitterPicSrc);
		block.children('.cand-name').html(submitterName);
		$('.ellipsis.singleline').ellipsis({force: true, forceRefreshHtml: true});
	},
	_resetBlock: function(block){
		var self = ce6.show.pickWinnerPanel;
		var id = block.attr('id');
		if ('winner-cand' == id)
			delete self['winnerEntryTkn'];
		else
			delete self['hmEntryTkn'+id.substring(8)];
		block.addClass('empty').removeClass('filled');
	}
};

ce6.show.autoSave = {
	enable: false,
	oldContent: '',
	showSubmitEntry: false,
	init: function() {
		if (!viewer_logged_in) return;
		$('.nicEdit-main').html(ce6.show.autoSave.oldContent);
		setInterval('ce6.show.autoSave.check()', 10000);
		if (this.showSubmitEntry) ce6.show.enterSubmission();
	},
	check: function() {
		if (!this.enable) return;
		var content = ce6.editor.getContentWithAutoLink();
		if (content == this.oldContent) return;
		this.save(content);
	},
	save: function(content) {
		ce6.ajaxJson('/auto_save/save_entry', {cid: ce6.show.contestToken, content: content}, function(data) {
			if (data.rc) {
				ce6.notifyBar(data.msg, 'error');
			} else {
				//ce6.notifyBar('Auto saved', 'success', 2000);
				ce6.show.autoSave.oldContent = content;
				if (!$('#ui-dialog-title-dlg-new-entry').next('#auto-save-msg').length) $('<span id="auto-save-msg" style="display: none;" class="float-left">Drafts Saved at <span class="time"></span></span>').insertAfter('#ui-dialog-title-dlg-new-entry');
				var t = new Clock();
				$('#auto-save-msg').show().find('.time').html(t.twelveFormat());
			}
		});
	},
	discard: function() {
		ce6.ajaxJson('/auto_save/discard_entry', {cid: ce6.show.contestToken}, function(data) {
			if (data.rc) {
				ce6.notifyBar(data.msg, 'error');
			} else {
				ce6.show.autoSave.enable = false;
				ce6.show.autoSave.oldContent = '';
				$('#auto-save-msg').hide();
			}
		});
	}
};
