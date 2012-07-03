<?php
namespace wcf\page;
use wcf\system\exception\IllegalLinkException;
use wcf\system\WCF;
use wcf\util\ArrayUtil;

/**
 * Generates RSS 2-Feeds.
 * 
 * @author	Tim Düsterhus
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	page
 * @category 	Community Framework
 */
abstract class AbstractFeedPage extends AbstractAuthedPage {
	public $templateName = 'rssFeed';
	public $objectIDs = array();
	public $items = null;
	
	/**
	 * @see wcf\page\IPage::assignVariables()
	 */
	public function assignVariables() {
		parent::assignVariables();
		
		WCF::getTPL()->assign(array(
			'items' => $this->items
		));
	}
	
	/**
	 * @see wcf\page\IPage::readParameters()
	 */
	public function readParameters() {
		parent::readParameters();
		
		if (isset($_REQUEST['id'])) {
			if (is_array($_REQUEST['id'])) {
				// ?id[]=1337&id[]=9001
				$this->objectIDs = ArrayUtil::toIntegerArray($_REQUEST['id']);
			}
			else {
				// ?id=1337 or ?id=1337,9001
				$this->objectIDs = ArrayUtil::toIntegerArray(explode(',', $_REQUEST['id']));
			}
		}
	}
	
	/**
	 * @see wcf\page\IPage::show()
	 */
	public function show() {
		// set correct content-type
		@header('Content-Type: application/rss+xml');
		
		parent::show();
	}
}
