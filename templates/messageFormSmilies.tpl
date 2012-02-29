<div id="smilies" class="wcf-border wcf-tabMenuContent wcf-smiliesContent hidden">
	<ul>
		{foreach from=$defaultSmilies item=smiley}
			<li><img src="{$smiley->getURL()}" alt="" title="{lang}{$smiley->smileyTitle}{/lang}" class="jsTooltip" /></li>
		{/foreach}
	</ul>
</div>