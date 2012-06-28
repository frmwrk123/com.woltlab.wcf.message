<ul>
	{foreach from=$smilies item=smiley}
		<li><img src="{$smiley->getURL()}" alt="" title="{lang}{$smiley->smileyTitle}{/lang}" class="icon24 jsTooltip" /></li>
	{/foreach}
</ul>