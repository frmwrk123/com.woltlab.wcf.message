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
 * @category 	Community Framework
 */
interface IMessageQuoteAction {
	/**
	 * Does nothing.
	 */
	public function validateGetQuotes();
	
	/**
	 * Returns a parsed template for all existing quotes.
	 * 
	 * @return	array
	 */
	public function getQuotes();
	
	/**
	 * Validates parameters to remove a quote from storage.
	 */
	public function validateRemoveQuote();
	
	/**
	 * Removes a quote from storage.
	 * 
	 * @return	array
	 */
	public function removeQuote();
	
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