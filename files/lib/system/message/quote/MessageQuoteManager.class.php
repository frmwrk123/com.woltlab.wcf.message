<?php
namespace wcf\system\message\quote;
use wcf\data\object\type\ObjectTypeCache;
use wcf\system\application\ApplicationHandler;
use wcf\system\exception\SystemException;
use wcf\system\SingletonFactory;
use wcf\system\WCF;

/**
 * Manages message quotes.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.message.quote
 * @category 	Community Framework
 */
class MessageQuoteManager extends SingletonFactory {
	/**
	 * list of object types
	 * @var	array<wcf\data\object\type\ObjectType>
	 */
	protected $objectTypes = array();
	
	/**
	 * primary application's package id
	 * @var	integer
	 */
	protected $packageID = 0;
	
	/**
	 * list of stored quotes
	 * @var	array<array>
	 */
	protected $quotes = array();
	
	/**
	 * list of quote messages by quote id
	 * @var	array<string>
	 */
	protected $quoteData = array();
	
	/**
	 * @see	wcf\system\SingletonFactory::init()
	 */
	protected function init() {
		$this->packageID = ApplicationHandler::getInstance()->getPrimaryApplication()->packageID;
		
		// load stored quotes from session
		$this->quotes = WCF::getSession()->getVar('__messageQuotes'.$this->packageID);
		if ($this->quotes === null) {
			$this->quotes = array();
		}
		
		// load object types
		$objectTypes = ObjectTypeCache::getInstance()->getObjectTypes('com.woltlab.wcf.message.quote');
		foreach ($objectTypes as $objectType) {
			$this->objectTypes[$objectType->objectType] = $objectType;
		}
	}
	
	/**
	 * Adds a quote unless it is already stored.
	 * 
	 * @param	string		$objectType
	 * @param	integer		$objectID
	 * @param	string		$message
	 */
	public function addQuote($objectType, $objectID, $message) {
		if (!isset($this->objectTypes[$objectType])) {
			throw new SystemException("Object type '".$objectType."' is unknown");
		}
		
		if (!isset($this->quotes[$objectType])) {
			$this->quotes[$objectType] = array();
		}
		
		if (!isset($this->quotes[$objectType][$objectID])) {
			$this->quotes[$objectType][$objectID] = array();
		}
		
		$quoteID = substr(sha1($objectType.'|'.$objectID.'|'.$message), 0, 8);
		if (!in_array($quoteID, $this->quotes[$objectType][$objectID])) {
			$this->quotes[$objectType][$objectID][] = $quoteID;
			$this->quoteData[$quoteID] = $message;
			
			WCF::getSession()->register('__messageQuotes'.$this->packageID, $this->quotes);
		}
	}
	
	/**
	 * Returns a list of quotes.
	 * 
	 * @param	string		$objectType
	 */
	public function getQuotes($objectType = '') {
		throw new SystemException("IMPLEMENT ME!");
	}
	
	/**
	 * Returns a quote by id.
	 * 
	 * @param	string		$quoteID
	 * @return	string
	 */
	public function getQuote($quoteID) {
		if (isset($this->quoteData[$quoteID])) {
			return $this->quoteData[$quoteID];
		}
		
		return null;
	}
	
	/**
	 * Returns the object id by quote id.
	 * 
	 * @param	string		$quoteID
	 * @return	integer
	 */
	public function getObjectID($quoteID) {
		if (isset($this->quoteData[$quoteID])) {
			foreach ($this->quotes as $objectIDs) {
				foreach ($objectIDs as $objectID => $quoteIDs) {
					foreach ($quoteIDs as $qID) {
						if ($quoteID == $qID) {
							return $objectID;
						}
					}
				}
			}
		}
		
		return null;
	}
	
	/**
	 * Returns the number of stored quotes.
	 * 
	 * @return	integer
	 */
	public function countQuotes() {
		return count($this->quotes);
	}
}
