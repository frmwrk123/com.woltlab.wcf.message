<div id="attachments" class="wcf-tabMenuContent wcf-attachmentContent wcf-box wcf-boxPadding hidden">
	
	<ul></ul>
</div>


<script type="text/javascript">
	//<![CDATA[
	$(function() {
		 new WCF.Upload($('#attachments'), $('#attachments ul'), 'wcf\\data\\attachment\\AttachmentAction', { multiple: true });
	});
	//]]>
</script>