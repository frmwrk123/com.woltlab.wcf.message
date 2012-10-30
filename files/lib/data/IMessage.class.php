<?php
namespace wcf\data;

/**
 * Default interface for message database objects.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	data
 * @category 	Community Framework
 */
interface IMessage extends IUserContent {
	/**
	 * Returns a plain text, truncated to 255 characters by default.
	 * 
	 * @param	integer		$maxLength
	 * @return	string
	 */
	public function getExcerpt($maxLength = 255);
	
	/**
	 * Returns formatted message text.
	 * 
	 * @return	string
	 */
	public function getFormattedMessage();
	
	/**
	 * Returns message text.
	 * 
	 * @return	string
	 */
	public function getMessage();
	
	/**
	 * Returns formatted message text.
	 * 
	 * @see	wcf\data\IMessage::getFormattedMessage()
	 */
	public function __toString();
}