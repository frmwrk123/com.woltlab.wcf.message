<?php
namespace wcf\data;

/**
 * Default interface for message action classes supporting quotes.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	data
 * @category	Community Framework
 */
interface IMessageQuoteAction {
	/**
	 * Validates parameters to quote an entire message.
	 */
	public function validateSaveFullQuote();
	
	/**
	 * Quotes an entire message.
	 * 
	 * @return	array
	 */
	public function saveFullQuote();
	
	/**
	 * Validates parameters to save a quote.
	 */
	public function validateSaveQuote();
	
	/**
	 * Saves the quote message and returns the number of stored quotes.
	 * 
	 * @return 	array
	 */
	public function saveQuote();
}