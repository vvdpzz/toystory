ce6.user = {
	charLimit: {
		username: 40,
		description: 25,
		location: 25,
		introduction: 500
	},
	wordCount: function(content, element) {
		if (element == "username") {
			return ce6.user.charLimit.username - content.length;
		} else if (element == "description") {
			return ce6.user.charLimit.description - content.length;
		} else if (element == "location") {
			return ce6.user.charLimit.location - content.length;
		} else if (element == "introduction") {
			return ce6.user.charLimit.introduction - content.length;
		} else {
			return 0;
		}
	},
	showCount: function(count, element_id) {
		$('#'+element_id).html(count);
		if (count < 0) {
			$('#'+element_id).removeClass('gray').addClass('red');
		} else {
			$('#'+element_id).removeClass('red').addClass('gray');
		}
	},
	checkCount: function(content, element) {
		var element_id = "profile-" + element + "-count";
		count = ce6.user.wordCount(content, element);
		ce6.user.showCount(count, element_id);
		return count;
	},
	init: function() {
		$('button.follow, button.unfollow').click(ce6.user.setRelation);
		$('#profile-user-detail-username .edit-tab').live('click', ce6.user.setUsername);
		$('#profile-user-detail-description .edit-tab').live('click', ce6.user.setDescription);
		$('#profile-user-detail-location .edit-tab').live('click', ce6.user.setLocation);
		$('#profile-user-detail-introduction .edit-tab').live('click', ce6.user.setIntroduction);
		$('#profile-user-detail-website .edit-tab').live('click', ce6.user.setWebsite);
		$('#profile-user-detail-categories .edit-tab').live('click', ce6.user.setCategories);
		$('#profile-send-message').click(ce6.user.sendPrivateMessage);
		$('button.external-link').click(ce6.user.redirect);
		ce6.user.hookTextareaMaxlength();
		ce6.user.showAddOrEditWebsite();
    /* ce6.user.showCategories();
		if (profileOwner.is_myself) {
			ce6.user.initConnections();
		}*/
		$('#block-user-btn').click(ce6.user.blockUser);
		$('#unblock-user-btn').click(ce6.user.unblockUser);
		$('#suspend-user-btn').click(ce6.user.suspendUser);
		$('#unsuspend-user-btn').click(ce6.user.unsuspendUser);
	},
	redirect: function(){
		redirect_to = $(this).attr('href');
		if (redirect_to) {
			window.open(redirect_to);
		}
	},
	setRelation: function() {
		var elem = $(this);
		if (elem.data('disabled')) return;
		elem.data('disabled', true);
		isFollowed = $(this).attr('followed');
		if (isFollowed == '1') {  
			elem.removeClass('unfollow').addClass('follow').text('Follow').attr('followed', '0');
			ce6.user.unfollowUser($(this).attr('uid'), function(){
				elem.data('disabled', false);
			});
		} else {
			if (viewer_logged_in)
				elem.removeClass('follow').addClass('unfollow').text('Unfollow').attr('followed', '1');
			ce6.user.followUser($(this).attr('uid'), function(data){
					if (data.rc) elem.removeClass('unfollow').addClass('follow').text('Follow').attr('followed', '0');
					elem.data('disabled', false);
				}, 
				function(){
					elem.data('disabled', false);
				});
		}
	},
	followUser: function(uid, callback, authCancel) {
		ce6.ajaxLog(event_types.follow_button_clicked, {time_passed:0});
		if (viewer_logged_in) {
			ce6.ajaxJson('/profile/follow_user', 
				{
					'uid': uid 
				},
				function(data){ 
					if (callback != undefined) callback(data); 
					if (data.rc) ce6.notifyBar(data.msg, 'error');
				}
			)
		} else {
			ce6.authDialog.open(
				function() { 
					ce6.ajaxJson('/profile/follow_user', 
						{ 
							'uid': uid
						},
						function(){ window.location.reload(); }
					)
				},
				function() {
					if (authCancel != undefined) authCancel();
				}, 'auto', ce6.authDialog.onDemandTitle
			);
		}
    },
	unfollowUser: function(uid, callback) {
		ce6.ajaxJson('/profile/unfollow_user', { 'uid': uid },
			function(){ 
				if (callback != undefined) callback(); 
			}
		)
    },
	followContest: function(cid, callback, authCancel) {
		if (viewer_logged_in) {
			ce6.ajaxJson('/profile/follow_contest', { 'cid': cid },
				function(data){ 
					if (data.rc) ce6.notifyBar(data.msg, 'error');
					if (callback != undefined) callback(data); 
				}
			)
		} else {
			ce6.authDialog.open(
				function() { 
					ce6.ajaxJson('/profile/follow_contest', { 'cid': cid },
						function(){ window.location.reload(); }
					)
				},
				function() {
					if (authCancel != undefined) authCancel();
				}, 'auto', ce6.authDialog.onDemandTitle
			);
		}
    },
	unfollowContest: function(cid, callback) {
		ce6.ajaxJson('/profile/unfollow_contest', { 'cid': cid },
			function(){ 
				if (callback != undefined) callback(); 
			}
		)
    },
	
	setUsername: function(e) {
		ce6.user.inlineEdit({
			editor: 'username',
			hideElements: ['#profile-user-detail-username', '.nav-arrow-container', '#profile-view-mode'],
			showElement: '#profile-user-detail-username-edit',
			inputElement: 'input.profile-name-box',
			textElement: 'a.profile-username',
			nonEmpty: true,
			hasPlaceholder: false
		});
	},
	
	setDescription: function(e) {
		ce6.user.inlineEdit({
			editor: 'description',
			editorText: 'occupation',
			hideElements: ['#profile-user-detail-description', '.profile-user-detail-header .edit-tab'],
			showElement: '#profile-user-detail-description-edit',
			inputElement: 'input.selector-desc',
			textElement: 'span.profile-description',
			defaultValue: 'Add Your Headline'
		});
	},
	
	setLocation: function(e) {
		ce6.user.inlineEdit({
			editor: 'location',
			hideElements: ['#profile-user-detail-location', '.profile-user-detail-header .edit-tab'],
			showElement: '#profile-user-detail-location-edit',
			inputElement: 'input.selector-location',
			textElement: 'span.profile-location',
			defaultValue: 'Add Your Location'
		});
	},
	
	setIntroduction: function(e) {
		ce6.user.inlineEdit({
			editor: 'introduction',
			hideElements: ['#profile-user-detail-introduction', '.profile-user-detail-header .edit-tab'],
			showElement: '#profile-user-detail-introduction-edit',
			inputElement: 'textarea.selector-introduction',
			textElement: 'span.profile-introduction',
			callback: function(){
				if (profileOwner.introduction) {
					$("span.profile-introduction").removeClass('gray');
				} else {
					$("span.profile-introduction").addClass('gray');
				}
			},
			defaultValue: 'Tell others something about yourself!'
		});
	},
	
	setWebsite: function(e){
		ce6.user.inlineEdit({
			editor: 'website',
			hideElements: ['#profile-user-detail-website', '.profile-user-detail-header .edit-tab'],
			showElement: '#profile-user-detail-website-edit',
			inputElement: 'input.selector-website',
			textElement: 'a.profile-website',
			callback: ce6.user.showAddOrEditWebsite,
			cancelCallback: ce6.user.showAddOrEditWebsite,
			hasCount: false
		});
	},

	setCategories: function(e) {
		ce6.user.initCategoriesSelection();
		ce6.user.inlineEdit({
			editor: 'categories',
			hideElements: ['#profile-user-detail-categories', '.profile-user-detail-header .edit-tab'],
			showElement: '#profile-user-detail-categories-edit',
			bypassAutoPost: true,
			saveCallback: function() {
				var categories = [];
				$('#profile-categories-selection input:checked').each(function(){
					categories.push($(this).val());
				});
				ce6.ajaxJsonPost('/profile/update_categories', {
					'categories' : JSON.stringify(categories)
				}, function(result) {
					profileOwner.categories = categories;
					ce6.user.showCategories();
				});
			}
		});
	},

	initCategoriesSelection: function() {
		var dom = $('<ul></ul>');
		var title = $('#profile-categories-container').attr('title');
		dom.attr('id', 'profile-categories-selection');
		$('#profile-categories-container').empty();

		$.each(profileOwner.site_categories, function(k,v) {
			var li=$('<li class="clearfix"></li>');
			var label=$('<label>'+v['name']+'</label>');
			label.attr('for', v['id']);
			var option = $('<input type="checkbox" />');
			option.val(k);
			option.attr('name', v['name']);
			option.attr('id', v['id']);
			if (-1 != $.inArray(k, profileOwner.categories)) {
				option.attr('checked', 'checked');
			}
			li.append(option);
			li.append(label);
			dom.append(li);
		});
		$('#profile-categories-container').append(dom);
	},

/*	showCategories: function() {
		var render_html = '';
		if (profileOwner.categories.length > 0) {
			var length = profileOwner.categories.length;
			for (var i=0; i<length; i++) {
				var cat_token = profileOwner.categories[i];
				var site_cat = profileOwner.site_categories[cat_token];
				if (i > 0) { render_html += " , "; }
				render_html += "<a href='" + site_cat['url'] + "'>" + site_cat['name'] + "</a>";
			}
		} else {
			render_html = $('#profile-user-detail-categories-edit').attr('placeholder');
		}
		$('span.profile-categories').html(render_html);
	},*/
	
	showAddOrEditWebsite: function() {
		if (profileOwner.website) {
			var rawUrl = smartUnescape(profileOwner.website);
			var idx = rawUrl.indexOf('://');
			var scheme = 'http';
			if (idx > 0) {
				scheme = rawUrl.substring(0, idx);
				rawUrl = rawUrl.substring(idx + 3);
			}
			$('.profile-website').html(profileOwner.website).attr('href', scheme + '://' + encodeURIComponent(rawUrl));
			$('.profile-edit-website').show();
			$('.profile-add-website').hide();
		} else {
			$('.profile-website').attr('href', '');
			$('.profile-edit-website').hide();
			$('.profile-add-website').show();
		}
	},

	hookFeedUser:function(){
		$('.show-more-inactive').each(function(){
			$(this).one('click', ce6.user.showFeedUser);
		});
		$('.profile-tab-btn').data('clicked', false);
		$('.profile-filter-box a').data('clicked', false);
		ce6.feed.handleTextOverflow();
	},
	showFeedUser:function(){
		$(this).parent().children('.followed-user-container').children('div:hidden').slideDown();
		$(this).removeClass('show-more-inactive').addClass('show-more-active').one('click', ce6.user.hideFeedUser);
		return false;
	},
	hideFeedUser:function(){
		$(this).parent().children('.followed-user-container').children('.followed-user-feed-hidden').slideUp();
		$(this).removeClass('show-more-active').addClass('show-more-inactive').one('click', ce6.user.showFeedUser);
		return false;
	},
	sendPrivateMessage:function() {
		ce6.message.sendPrivateMessage(profileOwner);
		return false;
	},
	hookTextareaMaxlength:function() {
		$('textarea[maxlength]').live('keyup', 
				function(){this.value = this.value.substring(0, parseInt($(this).attr('maxlength'), 10));}
			);
		$('textarea[maxlength]').live('blur', 
				function(){this.value = this.value.substring(0, parseInt($(this).attr('maxlength'), 10));}
			);
	},
	inlineEditBinded : { },
	getProfileValue: function(editor) {
		// hack username -> user
		if (editor=='username') {
			return profileOwner['name'];
		} else {
			return profileOwner[editor];
		}
	},
	setProfileValue: function(editor, val) {
		// hack username -> user
		if (editor=='username') {
			profileOwner['name'] = val;
		} else {
			profileOwner[editor] = val;
		}
	},
	_inlineEditExchange: function(elements, exc) {
		if (exc == 'edit') {
			for (i in elements.hide) {
				$(elements.hide[i]).hide();
			}
			$(elements.show).show();
		} else {
			for (i in elements.hide) {
				$(elements.hide[i]).show();
			}
			$(elements.show).hide();
		}
	},
	_inlineEditOpen: function(elements, editor, hasCount) {
		// hide displayer, open the edit elements
		ce6.user._inlineEditExchange(elements, 'edit');
		// fill in the initial value
		var hasValue = false;
		if (ce6.user.getProfileValue(editor)) {
			$(elements.input).val($(elements.text).text()).focus();
			hasValue = true;
		}
		// check count
		if (hasCount) {
			ce6.user.checkCount(hasValue ? $(elements.text).text() : '', editor);
		}
	},
	inlineEdit: function(data) {
		var elements = {
			hide: data.hideElements,
			show: data.showElement,
			input: data.inputElement,
			text: data.textElement ? data.textElement : ''
		};
		var editor = data.editor;
		var hasCount = (data.hasCount != undefined) ? data.hasCount : true;
		var hasPlaceholder = (data.hasPlaceholder != undefined) ? data.hasPlaceholder : true;
		var defaultValue = data.defaultValue ? data.defaultValue : '';
		var bypassAutoPost = (data.bypassAutoPost != undefined) ? data.bypassAutoPost : false;
		var editorText = data.editorText ? data.editorText : editor;

		ce6.user._inlineEditOpen(elements, editor, hasCount);

		// bind the event once
		if (!ce6.user.inlineEditBinded[editor]) {
			ce6.user.inlineEditBinded[editor] = true;

			// bind key up, if need count the char
			if (hasCount) {
				$(elements.input).keyup(function() {
					var content= $.trim($(elements.input).val());
					ce6.user.checkCount(content, editor);
					return false;
				});
			}

			// bind 'save' button
			var btn_id = 'profile-'+editor+'-btn';
			$('#'+btn_id).click(function() {
				// get value
				if (hasPlaceholder) {
					value = $.trim($(elements.input).trigger('focus.placeholder').val());
				} else {
					value = $.trim($(elements.input).val());
				}
				// check empty value if need
				if (data.nonEmpty) {
					if (!value && value.length == 0) {
						ce6.showNotify({'rc':1, 'msg':'Please enter non-empty '+editor+'.'});
						return false;
					}
				}
				// check count
				if (hasCount) {
					count = ce6.user.wordCount(value, editor);
					if (count<0) {
						ce6.notifyBar('You have exceed the character limit. Please try a shorter '+editorText+'.', 'error');
						return false;
					}
				}
				// disable other save button
				$('.profile-edit-bar').not($(this).parent()).children('button').each(
					function(){$(this).addClass('ui-state-disabled');$(this).attr('disabled', true);});

				// server call
				if (bypassAutoPost) {
					ce6.user._inlineEditExchange(elements, 'display');
					$('.profile-edit-bar').not($(this).parent()).children('button').each(
						function(){$(this).removeClass('ui-state-disabled');$(this).attr('disabled', false);});
					if (data.saveCallback) {
						data.saveCallback();
					}
				} else {
					var call_api = '/profile/update_'+editor;
					var call_parm = {};
					call_parm[editor] = value;
					ce6.ajaxJson(call_api, call_parm,
						// callback
						function(resp) {
							// enable other save button
							$('.profile-edit-bar').not($(this).parent()).children('button').each(
								function(){$(this).removeClass('ui-state-disabled');$(this).attr('disabled', false);});
							// check response
							if (resp.rc != 0) {
								if (resp.msg) {
									ce6.notifyBar(resp.msg, 'error');
								} else {
									ce6.notifyBar('Update '+editorText+' error.', 'error');
								}
								return false;
							}
							ce6.user.setProfileValue(editor, resp.result);
							$(elements.text).text(resp.result || defaultValue);
							// open displayer, hide the edit elements
							ce6.user._inlineEditExchange(elements, 'display');
							if (data.callback) {
								data.callback();
							}
						}
					);
				}
			});
			
			// bind 'cancel' button
			$(elements.show + ' .cancel-tab').click(function(e) {
				e.preventDefault();

				// open displayer, hide the edit elements
				ce6.user._inlineEditExchange(elements, 'display');
				if (data.cancelCallback) {
					data.cancelCallback();
				}
				return false;
			});
		}
	},
	blockUser : function() {
		ce6.ajaxJson('/profile/block_user', {
			user_token: profileOwner.token
		}, function(data) {
			$('#block-user-btn').hide();
			$('#unblock-user-btn').show();
			$('#block-status').html('<b>True</b>');
		})
	},
	suspendUser : function() {
		ce6.ajaxJson('/profile/suspend_user', {
			user_token: profileOwner.token
		}, function(data) {
			$('#suspend-user-btn').hide();
			$('#unsuspend-user-btn').show();
			$('#suspend-status').html('<b>True</b>');
		})
	},
	unblockUser : function() {
		ce6.ajaxJson('/profile/unblock_user', {
			user_token: profileOwner.token
		}, function(data) {
			$('#unblock-user-btn').hide();
			$('#block-user-btn').show();
			$('#block-status').html('<b>False</b>');
		})
	},
	unsuspendUser : function() {
		ce6.ajaxJson('/profile/unblock_user', {
			user_token: profileOwner.token
		}, function(data) {
			$('#unsuspend-user-btn').hide();
			$('#suspend-user-btn').show();
			$('#suspend-status').html('<b>False</b>');
		})
	}
};
