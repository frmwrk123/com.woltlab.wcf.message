<div id="settings" class="wcf-settingsContent wcf-tabMenuContent wcf-box wcf-boxPadding hidden">
	<dl>
		<dt class="reversed"><label for="parseURL">{lang}wcf.message.settings.parseURL{/lang}</label></dt>
		<dd>
			<input id="parseURL" name="parseURL" type="checkbox" value="1"{if $parseURL} checked="checked"{/if} />
			<small>{lang}wcf.message.settings.parseURL.description{/lang}</small>
		</dd>
		<dt class="reversed"><label for="enableSmilies">{lang}wcf.message.settings.enableSmilies{/lang}</label></dt>
		<dd>
			<input id="enableSmilies" name="enableSmilies" type="checkbox" value="1"{if $enableSmilies} checked="checked"{/if} />
			<small>{lang}wcf.message.settings.enableSmilies.description{/lang}</small>
		</dd>
		<dt class="reversed"><label for="enableBBCodes">{lang}wcf.message.settings.enableBBCodes{/lang}</label></dt>
		<dd>
			<input id="enableBBCodes" name="enableBBCodes" type="checkbox" value="1"{if $enableBBCodes} checked="checked"{/if} />
			<small>{lang}wcf.message.settings.enableBBCodes.description{/lang}</small>
		</dd>
		{if $__wcf->getSession()->getPermission('user.message.canUseHtml')}
			<dt class="reversed"><label for="enableHtml">{lang}wcf.message.settings.enableHtml{/lang}</label></dt>
			<dd>
				<input id="enableSmilies" name="enableHtml" type="checkbox" value="1"{if $enableHtml} checked="checked"{/if} />
				<small>{lang}wcf.message.settings.enableHtml.description{/lang}</small>
			</dd>
		{/if}
	</dl>
</div>