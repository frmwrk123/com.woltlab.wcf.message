/**
 * Message related classes for WCF
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 */
WCF.Message = { };

/**
 * Provides previews for ckEditor message fields.
 * 
 * @param	string		className
 * @param	string		messageFieldID
 * @param	string		previewButtonID
 */
WCF.Message.Preview = Class.extend({
	/**
	 * class name
	 * @var	string
	 */
	_className: '',
	
	/**
	 * message field id
	 * @var	string
	 */
	_messageFieldID: '',
	
	/**
	 * message field
	 * @var	jQuery
	 */
	_messageField: null,
	
	/**
	 * action proxy
	 * @var	WCF.Action.Proxy
	 */
	_proxy: null,
	
	/**
	 * preview button
	 * @var	jQuery
	 */
	_previewButton: null,
	
	/**
	 * previous button label
	 * @var	string
	 */
	_previewButtonLabel: '',
	
	/**
	 * Initializes a new WCF.Message.Preview object.
	 * 
	 * @param	string		className
	 * @param	string		messageFieldID
	 * @param	string		previewButtonID
	 */
	init: function(className, messageFieldID, previewButtonID) {
		this._className = className;
		
		// validate message field
		this._messageFieldID = $.wcfEscapeID(messageFieldID);
		this._messageField = $('#' + this._messageFieldID);
		if (!this._messageField.length) {
			console.debug("[WCF.Message.Preview] Unable to find message field identified by '" + this._messageFieldID + "'");
			return;
		}
		
		// validate preview button
		previewButtonID = $.wcfEscapeID(previewButtonID);
		this._previewButton = $('#' + previewButtonID);
		if (!this._previewButton.length) {
			console.debug("[WCF.Message.Preview] Unable to find preview button identified by '" + previewButtonID + "'");
			return;
		}
		
		this._previewButton.click($.proxy(this._click, this));
		this._proxy = new WCF.Action.Proxy({
			success: $.proxy(this._success, this)
		});
	},
	
	/**
	 * Reads message field input and triggers an AJAX request.
	 */
	_click: function(event) {
		var $message = this._getMessage();
		if ($message === null) {
			console.debug("[WCF.Message.Preview] Unable to access ckEditor instance of '" + this._messageFieldID + "'");
			return;
		}
		
		this._proxy.setOption('data', {
			actionName: 'getMessagePreview',
			className: this._className,
			parameters: this._getParameters($message)
		});
		this._proxy.sendRequest();
		
		// update button label
		this._previewButtonLabel = this._previewButton.html();
		this._previewButton.html(WCF.Language.get('wcf.global.loading')).disable();
		
		// poke event
		event.stopPropagation();
		return false;
	},
	
	/**
	 * Returns request parameters.
	 * 
	 * @param	string		message
	 * @return	object
	 */
	_getParameters: function(message) {
		// collect message form options
		var $options = { };
		$('#settings').find('input[type=checkbox]').each(function(index, checkbox) {
			var $checkbox = $(checkbox);
			if ($checkbox.is(':checked')) {
				$options[$checkbox.prop('name')] = $checkbox.prop('value');
			}
		});
		
		// build parameters
		return {
			data: {
				message: message
			},
			options: $options
		};
	},
	
	/**
	 * Returns parsed message from ckEditor or null if editor was not accessible.
	 * 
	 * @return	string
	 */
	_getMessage: function() {
		if (this._messageField.data('ckeditorInstance')) {
			var $ckEditor = this._messageField.ckeditorGet();
			return $ckEditor.getData();
		}
		
		return null;
	},
	
	/**
	 * Handles successful AJAX requests.
	 * 
	 * @param	object		data
	 * @param	string		textStatus
	 * @param	jQuery		jqXHR
	 */
	_success: function(data, textStatus, jqXHR) {
		// restore preview button
		this._previewButton.html(this._previewButtonLabel).enable();
		
		// evaluate message
		this._handleResponse(data);
	},
	
	/**
	 * Evaluates response data.
	 * 
	 * @param	object		data
	 */
	_handleResponse: function(data) { }
});

/**
 * Handles multilingualism for messages.
 * 
 * @param	integer		languageID
 * @param	object		availableLanguages
 * @param	boolean		forceSelection
 */
WCF.Message.Multilingualism = Class.extend({
	/**
	 * list of available languages
	 * @var	object
	 */
	_availableLanguages: { },
	
	/**
	 * language id
	 * @var	integer
	 */
	_languageID: 0,
	
	/**
	 * language input element
	 * @var	jQuery
	 */
	_languageInput: null,
	
	/**
	 * Initializes WCF.Message.Multilingualism
	 * 
	 * @param	integer		languageID
	 * @param	object		availableLanguages
	 * @param	boolean		forceSelection
	 */
	init: function(languageID, availableLanguages, forceSelection) {
		this._availableLanguages = availableLanguages;
		this._languageID = languageID || 0;
		
		this._languageInput = $('#languageID');
		
		// preselect current language id
		this._updateLabel();
		
		// register event listener
		this._languageInput.find('.dropdownMenu > li').click($.proxy(this._click, this));
		
		// add element to disable multilingualism
		if (!forceSelection) {
			var $dropdownMenu = this._languageInput.find('.dropdownMenu');
			$('<li class="dropdownDivider" />').appendTo($dropdownMenu);
			$('<li><span><span class="badge">' + this._availableLanguages[0] + '</span></span></li>').click($.proxy(this._disable, this)).appendTo($dropdownMenu);
		}
		
		// bind submit event
		this._languageInput.parents('form').submit($.proxy(this._submit, this));
	},
	
	/**
	 * Handles language selections.
	 * 
	 * @param	object		event
	 */
	_click: function(event) {
		this._languageID = $(event.currentTarget).data('languageID');
		this._updateLabel();
	},
	
	/**
	 * Disables language selection.
	 */
	_disable: function() {
		this._languageID = 0;
		this._updateLabel();
	},
	
	/**
	 * Updates selected language.
	 */
	_updateLabel: function() {
		this._languageInput.find('.dropdownToggle > span').text(this._availableLanguages[this._languageID]);
	},
	
	/**
	 * Sets language id upon submit.
	 */
	_submit: function() {
		this._languageInput.next('input[name=languageID]').prop('value', this._languageID);
	}
});

/**
 * Loads smiley categories upon user request.
 */
WCF.Message.Smilies = Class.extend({
	/**
	 * list of already loaded category ids
	 * @var	array<integer>
	 */
	_cache: [ ],
	
	/**
	 * action proxy
	 * @var	WCF.Action.Proxy
	 */
	_proxy: null,
	
	/**
	 * Initializes the smiley loader.
	 */
	init: function() {
		this._cache = [ ];
		this._proxy = new WCF.Action.Proxy({
			success: $.proxy(this._success, this)
		});
		
		$('#smilies').on('wcftabsselect', $.proxy(this._click, this));
		
		// handle onload
		var self = this;
		new WCF.PeriodicalExecuter(function(pe) {
			pe.stop();
			
			self._click({ }, { tab: $('#smilies > .menu li.ui-state-active a') });
		}, 100);
	},
	
	/**
	 * Handles tab menu clicks.
	 * 
	 * @param	object		event
	 * @param	object		ui
	 */
	_click: function(event, ui) {
		var $categoryID = parseInt($(ui.tab).data('smileyCategoryID'));
		
		if ($categoryID && !WCF.inArray($categoryID, this._cache)) {
			this._proxy.setOption('data', {
				actionName: 'getSmilies',
				className: 'wcf\\data\\smiley\\category\\SmileyCategoryAction',
				objectIDs: [ $categoryID ]
			});
			this._proxy.sendRequest();
		}
	},
	
	/**
	 * Handles successful AJAX requests.
	 * 
	 * @param	object		data
	 * @param	string		textStatus
	 * @param	jQuery		jqXHR
	 */
	_success: function(data, textStatus, jqXHR) {
		var $categoryID = parseInt(data.returnValues.smileyCategoryID);
		this._cache.push($categoryID);
		
		$('#smilies-' + $categoryID).html(data.returnValues.template);
	}
});

/**
 * Provides an AJAX-based quick reply for messages.
 */
WCF.Message.QuickReply = Class.extend({
	/**
	 * quick reply container
	 * @var	jQuery
	 */
	_container: null,
	
	/**
	 * message field
	 * @var	jQuery
	 */
	_messageField: null,
	
	/**
	 * notification object
	 * @var	WCF.System.Notification
	 */
	_notification: null,
	
	/**
	 * action proxy
	 * @var	WCF.Action.Proxy
	 */
	_proxy: null,
	
	/**
	 * scroll handler
	 * @var	WCF.Effect.Scroll
	 */
	_scrollHandler: null,
	
	/**
	 * submit button
	 * @var	jQuery
	 */
	_submitButton: null,
	
	/**
	 * Initializes a new WBB.Thread.QuickReply object.
	 * 
	 * @param	boolean		supportExtendedForm
	 */
	init: function(supportExtendedForm) {
		this._container = $('#messageQuickReply');
		this._messageField = $('#text');
		if (!this._container || !this._messageField) {
			return;
		}
		
		// button actions
		var $formSubmit = this._container.find('.formSubmit');
		$formSubmit.find('button[data-type=save]').click($.proxy(this._save, this));
		if (supportExtendedForm) $formSubmit.find('button[data-type=extended]').click($.proxy(this._prepareExtended, this));
		$formSubmit.find('button[data-type=cancel]').click($.proxy(this._cancel, this));
		
		$('.jsQuickReply').click($.proxy(this._click, this));
		
		this._proxy = new WCF.Action.Proxy({
			failure: $.proxy(this._failure, this),
			showLoadingOverlay: false,
			success: $.proxy(this._success, this)
		});
		this._scroll = new WCF.Effect.Scroll();
		this._notification = new WCF.System.Notification(WCF.Language.get('wcf.global.form.add.success'));
	},
	
	/**
	 * Handles clicks on reply button.
	 * 
	 * @param	object		event
	 */
	_click: function(event) {
		this._container.toggle();
		
		if (this._container.is(':visible')) {
			this._scroll.scrollTo(this._container, true);
		}
		
		// discard event
		event.stopPropagation();
		return false;
	},
	
	/**
	 * Saves post.
	 */
	_save: function() {
		var $ckEditor = this._messageField.ckeditorGet();
		var $message = $ckEditor.getData();
		
		this._proxy.setOption('data', {
			actionName: 'quickReply',
			className: this._getClassName(),// 'wcf\\data\\conversation\\message\\ConversationMessageAction',
			parameters: {
				objectID: this._getObjectID(),// this._container.data('conversationID'),
				data: {
					message: $message
				},
				lastPostTime: this._container.data('lastPostTime'),
				pageNo: this._container.data('pageNo')
			}
		});
		this._proxy.sendRequest();
		
		// show spinner and hide CKEditor
		this._container.find('.messageQuickReplyContent .messageBody').addClass('messageQuickReplyLoading').children('#cke_text').hide().end().next().hide();
	},
	
	/**
	 * Cancels quick reply.
	 */
	_cancel: function() {
		this._revertQuickReply(true);
		
		// revert ckEditor
		this._messageField.ckeditorGet().setData('');
	},
	
	/**
	 * Reverts quick reply to original state and optionally hiding it.
	 * 
	 * @param	boolean		hide
	 */
	_revertQuickReply: function(hide) {
		if (hide) {
			this._container.hide();
		}
		
		var $messageBody = this._container.find('.messageQuickReplyContent .messageBody');
		
		// display CKEditor
		$messageBody.removeClass('messageQuickReplyLoading').children('#cke_text').show();
		
		// display form submit
		$messageBody.next().show();
	},
	
	/**
	 * Prepares jump to extended post add form.
	 */
	_prepareExtended: function() {
		var $ckEditor = this._messageField.ckeditorGet();
		var $message = $ckEditor.getData();
		
		new WCF.Action.Proxy({
			autoSend: true,
			data: {
				actionName: 'jumpToExtended',
				className: this._getClassName(),// 'wcf\\data\\conversation\\message\\ConversationMessageAction',
				parameters: {
					objectID: this._getObjectID(),//this._container.data('conversationID'),
					message: $message
				}
			},
			success: function(data, textStatus, jqXHR) {
				window.location = data.returnValues.url;
			}
		});
	},
	
	/**
	 * Handles successful AJAX calls.
	 * 
	 * @param	object		data
	 * @param	string		textStatus
	 * @param	jQuery		jqXHR
	 */
	_success: function(data, textStatus, jqXHR) {
		// redirect to new page
		if (data.returnValues.url) {
			window.location = data.returnValues.url;
		}
		else {
			// insert HTML
			$('' + data.returnValues.template).insertBefore(this._container);
			
			// remove CKEditor contents
			this._messageField.ckeditorGet().setData('');
			
			// update last post time
			this._container.data('lastPostTime', data.returnValues.lastPostTime);
			
			// hide quick reply and revert it
			this._revertQuickReply(true);
			
			this._notification.show();
		}
	},
	
	/**
	 * Reverts quick reply on failure to preserve entered message.
	 */
	_failure: function() {
		this._revertQuickReply(false);
	},
	
	/**
	 * Returns action class name.
	 * 
	 * @return	string
	 */
	_getClassName: function() {
		return '';
	},
	
	/**
	 * Returns object id.
	 * 
	 * @return	integer
	 */
	_getObjectID: function() {
		return 0;
	}
});
