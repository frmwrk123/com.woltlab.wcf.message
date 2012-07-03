<?php
namespace wcf\data;

/**
 * Everything feed-entry should implement this interface.
 * 
 * @author	Tim Düsterhus
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	data
 * @category 	Community Framework
 */
interface IFeedEntry {
	public function getTitle();
	public function getLink();
}