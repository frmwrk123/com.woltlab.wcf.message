<?php
namespace wcf\system\message;
use wcf\data\DatabaseObjectDecorator;
use wcf\data\IMessageQuickReplyAction;
use wcf\system\bbcode\PreParser;
use wcf\system\event\EventHandler;
use wcf\system\exception\SystemException;
use wcf\system\exception\UserInputException;
use wcf\system\SingletonFactory;
use wcf\system\WCF;
use wcf\util\ArrayUtil;
use wcf\util\ClassUtil;

/**
 * Manages quick replies and stored messages.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2013 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.message
 * @category	Community Framework
 */
class QuickReplyManager extends SingletonFactory {
	/**
	 * container object
	 * @var	wcf\data\DatabaseObject
	 */
	public $container = null;
	
	/**
	 * object id
	 * @var	integer
	 */
	public $objectID = 0;
	
	/**
	 * object type
	 * @var	string
	 */
	public $type = '';
	
	/**
	 * Returns a stored message from session.
	 * 
	 * @param	string		$type
	 * @param	integer		$objectID
	 * @return	string
	 */
	public function getMessage($type, $objectID) {
		$this->type = $type;
		$this->objectID = $objectID;
		
		// allow manipulation before fetching data
		EventHandler::getInstance()->fireAction($this, 'getMessage');
		
		$message = WCF::getSession()->getVar('quickReply-'.$this->type.'-'.$this->objectID);
		return ($message === null ? '' : $message);
	}
	
	/**
	 * Stores a message in session.
	 * 
	 * @param	string		$type
	 * @param	integer		$objectID
	 * @param	string		$message
	 */
	public function setMessage($type, $objectID, $message) {
		WCF::getSession()->register('quickReply-'.$type.'-'.$objectID, $message);
	}
	
	/**
	 * Removes a stored message from session.
	 * 
	 * @param	string		$type
	 * @param	integer		$objectID
	 */
	public function removeMessage($type, $objectID) {
		WCF::getSession()->unregister('quickReply-'.$this->type.'-'.$objectID);
	}
	
	/**
	 * Validates parameters for current request.
	 * 
	 * @param	wcf\system\message\IMessageQuickReplyAction	$object
	 * @param	array<array>					$parameters
	 * @param	string						$containerClassName
	 * @param	string						$containerDecoratorClassName
	 */
	public function validateParameters(IMessageQuickReplyAction $object, array &$parameters, $containerClassName, $containerDecoratorClassName = '') {
		if (!isset($parameters['data']['message']) || empty($parameters['data']['message'])) {
			throw new UserInputException('message');
		}
		
		$parameters['lastPostTime'] = (isset($parameters['lastPostTime'])) ? intval($parameters['lastPostTime']) : 0;
		if (!$parameters['lastPostTime']) {
			throw new UserInputException('lastPostTime');
		}
		
		$parameters['pageNo'] = (isset($parameters['pageNo'])) ? intval($parameters['pageNo']) : 0;
		if (!$parameters['pageNo']) {
			throw new UserInputException('pageNo');
		}
		
		$parameters['objectID'] = (isset($parameters['objectID'])) ? intval($parameters['objectID']) : 0;
		if (!$parameters['objectID']) {
			throw new UserInputException('objectID');
		}
		
		$this->container = new $containerClassName($parameters['objectID']);
		if (!empty($containerDecoratorClassName)) {
			if (!ClassUtil::isInstanceOf($containerDecoratorClassName, 'wcf\data\DatabaseObjectDecorator')) {
				throw new SystemException("'".$containerDecoratorClassName."' does not extend 'wcf\data\DatabaseObjectDecorator'");
			}
			
			$this->container = new $containerDecoratorClassName($this->container);
		}
		$object->validateContainer($this->container);
		
		// validate message
		$object->validateMessage($this->container, $parameters['data']['message']);
		
		// check for message quote ids
		$parameters['removeQuoteIDs'] = (isset($parameters['removeQuoteIDs']) && is_array($parameters['removeQuoteIDs'])) ? ArrayUtil::trim($parameters['removeQuoteIDs']) : array();
	}
	
	/**
	 * Creates a new message and returns the parsed template.
	 * 
	 * @param	wcf\system\message\IMessageQuickReplyAction	$object
	 * @param	array<array>					$parameters
	 * @param	string						$containerActionClassName
	 * @param	string						$messageListClassName
	 * @param	string						$templateName
	 * @param	string						$sortOrder
	 * @param	string						$application
	 * @return	array
	 */
	public function createMessage(IMessageQuickReplyAction $object, array &$parameters, $containerActionClassName, $messageListClassName, $templateName, $sortOrder, $application = 'wcf') {
		$tableIndexName = call_user_func(array($this->container, 'getDatabaseTableIndexName'));
		$parameters['data'][$tableIndexName] = $parameters['objectID'];
		$parameters['data']['enableSmilies'] = WCF::getSession()->getPermission('user.message.canUseSmilies');
		$parameters['data']['enableHtml'] = 0;
		$parameters['data']['enableBBCodes'] = WCF::getSession()->getPermission('user.message.canUseBBCodes');
		$parameters['data']['showSignature'] = (WCF::getUser()->userID ? WCF::getUser()->showSignature : 0);
		$parameters['data']['time'] = TIME_NOW;
		$parameters['data']['userID'] = WCF::getUser()->userID;
		$parameters['data']['username'] = WCF::getUser()->username;
		
		// pre-parse message text
		$parameters['data']['message'] = PreParser::getInstance()->parse($parameters['data']['message']);
		
		$message = $object->create();
		$tableAlias = call_user_func(array($message, 'getDatabaseTableAlias'));
		
		// resolve the page no
		list($pageNo, $count) = $object->getPageNo($this->container);
		
		// we're still on current page
		if ($pageNo == $parameters['pageNo']) {
			// check for additional messages
			$messageList = new $messageListClassName();
			$messageList->getConditionBuilder()->add($tableAlias.".".$tableIndexName." = ?", array($this->container->$tableIndexName));
			$messageList->getConditionBuilder()->add($tableAlias.".time > ?", array($parameters['lastPostTime']));
			$messageList->sqlOrderBy = $tableAlias.".time ".$sortOrder;
			$messageList->readObjects();
				
			// calculate start index
			$startIndex = $count - (count($messageList) - 1);
			
			WCF::getTPL()->assign(array(
				'attachmentList' => $messageList->getAttachmentList(),
				'container' => $this->container,
				'objects' => $messageList,
				'startIndex' => $startIndex,
				'sortOrder' => $sortOrder,
			));
			
			// assign 'to top' link
			if (isset($parameters['anchor'])) {
				WCF::getTPL()->assign('anchor', $parameters['anchor']);
			}
			
			// update visit time (messages shouldn't occur as new upon next visit)
			if (ClassUtil::isInstanceOf($containerActionClassName, 'wcf\data\IVisitableObjectAction')) {
				$containerAction = new $containerActionClassName(array(($this->container instanceof DatabaseObjectDecorator ? $this->container->getDecoratedObject() : $this->container)), 'markAsRead');
				$containerAction->executeAction();
			}
			
			return array(
				'lastPostTime' => $message->time,
				'template' => WCF::getTPL()->fetch($templateName, $application)
			);
		}
		else {
			// redirect
			return array(
				'url' => $object->getRedirectUrl($this->container, $message)
			);
		}
	}
	
	/**
	 * Returns the container object.
	 * 
	 * @return	wcf\data\DatabaseObject
	 */
	public function getContainer() {
		return $this->container;
	}
}
