ce6.nav = (function() {
	var self = {};
	self.init = function() {
		//TODO: user-name, user-image click
		//$('#user-name').click();
		//$('#user-image').click();
		$('#add-credit-btn').click(self.addCredit);
		$('#logout-btn').click(self.logout);
		$('#user-login').click(self.signIn);
		$('#user-sign-up').click(self.signUp);
		$('#user-info').toggleMenu($('#dropdown-links'));
		$('#user-name').ellipsis();

		self.init_notifications();
		self.initSearch();
		self.initActiveContest();
		self.initBonusBalance();
		
		self.loadNotifications();
		self.loadActiveContests();

		$('#nav-messages').toggleMenu($('#nav-msg-menu'), {
			onMenuShow: self.messageMenuShow,
			onMenuHide: self.messageMenuHide
		}).click(self.clickMessages);
		$('#nav-msg-send').click(self.clickSendMessage);
		self.loadMessages();
	};

	self.init_notifications = function() {
		$('#notifications .notification-item [user]').addClass('user-name');
		$('#notifications').toggleMenu($('#notification-menu'), {
			onMenuShow: self.navMenuShow,
			onMenuHide: self.navMenuHide
		}).click(self.clickNotifications);
		$('#notifications .notification-item:last').addClass('non-bottom-line');
	};

	self.addCredit = function() {
		ce6.logButtonClicked(logging_objs.btn_nav_add_credit);
		ce6.addCredit();
	};

	self.initActiveContest = function() {
		var num = $('#nav-contest-new-num');
		parseInt(num.text()) ? num.show() : num.hide();
		$('#nav-contests').toggleMenu($('#nav-contest-menu'), {
			onMenuShow: self.contestMenuShow,
			onMenuHide: self.contestMenuHide
		}).click(self.clickActiveContest);
	};

	self.initBonusBalance = function() {
		if ((viewer.is_paid_verify_bonus) || (surface == 'user.profile')) {
			$('#user-bonus-credit').attr('href', '/history/credit_history');
		} else {
			$('#user-bonus-balance').toggleMenu($('#nav-bonus-menu'), {
				onMenuShow: self.bonusMenuShow,
				onMenuHide: self.bonusMenuHide
			});
			$('#nav-bonus-verify').click(function() {
				ce6.openVerifyDlg();
			});
		}
	};

	self.initSearch = function() {
		$('#search-button').live('click', self.search);
		$('#search-box').live('keypress', function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) {
				self.search();
			}
		});
	};

	self.search = function() {
		var keyword = $.trim($('#search-box').val());
		if(keyword && keyword != $('#search-box').attr('placeholder')) {
			window.location = '/search?k=' + keyword;
		}
	};
	
	self.signIn = function() {
		ce6.logButtonClicked(logging_objs.btn_nav_signin);
		ce6.authDialog.open(null, null, 1);
	};

	self.signUp = function() {
		ce6.logButtonClicked(logging_objs.btn_nav_signup);
		ce6.authDialog.open(null, null, 0);
	};

	self.logout = function() {
		ce6.logButtonClicked(logging_objs.btn_nav_logout);
		ce6.auth.logout();
	};

	self.logAndRedirect = function(buttonId, pageUrl) {
		return function() {
			ce6.logButtonClicked(buttonId);
			ce6.site.redirect(pageUrl);
		}
	};

	self.clickNotifications = function() {
		// ce6.logButtonClicked(logging_objs.btn_nav_notification);
		if($('#notification-new-num').length) {
			ce6.ajaxJson('/notifications/set_all_seen');
			$('.notifications-icon').removeClass('notifications-icon-active');
			$('#notification-new-num').text('').hide();
		}
	};

	self.clickMessages = function() {
		// ce6.logButtonClicked(logging_objs.btn_nav_messages);
		if ($('#nav-msg-new-num').length) {
			ce6.ajaxJsonPost('/messages/update_last_viewed');
			$('.nav-msg-icon').removeClass('nav-msg-icon-active');
			$('#nav-msg-new-num').text('').hide();
		}
	};

	self.clickActiveContest = function() {
		// ce6.logButtonClicked(logging_objs.btn_nav_activ_contest);
		if($('#nav-contest-new-num:visible').length) {
			// ce6.ajaxJson('/contest/set_all_seen');
			$('.nav-contest-icon').removeClass('nav-contest-icon-active');
			$('#nav-contest-new-num').hide();
		}
	};
	
	//Custom function to load notifications
	self.loadNotifications = function() {
		ce6.ajaxJsonGet('/notifications/load_notifications', {},
			function(data) {
				if(data.notifications.length == 0) {
					$('#notification-empty').show();
					return;
				}
				$.each(data.notifications, function(idx, notification) {
					var elem = self.contructNotificationItem(notification);
					$('#notification-items').append(elem);
				});
				if(data.count != null){
					$('#notification-new-num').text(data.count).show();				
					$('#notification-icon').addClass('notifications-icon-active');
				}
				$('#notification-menu .notification-item:last').addClass('non-bottom-line');
			}
		);
	}
	
	self.contructNotificationItem = function(notification) {
		if(notification.type == 'follow') {
			var item = $('#'+notification.type).clone().show().removeAttr('id');
			item.attr('href', 'users/'+notification.user_id);
			item.find('.user-name').html(notification.username);
			item.find('.notification-timeago').html(notification.created_at);
			return item;
		}else if(notification.type == 'entry') {
			var item = $('#'+notification.type).clone().show().removeAttr('id');
			item.attr('href', 'contests/'+notification.contest_id);
			item.find('.user-name').html(notification.username);
			item.find('#contest-title').html(notification.contest_name);
			item.find('.notification-timeago').html(notification.created_at);
			return item;
		}
	}
	
	//Custom function to load active_contests
	self.loadActiveContests = function() {
		ce6.ajaxJsonGet('/contests/load_active_contests', {},
			function(data) {
				if(data.active_contests.length == 0) {
					$('#nav-cnt-empty').show();
					return;
				}
				$.each(data.active_contests, function(idx, active_contest) {
					var elem = self.constructActiveContestItem(active_contest);
					elem.appendTo('#nav-contest-content');
				});
				$('#notification-title').text('Active Contests('+ data.count +')');
			}
		);
	}
	
	self.constructActiveContestItem = function(active_contest) {
		var item = $('#nav-ntf-item-proto').clone().show().removeAttr('id');
		item.attr('href', '/contests/' + active_contest.id);
		item.html(active_contest.title);
		return item;
		
	}
	
	self.clickSendMessage = function() {
		if (surface == 'message_box.conversation_view')
			ce6.message.sendMessageOnConversationView();
		else if (surface == 'user.profile')
			ce6.message.sendPrivateMessage(profileOwner.token != viewer.token ? profileOwner : null);
		else
			ce6.message.sendPrivateMessage();
		return false;
	}

	self.loadMessages = function() {
		ce6.ajaxJsonGet('/messages/load_messages_on_navbar', {},
			function(data) {
				// alert(JSON.stringify(data));
				if (data.messages.length == 0) {
					$('#nav-msg-empty').show();
					return;
				}

				$.each(data.messages, function(idx, message) {
					var elem = self.constructMessageItem(message);
					elem.appendTo('#nav-msg-content');
				});
				$('#nav-msg-new-num').text(data.count).show();
				$('.nav-msg-icon').addClass('nav-msg-icon-active');
				$('#nav-msg-menu .notification-item:last').addClass('non-bottom-line');
			}
		);
	}

	self.constructMessageItem = function(message) {
		var item = $('#nav-msg-item-proto').clone().show().removeAttr('id');
		item.find('.user-name').html(message.sender_name);
		item.find('.message-preview').html(message.text);
		item.find('.timeago').html(message.time_created);
		item.click(function() {
			ce6.site.redirect('messages/messages', {friend_token: message.sender_id});
		})
		return item;
	}

	self.messageMenuShow = function() {
		var tip = $('.nav-msg-icon').data('tip');
		if (tip) tip.disable();
		self.addEllipsisOnMessages();
	}

	self.messageMenuHide = function() {
		var tip = $('.nav-msg-icon').data('tip');
		if (tip) tip.enable();
	}

	self.addEllipsisOnMessages = function() {
		$('#nav-msg-content .message-preview').ellipsis();
	}

	self.navMenuShow = function() {
		var tip = $('#notification-icon').data('tip');
		if (tip) tip.disable();
		self.logNavNtfImpression();
	}

	self.navMenuHide = function() {
		var tip = $('#notification-icon').data('tip');
		if (tip) tip.enable();
	}

	self.contestMenuShow = function() {
		var tip = $('.nav-contest-icon').data('tip');
		if (tip) tip.disable();
	}

	self.contestMenuHide = function() {
		var tip = $('.nav-contest-icon').data('tip');
		if (tip) tip.enable();
	}
	
	self.bonusMenuShow = function() {
		var tip = $('.user-bonus-icon').data('tip');
		if (tip) tip.disable();
	}

	self.bonusMenuHide = function() {
		var tip = $('.user-bonus-icon').data('tip');
		if (tip) tip.enable();
	}

	self.logNavNtfImpression = function() {
		// ce6.log.sendImpressionLogReq('ntf-log-attr-nav', '/notification/logger_impression');
	}
	return self;
})();
