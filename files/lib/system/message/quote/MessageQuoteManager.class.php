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
		$messageQuotes = WCF::getSession()->getVar('__messageQuotes'.$this->packageID);
		if (is_array($messageQuotes)) {
			if (isset($messageQuotes['quotes']) && isset($messageQuotes['data'])) {
				$this->quotes = $messageQuotes['quotes'];
				$this->quoteData = $messageQuotes['data'];
			}
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
			
			WCF::getSession()->register('__messageQuotes'.$this->packageID, array(
				'quotes' => $this->quotes,
				'data' => $this->quoteData
			));
		}
	}
	
	/**
	 * Removes a quote from storage.
	 * 
	 * @param	string		$quoteID
	 */
	public function removeQuote($quoteID) {
		if (!isset($this->quoteData[$quoteID])) {
			return;
		}
		
		foreach ($this->quotes as $objectType => $objectIDs) {
			foreach ($objectIDs as $objectID => $quoteIDs) {
				foreach ($quoteIDs as $key => $qID) {
					if ($qID == $quoteID) {
						unset($this->quotes[$objectType][$objectID][$qID]);
						
						// clean-up structure
						if (empty($this->quotes[$objectType][$objectID])) {
							unset($this->quotes[$objectType][$objectID]);
							
							if (empty($this->quotes[$objectType])) {
								unset($this->quotes[$objectType]);
							}
						}
						
						WCF::getSession()->register('__messageQuotes'.$this->packageID, array(
							'quotes' => $this->quotes,
							'data' => $this->quoteData
						));
						
						break 3;
					}
				}
			}
		}
	}
	
	/**
	 * Returns a list of quotes.
	 * 
	 * @param	string		$objectType
	 */
	public function getQuotes($objectType = '') {
		$template = '';
		
		if (!empty($this->quoteData)) {
			foreach ($this->quotes as $objectType => $objectData) {
				$quoteHandler = call_user_func(array($this->objectTypes[$objectType]->className, 'getInstance'));
				$template .= $quoteHandler->render($objectData);
			}
		}
		
		return $template;
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
					if (in_array($quoteID, $quoteIDs)) {
						return $objectID;
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
		return count($this->quoteData);
	}
}
