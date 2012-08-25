<?php
namespace wcf\system\message\quote;
use wcf\system\SingletonFactory;
use wcf\system\WCF;

/**
 * Default implementation for quote handlers.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.message.quote
 * @category 	Community Framework
 */
abstract class AbstractMessageQuoteHandler extends SingletonFactory implements IMessageQuoteHandler {
	/**
	 * template name
	 * @var	string
	 */
	public $templateName = 'messageQuoteList';
	
	/**
	 * @see	wcf\system\message\quote\IMessageQuoteHandler::render()
	 */
	public function render(array $data) {
		$template = '';
		
		$links = $this->getLinks(array_keys($data));
		$quotes = array();
		foreach ($data as $quoteIDs) {
			foreach ($quoteIDs as $quoteID) {
				$quotes[$quoteID] = MessageQuoteManager::getInstance()->getQuote($quoteID); 
			}
		}
		
		WCF::getTPL()->assign(array(
			'data' => $data,
			'links' => $links,
			'quotes' => $quotes
		));
		
		return WCF::getTPL()->fetch($this->templateName);
	}
}
