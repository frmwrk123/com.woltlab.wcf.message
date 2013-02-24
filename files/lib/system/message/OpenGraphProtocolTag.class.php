<?php
namespace wcf\system\message;
use wcf\util\StringUtil;

/**
 * Represents an open graph protocol tag.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2013 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.message
 * @category	Community Framework
 */
class OpenGraphProtocolTag {
	/**
	 * true if value is an URL (disable encoding)
	 * @var	boolean
	 */
	protected $isURL = false;
	
	/**
	 * property name
	 * @var	string
	 */
	protected $name = '';
	
	/**
	 * property content
	 * @var	string
	 */
	protected $value = '';
	
	/**
	 * Creates a new open graph protocol tag.
	 * 
	 * @param	string		$name
	 * @param	string		$value
	 */
	public function __construct($name, $value) {
		$this->name = $name;
		$this->value = $value;
		
		if (StringUtil::startsWith($value, 'http')) {
			$this->isURL = true;
		}
	}
	
	/**
	 * Returns true, if value is an URL.
	 * 
	 * @return	boolean
	 */
	public function isURL() {
		return $this->isURL;
	}
	
	/**
	 * Returns the property name.
	 * 
	 * @return	string
	 */
	public function getName() {
		return $this->name;
	}
	
	/**
	 * Returns the encoded value, URLs will not be encoded.
	 * 
	 * @return	string
	 */
	public function getValue() {
		if ($this->isURL()) {
			return $this->value;
		}
		
		return StringUtil::encodeHTML($this->value);
	}
}
