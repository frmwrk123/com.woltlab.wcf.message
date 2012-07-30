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
 * Default implementation for message previews.
 * 
 * @see	WCF.Message.Preview
 */
WCF.Message.DefaultPreview = WCF.Message.Preview.extend({
	/**
	 * @see	WCF.Message.Preview.init()
	 */
	init: function() {
		this._super('wcf\\data\\bbcode\\MessagePreviewAction', 'text', 'previewButton');
	},
	
	/**
	 * @see	WCF.Message.Preview._handleResponse()
	 */
	_handleResponse: function(data) {
		var $preview = $('#previewContainer');
		if (!$preview.length) {
			$preview = $('<div class="container containerPadding marginTop shadow" id="previewContainer"><fieldset><legend>' + WCF.Language.get('wcf.global.preview') + '</legend><div></div></fieldset>').prependTo($('#messageContainer')).wcfFadeIn();
		}
		
		$preview.find('div:eq(0)').html(data.returnValues.message);
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