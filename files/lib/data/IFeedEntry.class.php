<?php
namespace wcf\data;

/**
 * Every feed entry should implement this interface.
 * 
 * @author	Tim Düsterhus
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	data
 * @category 	Community Framework
 */
interface IFeedEntry extends ILinkableDatabaseObject, ITitledDatabaseObject {
	/**
	 * Returns the content of the feed entry.
	 * 
	 * @return	string
	 */
	public function getMessage();
	
	/**
	 * Returns the creation time of the feed entry as an unix timestamp.
	 * 
	 * @return	integer
	 */
	public function getTime();
	
	/**
	 * Returns the username of the author of this feed entry.
	 * 
	 * @return	string
	 */
	public function getUsername();
	
	/**
	 * This method has to return the full permalink (including host) to this entry.
	 * 
	 * @return	string
	 */
	public function getLink();
}