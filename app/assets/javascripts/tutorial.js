ce6.tutorial = {
	init: function() {
		ce6.tutorial.pointingOffset = {
			'L': [1, 0],
			'R': [0, 0],
			'U': [0, 1],
			'D': [0, 0]
		};
		ce6.tutorial.alignOffset = {
			'left': [0, 0],
			'right': [1, 0],
			'centerHorizontal': [0.5, 0],
			'top': [0, 0],
			'bottom': [0, 1],
			'centerVertical': [0, 0.5]
		};
		ce6.tutorial.detailTutorial = [
			{lightDivSet: $('.contest-detail-header, .detail-body'),
				rootDiv: $('.page-left'),
				dlgTitle: 'Learn about this contest!',
				dlgContent: "Check out its background info and think how you can help!",
				dlgButton: "Next",
				alignComponent: $('.detail-body'),
				alignMethod: 'centerVertical',
				pointingDir: 'L',
				pointOffset: [0, 0]},
			{lightDivSet: $('#enter-submission-button'),
				rootDiv: $('.page-left'),
				dlgTitle: 'Enter the contest!',
				dlgContent: "Submit your entry now for a chance to win $X. The more contests you enter, the more likely you'll win!",
				dlgButton: "Next",
				alignComponent: $('#enter-submission-button'),
				alignMethod: 'centerVertical',
				pointingDir: 'L',
				pointOffset: [0, 0]},
			{lightDivSet: $('.contest-detail').nextAll(),
				rootDiv: $('.page-left'),
				dlgTitle: 'Vote for your favorites!',
				dlgContent: "Support the entries you like by voting for them.",
				dlgButton: "Next",
				alignComponent: $('.submission'),
				alignMethod: 'centerVertical',
				pointingDir: 'L',
				pointOffset: [0, 0]},
			{lightDivSet: $('.refer-now-box'),
				rootDiv: $('.page-left'),
				dlgTitle: 'Referral Bonus!',
				dlgContent: "Win 10% Bonus when your referral wins this contest!",
				dlgButton: "Next",
				alignComponent: $('.refer-now-box'),
				alignMethod: 'centerVertical',
				pointingDir: 'R',
				pointOffset: [0, 0]},
			{lightDivSet: $('#follow-contest-link'),
				rootDiv: $('.page-left'),
				dlgTitle: 'Follow the contest!',
				dlgContent: "Follow this contest for all the latest updates. Stay informed for when you win!",
				dlgButton: "Next",
				alignComponent: $('#follow-contest-link'),
				alignMethod: 'centerVertical',
				pointingDir: 'L',
				pointOffset: [5, 0]},
			{lightDivSet: $('.page-footer-icon'),
				rootDiv: $('.page-left'),
				excludedDiv: $('#top'),
				dlgTitle: 'Check out more contests!',
				dlgContent: "Head to the homepage to check out more contests or create your own!",
				dlgButton: "Finish Tour",
				alignComponent: $('#nav-home'),
				alignMethod: 'centerHorizontal',
				pointingDir: 'U',
				pointOffset: [0, 0]},
			{finishedCb: function(func){
				ce6.ajaxJson('/show/finish_detail_tutorial', 
						{close_method: 'finish_detail'},
						function(data) {
							if (func)
								func();
						});}}
		];
		ce6.tutorial.finishDetailTutorial = ce6.tutorial.detailTutorial[ce6.tutorial.detailTutorial.length-1].finishedCb;
		ce6.tutorial.detailTutorialFinished = [
			{
				'title': 'Tutorial completed!',
				'content': 'Congratulations! Sign up for a free account now or enter this contest for a chance to win $X!',
				'buttons': {
					'Close':  function(){$(this).dialog('close');},
					'Sign Up Now': function() {
						$(this).dialog('close');
						ce6.logButtonClicked(logging_objs.btn_nav_signup);
						ce6.authDialog.open(function(){
							// set detail_tutored True when user signing up after finishing tutorial
							ce6.tutorial.finishDetailTutorial(function(){
								window.location.reload();	
							});
						});
					}
				}
			},
			{
				'title': 'Tutorial completed!',
				'content': "Congratulations on completing the tutorial! Now you've got the chops. Enter this contest now to win $X or vote to win a special bonus!",
				'buttons': {
					'Close':  function(){$(this).dialog('close');}
				}
			},
			{
				'title': 'Tutorial completed!',
				'content': 'Sign up for a free account today to start winning cash. Check out more contests or create your own!',
				'buttons': {
					'Close':  function(){$(this).dialog('close');},
					'Sign Up Now': function() {
						$(this).dialog('close');
						ce6.logButtonClicked(logging_objs.btn_nav_signup);
						ce6.authDialog.open(function(){
							// set detail_tutored True when user signing up after finishing tutorial
							ce6.tutorial.finishDetailTutorial(function(){
								window.location.reload();	
							});
						});
					}
				}
			},
			{
				'title': 'Tutorial completed!',
				'content': "Now you've got the chops. Enter, vote or create new contests now!",
				'buttons': {
					'Close':  function(){$(this).dialog('close');}
				}
			}
		];
	},
	currentTutorial: null,
	setTutorialConfig : function(tutorialConfig){
		ce6.tutorial.currentTutorial = tutorialConfig;
	},
	getDisplayConfig : function(step){
		if (null == ce6.tutorial.currentTutorial || step >= ce6.tutorial.currentTutorial.length)
			return null;
		if (step + 1 == ce6.tutorial.currentTutorial.length)
			return ce6.tutorial.currentTutorial[step];
		var ct = ce6.tutorial.currentTutorial[step],
			po = ce6.tutorial.pointingOffset,
			ao = ce6.tutorial.alignOffset,
			result = {};
		
		result.lightDivSet = ct.lightDivSet;
		result.rootDiv = ct.rootDiv;
		result.excludedDiv = ct.excludedDiv ? ct.excludedDiv : $('.header-tip');
		if (0 == result.lightDivSet.length)
			result.lightDivSet = $(result.lightDivSet.selector);
		if (0 == result.excludedDiv.length)
			result.excludedDiv = $(result.excludedDiv.selector);
		var offsetFactor = [po[ct.pointingDir][0] + ao[ct.alignMethod][0],
					    po[ct.pointingDir][1] + ao[ct.alignMethod][1]];
		result.pointX = ct.alignComponent.offset().left + offsetFactor[0] * ct.alignComponent.outerWidth() + ct.pointOffset[0]; 
		result.pointY = ct.alignComponent.offset().top + offsetFactor[1] * ct.alignComponent.outerHeight() + ct.pointOffset[1] - $(window).scrollTop();
		result.dir = ct.pointingDir;
		result.textContent = {title: ct.dlgTitle, content: ct.dlgContent, button: ct.dlgButton};
		return result;
	},
	generateStepsHtml : function(stepsNames){
		if (!stepsNames.length)
			return "";
		var indexLen = stepsNames.length;
		var resultHtml = "<div id='step0' class='steps-container firststep first-bg-white'>\
							<a href='#'><span><strong>"+1+" </strong>" + stepsNames[0] + "</span></a>";
		for (var i = 1; i < indexLen; i++){
			resultHtml += "<div id='step" + i + "' class='substep sub-bg-blue'>\
								<a href='#'><span><strong>"+(i+1)+" </strong>" + stepsNames[i] + "</span></a>\
							</div>"; 
		}
		resultHtml += "</div><button class='darkgray header-tip-button header-tip-button-right' style='float:right;' onclick='ce6.show.tutorialStep(100); return false;'>Exit Tutorial</button>";
		return resultHtml;
	},
	goNextStep : function(step){
		if (0 == step){
			return;
		}
		else if (1 == step){	
			$('#step0').removeClass('first-bg-white').addClass('first-bg-blue');
			$('#step1').removeClass('sub-bg-blue').addClass('sub-bg-white');
		}
		else{
			$('#step' + (step-1)).removeClass('sub-bg-white').addClass('sub-bg-blue');
			$('#step' + step).removeClass('sub-bg-blue').addClass('sub-bg-white');
		}
	}
}
ce6.tutorial.closeDetailTutorial = function(){
	ce6.ajaxJson('/show/finish_detail_tutorial', 
				 {close_method: 'close_detail'},
				 function(data) {});
}
ce6.tutorial.closeHomeTutorial = function(){
	ce6.ajaxJson('/show/finish_detail_tutorial', 
				 {close_method: 'close_home'},
				 function(data) {});
}
