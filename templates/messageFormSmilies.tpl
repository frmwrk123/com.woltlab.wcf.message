<div id="smilies" class="wcf-border wcf-tabMenuContent hidden">
	<ul>
		{foreach from=$defaultSmilies item=smiley}
			<li style="float: left"><img src="{$smiley->getURL()}" alt="" title="{lang}{$smiley->smileyTitle}{/lang}" class="jsTooltip" /></li>
		{/foreach}
	</ul>
</div>