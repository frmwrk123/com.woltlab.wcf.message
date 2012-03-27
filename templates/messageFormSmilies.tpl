<div id="smilies" class="smiliesContent tabMenuContent container">
	<ul>
		{foreach from=$defaultSmilies item=smiley}
			<li><img src="{$smiley->getURL()}" alt="" title="{lang}{$smiley->smileyTitle}{/lang}" class="icon24 jsTooltip" /></li>
		{/foreach}
	</ul>
</div>