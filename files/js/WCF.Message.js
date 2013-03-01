/**
 * Message related classes for WCF
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2013 WoltLab GmbH
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
 * Default implementation for message previews.
 * 
 * @see	WCF.Message.Preview
 */
WCF.Message.DefaultPreview = WCF.Message.Preview.extend({
	_attachmentObjectType: null,
	_attachmentObjectID: null,
	_tmpHash: null,
	
	/**
	 * @see	WCF.Message.Preview.init()
	 */
	init: function(attachmentObjectType, attachmentObjectID, tmpHash) {
		this._super('wcf\\data\\bbcode\\MessagePreviewAction', 'text', 'previewButton');
		
		this._attachmentObjectType = attachmentObjectType || null;
		this._attachmentObjectID = attachmentObjectID || null;
		this._tmpHash = tmpHash || null;
	},
	
	/**
	 * @see	WCF.Message.Preview._handleResponse()
	 */
	_handleResponse: function(data) {
		var $preview = $('#previewContainer');
		if (!$preview.length) {
			$preview = $('<div class="container containerPadding marginTop" id="previewContainer"><fieldset><legend>' + WCF.Language.get('wcf.global.preview') + '</legend><div></div></fieldset>').prependTo($('#messageContainer')).wcfFadeIn();
		}
		
		$preview.find('div:eq(0)').html(data.returnValues.message);
	},
	
	/**
	 * @see	WCF.Message.Preview._getParameters()
	 */
	_getParameters: function(message) {
		var $parameters = this._super(message);
		
		if (this._attachmentObjectType != null) {
			$parameters.attachmentObjectType = this._attachmentObjectType;
			$parameters.attachmentObjectID = this._attachmentObjectID;
			$parameters.tmpHash = this._tmpHash;
		}
		
		return $parameters;
	}
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
WCF.Message.SmileyCategories = Class.extend({
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
	 * ckEditor element
	 * @var	jQuery
	 */
	_ckEditor: null,
	
	/**
	 * Initializes the smiley loader.
	 * 
	 * @param	string		ckEditorID
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
 * Handles smiley clicks.
 */
WCF.Message.Smilies = Class.extend({
	/**
	 * ckEditor element
	 * @var	jQuery
	 */
	_ckEditor: null,
	
	/**
	 * Initializes the smiley handler.
	 * 
	 * @param	string		ckEditorID
	 */
	init: function(ckEditorID) {
		// get ck editor
		if (ckEditorID) {
			this._ckEditor = $('#' + ckEditorID);
			
			// add smiley click handler
			$(document).on('click', '.jsSmiley', $.proxy(this._smileyClick, this));
		}
	},
	
	/**
	 * Handles tab smiley clicks.
	 * 
	 * @param	object		event
	 */
	_smileyClick: function(event) {
		var $target = $(event.currentTarget);
		var $smileyCode = $target.data('smileyCode');
		
		// get ckEditor
		var $ckEditor = this._ckEditor.ckeditorGet();
		// get smiley path
		var $smileyPath = $target.find('img').attr('src');
		
		// add smiley to config
		if (!WCF.inArray($smileyCode, $ckEditor.config.smiley_descriptions)) {
			$ckEditor.config.smiley_descriptions.push($smileyCode);
			$ckEditor.config.smiley_images.push($smileyPath);
		}
		
		if ($ckEditor.mode === 'wysiwyg') {
			// in design mode
			var $img = $ckEditor.document.createElement('img', {
				attributes: {
					src: $smileyPath,
					'class': 'smiley',
					alt: $smileyCode
				}
			});
			$ckEditor.insertText(' ');
			$ckEditor.insertElement($img);
			$ckEditor.insertText(' ');
		}
		else {
			// in source mode
			var $textarea = this._ckEditor.next('.cke_editor_text').find('textarea');
			var $value = $textarea.val();
			if ($value.length == 0) {
				$textarea.val($smileyCode);
				$textarea.setCaret($smileyCode.length);
			}
			else {
				var $position = $textarea.getCaret();
				var $string = (($value.substr($position - 1, 1) !== ' ') ? ' ' : '') + $smileyCode + ' ';
				$textarea.val( $value.substr(0, $position) + $string + $value.substr($position) );
				$textarea.setCaret($position + $string.length);
			}
		}
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
	 * quote manager object
	 * @var	WCF.Message.Quote.Manager
	 */
	_quoteManager: null,
	
	/**
	 * scroll handler
	 * @var	WCF.Effect.Scroll
	 */
	_scrollHandler: null,
	
	/**
	 * Initializes a new WCF.Message.QuickReply object.
	 * 
	 * @param	boolean				supportExtendedForm
	 * @param	WCF.Message.Quote.Manager	quoteManager
	 */
	init: function(supportExtendedForm, quoteManager) {
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
		
		if (quoteManager) this._quoteManager = quoteManager;
		
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
			
			WCF.Message.Submit.registerButton('text', this._container.find('.formSubmit button[data-type=save]'));
		}
		
		// discard event
		event.stopPropagation();
		return false;
	},
	
	/**
	 * Saves message.
	 */
	_save: function() {
		var $ckEditor = this._messageField.ckeditorGet();
		var $message = $.trim($ckEditor.getData());
		
		// check if message is empty
		var $innerError = this._messageField.parent().find('small.innerError');
		if ($message === '') {
			if (!$innerError.length) {
				$innerError = $('<small class="innerError" />').appendTo(this._messageField.parent());
			}
			
			$innerError.html(WCF.Language.get('wcf.global.form.error.empty'));
			return;
		}
		else {
			$innerError.remove();
		}
		
		this._proxy.setOption('data', {
			actionName: 'quickReply',
			className: this._getClassName(),
			interfaceName: 'wcf\\data\\IMessageQuickReplyAction',
			parameters: this._getParameters($message)
		});
		this._proxy.sendRequest();
		
		// show spinner and hide CKEditor
		var $messageBody = this._container.find('.messageQuickReplyContent .messageBody');
		$('<span class="icon icon48 icon-spinner" />').appendTo($messageBody);
		$messageBody.children('#cke_text').hide().end().next().hide();
	},
	
	/**
	 * Returns the parameters for the save request.
	 * 
	 * @param	string		message
	 * @return	object
	 */
	_getParameters: function(message) {
		var $parameters = {
			objectID: this._getObjectID(),
			data: {
				message: message
			},
			lastPostTime: this._container.data('lastPostTime'),
			pageNo: this._container.data('pageNo'),
			removeQuoteIDs: (this._quoteManager === null ? [ ] : this._quoteManager.getQuotesMarkedForRemoval())
		};
		if (this._container.data('anchor')) {
			$parameters.anchor = this._container.data('anchor');
		}
		
		return $parameters;
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
		$messageBody.children('.icon-spinner').remove();
		$messageBody.children('#cke_text').show();
		
		// display form submit
		$messageBody.next().show();
	},
	
	/**
	 * Prepares jump to extended message add form.
	 */
	_prepareExtended: function() {
		// mark quotes for removal
		if (this._quoteManager !== null) {
			this._quoteManager.markQuotesForRemoval();
		}
		
		var $ckEditor = this._messageField.ckeditorGet();
		var $message = $ckEditor.getData();
		
		new WCF.Action.Proxy({
			autoSend: true,
			data: {
				actionName: 'jumpToExtended',
				className: this._getClassName(),
				interfaceName: 'wcf\\data\\IExtendedMessageQuickReplyAction',
				parameters: {
					containerID: this._getObjectID(),
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
			
			// show notification
			this._notification.show();
			
			// count stored quotes
			if (this._quoteManager !== null) {
				this._quoteManager.countQuotes();
			}
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

/**
 * Provides an inline message editor.
 * 
 * @param	integer		containerID
 */
WCF.Message.InlineEditor = Class.extend({
	/**
	 * currently active message
	 * @var	string
	 */
	_activeElementID: '',
	
	/**
	 * message cache
	 * @var	string
	 */
	_cache: '',
	
	/**
	 * list of messages
	 * @var	object
	 */
	_container: { },
	
	/**
	 * container id
	 * @var	integer
	 */
	_containerID: 0,
	
	/**
	 * list of dropdowns
	 * @var	object
	 */
	_dropdowns: { },
	
	/**
	 * CSS selector for the message container
	 * @var	string
	 */
	_messageContainerSelector: '.jsMessage',
	
	/**
	 * prefix of the message editor CSS id
	 * @var	string
	 */
	_messageEditorIDPrefix: 'messageEditor',
	
	/**
	 * notification object
	 * @var	WCF.System.Notification
	 */
	_notification: null,
	
	/**
	 * proxy object
	 * @var	WCF.Action.Proxy
	 */
	_proxy: null,
	
	/**
	 * support for extended editing form
	 * @var	boolean
	 */
	_supportExtendedForm: false,
	
	/**
	 * Initializes a new WCF.Message.InlineEditor object.
	 * 
	 * @param	integer		containerID
	 * @param	boolean		supportExtendedForm
	 */
	init: function(containerID, supportExtendedForm) {
		this._activeElementID = '';
		this._cache = '';
		this._container = { };
		this._containerID = parseInt(containerID);
		this._dropdowns = { };
		this._supportExtendedForm = (supportExtendedForm) ? true : false;
		this._proxy = new WCF.Action.Proxy({
			failure: $.proxy(this._cancel, this),
			showLoadingOverlay: false,
			success: $.proxy(this._success, this)
		});
		this._notification = new WCF.System.Notification(WCF.Language.get('wcf.global.form.edit.success'));
		
		this.initContainers();
		
		WCF.DOMNodeInsertedHandler.addCallback('WCF.Message.InlineEditor', $.proxy(this.initContainers, this));
	},
	
	/**
	 * Initializes editing capability for all messages.
	 */
	initContainers: function() {
		$(this._messageContainerSelector).each($.proxy(function(index, container) {
			var $container = $(container);
			var $containerID = $container.wcfIdentify();
			
			if (!this._container[$containerID]) {
				this._container[$containerID] = $container;
				
				if ($container.data('canEditInline')) {
					$container.find('.jsMessageEditButton:eq(0)').data('containerID', $containerID).click($.proxy(this._clickInline, this));
				}
				else if ($container.data('canEdit')) {
					$container.find('.jsMessageEditButton:eq(0)').data('containerID', $containerID).click($.proxy(this._click, this));
				}
			}
		}, this));
	},
	
	/**
	 * Loads WYSIWYG editor for selected message.
	 * 
	 * @param	object		event
	 * @param	integer		containerID
	 * @return	boolean
	 */
	_click: function(event, containerID) {
		var $containerID = (event === null) ? containerID : $(event.currentTarget).data('containerID');
		
		if (this._activeElementID === '') {
			this._activeElementID = $containerID;
			this._prepare();
			
			this._proxy.setOption('data', {
				actionName: 'beginEdit',
				className: this._getClassName(),
				interfaceName: 'wcf\\data\\IMessageInlineEditorAction',
				parameters: {
					containerID: this._containerID,
					objectID: this._container[$containerID].data('objectID')
				}
			});
			this._proxy.sendRequest();
		}
		
		if (event !== null) {
			event.stopPropagation();
			return false;
		}
	},
	
	/**
	 * Provides an inline dropdown menu instead of directly loading the WYSIWYG editor.
	 * 
	 * @param	object		event
	 * @return	boolean
	 */
	_clickInline: function(event) {
		var $button = $(event.currentTarget);
		
		if (!$button.hasClass('dropdownToggle')) {
			var $containerID = $button.data('containerID');
			
			WCF.DOMNodeInsertedHandler.enable();
			
			$button.addClass('dropdownToggle').parent().addClass('dropdown');
			
			var $dropdownMenu = $('<ul class="dropdownMenu" />').insertAfter($button);
			this._initDropdownMenu($containerID, $dropdownMenu);
			
			WCF.DOMNodeInsertedHandler.disable();
			
			this._dropdowns[this._container[$containerID].data('objectID')] = $dropdownMenu;
			
			WCF.Dropdown.registerCallback($button.parent().wcfIdentify(), $.proxy(this._toggleDropdown, this));
			
			// trigger click event
			$button.trigger('click');
		}
		
		event.stopPropagation();
		return false;
	},
	
	/**
	 * Forces message options to stay visible if toggling dropdown menu.
	 * 
	 * @param	jQuery		dropdown
	 * @param	string		action
	 */
	_toggleDropdown: function(dropdown, action) {
		dropdown.parents('.messageOptions').toggleClass('forceOpen');
	},
	
	/**
	 * Initializes the inline edit dropdown menu.
	 * 
	 * @param	integer		containerID
	 * @param	jQuery		dropdownMenu
	 */
	_initDropdownMenu: function(containerID, dropdownMenu) { },
	
	/**
	 * Prepares message for WYSIWYG display.
	 */
	_prepare: function() {
		var $messageBody = this._container[this._activeElementID].find('.messageBody');
		$('<span class="icon icon48 icon-spinner" />').appendTo($messageBody);
		
		var $content = $messageBody.find('.messageText');
		this._cache = $content.html();
		$content.empty();
	},
	
	/**
	 * Cancels editing and reverts to original message.
	 */
	_cancel: function() {
		var $container = this._container[this._activeElementID];
		
		// remove ckEditor
		try {
			var $ckEditor = $('#' + this._messageEditorIDPrefix + $container.data('objectID')).ckeditorGet();
			$ckEditor.destroy();
		}
		catch (e) {
			// CKEditor might be not initialized yet, ignore
		}
		
		// restore message
		$container.find('.messageBody').removeClass('jsMessageLoading').find('.messageText').html(this._cache);
		
		this._activeElementID = '';
	},
	
	/**
	 * Handles successful AJAX calls.
	 * 
	 * @param	object		data
	 * @param	string		textStatus
	 * @param	jQuery		jqXHR
	 */
	_success: function(data, textStatus, jqXHR) {
		switch (data.returnValues.actionName) {
			case 'beginEdit':
				this._showEditor(data);
			break;
			
			case 'save':
				this._showMessage(data);
			break;
		}
	},
	
	/**
	 * Shows WYSIWYG editor for active message.
	 * 
	 * @param	object		data
	 */
	_showEditor: function(data) {
		var $messageBody = this._container[this._activeElementID].find('.messageBody');
		$messageBody.children('.icon-spinner').remove();
		var $content = $messageBody.find('.messageText');
		
		// insert wysiwyg
		$('' + data.returnValues.template).appendTo($content);
		
		// bind buttons
		var $formSubmit = $content.find('.formSubmit');
		var $saveButton = $formSubmit.find('button[data-type=save]').click($.proxy(this._save, this));
		if (this._supportExtendedForm) $formSubmit.find('button[data-type=extended]').click($.proxy(this._prepareExtended, this));
		$formSubmit.find('button[data-type=cancel]').click($.proxy(this._cancel, this));
		
		WCF.Message.Submit.registerButton(
			this._messageEditorIDPrefix + this._container[this._activeElementID].data('objectID'),
			$saveButton
		);
	},
	
	/**
	 * Saves editor contents.
	 */
	_save: function() {
		var $container = this._container[this._activeElementID];
		var $objectID = $container.data('objectID');
		var $ckEditor = $('#' + this._messageEditorIDPrefix + $objectID).ckeditorGet();
		
		this._proxy.setOption('data', {
			actionName: 'save',
			className: this._getClassName(),
			interfaceName: 'wcf\\data\\IMessageInlineEditorAction',
			parameters: {
				containerID: this._containerID,
				data: {
					message: $ckEditor.getData()
				},
				objectID: $objectID
			}
		});
		this._proxy.sendRequest();
		
		this._hideEditor();
		
		this._notification.show();
	},
	
	/**
	 * Prepares jumping to extended editing mode.
	 */
	_prepareExtended: function() {
		var $container = this._container[this._activeElementID];
		var $objectID = $container.data('objectID');
		
		var $ckEditor = $('#' + this._messageEditorIDPrefix + $objectID).ckeditorGet();
		var $message = $ckEditor.getData();
		
		new WCF.Action.Proxy({
			autoSend: true,
			data: {
				actionName: 'jumpToExtended',
				className: this._getClassName(),
				parameters: {
					containerID: this._containerID,
					message: $message,
					messageID: $objectID
				}
			},
			success: function(data, textStatus, jqXHR) {
				window.location = data.returnValues.url;
			}
		});
	},
	
	/**
	 * Hides WYSIWYG editor.
	 */
	_hideEditor: function() {
		var $messageBody = this._container[this._activeElementID].find('.messageBody');
		$('<span class="icon icon48 icon-spinner" />').appendTo($messageBody);
		$messageBody.find('.messageText').children().hide();
	},
	
	/**
	 * Shows rendered message.
	 * 
	 * @param	object		data
	 */
	_showMessage: function(data) {
		var $container = this._container[this._activeElementID];
		var $messageBody = $container.find('.messageBody');
		$messageBody.children('.icon-spinner').remove();
		var $content = $messageBody.find('.messageText');
		
		// remove editor
		var $ckEditor = $('#' + this._messageEditorIDPrefix + $container.data('objectID')).ckeditorGet();
		$ckEditor.destroy();
		$content.empty();
		
		// insert new message
		$content.html(data.returnValues.message);
		
		this._activeElementID = '';
	},
	
	/**
	 * Returns message action class name.
	 * 
	 * @return	string
	 */
	_getClassName: function() {
		return '';
	}
});

/**
 * Handles submit buttons for forms with an embedded WYSIWYG editor.
 */
WCF.Message.Submit = {
	/**
	 * list of registered buttons
	 * @var	object
	 */
	_buttons: { },
	
	/**
	 * Registers submit button for specified wysiwyg container id.
	 * 
	 * @param	string		wysiwygContainerID
	 * @param	string		selector
	 */
	registerButton: function(wysiwygContainerID, selector) {
		if (!WCF.Browser.isChrome()) {
			return;
		}
		
		this._buttons[wysiwygContainerID] = $(selector);
	},
	
	/**
	 * Triggers 'click' event for registered buttons.
	 */
	execute: function(wysiwygContainerID) {
		if (!this._buttons[wysiwygContainerID]) {
			return;
		}
		
		this._buttons[wysiwygContainerID].trigger('click');
	}
};

/**
 * Namespace for message quotes.
 */
WCF.Message.Quote = { };

/**
 * Handles message quotes.
 * 
 * @param	string		className
 * @param	string		objectType
 * @param	string		containerSelector
 * @param	string		messageBodySelector
 */
WCF.Message.Quote.Handler = Class.extend({
	/**
	 * active container id
	 * @var	string
	 */
	_activeContainerID: '',
	
	/**
	 * action class name
	 * @var	string
	 */
	_className: '',
	
	/**
	 * list of message containers
	 * @var	object
	 */
	_containers: { },
	
	/**
	 * container selector
	 * @var	string
	 */
	_containerSelector: '',
	
	/**
	 * 'copy quote' overlay
	 * @var	jQuery
	 */
	_copyQuote: null,
	
	/**
	 * marked message
	 * @var	string
	 */
	_message: '',
	
	/**
	 * message body selector
	 * @var	string
	 */
	_messageBodySelector: '',
	
	/**
	 * object id
	 * @var	integer
	 */
	_objectID: 0,
	
	/**
	 * object type name
	 * @var	string
	 */
	_objectType: '',
	
	/**
	 * action proxy
	 * @var	WCF.Action.Proxy
	 */
	_proxy: null,
	
	/**
	 * quote manager
	 * @var	WCF.Message.Quote.Manager
	 */
	_quoteManager: null,
	
	/**
	 * Initializes the quote handler for given object type.
	 * 
	 * @param	WCF.Message.Quote.Manager	quoteManager
	 * @param	string				className
	 * @param	string				objectType
	 * @param	string				containerSelector
	 * @param	string				messageBodySelector
	 * @param	string				messageContentSelector
	 */
	init: function(quoteManager, className, objectType, containerSelector, messageBodySelector, messageContentSelector) {
		this._className = className;
		if (this._className == '') {
			console.debug("[WCF.Message.QuoteManager] Empty class name given, aborting.");
			return;
		}
		
		this._objectType = objectType;
		if (this._objectType == '') {
			console.debug("[WCF.Message.QuoteManager] Empty object type name given, aborting.");
			return;
		}
		
		this._containerSelector = containerSelector;
		this._message = '';
		this._messageBodySelector = messageBodySelector;
		this._messageContentSelector = messageContentSelector;
		this._objectID = 0;
		this._proxy = new WCF.Action.Proxy({
			success: $.proxy(this._success, this)
		});
		
		this._initContainers();
		this._initCopyQuote();
		
		$(document).mouseup($.proxy(this._mouseUp, this));
		
		// register with quote manager
		this._quoteManager = quoteManager;
		this._quoteManager.register(this._objectType, this);
		
		// register with DOMNodeInsertedHandler
		WCF.DOMNodeInsertedHandler.addCallback('WCF.Message.Quote.Handler' + objectType.hashCode(), $.proxy(this._initContainers, this));
	},
	
	/**
	 * Initializes message containers.
	 */
	_initContainers: function() {
		var self = this;
		$(this._containerSelector).each(function(index, container) {
			var $container = $(container);
			var $containerID = $container.wcfIdentify();
			
			if (!self._containers[$containerID]) {
				self._containers[$containerID] = $container;
				if (self._messageBodySelector !== null) {
					$container = $container.find(self._messageBodySelector).data('containerID', $containerID);
				}
				
				$container.mousedown($.proxy(self._mouseDown, self));
				
				// bind event to quote whole message
				self._containers[$containerID].find('.jsQuoteMessage').click($.proxy(self._saveFullQuote, self));
			}
		});
	},
	
	/**
	 * Handles mouse down event.
	 * 
	 * @param	object		event
	 */
	_mouseDown: function(event) {
		// hide copy quote
		this._copyQuote.hide();
		
		// store container ID
		var $container = $(event.currentTarget);
		if (this._messageBodySelector) {
			$container = this._containers[$container.data('containerID')];
		}
		this._activeContainerID = $container.wcfIdentify();
	},
	
	/**
	 * Handles the mouse up event.
	 * 
	 * @param	object		event
	 */
	_mouseUp: function(event) {
		// ignore event
		if (this._activeContainerID == '') {
			this._copyQuote.hide();
			
			return;
		}
		
		var $container = this._containers[this._activeContainerID];
		var $selection = this._getSelectedText();
		var $text = $.trim($selection);
		if ($text == '') {
			this._copyQuote.hide();
			
			return;
		}
		
		// normalize line breaks before comparing content
		$text = $text.replace(/\r?\n|\r/g, "\n");
		
		// compare selection with message text of given container
		var $messageText = null;
		if (this._messageBodySelector) {
			$messageText = $container.find(this._messageContentSelector).text();
		}
		else {
			$messageText = $container.text();
		}
		
		// selected text is not part of $messageText or contains text from unrelated nodes
		if ($messageText.indexOf($text) === -1) {
			return;
		}
		
		this._copyQuote.show();
		
		var $coordinates = this._getBoundingRectangle($selection);
		var $dimensions = this._copyQuote.getDimensions('outer');
		var $left = (($coordinates.right - $coordinates.left) / 2) - ($dimensions.width / 2) + $coordinates.left;
		
		this._copyQuote.css({
			top: $coordinates.top - $dimensions.height - 7 + 'px',
			left: $left + 'px'
		});
		this._copyQuote.hide();
		
		// reset containerID
		this._activeContainerID = '';
		
		// show element after a delay, to prevent display if text was unmarked again (clicking into marked text)
		var self = this;
		new WCF.PeriodicalExecuter(function(pe) {
			pe.stop();
			
			var $text = $.trim(self._getSelectedText());
			if ($text != '') {
				self._copyQuote.show();
				self._message = $text;
				self._objectID = $container.data('objectID');
			}
		}, 10);
	},
	
	/**
	 * Returns the offsets of the selection's bounding rectangle.
	 * 
	 * @return	object
	 */
	_getBoundingRectangle: function(selection) {
		var $coordinates = null;
		
		if (document.createRange && typeof document.createRange().getBoundingClientRect != "undefined") { // Opera, Firefox, Safari, Chrome
			if (selection.rangeCount > 0) {
				// the coordinates returned by getBoundingClientRect() is relative to the window, not the document!
				var $rect = selection.getRangeAt(0).getBoundingClientRect();
				var $document = $(document);
				var $offsetTop = $document.scrollTop();
				
				$coordinates = {
					bottom: $rect.bottom + $offsetTop,
					left: $rect.left,
					right: $rect.right,
					top: $rect.top + $offsetTop
				};
			}
		}
		else if (document.selection && document.selection.type != "Control") { // IE
			var $range = document.selection.createRange();
			// TODO: Check coordinates if they're relative too!
			$coordinates = {
				bottom: $range.boundingBottom,
				left: $range.boundingLeft,
				right: $range.boundingRight,
				top: $range.boundingTop
			};
		}
		
		return $coordinates;
	},
	
	/**
	 * Initializes the 'copy quote' element.
	 */
	_initCopyQuote: function() {
		this._copyQuote = $('#quoteManagerCopy');
		if (!this._copyQuote.length) {
			this._copyQuote = $('<div id="quoteManagerCopy" class="balloonTooltip"><span>' + WCF.Language.get('wcf.message.quote.quoteSelected') + '</span><span class="pointer"><span></span></span></div>').hide().appendTo(document.body);
			this._copyQuote.click($.proxy(this._saveQuote, this));
		}
	},
	
	/**
	 * Returns the text selection.
	 * 
	 * @return	object
	 */
	_getSelectedText: function() {
		if (window.getSelection) { // Opera, Firefox, Safari, Chrome, IE 9+
			return window.getSelection();
		}
		else if (document.getSelection) { // Opera, Firefox, Safari, Chrome, IE 9+
			return document.getSelection();
		}
		else if (document.selection) { // IE 8
			return document.selection.createRange().text;
		}
		
		return '';
	},
	
	/**
	 * Saves a full quote.
	 * 
	 * @param	object		event
	 */
	_saveFullQuote: function(event) {
		var $listItem = $(event.currentTarget);
		
		this._proxy.setOption('data', {
			actionName: 'saveFullQuote',
			className: this._className,
			interfaceName: 'wcf\\data\\IMessageQuoteAction',
			objectIDs: [ $listItem.data('objectID') ]
		});
		this._proxy.sendRequest();
		
		// mark element as quoted
		if ($listItem.data('isQuoted')) {
			$listItem.data('isQuoted', false).children('a').removeClass('active');
		}
		else {
			$listItem.data('isQuoted', true).children('a').addClass('active');
		}
		
		// discard event
		event.stopPropagation();
		return false;
	},
	
	/**
	 * Saves a quote.
	 */
	_saveQuote: function() {
		this._proxy.setOption('data', {
			actionName: 'saveQuote',
			className: this._className,
			interfaceName: 'wcf\\data\\IMessageQuoteAction',
			objectIDs: [ this._objectID ],
			parameters: {
				message: this._message
			}
		});
		this._proxy.sendRequest();
	},
	
	/**
	 * Handles successful AJAX requests.
	 * 
	 * @param	object		data
	 * @param	string		textStatus
	 * @param	jQuery		jqXHR
	 */
	_success: function(data, textStatus, jqXHR) {
		if (data.returnValues.count !== undefined) {
			var $fullQuoteObjectIDs = (data.fullQuoteObjectIDs !== undefined) ? data.fullQuoteObjectIDs : { };
			this._quoteManager.updateCount(data.returnValues.count, $fullQuoteObjectIDs);
		}
	},
	
	/**
	 * Updates the full quote data for all matching objects.
	 * 
	 * @param	array<integer>		$objectIDs
	 */
	updateFullQuoteObjectIDs: function(objectIDs) {
		for (var $containerID in this._containers) {
			this._containers[$containerID].find('.jsQuoteMessage').each(function(index, button) {
				// reset all markings
				var $button = $(button).data('isQuoted', 0);
				$button.children('a').removeClass('active');
				
				// mark as active
				if (WCF.inArray($button.data('objectID'), objectIDs)) {
					$button.data('isQuoted', 1).children('a').addClass('active');
				}
			});
		}
	}
});

/**
 * Manages stored quotes.
 * 
 * @param	integer		count
 */
WCF.Message.Quote.Manager = Class.extend({
	/**
	 * ckEditor element
	 * @var	jQuery
	 */
	_ckEditor: '',
	
	/**
	 * number of stored quotes
	 * @var	integer
	 */
	_count: 0,
	
	/**
	 * dialog overlay
	 * @var	jQuery
	 */
	_dialog: null,
	
	/**
	 * form element
	 * @var	jQuery
	 */
	_form: null,
	
	/**
	 * list of quote handlers
	 * @var	object
	 */
	_handlers: { },
	
	/**
	 * true, if an up-to-date template exists
	 * @var	boolean
	 */
	_hasTemplate: false,
	
	/**
	 * action proxy
	 * @var	WCF.Action.Proxy
	 */
	_proxy: null,
	
	/**
	 * list of quotes to remove upon submit
	 * @var	array<string>
	 */
	_removeOnSubmit: [ ],
	
	/**
	 * show quotes element
	 * @var	jQuery
	 */
	_showQuotes: null,
	
	/**
	 * allow pasting
	 * @var	boolean
	 */
	_supportPaste: false,
	
	/**
	 * Initializes the quote manager.
	 * 
	 * @param	integer		count
	 * @param	string		ckEditorID
	 * @param	boolean		supportPaste
	 * @param	array<string>	removeOnSubmit
	 */
	init: function(count, ckEditorID, supportPaste, removeOnSubmit) {
		this._ckEditor = '';
		this._count = parseInt(count) || 0;
		this._dialog = null;
		this._form = null;
		this._handlers = { };
		this._hasTemplate = false;
		this._removeOnSubmit = [ ];
		this._showQuotes = null;
		this._supportPaste = false;
		
		if (ckEditorID) {
			this._ckEditor = $('#' + ckEditorID);
			if (this._ckEditor.length) {
				this._supportPaste = true;
				
				// get surrounding form-tag
				this._form = this._ckEditor.parents('form:eq(0)');
				if (this._form.length) {
					this._form.submit($.proxy(this._submit, this));
					this._removeOnSubmit = removeOnSubmit || [ ];
				}
				else {
					this._form = null;
					
					// allow override
					this._supportPaste = (supportPaste === true) ? true : false;
				}
			}
		}
		
		this._proxy = new WCF.Action.Proxy({
			showLoadingOverlay: false,
			success: $.proxy(this._success, this),
			url: 'index.php/MessageQuote/?t=' + SECURITY_TOKEN + SID_ARG_2ND
		});
		
		this._toggleShowQuotes();
	},
	
	/**
	 * Registers a quote handler.
	 * 
	 * @param	string				objectType
	 * @param	WCF.Message.Quote.Handler	handler
	 */
	register: function(objectType, handler) {
		this._handlers[objectType] = handler;
	},
	
	/**
	 * Updates number of stored quotes.
	 * 
	 * @param	integer		count
	 * @param	object		fullQuoteObjectIDs
	 */
	updateCount: function(count, fullQuoteObjectIDs) {
		this._count = parseInt(count) || 0;
		
		this._toggleShowQuotes();
		
		// update full quote ids of handlers
		for (var $objectType in this._handlers) {
			if (fullQuoteObjectIDs[$objectType]) {
				this._handlers[$objectType].updateFullQuoteObjectIDs(fullQuoteObjectIDs[$objectType]);
			}
		}
	},
	
	/**
	 * Toggles the display of the 'Show quotes' button
	 */
	_toggleShowQuotes: function() {
		if (!this._count) {
			if (this._showQuotes !== null) {
				this._showQuotes.hide();
			}
		}
		else {
			if (this._showQuotes === null) {
				this._showQuotes = $('#showQuotes');
				if (!this._showQuotes.length) {
					this._showQuotes = $('<div id="showQuotes" class="balloonTooltip" />').click($.proxy(this._click, this)).appendTo(document.body);
				}
			}
			
			var $text = WCF.Language.get('wcf.message.quote.showQuotes').replace(/#count#/, this._count);
			this._showQuotes.text($text).show();
		}
		
		this._hasTemplate = false;
	},
	
	/**
	 * Handles clicks on 'Show quotes'.
	 */
	_click: function() {
		if (this._hasTemplate) {
			this._dialog.wcfDialog('open');
		}
		else {
			this._proxy.showLoadingOverlayOnce();
			
			this._proxy.setOption('data', {
				actionName: 'getQuotes',
				supportPaste: this._supportPaste
			});
			this._proxy.sendRequest();
		}
	},
	
	/**
	 * Renders the dialog.
	 * 
	 * @param	string		template
	 */
	renderDialog: function(template) {
		// create dialog if not exists
		if (this._dialog === null) {
			this._dialog = $('#messageQuoteList');
			if (!this._dialog.length) {
				this._dialog = $('<div id="messageQuoteList" />').hide().appendTo(document.body);
			}
		}
		
		// add template
		this._dialog.html(template);
		
		// add 'delete marked' button
		var $formSubmit = $('<div class="formSubmit" />').appendTo(this._dialog);
		$('<button>' + WCF.Language.get('wcf.message.quote.deleteSelectedQuotes') + '</button>').click($.proxy(this._removeSelected, this)).appendTo($formSubmit);
		
		// show dialog
		this._dialog.wcfDialog({
			title: WCF.Language.get('wcf.message.quote.manageQuotes')
		});
		this._dialog.wcfDialog('render');
		this._hasTemplate = true;
		
		// bind event listener
		if (this._supportPaste) {
			this._dialog.find('.jsInsertQuote').click($.proxy(this._insertQuote, this));
		}
		
		// mark quotes for removal
		if (this._removeOnSubmit.length) {
			var self = this;
			this._dialog.find('input.jsRemoveQuote').each(function(index, input) {
				var $input = $(input).change($.proxy(this._change, this));
				
				// mark for deletion
				if (WCF.inArray($input.parent('li').attr('data-quote-id'), self._removeOnSubmit)) {
					$input.attr('checked', 'checked');
				}
			});
		}
	},
	
	/**
	 * Checks for change event on delete-checkboxes.
	 * 
	 * @param	object		event
	 */
	_change: function(event) {
		var $input = $(event.currentTarget);
		var $quoteID = $input.parent('li').attr('data-quote-id');
		
		if ($input.prop('checked')) {
			this._removeOnSubmit.push($quoteID);
		}
		else {
			for (var $index in this._removeOnSubmit) {
				if (this._removeOnSubmit[$index] == $quoteID) {
					delete this._removeOnSubmit[$index];
					break;
				}
			}
		}
	},
	
	/**
	 * Inserts a quote.
	 * 
	 * @param	object		event
	 */
	_insertQuote: function(event) {
		var $listItem = $(event.currentTarget).parents('li');
		var $quote = $.trim($listItem.children('div.jsFullQuote').html());
		var $message = $listItem.parents('article.message');
		
		// build quote tag
		$quote = "[quote='" + $message.attr('data-username') + "','" + $message.data('link') + "']" + $quote + "[/quote]";
		
		// insert into ckEditor
		var $ckEditor = this._ckEditor.ckeditorGet();
		if ($ckEditor.mode === 'wysiwyg') {
			// in design mode
			$ckEditor.insertText($quote);
		}
		else {
			// in source mode
			var $textarea = this._ckEditor.next('.cke_editor_text').find('textarea');
			var $value = $textarea.val();
			if ($value.length == 0) {
				$textarea.val($quote);
			}
			else {
				var $position = $textarea.getCaret();
				$textarea.val( $value.substr(0, $position) + $quote + $value.substr($position) );
			}
		}
		
		// remove quote upon submit or upon request
		this._removeOnSubmit.push($listItem.attr('data-quote-id'));
		
		// close dialog
		this._dialog.wcfDialog('close');
	},
	
	/**
	 * Removes selected quotes.
	 */
	_removeSelected: function() {
		var $quoteIDs = [ ];
		this._dialog.find('input.jsRemoveQuote:checked').each(function(index, input) {
			$quoteIDs.push($(input).parents('li').attr('data-quote-id'));
		});
		
		if ($quoteIDs.length) {
			// get object types
			var $objectTypes = [ ];
			for (var $objectType in this._handlers) {
				$objectTypes.push($objectType);
			}
			
			this._proxy.setOption('data', {
				actionName: 'remove',
				objectTypes: $objectTypes,
				quoteIDs: $quoteIDs
			});
			this._proxy.sendRequest();
			
			this._dialog.wcfDialog('close');
		}
	},
	
	/**
	 * Appends list of quote ids to remove after successful submit.
	 */
	_submit: function() {
		if (this._supportPaste && this._removeOnSubmit.length > 0) {
			var $formSubmit = this._form.find('.formSubmit');
			for (var $i in this._removeOnSubmit) {
				$('<input type="hidden" name="__removeQuoteIDs[]" value="' + this._removeOnSubmit[$i] + '" />').appendTo($formSubmit);
			}
		}
	},
	
	/**
	 * Returns a list of quote ids marked for removal.
	 * 
	 * @return	array<integer>
	 */
	getQuotesMarkedForRemoval: function() {
		return this._removeOnSubmit;
	},
	
	/**
	 * Marks quote ids for removal.
	 */
	markQuotesForRemoval: function() {
		if (this._removeOnSubmit.length) {
			this._proxy.setOption('data', {
				actionName: 'markForRemoval',
				quoteIDs: this._removeOnSubmit
			});
			this._proxy.sendRequest();
		}
	},
	
	/**
	 * Remoes all marked quote ids.
	 */
	removeMarkedQuotes: function() {
		if (this._removeOnSubmit.length) {
			this._proxy.setOption('data', {
				actionName: 'removeMarkedQuotes'
			});
			this._proxy.sendRequest();
		}
	},
	
	/**
	 * Counts stored quotes.
	 */
	countQuotes: function() {
		var $objectTypes = [ ];
		for (var $objectType in this._handlers) {
			$objectTypes.push($objectType);
		}
		
		this._proxy.setOption('data', {
			actionName: 'count',
			objectTypes: $objectTypes
		});
		this._proxy.sendRequest();
	},
	
	/**
	 * Handles successful AJAX requests.
	 * 
	 * @param	object		data
	 * @param	string		textStatus
	 * @param	jQuery		jqXHR
	 */
	_success: function(data, textStatus, jqXHR) {
		if (data === null) {
			return;
		}
		
		if (data.count !== undefined) {
			var $fullQuoteObjectIDs = (data.fullQuoteObjectIDs !== undefined) ? data.fullQuoteObjectIDs : { };
			this.updateCount(data.count, $fullQuoteObjectIDs);
		}
		
		if (data.template !== undefined) {
			this.renderDialog(data.template);
		}
	}
});

/**
 * Namespace for message sharing related classes.
 */
WCF.Message.Share = { };

/**
 * Displays a dialog overlay for permalinks.
 */
WCF.Message.Share.Content = Class.extend({
	/**
	 * list of cached templates
	 * @var	object
	 */
	_cache: { },
	
	/**
	 * dialog overlay
	 * @var	jQuery
	 */
	_dialog: null,
	
	/**
	 * Initializes the WCF.Message.Share.Content class.
	 */
	init: function() {
		this._cache = { };
		this._dialog = null;
		
		this._initLinks();
		
		WCF.DOMNodeInsertedHandler.addCallback('WCF.Message.Share.Content', $.proxy(this._initLinks, this));
	},
	
	/**
	 * Initializes share links.
	 */
	_initLinks: function() {
		$('a.jsButtonShare').removeClass('jsButtonShare').click($.proxy(this._click, this));
	},
	
	/**
	 * Displays links to share this content.
	 * 
	 * @param	object		event
	 */
	_click: function(event) {
		event.preventDefault();
		
		var $link = $(event.currentTarget).prop('href');
		var $key = $link.hashCode();
		if (this._cache[$key] === undefined) {
			// remove dialog contents
			var $dialogInitialized = false;
			if (this._dialog === null) {
				this._dialog = $('<div />').hide().appendTo(document.body);
				$dialogInitialized = true;
			}
			else {
				this._dialog.empty();
			}
			
			// permalink (plain text)
			var $fieldset = $('<fieldset><legend><legend>' + WCF.Language.get('wcf.message.share.permalink') + '</legend></fieldset>').appendTo(this._dialog);
			$('<input type="text" class="long" value="' + $link + '" readonly="readonly" />').appendTo($fieldset);
			
			// permalink (BBCode)
			var $fieldset = $('<fieldset><legend><legend>' + WCF.Language.get('wcf.message.share.permalink.bbcode') + '</legend></fieldset>').appendTo(this._dialog);
			$('<input type="text" class="long" value="[url]' + $link + '[/url]" readonly="readonly" />').appendTo($fieldset);
			
			// permalink (HTML)
			var $fieldset = $('<fieldset><legend><legend>' + WCF.Language.get('wcf.message.share.permalink.html') + '</legend></fieldset>').appendTo(this._dialog);
			$("<input type=\"text\" class=\"long\" value='&lt;a href=\"" + $link + "\"&gt;" + $link + "&lt;/a&gt;' readonly=\"readonly\" />").appendTo($fieldset);
			
			this._cache[$key] = this._dialog.html();
			
			if ($dialogInitialized) {
				this._dialog.wcfDialog({
					title: WCF.Language.get('wcf.message.share')
				});
			}
			else {
				this._dialog.wcfDialog('open');
			}
		}
		else {
			this._dialog.html(this._cache[$key]).wcfDialog('open');
		}
		
		this._dialog.find('input').click(function() { $(this).select(); });
	}
});

/**
 * Provides buttons to share a page through multiple social community sites.
 * 
 * @param	boolean		fetchObjectCount
 */
WCF.Message.Share.Page = Class.extend({
	/**
	 * list of share buttons
	 * @var	object
	 */
	_ui: { },
	
	/**
	 * page description
	 * @var	string
	 */
	_pageDescription: '',
	
	/**
	 * canonical page URL
	 * @var	string
	 */
	_pageURL: '',
	
	/**
	 * Initializes the WCF.Message.Share.Page class.
	 * 
	 * @param	boolean		fetchObjectCount
	 */
	init: function(fetchObjectCount) {
		this._pageDescription = encodeURIComponent($('meta[property="og:description"]').prop('content'));
		this._pageURL = encodeURIComponent($('meta[property="og:url"]').prop('content'));
		
		var $container = $('.messageShareButtons');
		this._ui = {
			facebook: $container.find('.jsButtonShareFacebook').click($.proxy(this._shareFacebook, this)),
			google: $container.find('.jsButtonShareGoogle').click($.proxy(this._shareGoogle, this)),
			reddit: $container.find('.jsButtonShareReddit').click($.proxy(this._shareReddit, this)),
			twitter: $container.find('.jsButtonShareTwitter').click($.proxy(this._shareTwitter, this))
		};
		
		if (fetchObjectCount === true) {
			this._fetchFacebook();
			this._fetchTwitter();
			this._fetchReddit();
		}
	},
	
	/**
	 * Shares current page to selected social community site.
	 * 
	 * @param	string		objectName
	 * @param	string		url
	 */
	_share: function(objectName, url) {
		window.open(url.replace(/{pageURL}/, this._pageURL).replace(/{text}/, this._pageDescription), 'height=600,width=600');
	},
	
	/**
	 * Shares current page with Facebook.
	 */
	_shareFacebook: function() {
		this._share('facebook', 'https://www.facebook.com/sharer.php?u={pageURL}&t={text}');
	},
	
	/**
	 * Shares current page with Google Plus.
	 */
	_shareGoogle: function() {
		this._share('google', 'https://plus.google.com/share?url={pageURL}');
	},
	
	/**
	 * Shares current page with Reddit.
	 */
	_shareReddit: function() {
		this._share('reddit', 'https://ssl.reddit.com/submit?url={pageURL}');
	},
	
	/**
	 * Shares current page with Twitter.
	 */
	_shareTwitter: function() {
		this._share('twitter', 'https://twitter.com/share?url={pageURL}&text={text}');
	},
	
	/**
	 * Fetches share count from a social community site.
	 * 
	 * @param	string		url
	 * @param	object		callback
	 * @param	string		callbackName
	 */
	_fetchCount: function(url, callback, callbackName) {
		var $options = {
			autoSend: true,
			dataType: 'jsonp',
			showLoadingOverlay: false,
			success: callback,
			type: 'GET',
			url: url.replace(/{pageURL}/, this._pageURL)
		};
		if (callbackName) {
			$options.jsonp = callbackName;
		}
		
		new WCF.Action.Proxy($options);
	},
	
	/**
	 * Fetches number of Facebook likes.
	 */
	_fetchFacebook: function() {
		this._fetchCount('https://graph.facebook.com/?id={pageURL}', $.proxy(function(data) {
			if (data.shares) {
				this._ui.facebook.children('span.badge').show().text(data.shares);
			}
		}, this));
	},
	
	/**
	 * Fetches tweet count from Twitter.
	 */
	_fetchTwitter: function() {
		this._fetchCount('http://urls.api.twitter.com/1/urls/count.json?url={pageURL}', $.proxy(function(data) {
			if (data.count) {
				this._ui.twitter.children('span.badge').show().text(data.count);
			}
		}, this));
	},
	
	/**
	 * Fetches cumulative vote sum from Reddit.
	 */
	_fetchReddit: function() {
		this._fetchCount('http://www.reddit.com/api/info.json?url={pageURL}', $.proxy(function(data) {
			if (data.data.children.length) {
				self._ui.reddit.children('span.badge').show().text(data.data.children[0].data.score);
			}
		}, this), 'jsonp');
	}
});
