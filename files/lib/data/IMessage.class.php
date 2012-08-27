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
interface IMessage extends ILinkableDatabaseObject, ITitledDatabaseObject {
	/**
	 * Returns message creation timestamp.
	 * 
	 * @return	integer
	 */
	public function getTime();
	
	/**
	 * Returns author's user id.
	 * 
	 * @return	id
	 */
	public function getUserID();
	
	/**
	 * Returns author's username.
	 * 
	 * @return	string
	 */
	public function getUsername();
	
	/**
	 * Returns message subject.
	 * 
	 * @see	wcf\data\ITitledDatabaseObject::getTitle()
	 */
	public function __toString();
}
