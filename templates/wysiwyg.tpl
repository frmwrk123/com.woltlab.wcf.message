<script type="text/javascript" src="{@RELATIVE_WCF_DIR}js/3rdParty/ckeditor/ckeditor.js"></script>
<script type="text/javascript" src="{@RELATIVE_WCF_DIR}js/3rdParty/ckeditor/adapters/jquery.js"></script>
{event name='additionalIncludes'}

<script type="text/javascript">
//<![CDATA[
$(function() {
	var config = {
		extraPlugins: 'bbcode',
		language: '{@$__wcf->language->getFixedLanguageCode()}',
		toolbar:
		[
			['Source', '-', 'Undo', 'Redo'],
			['Bold', 'Italic', 'Underline', 'Strike'],
			['NumberedList', 'BulletedList', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', '-', 'Blockquote'],
			'/',
			['Font', 'FontSize'],
			['Link', 'Unlink', 'Image'],
			['TextColor', '-', 'SpecialChar', '-', 'Maximize']
		]
	};
	
	{event name='additionalJS'}
	
	$('#text').ckeditor(config);
});
//]]>
</script>