<?php
namespace wcf\data\bbcode;
use wcf\system\bbcode\MessageParser;
use wcf\system\exception\ValidateActionException;
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
 * @category 	Community Framework
 */
class MessagePreviewAction extends BBCodeAction {
	/**
	 * Validates parameters for message preview.
	 */
	public function validateGetMessagePreview() {
		if (!isset($this->parameters['data']['message'])) {
			throw new ValidateActionException("Missing parameter 'message'");
		}
		
		if (!isset($this->parameters['options'])) {
			throw new ValidateActionException("Missing parameter 'options'");
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
		
		// parse message
		$message = StringUtil::trim($this->parameters['data']['message']);
		$preview = MessageParser::getInstance()->parse($message, $enableSmilies, $enableHtml, $enableBBCodes, false);
		
		return array(
			'message' => $preview
		);
	}
}
