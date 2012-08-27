<?php
namespace wcf\system\message\quote;
use wcf\data\IMessage;

/**
 * Wrapper class for quoted messages.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.message.quote
 * @category 	Community Framework
 */
class QuotedMessage implements \Countable, \Iterator {
	/**
	 * quotable database object
	 * @var	wcf\data\IQuotableDatabaseObject
	 */
	public $object = null;
	
	/**
	 * list of quotes
	 * @var	array<string>
	 */
	public $quotes = array();
	
	/**
	 * current iterator index
	 * @var	integer
	 */
	protected $index = 0;
	
	/**
	 * list of index to object relation
	 * @var	array<integer>
	 */
	protected $indexToObject = null;
	
	/**
	 * Creates a new QuotedMessage object.
	 * 
	 * @param	wcf\data\IMessage	$object
	 */
	public function __construct(IMessage $object) {
		$this->object = $object;
	}
	
	/**
	 * Adds a quote for this message.
	 * 
	 * @param	string		$quoteID
	 * @param	string		$quote
	 */
	public function addQuote($quoteID, $quote) {
		$this->quotes[$quoteID] = $quote;
		$this->indexToObject[] = $quoteID;
	}
	
	/**
	 * @see	wcf\data\ITitledDatabaseObject::getTitle()
	 */
	public function __toString() {
		return $this->object->getTitle();
	}
	
	/**
	 * Forwards calls to the decorated object.
	 * 
	 * @param	string		$name
	 * @param	mixed		$value
	 * @return	mixed
	 */
	public function __call($name, $value) {
		return $this->object->$name();
	}
	
	/**
	 * @see	\Countable::count()
	 */
	public function count() {
		return count($this->quotes);
	}
	
	/**
	 * @see	\Iterator::current()
	 */
	public function current() {
		$objectID = $this->indexToObject[$this->index];
		return $this->quotes[$objectID];
	}
	
	/**
	 * CAUTION: This methods does not return the current iterator index,
	 * rather than the object key which maps to that index.
	 *
	 * @see	\Iterator::key()
	 */
	public function key() {
		return $this->indexToObject[$this->index];
	}
	
	/**
	 * @see	\Iterator::next()
	 */
	public function next() {
		++$this->index;
	}
	
	/**
	 * @see	\Iterator::rewind()
	 */
	public function rewind() {
		$this->index = 0;
	}
	
	/**
	 * @see	\Iterator::valid()
	 */
	public function valid() {
		return isset($this->indexToObject[$this->index]);
	}
}
