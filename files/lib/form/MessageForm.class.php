<?php
namespace wcf\form;
use wcf\data\smiley\SmileyCache;
use wcf\system\attachment\AttachmentHandler;
use wcf\system\bbcode\BBCodeParser;
use wcf\system\bbcode\PreParser;
use wcf\system\exception\UserInputException;
use wcf\system\language\LanguageFactory;
use wcf\system\WCF;
use wcf\util\MessageUtil;
use wcf\util\StringUtil;

/**
 * MessageForm is an abstract form implementation for a message with optional captcha suppport.
 * 
 * @author	Marcel Werk
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	form
 * @category	Community Framework
 */
abstract class MessageForm extends RecaptchaForm {
	/**
	 * name of the permission which contains the allowed BBCodes
	 * @var	string
	 */
	public $allowedBBCodesPermission = 'user.message.allowedBBCodes';
	
	/**
	 * attachment handler
	 * @var	wcf\system\attachment\AttachmentHandler
	 */
	public $attachmentHandler = null;
	
	/**
	 * object id for attachments
	 * @var	integer
	 */
	public $attachmentObjectID = 0;
	
	/**
	 * object type for attachments, if left blank, attachment support is disabled
	 * @var	integer
	 */
	public $attachmentObjectType = '';
	
	/**
	 * parent object id for attachments
	 * @var	integer
	 */
	public $attachmentParentObjectID = 0;
	
	/**
	 * list of available content languages
	 * @var	array<wcf\data\language\Language>
	 */
	public $availableContentLanguages = array();
	
	/**
	 * list of default smilies
	 * @var	array<wcf\data\smiley\Smiley>
	 */
	public $defaultSmilies = array();
	
	/**
	 * enables bbcodes
	 * @var	boolean
	 */
	public $enableBBCodes = 1;
	
	/**
	 * enables html
	 * @var	boolean
	 */
	public $enableHtml = 0;
	
	/**
	 * enables multilingualism
	 * @var	boolean
	 */
	public $enableMultilingualism = false;
	
	/**
	 * enables smilies
	 * @var	boolean
	 */
	public $enableSmilies = 1;
	
	/**
	 * content language id
	 * @var	integer
	 */
	public $languageID = null;
	
	/**
	 * maximum text length
	 * @var	integer
	 */
	public $maxTextLength = 0;
	
	/**
	 * pre parses the message
	 * @var	boolean
	 */
	public $preParse = 1;
	
	/**
	 * required permission to use BBCodes
	 * @var	boolean
	 */
	public $permissionCanUseBBCodes = 'user.message.canUseBBCodes';
	
	/**
	 * required permission to use HTML
	 * @var	boolean
	 */
	public $permissionCanUseHtml = 'user.message.canUseHtml';
	
	/**
	 * required permission to use smilies
	 * @var	boolean
	 */
	public $permissionCanUseSmilies = 'user.message.canUseSmilies';
	
	/**
	 * shows the signature
	 * @var	boolean
	 */
	public $showSignature = 0;
	
	/**
	 * enables the 'showSignature' setting
	 * @var	boolean
	 */
	public $showSignatureSetting = 1;
	
	/**
	 * list of smiley categories
	 * @var	array<wcf\data\smiley\category\SmileyCategory>
	 */
	public $smileyCategories = array();
	
	/**
	 * message subject
	 * @var	string
	 */
	public $subject = '';
	
	/**
	 * message text
	 * @var	string
	 */
	public $text = '';
	
	/**
	 * temp hash
	 * @var	string
	 */
	public $tmpHash = '';
	
	/**
	 * @see	wcf\form\IPage::readParameters()
	 */
	public function readParameters() {
		parent::readParameters();
		
		if (isset($_REQUEST['tmpHash'])) {
			$this->tmpHash = $_REQUEST['tmpHash'];
		}
		if (empty($this->tmpHash)) {
			$this->tmpHash = StringUtil::getRandomID();
		}
		
		if ($this->enableMultilingualism) {
			$this->availableContentLanguages = LanguageFactory::getInstance()->getContentLanguages();
		}
	}
	
	/**
	 * @see	wcf\form\IForm::readFormParameters()
	 */
	public function readFormParameters() {
		parent::readFormParameters();
		
		if (isset($_POST['subject'])) $this->subject = StringUtil::trim($_POST['subject']);
		if (isset($_POST['text'])) $this->text = MessageUtil::stripCrap(StringUtil::trim($_POST['text']));
		
		// settings
		$this->enableSmilies = $this->enableHtml = $this->enableBBCodes = $this->preParse = $this->showSignature = 0;
		if (isset($_POST['preParse'])) $this->preParse = intval($_POST['preParse']);
		if (isset($_POST['enableSmilies']) && WCF::getSession()->getPermission($this->permissionCanUseSmilies)) $this->enableSmilies = intval($_POST['enableSmilies']);
		if (isset($_POST['enableHtml']) && WCF::getSession()->getPermission($this->permissionCanUseHtml)) $this->enableHtml = intval($_POST['enableHtml']);
		if (isset($_POST['enableBBCodes']) && WCF::getSession()->getPermission($this->permissionCanUseBBCodes)) $this->enableBBCodes = intval($_POST['enableBBCodes']);
		if (isset($_POST['showSignature'])) $this->showSignature = intval($_POST['showSignature']);
		
		// TODO: stop shouting
		/*if (StringUtil::length($this->subject) >= MESSAGE_SUBJECT_STOP_SHOUTING && StringUtil::toUpperCase($this->subject) == $this->subject) {
			$this->subject = StringUtil::wordsToUpperCase(StringUtil::toLowerCase($this->subject));
		}*/
		
		// multilingualism
		if (isset($_POST['languageID'])) $this->languageID = intval($_POST['languageID']);
	}
	
	/**
	 * @see	wcf\form\IForm::validate()
	 */
	public function validate() {
		// subject
		$this->validateSubject();
		
		// text
		$this->validateText();
		
		// multilingualism
		$this->validateContentLanguage();
		
		parent::validate();
	}
	
	/**
	 * Validates the message subject.
	 */
	protected function validateSubject() {
		if (empty($this->subject)) {
			throw new UserInputException('subject');
		}
	}
	
	/**
	 * Validates the message text.
	 */
	protected function validateText() {
		if (empty($this->text)) {
			throw new UserInputException('text');
		}
		
		// check text length
		if ($this->maxTextLength != 0 && StringUtil::length($this->text) > $this->maxTextLength) {
			throw new UserInputException('text', 'tooLong');
		}
		
		if ($this->enableBBCodes && $this->allowedBBCodesPermission) {
			$disallowedBBCodes = BBCodeParser::getInstance()->validateBBCodes($this->text, explode(',', WCF::getSession()->getPermission($this->allowedBBCodesPermission)));
			if (!empty($disallowedBBCodes)) {
				// todo: the user should be informed which disallowed BBCodes
				// they are using
				throw new UserInputException('text', 'disallowedBBCodes');
			}
		}
		
		/*// TODO: search for censored words
		if (ENABLE_CENSORSHIP) {
			require_once(WCF_DIR.'lib/data/message/censorship/Censorship.class.php');
			$result = Censorship::test($this->text);
			if ($result) {
				WCF::getTPL()->assign('censoredWords', $result);
				throw new UserInputException('text', 'censoredWordsFound');
			}
		}*/
	}
	
	/**
	 * Validates content language id.
	 */
	protected function validateContentLanguage() {
		if (!$this->languageID || !$this->enableMultilingualism || count($this->availableContentLanguages) < 2) {
			$this->languageID = null;
			return;
		}
		
		if (!isset($this->availableContentLanguages[$this->languageID])) {
			throw new UserInputException('languageID', 'notValid');
		}
	}
	
	/**
	 * @see	wcf\form\IForm::save()
	 */
	public function save() {
		parent::save();
		
		// parse URLs
		if ($this->preParse == 1) {
			$this->text = PreParser::getInstance()->parse($this->text);
		}
	}
	
	/**
	 * @see	wcf\page\IPage::readData()
	 */
	public function readData() {
		// get attachments
		if (MODULE_ATTACHMENT && $this->attachmentObjectType) {
			$this->attachmentHandler = new AttachmentHandler($this->attachmentObjectType, $this->attachmentObjectID, $this->tmpHash);
		}
		
		if (empty($_POST)) {
			$this->enableBBCodes = (ENABLE_BBCODES_DEFAULT_VALUE && WCF::getSession()->getPermission($this->permissionCanUseBBCodes)) ? 1 : 0;
			$this->enableHtml = (ENABLE_HTML_DEFAULT_VALUE && WCF::getSession()->getPermission($this->permissionCanUseHtml)) ? 1 : 0;
			$this->enableSmilies = (ENABLE_SMILIES_DEFAULT_VALUE && WCF::getSession()->getPermission($this->permissionCanUseSmilies)) ? 1 : 0;
			$this->preParse = PRE_PARSE_DEFAULT_VALUE;
			$this->showSignature = SHOW_SIGNATURE_DEFAULT_VALUE;
		}
		
		parent::readData();
		
		// get default smilies
		if (MODULE_SMILEY) {
			$this->defaultSmilies = SmileyCache::getInstance()->getCategorySmilies();
			$this->smileyCategories = SmileyCache::getInstance()->getCategories();
			foreach ($this->smileyCategories as $index => $category) {
				$category->loadSmilies();
				
				// remove empty categories
				if (!count($category)) {
					unset($this->smileyCategories[$index]);
				}
			}
		}
	}
	
	/**
	 * @see	wcf\page\IPage::assignVariables();
	 */
	public function assignVariables() {
		parent::assignVariables();
		
		WCF::getTPL()->assign(array(
			'attachmentHandler' => $this->attachmentHandler,
			'attachmentObjectID' => $this->attachmentObjectID,
			'attachmentObjectType' => $this->attachmentObjectType,
			'attachmentParentObjectID' => $this->attachmentParentObjectID,
			'availableContentLanguages' => $this->availableContentLanguages,
			'defaultSmilies' => $this->defaultSmilies,
			'enableBBCodes' => $this->enableBBCodes,
			'enableHtml' => $this->enableHtml,
			'enableSmilies' => $this->enableSmilies,
			'languageID' => ($this->languageID ?: 0),
			'maxTextLength' => $this->maxTextLength,
			'preParse' => $this->preParse,
			'showSignature' => $this->showSignature,
			'showSignatureSetting' => $this->showSignatureSetting,
			'smileyCategories' => $this->smileyCategories,
			'subject' => $this->subject,
			'text' => $this->text,
			'tmpHash' => $this->tmpHash
		));
		
		if ($this->allowedBBCodesPermission) {
			WCF::getTPL()->assign('allowedBBCodes', explode(',', WCF::getSession()->getPermission($this->allowedBBCodesPermission)));
		}
	}
}
