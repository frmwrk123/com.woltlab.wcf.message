<?php
namespace wcf\system\message;
use wcf\system\SingletonFactory;
use wcf\system\WCF;

/**
 * Handles open graph protocol tags.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2013 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.message
 * @category	Community Framework
 */
class OpenGraphProtocolHandler extends SingletonFactory {
	/**
	 * list of open graph protocol tags
	 * @var	array<wcf\system\message\OpenGraphProtocolTag>
	 */
	protected $tags = array();
	
	/**
	 * Adds a new tag or replaces an existing one.
	 * 
	 * @param	wcf\system\message\OpenGraphProtocolTag		$tag
	 */
	public function addTag(OpenGraphProtocolTag $tag) {
		$this->tags[$tag->getName()] = $tag;
	}
	
	/**
	 * Assigns default values for missing tags and return all previously set tags.
	 * 
	 * @return	array<wcf\system\message\OpenGraphProtocolTag>
	 */
	public function getTags() {
		// add site name
		if (!empty($this->tags)) {
			$this->addTag(new OpenGraphProtocolTag('site_name', WCF::getLanguage()->get(PAGE_TITLE)));
			
			// default to 'article' type
			if (!isset($this->tags['type'])) {
				$this->addTag(new OpenGraphProtocolTag('type', 'article'));
			}
		}
		
		return $this->tags;
	}
}
