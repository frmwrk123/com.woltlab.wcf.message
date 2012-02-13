<div id="attachments" class="wcf-border wcf-tabMenuContent hidden">
	
	<ul></ul>
</div>


<script type="text/javascript">
	//<![CDATA[
	$(function() {
		 new WCF.Upload($('#attachments'), $('#attachments ul'), 'wcf\\data\\attachment\\AttachmentAction', { multiple: true });
	});
	//]]>
</script>