<div id="attachments" class="wcf-tabMenuContent wcf-attachmentContent wcf-box wcf-boxPadding hidden">
	
	<ul>
		{foreach from=$attachmentHandler->getAttachmentList() item=$attachment}
			<li class="wcf-container" style="margin-bottom: 7px">
				<p class="wcf-containerIcon"><img src="{link controller='Attachment' object=$attachment}tiny=1{/link}" alt="" style="width: 48px; height: 48px; border-radius: 5px;" class="wcf-attachmentImage" /></p>
				
				<div class="wcf-containerContent">
					<p>{$attachment->filename}</p>
					<p>{@$attachment->filesize|filesize}</p>
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
	});
	//]]>
</script>