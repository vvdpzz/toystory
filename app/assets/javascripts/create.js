ce6.create = {
	calling: false,
	minPrize: 5,
	maxPrize: 1000,
	defaultEndDate: 5,
	just_for_fun: false,
	need_credit: 0,
	readySettings:{
		title:false,
		desc: false,
		credits:true,
		endDate:true
	},
	checkReady: function(exclude){
		var allready = true;
		for (var k in this.readySettings){
			if ((k == exclude) || (k == 'credits' && ce6.create.just_for_fun)) {
				continue;
			}
			if(!this.readySettings[k]){
				allready = false;
				this.disableCreateBtn(true);
				break;
			}
		}
		if(allready){
			this.disableCreateBtn(false);
		}
	},
	resetInputs:function() {
		$('#contest-title').val('');
		$('#enddate-picker').val('');
		$('.prize-container #radio-prize-default').prop('checked', true);
	},
	titleOnBlur: function(){
		if (!$(this).val()){
			$(this).val($(this).attr('sample-text'));
			$(this).addClass('create-contest-gray');
		}
		ce6.create.checkReady();
	},
	titleOnFocus: function(){
		if ($(this).val() == $(this).attr('sample-text')){
			$(this).val('');
		}
		$(this).removeClass('create-contest-gray');
	},
	init: function() {
		$('#create-confirm').dialog(this.confirmDialog).restyleButtons();

		$('#enddate-picker').datepicker(this.datepickerOptions)
		var today = new Date();
		var endDate = new Date(today.getTime() + this.defaultEndDate * 86400 * 1000);
		$('#enddate-picker').datepicker('setDate', endDate);

		$('#btn-preview-publish').data('disabled', true).click(this.previewAndConfirmContest);

		this.enableTips();
		
		
		ce6.editor.newEditorInstance('contest-content', {maxHeight: 223});
		$('.tinymce-preloader').hide();
		$('.nicEdit-main').live('keyup', function(e){
			ce6.create.descCountdown(ce6.editor.getPlainContentLength());
		});
		$('.nicEdit-main').live('focus', function(){
			sampleDesc = $(this).find('#sample-desc');
			if (sampleDesc.length){
				sampleDesc.remove();
				$(this).html('<br>');
			}
		});
		var panelCover = $('<div class="editor-panel-cover"></div>');
		panelCover.css({left:$('.nicEdit-panelContain').offset().left,top:$('.nicEdit-panelContain').offset().top});
		$('body').append(panelCover);
		$('.nicEdit-main').click(
			function(){
				sampleDesc = $(this).find('#sample-desc');
				if (sampleDesc.length){
					sampleDesc.remove();
					$(this).html('<br>');
				}
				panelCover.hide();
				setTimeout(function(){$('.nicEdit-main')[0].focus();}, 50);
			}
			);
		$('.nicEdit-main').blur(
				function(){
					ce6.create.fillExampleDesc();
					panelCover.show();
				}
			);
		$('#contest-title').bind('keyup', this.titleCountdown).bind('blur', this.titleOnBlur).bind('focus', this.titleOnFocus);

		$('#contest-credits').blur(this.blurOtherCredit).focus(function(){
			$('.prize-other-option input:radio').prop('checked', true);
			ce6.create.calServiceFee();
			ce6.create.autoSelectCoupon();
		});

		$('.prize-options input').change(function(){ 
			$('#contest-credits').val('');
			$('#credit-limit-num').text('');
			ce6.create.readySettings.credits = true;
			ce6.create.autoSelectCoupon();
			ce6.create.checkReady(); 
		})

		$('.prize-other-option input:radio').change(function(){ 
			$('#contest-credits').focus();
		})
		$('#rules_100').change(function(){
			if ($(this).prop('checked'))
				$('#additional-rule').show();
			else
				$('#additional-rule').hide();
		});
		$(window).unload(this.resetInputs);
		window.onbeforeunload = this.unloadConfirm; 

		$('#tab-normal-contest').click(ce6.create.showCreateNormal);
		$('#tab-jff-contest').click(ce6.create.showCreateJFF);
		if (ce6.create.pre_fill == 'just_for_fun') {
			ce6.create.just_for_fun = true;
		} else {
			ce6.create.just_for_fun = false;
		}

		setToolTip('#jff-contest-tips-icon', {
			text: 'It\'s FREE to create Just For Fun contests and if they become popular, we\'ll add real prize money for you!', 
			position: 'bottom', 
			distance: 8,
			containerStyle: {width: '260px', 'line-height': '18px'}
		});

		ce6.create.autoSave.init();

		// Bind special service event
		setToolTip('#blind-contest-tip', {
			text: 'In a blind contest, entries are visible to the creator only. Once the contest has ended, all entries will be visible to everyone. (available for contests over $50 and an additional 9.98% service fee will be charged.)', 
			position: 'bottom', 
			containerStyle: {width: '300px'},
			distance: 8
		});
		$('.prize-options input:radio').click(this.calServiceFee);
		$('#input-blind-setting').click(this.calServiceFee);
		this.calServiceFee();

		// Coupon related elements
		if (!ce6.create.just_for_fun) {
			if (ce6.create.pre_coupon_token) {
				ce6.create.selectCoupon(ce6.create.pre_coupon_token);
			} else {
				ce6.create.autoSelectCoupon();
			}
		}
    // ce6.refreshCallouts();
	},
	limit:{
		title : 75, 
		desc  : 4000 
	},
	getSelectedCouponStr: function() {
		var coupon_token = $('.coupon-container input:radio:checked').val();
		if (coupon_token) {
			return JSON.stringify([coupon_token]);
		} else {
			return "";
		}
	},
	selectCoupon: function(coupon_token) {
		/* used for select prize by give coupon */
		prize = 0;
		for (var i in ce6.create.coupons) {
			var coupon = ce6.create.coupons[i];
			if (coupon.token == coupon_token) {
				// select this coupon
				$('#coupon-'+coupon_token).prop('checked', 'true');
				if (coupon.limit && coupon.limit.contest_prize) {
					prize = parseInt(coupon.limit.contest_prize);
				} else {
					prize = parseInt(coupon.prize);
				}
				break;
			}
		}
		if (!prize) {
			$('#coupon-no').prop('checked', 'true');
		}
		ce6.create.showCoupons(prize);

		if (prize >= ce6.create.minPrize && prize <= ce6.create.maxPrize) {
			$('.prize-other-option input:radio').val(prize).prop('checked', true);
			$('#contest-credits').val(prize);
		}
	},
	showCoupons: function(prize) {
		/* used for enable/disable coupon radio by a give prize 
		 * return a suggested coupon.
		 * */
		var selected = null;
		for (var i in ce6.create.coupons) {
			var coupon = ce6.create.coupons[i];
			if (coupon.limit && coupon.limit.contest_prize) {
				var limited_prize = parseInt(coupon.limit.contest_prize);
				if (limited_prize <= prize) {
					$('#coupon-'+coupon.token).attr('disabled', false);
					// selected the coupon
					if (!selected) {
						selected = coupon.token;
					}
				} else {
					$('#coupon-'+coupon.token).attr('disabled', true);
				}
			} else {
				$('#coupon-'+coupon.token).attr('disabled', false);
				if (!selected) {
					selected = coupon.token;
				}
			}
		}
		$('#coupon-no').attr('disabled', false);
		return selected;
	},
	autoSelectCoupon: function() {
		/* used for select coupon by given prize */
		if (!ce6.create.coupons) {
			return
		}
		var prize = parseInt($('.prize-container input:radio:checked').val());
		var selected = ce6.create.showCoupons(prize);
		if (selected) {
			$('#coupon-'+selected).prop('checked', 'true');
		} else {
			$('#coupon-no').prop('checked', 'true');
		}
	},
	showCreateNormal: function(e) {
		$('.create-tabs').removeClass('tab-active');
		$(this).addClass('tab-active');
		$('.prize-area').show();
		ce6.create.just_for_fun = false;
		$('.create-jff-top-tips').hide();
		ce6.create.checkReady();
	},
	showCreateJFF: function() {
		$('.create-tabs').removeClass('tab-active');
		$('#tab-jff-contest').addClass('tab-active');
		$('.prize-area').hide();
		ce6.create.just_for_fun = true;
	
		// display the top tips
		// keep the code here, may add back
		$('.create-jff-top-tips').show();

		// disable blind contest callout
		$('#new_blind_contest').hide();	

		ce6.create.checkReady();
	},
	unloadConfirm: function(){
		if (ce6.create.readySettings.title || ce6.create.readySettings.desc ){
			return "You have not created the contest yet. Are you sure you want to leave this page?";
		}
	},
	titleCountdown : function() {
		var numDiv = $('#title-limit-num');
		if ($(this).val()){
			var countdown = ce6.create.limit.title - $(this).val().length;
			numDiv.text(countdown);
			if (countdown < 0){
				numDiv.addClass('negative');
				ce6.create.readySettings.title = false;
			}else{
				numDiv.removeClass('negative');
				ce6.create.readySettings.title = true;
			}
		}else{
			numDiv.text(ce6.create.limit.title);
			ce6.create.readySettings.title = false;
		}
	},
	descCountdown : function(currNum) {
		var numDiv = $('#desc-limit-num');
		if(currNum){
			var countdown = ce6.create.limit.desc- currNum;
			numDiv.text(countdown);
			if (countdown < 0){
				numDiv.addClass('negative');
				ce6.create.readySettings.desc = false;
				ce6.create.disableCreateBtn(true);
			}else{
				if (!ce6.create.readySettings.desc){
					numDiv.removeClass('negative');
					ce6.create.readySettings.desc = true;
					ce6.create.checkReady();
				}
			}
		}else{
			numDiv.text(ce6.create.limit.desc);
			ce6.create.readySettings.desc = false;
			ce6.create.disableCreateBtn(true);
		}
	},
	blurOtherCredit : function(){
		var amount = parseInt($(this).val());

		if (amount >= ce6.create.minPrize && amount <= ce6.create.maxPrize) {
			$('.prize-other-option input:radio').val(amount); 
			ce6.create.readySettings.credits = true;
			ce6.create.checkReady(); 
			$('#credit-limit-num').text('');
		}else if (amount < ce6.create.minPrize){
			if (!amount ) {
				$('#credit-limit-num').text('Please specify the prize for the contest.');
			} else {
				$('#credit-limit-num').text('Sorry, the minimum prize is $'+ce6.create.minPrize+'.');
			}
			ce6.create.readySettings.credits = false;
			ce6.create.disableCreateBtn(true);
		}else {
			if (!amount ) {
				$('#credit-limit-num').text('Please specify the prize for the contest');
			} else {
				$('#credit-limit-num').text("Sorry, we currently only support contests valued at $"+ce6.create.maxPrize+" or less.");
			}
			ce6.create.readySettings.credits = false;
			ce6.create.disableCreateBtn(true);
		}
		ce6.create.calServiceFee();
		ce6.create.autoSelectCoupon();
	},
	enableTips : function() {
		$('#contest-title').focus(function(){
			ce6.create.fillExampleDesc();
		})

		// close all tips, when click other place
		$('.create-buttons, .prize-container, .enddate-container').click(function(){ 
			ce6.create.fillExampleDesc();
		});
	},
	fillExampleDesc: function(){
		tx = ce6.editor.currentEditorInstance().getContent();
		if (tx == undefined){
			return
		}
		imgTag = tx.match(/<img.*?>/gi);
		tx = tx.replace(/<.[^<>]*?>/g, '').replace(/&nbsp;|&#160;/gi, '');
		if (!tx && (!imgTag || imgTag.length==0)){
			var sample = $("<span style='color:#909090;' id='sample-desc'></span>");
			sample.html($('#contest-content').attr('sample-text'));
			$('.nicEdit-main').html(sample);
		}
	},
	previewAndConfirmContest : function() {
		if (IS_SUSPENDED == 1) {
			ce6.notifyBar('This account is temporarily suspended. Please contact Prizes support for more clarification.', 'error');
			return;
		}
		if (!ce6.editor.presubmit())
			return;
		if ($('#btn-preview-publish').data('disabled'))
			return;
		var title = $.trim($('#contest-title').val());
		var content = ce6.editor.getContentWithAutoLink(true);

		if ($.trim($('#additional-rule').val()).length == 0 || $('#additional-rule').val() == $('#additional-rule').attr('placeholder')){
			$('#additional-rule').val('').hide();
			$('#rules_100').prop('checked', false);
		}
				
		$('#create-confirm-title').text(title);
		$('#create-confirm-content').html(content);
		var submissionRules = $('<div class="submission-rules"></div>');
		var ul = $('<ul></ul>');
		var allCheckedRules = $('.checkbox-list input[type=checkbox]:checked');
		var videoPreview = $("<div class='contest-video-preview'></div>");
		videoPreview.appendTo($('#create-confirm-content'));

		if (allCheckedRules.length > 0){
			for (var i=0; i<allCheckedRules.length; i++){
				if ($(allCheckedRules[i]).attr('id') != 'rules_100'){
					$('<li>'+$(allCheckedRules[i]).next('label').html()+'</li>').appendTo(ul);
				}
				else{
					var li = $('<li></li>').text($('#additional-rule').val());
					li.appendTo(ul);
				}
			}
			$('<div>CONTEST RULES</div>').appendTo(submissionRules);
			ul.appendTo(submissionRules);
			submissionRules.appendTo($('#create-confirm-content'));
		}

		// add left days in preview 
		var curr_date = new Date();
		var end_date = $('#enddate-picker').datepicker('getDate');
		var leftDays = Math.floor((end_date.getTime() - curr_date.getTime())/1000/60/60/24);
		$('#left-time-num').text( leftDays + (leftDays>1 ? ' days': ' day'));
		
		if (ce6.create.just_for_fun) {
			$('#createconfirm').html('');
			$('.detail-prize-jff-zone').show();
			$('.detail-prize-zone').hide();
			$('#createconfirm-bottom-line').hide();
			
			ce6.create.openCreateConfirmDlg(0);
		} else {
			var prize_num = parseInt($('.prize-container input:radio:checked').val(), 10); 
			$('.detail-prize-jff-zone').hide();
			$('.detail-prize-zone').show();
			$('#createconfirm-bottom-line').show();
			$('#create-prize-credit').html(prize_num);
			ce6.ajaxJson('/contests/check_credits',
				{
					prize: prize_num
				},
				function(data) {
					var need_credit = data.need_credit;
					var used_credit = data.used_credit;
					
					if (used_credit == 0){
						$('#createconfirm').html('To create this contest, you need to buy <b>'+need_credit+' credits</b>.');
					} else {
						var s = 'To create this contest, ';
						var s1 = '<b>$' + used_credit + '</b> credits';
						if (used_credit) {
							s += s1;
						}
						s += ' will be deducted from your account. ';

						if (need_credit) {
							s += 'Please get an additional <b>$'+need_credit+'</b> .';
						}
						$('#createconfirm').html(s);
					}
					ce6.create.openCreateConfirmDlg(need_credit);
				}
			);
		}
	},
	buySuccess : function(){
		var prize_num = parseInt($('.prize-container input:radio:checked').val(), 10); 
		ce6.ajaxJson('/contests/check_credits',{prize:prize_num},
			function(data) {
				$("#dlg-ofac").dialog("close");
				ce6.create.previewAndConfirmContest()
				if (data.need_credit == 0){
					$("#createconfirm").text("充值成功，请创建答案");
//	                    $('#payment-form').remove();
				}
			},function(){}
		);
		// ce6.ajaxJson('/contests/check_credits',
		// 		{
		// 			prize: prize_num
		// 		},
	},
	disableCreateBtn : function(isOff){
		if(isOff){
			$('#btn-preview-publish').data('disabled', true).addClass('ui-state-disabled')
		}else{
			$('#btn-preview-publish').data('disabled', false).removeClass('ui-state-disabled')
		}
		ce6.create.autoSave.enable = !isOff;
	},
	submitContestCheck: function() {
		if ($('#btn-preview-publish').data('disabled'))
			return false;
		
		var title = $.trim($('#contest-title').val());
		var content = ce6.editor.getContentWithAutoLink();
		txLength = ce6.editor.getPlainContentLength();
		var prize = parseInt($('.prize-container input:radio:checked').val()); 
		var endDate = $('#enddate-picker').val();
		
		var valid = true;

		if (!(title && title.length <= ce6.create.limit.title)) {
			$('#title-limit-num').text('Please input valid contest title').addClass('negative');
			valid = false;
		} 
		if (!(content && txLength <= ce6.create.limit.desc)) {
			$('#desc-limit-num').text('Please input valid contest content').addClass('negative');
			valid = false;
		}
		if (!(prize && prize >= ce6.create.minPrize)) {
			$('#credit-limit-num').text('Please specify valid prize for the contest').addClass('negative');
			valid = false;
		}
		if (!endDate) {
			$('#enddate-limit').text('Please choose a future end date for the contest').addClass('negative');
			valid = false;
		} 

		if(!valid){
			$('#create-confirm').dialog('close');
			return false;
		}
		
		var content = ce6.editor.getContentWithAutoLink();
		var enddate = $('#enddate-picker').datepicker('getDate');
		$('#contest-end').val(enddate.getTime()/1000);

		if ($.trim($('#additional-rule').val()).length == 0 || $('#additional-rule').val() == $('#additional-rule').attr('placeholder')){
			$('#additional-rule').val('').hide();
			$('#rules_100').prop('checked', false);
		}
		var allCheckedRules = $('.checkbox-list input[type=checkbox]:checked');
		var checkedList = [];
		for (var i=0; i<allCheckedRules.length; i++){
			checkedList.push(parseInt($(allCheckedRules[i]).attr('id').slice(6), 10));
		}
		$('[name=rules_list]').val('['+checkedList.join(',')+']');
		$('[name=customized_rule]').val($('#additional-rule:visible').val());
		$('[name=content]').val(content);

		ce6.create.disableCreateBtn(true);
		return true;
	},
	submitAction: function() {
		if (ce6.create.calling) {
			return;
		} else {
			ce6.create.calling = true;
		}
		var submitData = $('#create-form').serialize();
		submitData += '&is_community=' + (ce6.create.just_for_fun ? 1 : 0);
		ce6.ajaxJsonPost('/contests', submitData,
			function(data) {
				if (data.rc == 0) {
					window.onbeforeunload = null; 
					window.location = data.next;
				} else {
					if(data.rc == 2){ // see apps.ce6.data.contest.py
						diff = data.diff;
					}else if(data.rc){
						ce6.notifyBar(data.msg, 'error');
						$('#create-confirm').dialog('close');
					}
					ce6.create.disableCreateBtn(false);
					ce6.create.calling = false;
				}
			},
			function(data){
				$('#create-confirm').dialog('close');
				ce6.showMessage('Oops! Failed to create new contest. Please try again.', 'Error');
				ce6.create.disableCreateBtn(false);
				ce6.create.calling = false;
			}
		);
	},
	openCreateConfirmDlg : function(need_credit) {
		if(need_credit){
			$('#create-confirm').dialog("option", 'buttons', {
				Cancel: function() {
					ce6.create.autoSave.enable = true;
					$(this).dialog('close');
				},
				'Buy credits': function() {
					ce6.create.autoSave.discard();
					ce6.create.submitBuyContest(need_credit);
					$("#dlg-ofac").dialog("open");
				}
			}).restyleButtons();
		} else {
			$('#create-confirm').dialog("option", 'buttons', {
				Cancel: function() {
					$(this).dialog('close');
				},
				'Create': function() {
					ce6.create.autoSave.discard();
					ce6.create.submitNewContest();
				}
			}).restyleButtons();
		}
		$('#create-confirm').dialog('open');
	},
	submitBuyAction : function() {
		ce6.payCreateContest(ce6.create.need_credit);
	},
	submitBuyContest : function(need_credit) {
		ce6.create.need_credit = need_credit;

		ce6.payCreateContest(need_credit); 
	},
	submitNewContest : function() {
		if (!ce6.create.submitContestCheck()) {	
			return
		}
		ce6.create.submitAction();
	},
	datepickerOptions : {
		minDate: 5, 
		maxDate: 30,
		onClose: function(dateText, inst) {
			if(dateText){
				ce6.create.readySettings.endDate = true;
			}else{
				ce6.create.readySettings.endDate = false;
			}
			ce6.create.checkReady();
		}
	},
	blindContestMinPrize: 50,
	blindContestId: 0,
	calServiceFee: function() {
		var prize = $('.prize-container input:radio:checked').val(); 
		var setting = $('#input-blind-setting');
		var canBlind = prize >= 50 ? true : false;
		setting.prop('disabled', !canBlind);
		$('label[for=input-blind-setting]').css({opacity: canBlind ? 1 : 0.5});
		if (!canBlind) {
			setting.prop('checked', false);
		}
		if (canBlind && setting.prop('checked')) {
			$('#service-fee').show();
		} else {
			$('#service-fee').hide();
		}
	}
}

ce6.create.previewDialog = {
	autoOpen: false,
	open: ce6.dlgOpenDefault,
	modal: true,
	width: 680,
	height: 500,
	title: 'Preview',
	buttons: {
		OK: function() {
			$(this).dialog('close');
		}
	}
}

ce6.create.confirmDialog = {
	autoOpen: false,
	open: ce6.dlgOpenDefault,
	modal: true,
	width: 680,
	title: 'Preview',
	buttons: {
		Cancel: function() {
			$(this).dialog('close');
		},
		Create: function() {
			ce6.create.submitNewContest();
		}
	}
}
ce6.create.autoSave = {
	enable: false,
	oldTitle: '',
	oldContent: '',
	key: 0,
	init: function() {
		if (this.oldContent) $('.nicEdit-main').html(this.oldContent);
		if (this.oldTitle) $('#contest-title').val(this.oldTitle).focus().trigger('keyup').blur();
		ce6.create.descCountdown(ce6.editor.getPlainContentLength());
		setInterval('ce6.create.autoSave.check()', 10000);
		$('#create-discard').click(function() {
			ce6.create.autoSave.discard();
			$('.nicEdit-main').html('');
			$('#contest-title').val('').focus().trigger('keyup').blur();
			ce6.create.descCountdown(ce6.editor.getPlainContentLength());
		});
	},
	check: function() {
		if (!this.enable) return;
		var content = ce6.editor.getContentWithAutoLink();
		var title = $.trim($('#contest-title').val());
		if (content == this.oldContent && title == this.oldTitle) return;
		this.save(title, content);
	},
	save: function(title, content) {
		ce6.ajaxJson('/autosave/save_creation', {key: this.key, title: title, content: content}, function(data) {
			if (data.rc) {
				ce6.notifyBar(data.msg, 'error');
			} else {
				ce6.create.autoSave.oldContent = content;
				ce6.create.autoSave.oldTitle = title;
				ce6.create.autoSave.key = data.key;
				var t = new Clock();
				$('#auto-save-msg').show().find('.time').html(t.twelveFormat());
			}
		});
	},
	discard: function() {
		if (!this.key) return;
		ce6.ajaxJson('/autosave/discard_creation', {key: this.key}, function(data) {
			if (data.rc) {
				ce6.notifyBar(data.msg, 'error');
			} else {
				ce6.create.autoSave.enable = false;
				ce6.create.autoSave.key = '';
				ce6.create.autoSave.oldTitle = '';
				ce6.create.autoSave.oldContent = '';
				$('#auto-save-msg').hide();
			}
		});
	}
};


// ********************************
$(function () {
    if (surface == "contest.create" || surface == "history.credit") {
        $("#dlg-ofac").dialog(ce6.ofacDialog.params).restyleButtons();
        ce6.ofacDialog.init()
    }
});
ce6.ofacDialog = function () {
    var a = {
        countryListContainer: null,
        successCb: null,
        errorCb: null,
        params: {
            autoOpen: false,
            modal: true,
            width: 575,
            height: 435,
            resizable: false,
            title: "Address Confirmation",
            open: function () {
//                $("#ofac-name").val(viewer.name)
            },
            buttons: {
                Cancel: function () {
                    $(this).dialog("close");
                    a.errorCb && a.errorCb()
                },
                Alipay: function () {
                    $($('#payment-form').get(0).utf8).remove();
					var url = "https://www.alipay.com/cooperate/gateway.do?" + $('#payment-form').serialize();
					if($("#buySuccessButton").length==0){
						var success = $("<input type='button' id='buySuccessButton' value='确定充值'/>").bind("click",ce6.create.buySuccess);
						var again   = $("<input type='button' value='重试'/>").bind("click",function(){window.open(url,"_blank");});
						$("#alipay-form").append(success).append(again)
					}
					window.open(url,"_blank");
					
					
                }
            }
        },
        init: function () {
            $("#ofac-country").click(function (b) {
                b.stopPropagation();
                a.showCountryList()
            });
            a.citySelector = new ce6.simpleSelector({
                inputElem: "#ofac-city",
                all: ce6.constants.usaCities
            });
            a.stateSelector = new ce6.simpleSelector({
                inputElem: "#ofac-state",
                all: ce6.constants.usaStates
            })
        },
        open: function (b, e, h) {
            a.successCb = b;
            a.errorCb = e;
            // ce6.ajaxJson("/payment/payment_precheck", {
            //     is_payout: h ? 1 : 0
            // }, function (f) {
            //     if (f.rc == 0) a.successCb();
            //     else if (f.rc == 1) ce6.ofacDialog.openFailedDialog();
            //     else if (f.rc == 2) $("#dlg-ofac").dialog("open");
            //     else f.rc == 100 ? ce6.notifyBar(f.msg, "warn") : ce6.notifyBar(ce6.constants.texts.errors.serverError, "error")
            // });
			
			$("#dlg-ofac").dialog("open");
        },
        verify: function () {
            for (var b = ["#ofac-name", "#ofac-address", "#ofac-city", "#ofac-state", "#ofac-zip"], e = 0; e < b.length; e++) if (!$.trim($(b[e]).val())) {
                ce6.notifyBar("Please fill in all the fields.", "error");
                $(b[e]).focus();
                return
            }
            ce6.secureCall("ofac/verify", {
                name: $.trim($("#ofac-name").val()),
                address: $.trim($("#ofac-address").val()),
                city: $.trim($("#ofac-city").val()),
                state: $.trim($("#ofac-state").val()),
                zip: $.trim($("#ofac-zip").val()),
                country: $.trim($("#ofac-country").val())
            }, function (h) {
                if (h.rc == 0) {
                    $("#dlg-ofac").dialog("close");
                    a.successCb && a.successCb()
                } else if (h.rc == 1) {
                    $("#dlg-ofac").dialog("close");
                    a.openFailedDialog()
                } else ce6.notifyBar(ce6.constants.texts.errors.serverError, "error")
            })
        },
        openFailedDialog: function () {
            ce6.showMessage(ce6.constants.texts.errors.ofacFailed, "Address Confirm Failed", a.errorCb)
        },
        showCountryList: function () {
            if (!a.countryListContainer) {
                var b = $("#ofac-country").val();
                a.countryListContainer = $("<div class='ofac-country-list'><ul></ul></div>");
                a.countryListContainer.appendTo("body");
                var e = $(".ofac-country-list ul");
                $.each(ce6.constants.countries, function (g, m) {
                    m == b ? e.append("<li class='selected-country'>" + m + "</li>") : e.append("<li>" + m + "</li>")
                });
                e.find("li").click(a.onSelectCountry)
            }
            var h = a.countryListContainer,
                f = $("#ofac-country").offset();
            h.css({
                left: f.left
            });
            h.show();
            $(document).one("click", function () {
                h.hide()
            })
        },
        onSelectCountry: function (b) {
            b.stopPropagation();
            b = $(this).text();
            $("#ofac-country").val(b);
            a.countryListContainer.hide();
            a.countryListContainer.find("li").removeClass("selected-country");
            $(this).addClass("selected-country");
            if (b == "United States") {
                a.citySelector.updateAllList(ce6.constants.usaCities);
                a.stateSelector.updateAllList(ce6.constants.usaStates)
            } else {
                a.citySelector.updateAllList([]);
                a.stateSelector.updateAllList([])
            }
        }
    };
    return a
}();

ce6.openPayments = function(gold, callback, cancelback, shop_descriptor){
	ce6.ajaxJsonPost("/recharge/generate_order", {
        credits: gold
    }, function (data) {
		if (data.rc == 0)
		{
			$("#order-number").html(data.orderId);
			$("#alipay-form").html(data.html);
			$("#dlg-ofac").dialog("open");
		}
    });
};

ce6.payCreateContest = function(gold) {
	ce6.openPayments(gold, ce6.payCreateContestCb, ce6.payCreateContestCancel, "Almost there! Add $"+gold+" to publish!");
};

ce6.payCreateContestCb = function(gold) {
	ce6.updateCredit(gold); 
	ce6.create.submitAction();
};

ce6.payCreateContestCancel = function() {
	//close the auth dialog if it opened
	ce6.authDialog.close();
};

ce6.payments = new function () {
	this.init = function () {
		if(viewer_logged_in){
			if (!payments_initialized) {
				payments_initialized = true;
				$('.payments-popup').css({'visibility':'hidden'});
				
				this.options = {
					'buckets': [],
					//get this from a data file
					'conversion_rate': 100,
					'shop_descriptor': 'Add Credits'
	//				'buy_phrase': 'Select the amount of Credits you want to buy'

				};

				ce6.ajaxJson(
					'/payment/authorize_payments',
					{},
					this.authorize
				);
			}
		}
	}

	this.authorize = function(response) {
		if (response.rc != 0) {
			return;
		}
		ce6.payments.user_auth = response.user_auth; 
		ce6.payments.callback_url = response.callback_url; 
		Slide.Payments.initialize(
			'payment-frame',
			ce6.payments.user_auth,
			ce6.payments.callback_url, 
			null,
			ce6.payments.options
		);
	}

	this.pageSize = function() {
		var scrW, scrH;
		if (window.innerHeight && window.scrollMaxY) {
			// Mozilla
			scrW = window.innerWidth + window.scrollMaxX;
			scrH = window.innerHeight + window.scrollMaxY;
		} 
		else if (document.body.scrollHeight > document.body.offsetHeight){
			// all but IE Mac
			scrW = document.body.scrollWidth;
			scrH = document.body.scrollHeight;
		}
		else if (document.body) { 
			// IE Mac
			scrW = document.body.offsetWidth;
			scrH = document.body.offsetHeight;
		}

		var winW, winH;
		if(window.innerHeight) { // all except IE
			winW = window.innerWidth;
			winH = window.innerHeight;
		}
		else if (document.body) { // other
			winW = document.body.clientWidth;
			winH = document.body.clientHeight;
		}
		var w = (scrW<winW) ? winW : scrW;
		var h = (scrH<winH) ? winH : scrH;

		return {width: w, height: h};
	}

	this.show_overlay = function() {
		sz = this.pageSize();
		var w = sz.width;
		var h = sz.height;
		if (window.screen.width > sz.width) {
			w = window.screen.width;
		}
		$('#payments-overlay').css({'width': w});
		$('#payments-overlay').css({'height': h});
		$('#payments-overlay').css({'visibility':'visible'});
	}
	
	this.show_dlg = function() {
		sz = this.pageSize();
		var w = sz.width;
		// diff to overlay, should use the min size 
		var l = (w - 520)/2;
		if (l<0) {
			l = 0;
		}
		$('#payments-popup').css({'margin-left': l});
		$('#payments-popup').css({'visibility':'visible'});
		$('.payment-dlg-preloader').css({'margin-left': l+160});
		$('.payment-dlg-preloader').css({'visibility':'visible'});
	}

	this.hide_overlay = function() {
		$('#payments-overlay').css({'visibility':'hidden'});
	}

	this.open = function(gold, params) {
		this.init();
		ce6.payments.show_overlay();
		this.show_dlg();
		var gold = gold || 50;
		var dollars = gold;
		param = {
			shop_descriptor: params.shop_descriptor
		};
		Slide.Payments.open(dollars, undefined, null, param);
		this.callback = params.callback;
		this.cancelback = params.cancelback;
	}

	this.goldToCashConversion = function(gold){
		gold = String(gold);
		return gold;
//		var dollars = gold.substr(0, gold.length-1)+'.'+gold.substr(gold.length-1, 1)+'0';
//		return dollars;
	}

	this.close = function () {
		$('#other-amount').val('');
		$('.payments-popup').css({'visibility':'hidden'});
		this.hide_overlay();
		Slide.Payments.close();
	}

	this.handleSuccess = function (amount) {
		ce6.payments.close();
		ce6.ajaxJson(
			'/payment/balance_change_notify',
			{credits: parseInt(amount)},
			null
		);
		if(this.callback){
			var gold = parseInt(amount); // * this.options.conversion_rate;
			this.callback(gold);
		}
	}

	this.handleCancel = function () {
		ce6.payments.close();
		if(this.cancelback){
			this.cancelback();
		}
	}
	
	this.pay = function(gold) {
		ce6.openPayments(gold, ce6.payments.paySuccess, ce6.payments.payCancel);
	}

	this.paySuccess = function() {
	}

	this.payCancel = function() {
	}
};