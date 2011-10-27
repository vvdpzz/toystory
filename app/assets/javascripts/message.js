ce6.message = (function() {
	var self = {};
	// PRIVATE METHODS AND VARIABLES
	var userList = null;
	var getUserInfoByToken = function(token) {
		var matched = $.grep(userList, function(user) {
			return user.id == token;
		});
		return matched.length == 0 ? null : matched[0];
	}

	//////////////////////////////////
	// Functions for Send Message Box
	//////////////////////////////////
	var recipientToken = null;
	var userSelector = null;
	var enteringUserName = false;
	var sendButton = null;
	var sendButtonDisabled = true;
	var messageTextLimit = 1000;
	this.dialogOpened = false;

	var sendMessageDialog = {
		initialized : false,
		autoOpen: false,
		modal: true,
		width: 500,
		height: 325,
		resizable: false,
		title: 'New Message',
		dialogClass: 'dlg-container-send-message',
		draggable: false,
		beforeClose: function() {
			ce6.message.dialogOpened = false;
			resetMessageDialog();
		},
		buttons: {
			Cancel: function() {
				// close dialog
				$(this).dialog('close');
			},
			Send: function() {
				if (!sendButtonDisabled)
					submitMessage();
			}
		},
		init : function() {
			this.initialized = true;
			$('#dlg-send-message').dialog(this).restyleButtons();
			$('#message-body textarea')
				.bind('keyup', updateSendMessageCountdown)
				.bind('blur', updateSendMessageCountdown)
				.bind('focus', messageTextOnFocus)
				.val('')
			$('#send-message-countdown').text(messageTextLimit);
			addRecipientInputBox();
			sendButton = $('.dlg-container-send-message .ui-dialog-buttonpane button:last');
	    },
		open : function() {
			ce6.message.dialogOpened = true;
			disableSendButton();
		}
	};

	var loadUserConnectionList = function(profileOwner) {
		userSelector = new ce6.msgUserSelector(); 
		ce6.ajaxJsonGet('/messages/load_contact_list', {
		}, function(data) {	
			userList = data.contact_list;
			// alert(JSON.stringify(data));
			if (profileOwner) {
				var isOwnerInList = false;
				for (var i = 0; i < data.contact_list.length; i++)
					if (data.contact_list[i].token == profileOwner.token) {
						isOwnerInList = true;
						break;
					}
				if (!isOwnerInList)
					data.contact_list.push(profileOwner);
			}
			userSelector.userList = data.contact_list; 
		});
	};

	var updateSendMessageCountdown = function() {
		var countdown = messageTextLimit - $(this).val().length;
		$('#send-message-countdown').text(countdown);
		if (countdown < 0)
			$('#send-message-countdown').addClass('negative');
		else
			$('#send-message-countdown').removeClass('negative');

		updateSendButtonState();
	}

	var messageTextOnFocus = function() {
		userSelector.hide();
	}

	var getMessageText = function() {
		return $('#message-body textarea').val();
	};

	var updateSendButtonState = function() {
		var messageText = getMessageText();
		if (!recipientToken || !messageText || messageText.length > messageTextLimit)
			disableSendButton();
		else
			enableSendButton();
	}

	var disableSendButton = function() {
		sendButton.addClass('ui-state-disabled');
		sendButtonDisabled = true;
	}

	var enableSendButton = function() {
		sendButton.removeClass('ui-state-disabled');
		sendButtonDisabled = false;
	}

	self.selectRecipient = function(user) {
		$('#message-recipient input').remove();
		$('#message-recipient .recipient-name').remove();
		$('#message-recipient .remove-button').remove();
		
		var userSpan = "<span class='recipient-name'>" + stringutil.cut(user.username, 35) + "</span><span class='remove-button'></span>";
		$('#message-recipient').append(userSpan);
		$('#message-recipient .remove-button').click(removeRecipient);

		recipientToken = user.id;

		updateSendButtonState();
	};

	var addRecipientInputBox = function() {
		var recipientInput = "<input type='text' placeholder='Send message to people you are following' id='msg-user-input'/>";
		$(recipientInput).appendTo($('#message-recipient'))
			.placeholder()
			.focus();
		userSelector.bindInputElement('#msg-user-input');
		userSelector.refresh();
	};

	var removeRecipient = function() {
		$('#message-recipient .recipient-name').remove();
		$('#message-recipient .remove-button').remove();
		userSelector.clear();
		addRecipientInputBox();
		recipientToken = null;
		disableSendButton();
	};

	var submitMessage = function() {
		sendButtonDisabled = true;
		var messageText = getMessageText();
		ce6.ajaxJson('/messages/send_message', {
			'recipient_token' : recipientToken,
			'text' : messageText
		}, function(res){
			if (res.rc) {
				ce6.notifyBar(res.msg, 'error');
				sendButtonDisabled = false;
			} else {
				ce6.notifyBar('The message has been sent successfully', 'success');
				var cb = $('#dlg-send-message').data('successCallback');
				if (cb)
					cb(recipientToken, messageText);
				$('#dlg-send-message').dialog('close');
			}
		});
	}

	var resetMessageDialog = function() {
		if (recipientToken)
			removeRecipient();
		$('#message-body textarea').val('');
		$('#message-recipient input').val('');
		userSelector.clear();
		userSelector.hide();
		$('#dlg-send-message').data('successCallback', null);
		$('#send-message-countdown').text(messageTextLimit).removeClass('negative');
	}

	//////////////////////////////////
	// Functions for Conversation View
	//////////////////////////////////
	var constructConversationBox = function(data) {
		var box = $('#conversation-box-proto').clone().show()
					.attr('id', 'conversation-box-' + data.friend_token)
					.data('friendToken', data.friend_token)
					.click(function() {
						ce6.site.redirect('messages/messages', {friend_token : data.friend_token});
					});
		if (data.unread_message_count > 0)
			box.addClass('conversation-box-highlight');

		box.find('.conversation-friend-picture img').attr('src', data.friend_picture);
		var friendName = data.friend_name;
		if (data.unread_message_count > 0)
			friendName += ' (' + data.unread_message_count + ')';

		box.find('.conversation-info .friend-name').html(friendName);
		box.find('.conversation-info .message-preview').html(data.last_message);
		if (data.last_message_is_outgoing)
			box.find('.conversation-info .message-preview').addClass('outgoing-icon');	

		box.find('.conversation-last-update .conversation-date').html(data.last_update);

		box.find('.conversation-last-update .remove-button').click(function(e){
			removeConversation(data.friend_token);
			e.stopPropagation();
		});
		return box;
	}

	var addEllipsisInConversationBox = function(box) {
		box.find('.conversation-info .message-preview').ellipsis();
	}

	var addNewMessageToConversation = function(friendToken, messageText) {
		var box = $('#conversation-box-' + friendToken);
		if (box.length == 1) {
			box.find('.conversation-info .message-preview').text(messageText)
				.addClass('outgoing-icon');
			box.find('.conversation-last-update .conversation-date').html('1 second ago');
		} else {
			var friend = getUserInfoByToken(friendToken);
			box = constructConversationBox({
				'friend_token' : friendToken,
				'friend_picture' : friend.picture,
				'friend_name' : friend.name,
				'unread_message_count' : 0,
				'last_message' : htmlEscape(messageText),
				'last_update' : '1 second ago',
				'last_message_is_outgoing' : true
			});
		}
		box.prependTo('#conversations-container');
		addEllipsisInConversationBox(box);
		$('#conversations-empty').hide();
	}

	var removeConversation = function(friendToken) {
		ce6.confirmDialog('Do you want to delete this conversation?', 'Delete Conversation',
			function() {
				ce6.ajaxJson('/messages/remove_conversation', {
					friend_token : friendToken
				});
				$('#conversation-box-' + friendToken).slideToggle(
					'fast', function() {
						$(this).remove();
						if($('.conversation-box:visible').length == 0)
							$('#conversations-empty').show();
				});
			}
		);
	}

	var loadConversations = function() {
		ce6.ajaxJsonGet('/messages/load_conversations', {},
			function(data) {
				if (data.conversations.length > 0)
					$.each(data.conversations, function(idx, conversation) {
						var elem = constructConversationBox(conversation);
						elem.appendTo('#conversations-container');
						addEllipsisInConversationBox(elem);
					});
				else
					$('#conversations-empty').show();
			}
		);
	}

	//////////////////////////////////
	// Functions for Message View
	//////////////////////////////////
	var isReplyBoxBeFixed = false;

	var scrollToBottom = function() {
		$(window).scrollTop($(document).height());
	}

	var constructMessageEntry = function(data) {
		var box = $('#message-entry-proto').clone().show()
					.attr('id', 'message-entry-' + data.message_token);

		box.find('.friend-picture a').attr('href', data.owner_profile_url);
		box.find('.friend-picture img').attr('src', data.owner_picture);
		box.find('.message-info .owner-name').html(data.owner_name).attr('href', data.owner_profile_url);
		box.find('.message-info .message-date').html(data.time_created);
		box.find('.message-body').html(data.text);

		// box.find('.message-info .remove-button').click(function(e){
		// 	removeMessage(data.message_token);
		// });
		return box;
	}

	var showNewMessage = function(messageToken, messageText) {
		var e = constructMessageEntry({
			message_token : messageToken,
			owner_name : viewer.name,
			owner_picture : viewer.picture,
			owner_profile_url : ce6.site.url('profile', {uid : viewer.token}),
			time_created : '1 second ago',
			text : messageText
		});
		e.appendTo('#messages-container');
		// background animation 
		e.append($("<div>")
			.css({
				backgroundColor: '#fee791',
				position: 'absolute',
				top: 0,
				left: 0,
				zIndex: -1,
				width: e.outerWidth(),
				height: e.outerHeight()
			})
			.addClass('entry-background')
		);
		e.find('.entry-background').fadeOut(1000, function() { 
			$(this).remove();
		});
	}

	var removeMessage = function(message_token) {
		ce6.ajaxJson('/message/remove_message',
			{
				message_token: message_token
			},
			function(data) {
				$('#message-entry-' + message_token).slideToggle(
					'fast', function(){
						$(this).remove();
						$('.message-entry:visible').first().addClass('message-first-entry');
						replyBoxPosition();
					}
				);
			}
		);
	}

	var updateReplyMessageCountdown = function() {
		var countdown = messageTextLimit - $(this).val().length;
		$('#reply-message-countdown').text(countdown);
		if (countdown < 0) 
			$('#reply-message-countdown').addClass('negative');
		else
			$('#reply-message-countdown').removeClass('negative');
		updateReplyButtonState();
	}

	var updateReplyButtonState = function() {
		var msg = $('.message-reply-box textarea').val();
		if (msg.length > 0 && msg.length <= messageTextLimit) {
			$('#btn-reply-message').removeClass('btn-disabled');
		} else {
			$('#btn-reply-message').addClass('btn-disabled');
		}
	}

	var replyMessage = function(friendToken) {
		if($('#btn-reply-message').hasClass('btn-disabled'))
			return;
		$('#btn-reply-message').addClass('btn-disabled');
		var messageText = $('.message-reply-box textarea').val();
		ce6.ajaxJson('/messages/send_message', {
			'recipient_token' : friendToken,
			'text' : messageText
		}, function(res){
			if (res.rc) {
				ce6.notifyBar(res.msg, 'error');
				$('#btn-reply-message').removeClass('btn-disabled');
			} else {
				showNewMessage(res.outgoing_token, htmlEscape(messageText));
				scrollToBottom();
				$('.message-reply-box textarea').val('');
				$('#reply-message-countdown').text(messageTextLimit);
			}
		});
	}

	var loadMessages = function(friendToken) {
		ce6.ajaxJsonGet('/messages/load_messages', {
				'friend_token': friendToken
			}, function(data) {
				
				// alert(JSON.stringify(data));
				$.each(data.messages, function(idx, message) {
					var elem = constructMessageEntry(message);
					elem.appendTo('#messages-container');
				});
				$('.message-entry:visible').first().addClass('message-first-entry');
				$('.message-reply-box').show();
				$(window).resize(replyBoxPosition);
				$(window).scroll(showBorderShadow);
				replyBoxPosition();
				scrollToBottom();
			}
		);
	}

	var showBorderShadow = function() {
		if ($(window).scrollTop() > 0)
			$('.message-border-shadow').show();
		else
			$('.message-border-shadow').hide();

	}

	var replyBoxPosition = function() {
		// will reply box be out of window if it's put after messages-container		
		replyBoxTop = $('#messages-container').offset().top + $('#messages-container').innerHeight();
		replyBoxHeight = $('.message-reply-box').outerHeight();
		replyBoxBottom = replyBoxTop + replyBoxHeight;
		// will it be larger than window bottom
		var willReplyBoxBeFixed = (replyBoxBottom > $(window).height());
		if (willReplyBoxBeFixed == isReplyBoxBeFixed) return;
		if (willReplyBoxBeFixed) {
			//make reply box fixed
			$('.message-reply-box').css({
				'position' : 'fixed',
				'bottom' : 0
			});
			// add white space to the bottom of message-container 
			$('#messages-container').css('margin-bottom', replyBoxHeight);
			// show border shadow
			var borderPos = $('.message-header-fixed').offset().top + $('.message-header-fixed').innerHeight();
			$('.message-border-shadow').css('top', borderPos);
			showBorderShadow();
		} else {
			$('.message-reply-box').css({
				'position' : 'static'
			});
			$('#messages-container').css('margin-bottom', 0);
		}
		isReplyBoxBeFixed = willReplyBoxBeFixed;
	}

	// PUBLIC METHODS
	self.initConversationView = function() {
		loadConversations();
		$('#btn-send-message, #compose-message-link').click(self.sendMessageOnConversationView);
	}

	self.sendMessageOnConversationView = function() {
		self.sendPrivateMessage(null, addNewMessageToConversation);
	}

	self.initMessageView = function() {
		loadMessages(messageFriendToken);
		$('.message-reply-box textarea').bind('keyup', updateReplyMessageCountdown)
			.bind('blur', updateReplyMessageCountdown);
		$('#reply-message-countdown').text(messageTextLimit);
		$('#btn-reply-message').click(function(){
			replyMessage(messageFriendToken);
		});
		$('#btn-back-to-conversations').click(function(){
			ce6.site.redirect('messages/conversations');
		});
	}

	self.sendPrivateMessage = function(user, successCallback) {
		if (!userSelector) {
			loadUserConnectionList(user);
		}
		if (!sendMessageDialog.initialized) {
			sendMessageDialog.init();
		}
		$('#dlg-send-message').dialog('open');

		if (successCallback) {
			$('#dlg-send-message').data('successCallback', successCallback);
		}
		if (user) {
			self.selectRecipient(user);
			$('#message-body textarea').focus();
		} else {
			$('#message-recipient input').focus();
		}
	};	

	return self;
})();

ce6.msgUserSelector = function() {
	var superClass = new ce6.Selector({
		dropdownClass: "user-selector-list",
		rowClass: "user-entry-item",
		defaultMsg : "Enter the name of someone you're following..."
	});

	superClass.userList = [];
	
	var sortUser = function(a, b) {
		return a.username.toLowerCase() < b.username.toLowerCase() ? -1 : 1;
	}

	var matchUsers = function(userList, pat) {
		var firstClassMatch = [];
		var secondClassMatch = [];
		pat = pat.toLowerCase();
		if (!pat) {
			return []
		}
		$.each(userList, function(idx, userObj) {
			var name = userObj.username.toLowerCase();
			var pos = name.indexOf(pat);
			if (pos == 0)
				firstClassMatch.push(userObj);
			else if (pos > -1)
				secondClassMatch.push(userObj);
		});
		firstClassMatch.sort(sortUser);
		secondClassMatch.sort(sortUser);
		return firstClassMatch.concat(secondClassMatch);
	}

	superClass.constructRow = function(idx, rowObj) {
		var row = "<div class='user-entry-item' index=" + idx + ">";
		row += "<img src='" + rowObj.picture + "'>";
		row += "<span>" + rowObj.username + "</span>";
		row += "</div>";
		return $(row);
	}

	superClass.refresh = function() {
		if (!ce6.message.dialogOpened) {
			return false;
		}
		var value = $.trim($(superClass.inputElem).val());
		var list = matchUsers(superClass.userList, value);
		superClass.refreshList(list);
	}
	
	superClass.onEnter = function(e) {
		return;
	}

	superClass.onSelect = function(idx) {
		var user = superClass.list[idx];
		ce6.message.selectRecipient(user);
	}

	return superClass;
};