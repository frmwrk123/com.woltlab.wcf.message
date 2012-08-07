<?php
namespace wcf\system\message;
use wcf\data\DatabaseObject;

/**
 * Default interface for actions implementing quick reply.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.message
 * @category 	Community Framework
 */
interface IMessageQuickReply {
	/**
	 * Creates a new message object.
	 * 
	 * @return	wcf\data\DatabaseObject
	 */
	public function create();
	
	/**
	 * Returns page no for given container object.
	 * 
	 * @param	wcf\data\DatabaseObject		$container
	 * @return	array
	 */
	public function getPageNo(DatabaseObject $container);
	
	/**
	 * Returns the redirect url.
	 * 
	 * @param	wcf\data\DatabaseObject		$container
	 * @param	wcf\data\DatabaseObject		$message
	 * @return	string
	 */
	public function getRedirectUrl(DatabaseObject $container, DatabaseObject $message);
	
	/**
	 * Creates a new message and returns it.
	 *
	 * @return	array
	 */
	public function quickReply();
	
	/**
	 * Validates the container object for quick reply.
	 *
	 * @param	wcf\data\DatabaseObject		$container
	 */
	public function validateContainer(DatabaseObject $container);
	
	/**
	 * Validates parameters for quick reply.
	 */
	public function validateQuickReply();
}
