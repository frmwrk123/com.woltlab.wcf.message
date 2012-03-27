{*<input type="submit" name="send" value="{lang}wcf.global.button.submit{/lang}" class="hidden" />
<div class="hidden" id="tabMenu">
	<ul id="tabMenuList">
		{if MODULE_SMILEY && $showSmilies && $canUseSmilies}<li id="smiliesTab"><a onclick="tabbedPane.openTab('smilies');"><span>{lang}wcf.smiley.smilies{/lang}</span></a></li>{/if}
		{if $showSettings}<li id="settingsTab"><a onclick="tabbedPane.openTab('settings');"><span>{lang}wcf.message.settings{/lang}</span></a></li>{/if}
		{if MODULE_ATTACHMENT && $showAttachments}<li id="attachmentsEditTab"><a onclick="tabbedPane.openTab('attachmentsEdit');"><span>{lang}wcf.attachment.attachments{/lang}</span></a></li>{/if}
		{if MODULE_POLL && $showPoll}<li id="pollEditTab"><a onclick="tabbedPane.openTab('pollEdit');"><span>{lang}wcf.poll{/lang}</span></a></li>{/if}
		{if $additionalTabs|isset}{@$additionalTabs}{/if}
	</ul>
</div>
<!-- ToDo: Please do not use the class or ID "subTabMenu" any more!!! -->"
<div class="hidden" id="subTabMenu"><div class="containerHead"><div> </div></div></div>
<div id="tabContent">
	{if MODULE_SMILEY && $showSmilies && $canUseSmilies}{include file="messageFormSmileys"}{/if}
	{if $showSettings}{include file="messageFormSettings"}{/if}
	{if MODULE_ATTACHMENT && $showAttachments}{include file="attachmentsEdit"}{/if}
	{if MODULE_POLL && $showPoll}{include file="pollEdit"}{/if}
	{if $additionalSubTabs|isset}{@$additionalSubTabs}{/if}
</div>
<input id="activeTab" type="hidden" name="activeTab" value="{$activeTab}" />
<script type="text/javascript">
	//<![CDATA[
	tabbedPane.init('{$activeTab|encodeJS}');
	//]]>
</script>*}

<div class="tabMenuContainer" data-active="{*$activeTabMenuItem*}" data-store="activeTabMenuItem">
	<nav class="tabMenu">
		<ul>
			{if MODULE_SMILEY}<li><a href="#smilies" title="{lang}wcf.smiley.smilies{/lang}">{lang}wcf.smiley.smilies{/lang}</a></li>{/if}
			{if MODULE_ATTACHMENT && $attachmentHandler !== null}<li><a href="#attachments" title="{lang}wcf.attachment.attachments{/lang}">{lang}wcf.attachment.attachments{/lang}</a></li>{/if}
			<li><a href="#settings" title="{lang}wcf.message.settings{/lang}">{lang}wcf.message.settings{/lang}</a></li>
		</ul>
	</nav>
	
	{if MODULE_SMILEY}{include file='messageFormSmilies' sandbox=false}{/if}
	{if MODULE_ATTACHMENT && $attachmentHandler !== null}{include file='messageFormAttachments' sandbox=false}{/if}
	{include file='messageFormSettings' sandbox=false}
</div>

<script type="text/javascript">
	//<![CDATA[
	$(function() {
		WCF.TabMenu.init();
	});
	//]]>
</script>