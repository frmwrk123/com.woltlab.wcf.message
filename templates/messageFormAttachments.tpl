<div id="attachments" class="formAttachmentContent tabMenuContent container containerPadding">
	<ul class="formAttachmentList clearfix"{if !$attachmentHandler->getAttachmentList()|count} style="display: none"{/if}>
		{foreach from=$attachmentHandler->getAttachmentList() item=$attachment}
			<li class="box48">
				{if $attachment->tinyThumbnailType}
					<img src="{link controller='Attachment' object=$attachment}tiny=1{/link}" alt="" class="thumbnail" />
				{else}
					<img src="{icon size='L'}attachment{/icon}" alt="" class="icon48" />
				{/if}
				
				<div>
					<hgroup>
						<h1><a href="{link controller='Attachment' object=$attachment}{/link}"{if $attachment->isImage} rel="imageviewer" title="{$attachment->filename}"{/if}>{$attachment->filename}</a></h1>
						<h2><small>{@$attachment->filesize|filesize}</small></h2>
					</hgroup>
					
					<ul>
						<li><img src="{icon size='S'}delete{/icon}" alt="" title="{lang}wcf.global.button.delete{/lang}" class="jsDeleteButton jsTooltip" data-object-id="{@$attachment->attachmentID}" data-confirm-message="{lang}wcf.attachment.delete.sure{/lang}" /></li>
					</ul>
				</div>
			</li>
		{/foreach}
	</ul>
	
	<dl>
		<dd>
			<div></div>
			<small>{lang}wcf.attachment.upload.limits{/lang}</small>
		</dd>
	</dl>
</div>

<script type="text/javascript" src="{@$__wcf->getPath()}js/WCF.Attachment.js"></script>
<script type="text/javascript">
	//<![CDATA[
	$(function() {
		WCF.Language.addObject({
			'wcf.attachment.upload.error.invalidExtension': '{lang}wcf.attachment.upload.error.invalidExtension{/lang}',
			'wcf.attachment.upload.error.tooLarge': '{lang}wcf.attachment.upload.error.tooLarge{/lang}',
			'wcf.attachment.upload.error.uploadFailed': '{lang}wcf.attachment.upload.error.uploadFailed{/lang}',
			'wcf.global.button.upload': '{lang}wcf.global.button.upload{/lang}'
		});
		WCF.Icon.addObject({
			'wcf.icon.attachment': '{icon size='L'}attachment{/icon}'
		});

		new WCF.Attachment.Upload($('#attachments > dl > dd > div'), $('#attachments > ul'), '{@$attachmentObjectType}', '{@$attachmentObjectID}', '{$tmpHash|encodeJS}', '{@$attachmentParentObjectID}', {@$attachmentHandler->getMaxCount()}-{@$attachmentHandler->getAttachmentList()|count});
		new WCF.Action.Delete('wcf\\data\\attachment\\AttachmentAction', $('.formAttachmentList > li'));

		{* @todo: sorting *}
		{* @todo: add to message button *}
		{* @todo: ie9/opera fallback *}
		{* @todo: count number of attachments / check max count *}
	});
	//]]>
</script>

<input type="hidden" name="tmpHash" value="{$tmpHash}" />