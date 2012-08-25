{if !$allowInsert|isset}{assign var=allowInsert value=false}{/if}
{foreach from=$data key=objectID item=quoteData}
	{if $links[$objectID]|isset}
		<fieldset>
			<legend><a href="{@$links[$objectID]}">Beitrag</a></legend>
			
			{foreach from=$quoteData item=quoteID}
				<dl data-quote-id="{@$quoteID}">
					<dt>
						<input type="checkbox" value="1" class="jsRemoveQuote" />
						<span>
							<img src="{icon size='S}add{/icon}" alt="" class="jsTooltip icon16 jsInsertQuote" title="{lang}wcf.message.quote.insertQuote{/lang}" />
						</span>
					</dt>
					<dd>
						{$quotes[$quoteID]}
					</dd>
				</dl>
			{/foreach}
		</fieldset>
	{/if}
{/foreach}