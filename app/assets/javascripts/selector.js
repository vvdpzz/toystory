ce6.Selector = function(options) {

	/*
	 * variables
	 */

	/* Public variables */
	this.count = 0;
	this.selectorId = -1;
	this.selectedIdx = -1;
	this.highlightIdx = -1;
	this.list = [];
	this.inputElem = '';
	/* Public variables end */

	
	/* Private variables */
	var self = this;      // point to self obj when instanced
	var defaultMsg = '';
	var autoSelect = true;
	var autoComplete = true;
	var limit = 0;
	var timeout = 0;

	/* HTML controlling and displaying variables
	 * 
	 * Each element will have two classes
	 * One is control class, the other is display class
	 *   control class - control the flow of selector
	 *	                 can't be changed
	 *	 display class - CSS style class
	 *                   has a default value but can be replaced.
	 */
	var DEFAULT_CSS_DROPDOWN = 'ce6-sel-dropdown';
	var DEFAULT_CSS_TABLE = 'ce6-sel-table';
	var DEFAULT_CSS_ROW = 'ce6-sel-row';

	// display classes
	var _cssDropd = DEFAULT_CSS_DROPDOWN;
	var _cssTable = DEFAULT_CSS_TABLE;
	var _cssRow = DEFAULT_CSS_ROW;

	// control classes
	var _ctrlDropd = 's-ctrl-dp';
	var _ctrlTable = 's-ctrl-t';
	var _ctrlRow = 's-ctrl-r';

	// save the element object, so that don't query them every time.
	var _dp = null;         // Dropdown div
	var _t = null;          // Table div followed the dropdown div
	var _i = null;          // The input element obj

	/* Private variables end */


	/*
	 * functions
	 */

	/*******************************************
	 * functions must be override by sub class 
	 *******************************************/

	/* refresh
	 *   Get the list for the dropdown, from ajax call or memory.
	 *   Then call 'refreshList' to show .
	 */ 
	this.refresh = function() {
		self.refreshList([]);
	};

	/* onEnter
	 *   Event handler for 'Enter' on the input element.
	 */
	this.onEnter = function() {
		return;
	};

	/* onSelect
	 *   Event handler for mouseclick on the dropdown list
	 */
	this.onSelect = function(idx) {
		return;
	};
	
	/* getValue
	 *   get the displayed value in 'input element'
	 *   from the selected dropdown row
	 * rowObj - one object from self.list[]
	 *
	 * override case by case
	 */
	this.getValue = function(rowObj) {
		return rowObj.value;
	};

	/* constructRow
	 *   build a row for dropdown list
	 *
	 * override case by case
	 */
	this.constructRow = function(idx, rowObj) {
		var row = "<div class='"+_cssRow+"' index=" + idx + ">";
		row += "<span>" + rowObj.value + "</span>";
		row += "</div>";
		return $(row);	
	};
	
	/******************************************
	 * functions can be override by sub class 
	 ******************************************/
	this.init = function(options) {
		self.hide();
		return false;
	};
	
	this.show = function() {
		_dp.show();

		var offset = _i.offset();
		var h = _i.outerHeight();
		self.setPosition(offset.left, offset.top+h);
	};

	this.hide = function() {
		_dp.hide();
	};
	
	this.addDefaultMsg = function() {
		if (defaultMsg) {
			var row = $("<div class='"+_ctrlRow+" "+_cssRow+"'><div class='default-message'>" + defaultMsg + "</div></div>");
			addRow(row);
		}
	};
	
	this.clear = function() {
		_t.find("."+_ctrlRow).remove();
		unbindDropdownEvents();

		self.selectedIdx = -1;
		self.highlightIdx = -1;
		self.list = [];
		self.count = 0;
	};
	
	this.bindInputElement = function(inputElem) {
		if (_i)	{
			self.unbindInputElement();
		}
		self.inputElem = inputElem;
		_i = $(self.inputElem);
		bindInputEvents();
	};
	
	this.unbindInputElement = function() {
		unbindInputEvents();	
	};

	/****************************************
	 * functions can be called by sub class,
	 * should not be override
	 ****************************************/
	this.refreshList = function(list) {
		// 1st, clear the current list.
		self.clear();

		// update the list
		self.list = list || [];
		self.list = self.list.slice(0, limit);
		self.count = self.list.length;
		
		if (self.count<=0) {
			self.addDefaultMsg();
		} else {
			// fill the list to the dropdown list
			$.each(self.list, function(idx, obj) {
				addRow(_constructRow(idx, obj));
			});
			self.show();
			// bind dropdown list events
			bindDropdownEvents();
		} 

		// show the list or hide if empty.
		if (self.count<=0 && !defaultMsg) {
			self.hide();
		} else {
			self.show();
		}
	};
	
	this.setPosition = function(x, y) {
		if (!self.inDOMTree) {
			$('body').append(_dp);
			self.inDOMTree = true;
		}
		_dp.css({'left' : x, 'top' : y});
	};
	
	this.dropDownList = function() {
		return _dp;
	};

	
	/***************************
	 * private functions 
	 ***************************/
	var getId = function() {
		return 'ce6-selector-' + parseInt(Math.random() * 1000000);
	};

	var addRow = function(row) {
		_t.append(row);
	};

	var _constructRow = function(idx, rowObj) {
		var elem = self.constructRow(idx, rowObj);
		elem.addClass(_ctrlRow);
		return elem;
	};

	var highlightCurrent = function(idx) {
		if (self.highlightIdx > -1) {
			var oldElem = _t.find("."+_ctrlRow+":[index=" + self.highlightIdx + "]");
			oldElem.removeClass("selected");
		}
		
		var elem = _t.find("."+_ctrlRow+":[index=" + idx + "]");
		if (elem.length) {
			elem.addClass('selected');
			self.highlightIdx = idx;
		} else {
			self.highlightIdx = -1;
		}
	};

	var setCurrentSelection = function() {
		self.selectedIdx = self.highlightIdx;
		if (self.highlightIdx >= 0 && self.highlightIdx < self.count) {
			var value = self.getValue(self.list[self.selectedIdx]);
			_i.val(value);
		}
	};

	var prev = function() {
		if (self.highlightIdx >= 0) {
			highlightCurrent(self.highlightIdx - 1);
		} else {
			if (self.count>0) {
				highlightCurrent(self.count - 1);
			}
		}
		setCurrentSelection();
	};

	var next = function() {
		if (self.highlightIdx < self.count) {
			highlightCurrent(self.highlightIdx + 1);
		} 
		setCurrentSelection();
	};

	var select = function() {
		if (self.selectedIdx == -1) {
			return false;
		}
		if (self.onSelect) {
			self.onSelect(self.selectedIdx);
		}
		self.hide();
	};

	var bindDropdownEvents = function() {
		_t.children().each(
			function(index){
				$(this).bind('mouseover', dpMouseover);
				$(this).bind('mousedown', dpMousedown);
			}
		);
	};

	var unbindDropdownEvents = function() {
		_t.children().each(
			function(index){
				$(this).unbind('mouseover');
				$(this).unbind('mouseup');
			}
		);
	};

	var bindInputEvents = function() {
		/*
		 * When using 'input method' such as 'google input method'
		 *   - Keypress event will be hited in the 'input method'
		 *   - The last keyup event will be passed to the input Element
		 * Therefore, we update the selector list after catching the last
		 * keyup event. But the last keyup event always be 'Enter', which
		 * always a useable event for input Element. So, we ignore the 
		 * 'Enter' keyup, and catch the 'Enter' keypress in input Element.
		 * */
		_i.bind('keyup', inputKeyup);
		_i.bind('keypress', inputKeypress);
		_i.bind('focus', inputOnFocus);
		_i.bind('blur', {callback:inputBlurDelay}, inputOnBlur);
	};

	var unbindInputEvents = function() {
		_i.unbind('keyup').unbind('keypress').unbind('focus').unbind('blur');
	};

	var inputOnBlur = function(e) {
		data = e.data || {};
		if (data.callback) {
			setTimeout(data.callback, 100);
		} else {
			self.hide();
		}
	};

	var inputBlurDelay = function() {
		self.hide();
	};

	var inputOnFocus = function(e) {
		resetTimer();
	};
	
	var inputKeyup = function(e) {
		if (e.keyCode == 40) { // down
			next();
		} else if (e.keyCode == 38) {
			prev();
		} else if ( (e.keyCode < 48)   // ignore all function keys,except:
			&& (e.keyCode != 8)        // backspace
			&& (e.keyCode != 32)       // space
			&& (e.keyCode != 46)  ) {  // del
			return false;
		} else {
			resetTimer();	
		}
	};

	var inputKeypress = function(e) {
		if (e.keyCode == 13) {
			self.onEnter();
		}
	};

	var resetTimer = function() {
		if (typeof(timerID) != 'undefined') {
			clearTimeout(timerID);
		}

		if (timeout <= 0) {
			self.refresh();
		} else {
			timerID = setTimeout(self.refresh, timeout);
		}
	};

	var dpMouseover = function(e) {
		var index = parseInt($(this).attr('index'), 10);
		highlightCurrent(index);
	};

	var dpMousedown = function(e) {
		var index = parseInt($(this).attr('index'), 10);
		highlightCurrent(index);
		setCurrentSelection();
		select();
	};
	
	var createDropDown = function(options) {
		if (options.dropdownClass) {
			_cssDropd = options.dropdownClass;
		}
		if (options.tableClass) {
			_cssTable = options.tableClass;
		}
		if (options.rowClass) {
			_cssRow = options.rowClass;
		}

		_dp = $("<div class='"+_ctrlDropd+"'><div class='"+_ctrlTable+"'></div></div>");
		_dp.addClass(_cssDropd);
		_dp.attr('id', self.selectorId);

		_t = _dp.find("."+_ctrlTable);
		_t.addClass(_cssTable);
	};


	/* options:
	 *
	 * recommended given:
	 *   inputElem        - the input element,  '#id' or '.class' format
	 *   dropdownClass    - dropdown element css class
	 *   rowClass         - row of dropdown, css class
	 *   timeout          - show the dropdown list after 'timeout' time 
	 *                      from the last keypress.
	 *   
	 * can be given:
	 *   tableClass       - contains rows in dropdown, css class
	 *         <inputElem></input>
	 *         <dropdownClass>
	 *            <tableClass>
	 *               <rowClass, idx=0>
	 *               <rowClass, idx=1>
	 *               ...
	 *            </tableClass>
	 *         </dropdownClass>
	 * 
	 *   limit            - num of rows in dropdown list
	 *   defaultMsg       - default message, if no rows in dropdown list
	 *                      if not given, will not show the msg
	 *   autoSelect:      - no use now
	 *   autoComplete:    - no use now
	 *   refresh (function) - can be given at init, or override after init
	 *
	 * */
	var _init = function(options) {
		options = options || {};

		limit = options.limit || 10;
		timeout = options.timeout || 0;
		defaultMsg = options.defaultMsg || '';
		
		if (typeof(options.autoSelect) != 'undefined') {
			autoSelect = options.autoSelect;
		}
		if (typeof(options.autoComplete) != 'undefined') {
			autoComplete = options.autoComplete;
		}

		if (typeof(options.refresh) != 'undefined') {
			self.refresh = options.refresh;
		}

		self.highlightIdx = -1;
		self.selectedIdx = -1;
		self.selectorId = getId();

		createDropDown(options);
		if (typeof(options.inputElem) != 'undefined') {
			self.bindInputElement(options.inputElem);
		}
		self.init(options);
	};

	_init(options);
}

ce6.searchSelector = function(options) {
	var superClass = new ce6.Selector({
		inputElem: "#test_input",
		dropdownClass: "ce6-search-dropdown",
		rowClass: "ce6-search-row",
		timeout: 500
	});

	superClass.constructRow = function(idx, rowObj) {
		var row = "<div class='ce6-search-row' index=" + idx + ">";
		row += "<span class='row-val'>" + rowObj.value + "</span>";
		row += "<span class='row-type'>(" + rowObj.indexer + ")</span>";
		row += "</div>";
		return $(row);
	}

//	superClass.hide = function() {
		// hack for debug
//	}

	superClass.refresh = function(e) {
		var value = $.trim($(superClass.inputElem).val());
		if (!value) {
			// do not search for empty input
			superClass.refreshList([]);
			return false;
		}
		var params = {
			partial: value
		};
		ce6.ajaxJson('/show/search',
			params,
			function(data) {
				if (data.rc == 0){
					var list = data['list'];
					superClass.refreshList(list);
				}
				else{
				}
				return false;
			}
		);
	}

	superClass.onEnter = function(e) {
		if (superClass.selectedIdx >=0 &&
			superClass.selectedIdx < superClass.count) {
			superClass.onSelect(superClass.selectedIdx);
		} else {
			var v = $(superClass.inputElem).val();
			alert(v);
		}
	}

	superClass.onSelect = function(idx) {
		var obj = superClass.list[idx];
		alert(obj['value']+"("+obj['indexer']+")");
	}

	return superClass;
}

ce6.simpleSelector = function(options) {
	var selector = new ce6.Selector(options);
	selector.updateAllList = function(list) {
		selector.all = [];
		$.each(list, function(idx, value) {
			selector.all.push({value: value});
		});
	}

	selector.refresh = function(e) {
		var prefix = $.trim($(selector.inputElem).val());
		var matched = [];
		$.each(selector.all, function(idx, obj) {
			if (obj.value.toLowerCase().indexOf(prefix.toLowerCase()) >= 0)
				matched.push(obj);
		});
		selector.refreshList(matched.slice(0, 10));
	};

	selector.onEnter = function(e) {
		if (selector.count == 0)
			return;

		var idx = selector.selectedIdx >= 0 ? selector.selectedIdx : 0;
		selector.onSelect(idx);
	}

	selector.onSelect = function(idx) {
		$(selector.inputElem).val(selector.list[idx].value);
		$(selector.inputElem).focusNextInput();
	}
	selector.updateAllList(options.all);
	return selector;
}