<script type="text/javascript" src="{@$__wcf->getPath('wcf')}js/3rdParty/ckeditor/ckeditor.js"></script>
<script type="text/javascript" src="{@$__wcf->getPath('wcf')}js/3rdParty/ckeditor/adapters/jquery.js"></script>
{event name='additionalIncludes'}

<script type="text/javascript">
//<![CDATA[
$(function() {
	var config = {
		extraPlugins: 'wbbcode',
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
		],
		smiley_images: [
			{implode from=$defaultSmilies item=smiley}'{$smiley->getURL()|encodeJS}'{/implode}
		],
		smiley_descriptions: [
			{implode from=$defaultSmilies item=smiley}'{$smiley->smileyCode|encodeJS}'{/implode}
		]
	};
	
	{event name='additionalJS'}
	
	$('#text').ckeditor(config);
});
//]]>
</script>