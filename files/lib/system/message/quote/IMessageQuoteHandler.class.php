<?php
namespace wcf\system\message\quote;

/**
 * Default interface for quote handlers.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.message.quote
 * @category 	Community Framework
 */
interface IMessageQuoteHandler {
	/**
	 * Renders a template for given quotes.
	 * 
	 * @param	array		$data
	 * @return	string
	 */
	public function render(array $data);
}
