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
interface IFeedEntry extends IMessage {
	/**
	 * This method has to return the full permalink (including host) to this entry.
	 * 
	 * @return	string
	 */
	public function getLink();
}