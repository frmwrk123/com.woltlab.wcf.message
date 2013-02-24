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
	 * @see	wcf\system\SingletonFactory::init()
	 */
	protected function init() {
		$this->addTag(new OpenGraphProtocolTag('link', WCF::getRequestURI()));
		$this->addTag(new OpenGraphProtocolTag('type', 'article'));
		$this->addTag(new OpenGraphProtocolTag('title', WCF::getLanguage()->get(PAGE_TITLE)));
		$this->addTag(new OpenGraphProtocolTag('site_name', WCF::getLanguage()->get(PAGE_TITLE)));
		$this->addTag(new OpenGraphProtocolTag('description', WCF::getLanguage()->get(PAGE_DESCRIPTION)));
	}
	
	/**
	 * Adds a new tag or replaces an existing one.
	 * 
	 * @param	wcf\system\message\OpenGraphProtocolTag		$tag
	 */
	public function addTag(OpenGraphProtocolTag $tag) {
		$this->tags[$tag->getName()] = $tag;
	}
	
	/**
	 * @return	array<wcf\system\message\OpenGraphProtocolTag>
	 */
	public function getTags() {
		return $this->tags;
	}
}
