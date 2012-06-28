<div id="smilies" class="smiliesContent tabMenuContent container containerPadding{if $smileyCategories|count > 1} tabMenuContainer{/if}">
	{if $smileyCategories|count > 1}
		<nav class="menu">
			<ul>
				{foreach from=$smileyCategories item=smileyCategory}
					<li><a href="#smilies-{@$smileyCategory->smileyCategoryID}">{$smileyCategory->title|language}</a></li>
				{/foreach}
			</ul>
		</nav>
		
		{foreach from=$smileyCategories item=smileyCategory}
			<div id="smiles-{@$smileyCategory->smileyCategoryID}" class="hidden">
				<ul>
					{foreach from=$smileyCategory item=smiley}
						<li><img src="{$smiley->getURL()}" alt="" title="{lang}{$smiley->smileyTitle}{/lang}" class="icon24 jsTooltip" /></li>
					{/foreach}
				</ul>
			</div>
		{/foreach}
	{else}
		{foreach from=$smileyCategories item=smileyCategory}
			{foreach from=$smileyCategory item=smiley}
				<li><img src="{$smiley->getURL()}" alt="" title="{lang}{$smiley->smileyTitle}{/lang}" class="icon24 jsTooltip" /></li>
			{/foreach}
		{/foreach}
	{/if}
</div>