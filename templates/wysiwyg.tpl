<script type="text/javascript" src="{@$__wcf->getPath('wcf')}js/3rdParty/ckeditor/ckeditor.js"></script>
<script type="text/javascript" src="{@$__wcf->getPath('wcf')}js/3rdParty/ckeditor/adapters/jquery.js"></script>
{event name='additionalIncludes'}

<script type="text/javascript">
//<![CDATA[
$(function() {
	var config = {
		extraPlugins: 'wbbcode',
		removePlugins: 'elementspath,contextmenu,menubutton,forms',
		language: '{@$__wcf->language->getFixedLanguageCode()}',
		fontSize_sizes: '8/8pt;10/10pt;12/12pt;14/14pt;18/18pt;24/24pt;36/36pt;',
		disableObjectResizing: true,
		toolbarCanCollapse: false,
		enterMode: CKEDITOR.ENTER_BR,
		minHeight: 200,
		forcePasteAsPlainText: true,
		toolbar:
		[
			['Source', '-', 'Undo', 'Redo'],
			['Bold', 'Italic', 'Underline', '-', 'Strike', 'Subscript','Superscript'],
			['NumberedList', 'BulletedList', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'Blockquote'],
			'/',
			['Font', 'FontSize', 'TextColor'],
			['Link', 'Unlink', 'Image', 'Table'],
			['Maximize']
		],
		smiley_images: [
			{implode from=$defaultSmilies item=smiley}'{@$smiley->getURL()|encodeJS}'{/implode}
		],
		smiley_descriptions: [
			{implode from=$defaultSmilies item=smiley}'{@$smiley->smileyCode|encodeJS}'{/implode}
		]
	};
	
	{event name='additionalJS'}
	
	$('{if $wysiwygSelector|isset}#{$wysiwygSelector|encodeJS}{else}#text{/if}').ckeditor(config);
});
//]]>
</script>

