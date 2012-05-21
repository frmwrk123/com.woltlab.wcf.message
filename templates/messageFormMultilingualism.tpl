{if $availableContentLanguages|count}
	{if !$forceLanguageSelection|isset}{assign var=forceLanguageSelection value=true}{/if}
	<dl{if $errorField == 'languageID'} class="formError"{/if}>
		<dt>{lang}wcf.message.language{/lang}</dt>
		<dd>
			<div class="dropdown languageChooser" id="languageID">
				<div class="dropdownToggle" data-toggle="languageID"><span class="badge label">{lang}wcf.message.language.none{/lang}</span></div>
				<ul class="dropdownMenu">
					{foreach from=$availableContentLanguages item=contentLanguage}
						<li data-language-id="{@$contentLanguage->languageID}"><span><span class="badge">{$contentLanguage->languageName}</span></span></li>
					{/foreach}
				</ul>
			</div>
			<input type="hidden" name="languageID" value="{@$languageID}" />
		</dd>
	</dl>
	
	<script type="text/javascript" href="{@$__wcf->getPath()}js/WCF.Message.js"></script>
	<script type="text/javascript">
		//<![CDATA[
		$(function() {
			var $availableContentLanguages = {
				0: '{lang}wcf.message.language.none{/lang}'
			};
			{foreach from=$availableContentLanguages item=contentLanguage}
				$availableContentLanguages[{@$contentLanguage->languageID}] = '{$contentLanguage->languageName}';
			{/foreach}
			
			new WCF.Message.Multilingualism('{@$languageID}', $availableContentLanguages, {if $forceLanguageSelection}true{else}false{/if});
		});
		//]]>
	</script>
{/if}