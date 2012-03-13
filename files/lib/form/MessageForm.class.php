<?php
namespace wcf\form;
use wcf\data\smiley\SmileyCache;
use wcf\system\bbcode\URLParser;
use wcf\system\attachment\AttachmentHandler;
use wcf\system\exception\UserInputException;
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
 * @category 	Community Framework
 */
abstract class MessageForm extends RecaptchaForm {
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
	 * maximum text length
	 * @var	integer
	 */
	public $maxTextLength = 0;
	
	/**
	 * adds url bbcodes automatically
	 * @var	boolean
	 */
	public $parseURL = 1;
	
	/**
	 * enables smilies
	 * @var	boolean
	 */
	public $enableSmilies = 1;
	
	/**
	 * enables html
	 * @var	boolean
	 */
	public $enableHtml = 0;
	
	/**
	 * enables bbcodes
	 * @var	boolean
	 */
	public $enableBBCodes = 1;
	
	/**
	 * shows the signature
	 * @var	boolean
	 */
	public $showSignature = 0;
	
	/**
	 * list of default smilies
	 * @var array<wcf\data\smiley\Smiley>
	 */
	public $defaultSmilies = array();
	
	/**
	 * object type for attachments;
	 * leave blank to disable attachment support
	 * @var integer
	 */
	public $attachmentObjectType = '';
	
	/**
	 * object id for attachments
	 * @var integer
	 */
	public $attachmentObjectID = 0;
	
	/**
	 * parent object id for attachments
	 * @var integer
	 */
	public $attachmentParentObjectID = 0;
	
	/**
	 * temp hash
	 * @var string
	 */
	public $tmpHash = '';
	
	/**
	 * attachment handler
	 * @var wcf\system\attachment\AttachmentHandler
	 */
	public $attachmentHandler = null;
	
	/**
	 * required permission to use smilies
	 * @var	boolean
	 */
	public $permissionCanUseSmilies = 'user.message.canUseSmilies';
	
	/**
	 * required permission to use HTML
	 * @var	boolean
	 */
	public $permissionCanUseHtml = 'user.message.canUseHtml';
	
	/**
	 * required permission to use BBCodes
	 * @var	boolean
	 */
	public $permissionCanUseBBCodes = 'user.message.canUseBBCodes';
	
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
	}
	
	/**
	 * @see	wcf\form\IForm::readFormParameters()
	 */
	public function readFormParameters() {
		parent::readFormParameters();
		
		if (isset($_POST['subject'])) $this->subject = StringUtil::trim($_POST['subject']);
		if (isset($_POST['text'])) $this->text = MessageUtil::stripCrap(StringUtil::trim($_POST['text']));
		
		// settings
		$this->enableSmilies = $this->enableHtml = $this->enableBBCodes = $this->parseURL = $this->showSignature = 0;
		if (isset($_POST['parseURL'])) $this->parseURL = intval($_POST['parseURL']);
		if (isset($_POST['enableSmilies']) && WCF::getSession()->getPermission($this->permissionCanUseSmilies)) $this->enableSmilies = intval($_POST['enableSmilies']);
		if (isset($_POST['enableHtml']) && WCF::getSession()->getPermission($this->permissionCanUseHtml)) $this->enableHtml = intval($_POST['enableHtml']);
		if (isset($_POST['enableBBCodes']) && WCF::getSession()->getPermission($this->permissionCanUseBBCodes)) $this->enableBBCodes = intval($_POST['enableBBCodes']);
		if (isset($_POST['showSignature'])) $this->showSignature = intval($_POST['showSignature']);
		
		// TODO: stop shouting
		/*if (StringUtil::length($this->subject) >= MESSAGE_SUBJECT_STOP_SHOUTING && StringUtil::toUpperCase($this->subject) == $this->subject) {
			$this->subject = StringUtil::wordsToUpperCase(StringUtil::toLowerCase($this->subject));
		}*/
	}
	
	/**
	 * @see	wcf\form\IForm::validate()
	 */
	public function validate() {
		// subject
		$this->validateSubject();
		
		// text
		$this->validateText();
		
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
	 * @see	wcf\form\IForm::save()
	 */
	public function save() {
		parent::save();
		
		// parse URLs
		if ($this->parseURL == 1) {
			$this->text = URLParser::getInstance()->parse($this->text);
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
		
		parent::readData();
		
		if (!count($_POST)) {
			$this->enableBBCodes = (WCF::getSession()->getPermission('user.message.canUseBBCodes')) ? 1 : 0;
			$this->enableHtml = (WCF::getSession()->getPermission('user.message.canUseHtml')) ? 1 : 0;
			$this->enableSmilies = (WCF::getSession()->getPermission('user.message.canUseSmilies')) ? 1 : 0;
		}
		
		// get default smilies
		if (MODULE_SMILEY) {
			$this->defaultSmilies = SmileyCache::getInstance()->getCategorySmilies();
		}
	}
	
	/**
	 * @see	wcf\page\IPage::assignVariables();
	 */
	public function assignVariables() {
		parent::assignVariables();
		
		WCF::getTPL()->assign(array(
			'subject' => $this->subject,
			'text' => $this->text,
			'parseURL' => $this->parseURL,
			'enableSmilies' => $this->enableSmilies,
			'enableHtml' => $this->enableHtml,
			'enableBBCodes' => $this->enableBBCodes,
			'showSignature' => $this->showSignature,
			'maxTextLength' => $this->maxTextLength,
			'defaultSmilies' => $this->defaultSmilies,
			'attachmentObjectType' => $this->attachmentObjectType,
			'attachmentObjectID' => $this->attachmentObjectID,
			'attachmentParentObjectID' => $this->attachmentParentObjectID,
			'tmpHash' => $this->tmpHash,
			'attachmentHandler' => $this->attachmentHandler
		));
	}
}
