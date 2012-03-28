<div id="attachments" class="attachmentContent tabMenuContent container containerPadding">
	
	<ul>
		{foreach from=$attachmentHandler->getAttachmentList() item=$attachment}
			<li class="box48 jsAttachment" style="margin-bottom: 7px">
				<img src="{link controller='Attachment' object=$attachment}tiny=1{/link}" alt="" style="width: 48px; height: 48px; border-radius: 5px;" class="wcf-attachmentImage" />
				
				<div>
					<p>{$attachment->filename}</p>
					<p>{@$attachment->filesize|filesize}</p>
					<p><img src="{icon}delete1{/icon}" alt="" title="{lang}wcf.global.button.delete{/lang}" class="jsDeleteButton jsTooltip" data-object-id="{@$attachment->attachmentID}" data-confirm-message="{lang}wcf.attachment.delete.sure{/lang}" /></p>
				</div>
			</li>
		{/foreach}
	
	</ul>
	
	<p>Maximum number of attachments: {#$attachmentHandler->getMaxCount()}<br />
	Maximum file size: {@$attachmentHandler->getMaxSize()|filesize}<br />
	Allowed file extensions: {', '|implode:$attachmentHandler->getAllowedExtensions()}</p>
</div>

<script type="text/javascript" src="{@$__wcf->getPath('wcf')}js/WCF.Attachment.js"></script>
<script type="text/javascript">
	//<![CDATA[
	$(function() {
		 new WCF.Attachment.Upload($('#attachments'), $('#attachments ul'), '{@$attachmentObjectType}', '{@$attachmentObjectID}', '{$tmpHash|encodeJS}', '{@$attachmentParentObjectID}');
		 new WCF.Action.Delete('wcf\\data\\attachment\\AttachmentAction', $('.jsAttachment'));
	});
	//]]>
</script>