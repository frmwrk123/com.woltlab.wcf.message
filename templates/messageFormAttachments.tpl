<div id="attachments" class="wcf-tabMenuContent wcf-attachmentContent wcf-box wcf-boxPadding hidden">
	
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