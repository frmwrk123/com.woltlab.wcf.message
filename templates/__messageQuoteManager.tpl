{if !$wysiwygSelector|isset}{assign var=wysiwygSelector value=''}{/if}
{if !$supportPaste|isset}{assign var=supportPaste value=false}{/if}
var $quoteManager = new WCF.Message.Quote.Manager({@$__quoteCount}, '{$wysiwygSelector}', {if $supportPaste}true{else}false{/if}, [ {implode from=$__quoteRemove item=quoteID}'{$quoteID}'{/implode} ]);