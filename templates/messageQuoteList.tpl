{if !$allowInsert|isset}{assign var=allowInsert value=false}{/if}
{foreach from=$messages item=message}
	<fieldset>
		<legend><a href="{$message->getLink()}">{$message->getTitle()}</a></legend>
		
		{foreach from=$message key=quoteID item=quote}
			<dl data-quote-id="{@$quoteID}">
				<dt>
					<input type="checkbox" value="1" class="jsRemoveQuote" />
					<span>
						<img src="{icon size='S'}add{/icon}" alt="" class="jsTooltip icon16 jsInsertQuote" title="{lang}wcf.message.quote.insertQuote{/lang}" />
					</span>
				</dt>
				<dd>
					{$quote}
				</dd>
			</dl>
		{/foreach}
	</fieldset>
{/foreach}