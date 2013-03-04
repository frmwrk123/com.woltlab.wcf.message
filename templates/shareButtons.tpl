<div class="messageShareButtons jsOnly">
	<ul>
		<li><a class="jsButtonShareFacebook">
			<span class="icon icon32 icon-facebook-sign jsTooltip" title="{lang}wcf.message.share.facebook{/lang}"></span>
			<span class="invisible">{lang}wcf.message.share.facebook{/lang}</span>
			<span class="badge" style="display: none">0</span>
		</a></li>
		<li><a class="jsButtonShareTwitter">
			<span class="icon icon32 icon-twitter-sign jsTooltip" title="{lang}wcf.message.share.twitter{/lang}"></span>
			<span class="invisible">{lang}wcf.message.share.twitter{/lang}</span>
			<span class="badge" style="display: none">0</span>
		</a></li>
		<li><a class="jsButtonShareGoogle">
			<span class="icon icon32 icon-google-plus-sign jsTooltip" title="{lang}wcf.message.share.google{/lang}"></span>
			<span class="invisible">{lang}wcf.message.share.google{/lang}</span>
			<span class="badge" style="display: none">0</span>
		</a></li>
		<li><a class="jsButtonShareReddit">
			<span class="icon icon32 icon-sign-blank jsTooltip" title="{lang}wcf.message.share.reddit{/lang}"></span>
			<span class="invisible">{lang}wcf.message.share.reddit{/lang}</span>
			<span class="badge" style="display: none">0</span>
		</a></li>
	</ul>
	
	<script type="text/javascript">
		//<![CDATA[
		$(function() {
			WCF.Language.addObject({
				'wcf.message.share.facebook': '{lang}wcf.message.share.facebook{/lang}',
				'wcf.message.share.google': '{lang}wcf.message.share.google{/lang}',
				'wcf.message.share.reddit': '{lang}wcf.message.share.reddit{/lang}',
				'wcf.message.share.twitter': '{lang}wcf.message.share.twitter{/lang}'
			});
			
			new WCF.Message.Share.Page({if SHARE_BUTTONS_SHOW_COUNT}true{else}false{/if});
		});
		//]]>
	</script>
</div>