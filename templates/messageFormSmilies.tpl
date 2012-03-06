<div id="smilies" class="wcf-smiliesContent wcf-tabMenuContent wcf-box wcf-boxPadding hidden">
	<ul>
		{foreach from=$defaultSmilies item=smiley}
			<li><img src="{$smiley->getURL()}" alt="" title="{lang}{$smiley->smileyTitle}{/lang}" class="jsTooltip" /></li>
		{/foreach}
	</ul>
</div>