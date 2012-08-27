<?php
namespace wcf\data;

/**
 * Default interface for quotable database objects.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	data
 * @category 	Community Framework
 */
interface IQuotableDatabaseObject extends ILinkableDatabaseObject, ITitledDatabaseObject {
	/**
	 * Returns author's user id.
	 * 
	 * @return	integer
	 */
	public function getAuthorID();
	
	/**
	 * Returns date of creation.
	 * 
	 * @return	integer
	 */
	public function getCreationTime();
}
