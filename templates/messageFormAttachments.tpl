<div id="attachments" class="wcf-border wcf-tabMenuContent hidden">
	
	<ul></ul>
</div>

<script type="text/javascript" src="{@$__wcf->getPath('wcf')}js/WCF.Attachment.js"></script>
<script type="text/javascript">
	//<![CDATA[
	$(function() {
		 new WCF.Attachment.Upload($('#attachments'), $('#attachments ul'), '{@$attachmentObjectType}', '{@$attachmentObjectID}', '{$tmpHash|encodeJS}');
	});
	//]]>
</script>