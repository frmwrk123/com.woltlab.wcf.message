<?php
namespace wcf\system\bbcode;
use wcf\data\attachment\GroupedAttachmentList;
use wcf\system\request\LinkHandler;
use wcf\system\WCF;
use wcf\util\StringUtil;

/**
 * Parses the [attach] bbcode tag.
 * 
 * @author	Marcel Werk
 * @copyright	2001-2012 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.message
 * @subpackage	system.bbcode
 * @category	Community Framework
 */
class AttachmentBBCode extends AbstractBBCode {
	/**
	 * list of attachments
	 * @var wcf\data\attachment\GroupedAttachmentList
	 */
	protected static $attachmentList = null;
	
	/**
	 * active object id
	 * @var integer
	 */
	protected static $objectID = 0;
	
	/**
	 * @see	wcf\system\bbcode\IBBCode::getParsedTag()
	 */
	public function getParsedTag(array $openingTag, $content, array $closingTag, BBCodeParser $parser) {
		// get attachment id
		$attachmentID = 0;
		if (isset($openingTag['attributes'][0])) {
			$attachmentID = $openingTag['attributes'][0];
		}

		// get attachment for active object
		$attachments = array();
		if (self::$attachmentList !== null) {
			$attachments = self::$attachmentList->getGroupedObjects(self::$objectID);
		}
		
		if (isset($attachments[$attachmentID])) {
			$attachment = $attachments[$attachmentID];
			
			// mark attachment as embedded
			$attachment->markAsEmbedded();
			
			if ($attachment->showAsImage()) {
				// image
				$linkParameters = array(
					'object' => $attachment	
				);
				if ($attachment->hasThumbnail()) {
					$linkParameters['thumbnail'] = 1; 
				}
				
				if ($parser->getOutputType() == 'text/html') {
					// get alignment
					$alignment = (isset($openingTag['attributes'][1]) ? $openingTag['attributes'][1] : '');
					$result = '<img src="'.StringUtil::encodeHTML(LinkHandler::getInstance()->getLink('Attachment', $linkParameters)).'"'.(!$attachment->hasThumbnail() ? ' class="jsResizeImage"' : '').' style="width: '.($attachment->hasThumbnail() ? $attachment->thumbnailWidth : $attachment->width).'px; height: '.($attachment->hasThumbnail() ? $attachment->thumbnailHeight: $attachment->height).'px;'.(!empty($alignment) ? ' float:' . ($alignment == 'left' ? 'left' : 'right') . '; margin: ' . ($alignment == 'left' ? '0 15px 7px 0' : '0 0 7px 15px' ) : '').'" alt="" />';
					if ($attachment->hasThumbnail() && $attachment->canDownload()) {
						$result = '<a href="'.StringUtil::encodeHTML(LinkHandler::getInstance()->getLink('Attachment', array('object' => $attachment))).'" title="'.StringUtil::encodeHTML($attachment->filename).'" class="jsImageViewer">'.$result.'</a>';
					}
					return $result;
				}
				else if ($parser->getOutputType() == 'text/plain') {
					return ((!empty($content) && $content != $attachmentID) ? $content : $attachment->filename).': '.LinkHandler::getInstance()->getLink('Attachment', $linkParameters);
				}
			}
			else {
				// file
				$link = LinkHandler::getInstance()->getLink('Attachment', array(
					'object' => $attachment
				));
				if ($parser->getOutputType() == 'text/html') {
					return '<a href="'.StringUtil::encodeHTML($link).'">'.((!empty($content) && $content != $attachmentID) ? $content : StringUtil::encodeHTML($attachment->filename)).'</a>';
				}
				else if ($parser->getOutputType() == 'text/plain') {
					return ((!empty($content) && $content != $attachmentID) ? $content : $attachment->filename).': '.$link;
				}
			}
		}
		
		// fallback
		$link = LinkHandler::getInstance()->getLink('Attachment', array(
			'id' => $attachmentID
		));
		if ($parser->getOutputType() == 'text/html') {
			$encodedLink = StringUtil::encodeHTML($link);
			return '<a href="'.$encodedLink.'">'.$encodedLink.'</a>';
		}
		else if ($parser->getOutputType() == 'text/plain') {
			return $link;
		}
	}
	
	/**
	 * Sets the attachment list.
	 * 
	 * @param	wcf\data\attachment\GroupedAttachmentList	$attachments
	 */
	public static function setAttachmentList(GroupedAttachmentList $attachmentList) {
		self::$attachmentList = $attachmentList;
	}
	
	/**
	 * Sets the active object id.
	 * 
	 * @param	integer		$objectID
	 */
	public static function setObjectID($objectID) {
		self::$objectID = $objectID;
	}
}
