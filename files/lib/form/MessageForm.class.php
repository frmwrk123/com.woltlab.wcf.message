<?php
namespace wcf\form;
use wcf\data\smiley\SmileyCache;
use wcf\system\bbcode\URLParser;
use wcf\system\exception\UserInputException;
use wcf\system\WCF;
use wcf\util\MessageUtil;
use wcf\util\StringUtil;

/**
 * MessageForm is an abstract form implementation for a message with optional captcha suppport.
 * 
 * @author	Marcel Werk
 * @copyright	2001-2011 WoltLab GmbH
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
	 * @see	wcf\form\IForm::readFormParameters()
	 */
	public function readFormParameters() {
		parent::readFormParameters();
		
		if (isset($_POST['subject'])) $this->subject = StringUtil::trim($_POST['subject']);
		if (isset($_POST['text'])) $this->text = MessageUtil::stripCrap(StringUtil::trim($_POST['text']));
		
		// settings
		$this->enableSmilies = $this->enableHtml = $this->enableBBCodes = $this->parseURL = $this->showSignature = 0;
		if (isset($_POST['parseURL'])) $this->parseURL = intval($_POST['parseURL']);
		if (isset($_POST['enableSmilies'])) $this->enableSmilies = intval($_POST['enableSmilies']);
		if (isset($_POST['enableHtml'])) $this->enableHtml = intval($_POST['enableHtml']);
		if (isset($_POST['enableBBCodes'])) $this->enableBBCodes = intval($_POST['enableBBCodes']);
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
		parent::readData();
		
		if (!count($_POST)) {
			
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
			'defaultSmilies' => $this->defaultSmilies
		));
	}
}
