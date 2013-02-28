<?php
namespace wcf\data\bbcode;
use wcf\data\attachment\GroupedAttachmentList;
use wcf\system\bbcode\AttachmentBBCode;
use wcf\system\bbcode\MessageParser;
use wcf\system\exception\UserInputException;
use wcf\system\WCF;
use wcf\util\StringUtil;

/**
 * Provides a default message preview action.
 * 
 * @author	Marcel Werk
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	data.message
 * @category	Community Framework
 */
class MessagePreviewAction extends BBCodeAction {
	/**
	 * @see	wcf\data\AbstractDatabaseObjectAction::$allowGuestAccess
	 */
	protected $allowGuestAccess = array('getMessagePreview');
		
	/**
	 * Validates parameters for message preview.
	 */
	public function validateGetMessagePreview() {
		if (!isset($this->parameters['data']['message'])) {
			throw new UserInputException('message');
		}
		
		if (!isset($this->parameters['options'])) {
			throw new UserInputException('options');
		}
	}
	
	/**
	 * Returns a rendered message preview.
	 *
	 * @return	array
	 */
	public function getMessagePreview() {
		// get options
		$enableBBCodes = (isset($this->parameters['options']['enableBBCodes'])) ? 1 : 0;
		$enableHtml = (isset($this->parameters['options']['enableHtml'])) ? 1 : 0;
		$enableSmilies = (isset($this->parameters['options']['enableSmilies'])) ? 1 : 0;
		
		// validate permissions for options
		if ($enableBBCodes && !WCF::getSession()->getPermission('user.message.canUseBBCodes')) $enableBBCodes = 0;
		if ($enableHtml && !WCF::getSession()->getPermission('user.message.canUseHtml')) $enableHtml = 0;
		if ($enableSmilies && !WCF::getSession()->getPermission('user.message.canUseSmilies')) $enableSmilies = 0;
		
		// get attachments
		if (!empty($this->parameters['attachmentObjectType']) && WCF::getUser()->userID) {
			$attachmentList = new GroupedAttachmentList($this->parameters['attachmentObjectType']);
			if (!empty($this->parameters['attachmentObjectID'])) {
				$attachmentList->getConditionBuilder()->add('attachment.objectID = ?', array($this->parameters['attachmentObjectID']));
				AttachmentBBCode::setObjectID($this->parameters['attachmentObjectID']);
			}
			else {
				$attachmentList->getConditionBuilder()->add('attachment.tmpHash = ?', array($this->parameters['tmpHash']));
			}
			// @todo: check permissions
			$attachmentList->getConditionBuilder()->add('attachment.userID = ?', array(WCF::getUser()->userID));
			$attachmentList->readObjects();
			AttachmentBBCode::setAttachmentList($attachmentList);
		}
		
		// parse message
		$message = StringUtil::trim($this->parameters['data']['message']);
		$preview = MessageParser::getInstance()->parse($message, $enableSmilies, $enableHtml, $enableBBCodes, false);
		
		return array(
			'message' => $preview
		);
	}
}
