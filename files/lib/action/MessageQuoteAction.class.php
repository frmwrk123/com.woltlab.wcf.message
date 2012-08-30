<?php
namespace wcf\action;
use wcf\system\exception\SystemException;
use wcf\system\exception\UserInputException;
use wcf\system\message\quote\MessageQuoteManager;
use wcf\util\ArrayUtil;
use wcf\util\JSON;
use wcf\util\StringUtil;

/**
 * Handles message quotes.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	action
 * @category 	Community Framework
 */
class MessageQuoteAction extends AJAXProxyAction {
	/**
	 * list of quote ids
	 * @var	array<string>
	 */
	public $quoteIDs = array();
	
	/**
	 * @see	wcf\action\IAction::readParameters()
	 */
	public function readParameters() {
		AbstractSecureAction::readParameters();
		
		if (isset($_POST['actionName'])) $this->actionName = StringUtil::trim($_POST['actionName']);
		if (isset($_POST['quoteIDs'])) {
			$this->quoteIDs = ArrayUtil::trim($_POST['quoteIDs']);
			
			// validate quote ids
			foreach ($this->quoteIDs as $quoteID) {
				if (MessageQuoteManager::getInstance()->getQuote($quoteID) === null) {
					throw new UserInputException('quoteIDs');
				}
			}
		}
	}
	
	/**
	 * @see	wcf\action\IAction::execute()
	 */
	public function execute() {
		AbstractAction::execute();
		
		$returnValues = null;
		switch ($this->actionName) {
			case 'count':
				$returnValues = array('count' => $this->count());
			break;
			
			case 'getQuotes':
				$returnValues = array('template' => $this->getQuotes());
			break;
			
			case 'markForRemoval':
				$this->markForRemoval();
			break;
			
			case 'remove':
				$returnValues = array('count' => $this->remove());
			break;
			
			default:
				throw new SystemException("Unknown action '".$this->actionName."'");
			break;
		}
		
		$this->executed();
		
		if ($returnValues !== null) {
			// send JSON-encoded response
			header('Content-type: application/json');
			echo JSON::encode($this->response);
		}
		
		exit;
	}
	
	/**
	 * Returns the count of stored quotes.
	 * 
	 * @return	integer
	 */
	protected function count() {
		return MessageQuoteManager::getInstance()->countQuotes();
	}
	
	/**
	 * Returns the quote list template.
	 * 
	 * @return	string
	 */
	protected function getQuotes() {
		$supportPaste = (isset($_POST['supportPaste'])) ? (bool)$_POST['supportPaste'] : false;
		
		return MessageQuoteManager::getInstance()->getQuotes($supportPaste);
	}
	
	/**
	 * Marks quotes for removal.
	 */
	protected function markForRemoval() {
		if (empty($this->quoteIDs)) {
			throw new UserInputException('quoteIDs');
		}
		
		MessageQuoteManager::getInstance()->markQuotesForRemoval($this->parameters['quoteIDs']);
	}
	
	/**
	 * Removes a list of quotes from storage and returns the remaining count.
	 * 
	 * @return	integer
	 */
	protected function remove() {
		if (empty($this->quoteIDs)) {
			throw new UserInputException('quoteIDs');
		}
		
		foreach ($this->parameters['quoteIDs'] as $quoteID) {
			if (!MessageQuoteManager::getInstance()->removeQuote($quoteID)) {
				throw new SystemException("Unable to remove quote identified by '".$quoteID."'");
			}
		}
		
		return $this->countQuotes();
	}
}
