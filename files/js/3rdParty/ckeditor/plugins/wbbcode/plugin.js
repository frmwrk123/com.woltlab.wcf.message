/*
 * BBCode Plugin v1.0 for CKEditor - http://www.site-top.com/
 * Copyright (c) 2010, PitBult.
 * - GNU Lesser General Public License Version 2.1 or later (the "LGPL")
 */

// todo
/*
- floating images
*/
(function() {
	var $pasted = false;
	
	CKEDITOR.on('instanceReady', function(event) {
		/**
		 * Fixes issues with pasted html.
		 */
		event.editor.on('paste', function(ev) {
			if (ev.data.type == 'html') {
				var $value = ev.data.dataValue;
				
				// Convert <br> to line breaks.
				$value = $value.replace(/<br><\/p>/gi,"\n\n");
				$value = $value.replace(/<br>/gi, "\n");
				$value = $value.replace(/<\/p>/gi,"\n\n");
				$value = $value.replace(/&nbsp;/gi," ");
				
				// remove html tags
				$value = $value.replace(/<[^>]+>/g, '');

				// fix multiple new lines
				$value = $value.replace(/\n{3,}/gi,"\n\n");
				
				ev.data.dataValue = $value;
				
				$pasted = true;
			}
		}, null, null, 9); 
	});
	
	/**
	 * Removes obsolete dialog elements.
	 */
	CKEDITOR.on('dialogDefinition', function(event) {
		var $tab;
		var $name = event.data.name;
		var $definition = event.data.definition;

		if ($name == 'link') {
			$definition.removeContents('target');
			$definition.removeContents('upload');
			$definition.removeContents('advanced');
			$tab = $definition.getContents('info');
			$tab.remove('emailSubject');
			$tab.remove('emailBody');
		}
		else if ($name == 'image') {
			$definition.removeContents('advanced');
			$tab = $definition.getContents('Link');
			$tab.remove('cmbTarget');
			$tab = $definition.getContents('info');
			$tab.remove('txtAlt');
			$tab.remove('basic');
		}
		else if ($name == 'table') {
			$definition.removeContents('advanced');
			$tab = $definition.getContents('info');
			
			$tab.remove('selHeaders');
			$tab.remove('cmbAlign');
			$tab.remove('txtHeight');
			$tab.remove('txtCaption');
			$tab.remove('txtSummary');
			
			// don't remove these fields as we need their default values
			$tab.get('txtBorder').style = 'display: none';
			$tab.get('txtWidth').style = 'display: none';
			$tab.get('txtCellSpace').style = 'display: none';
			$tab.get('txtCellPad').style = 'display: none';
		}
	});
	
	/**
	 * Enables this plugin.
	 */
	CKEDITOR.plugins.add('wbbcode', {
		requires: ['htmlwriter'],
		init: function(editor) {
			editor.dataProcessor = new CKEDITOR.htmlDataProcessor(editor);
			editor.dataProcessor.toHtml = toHtml;
			editor.dataProcessor.toDataFormat = toDataFormat;
		}
	});

	/**
	 * Converts bbcodes to html.
	 */
	var toHtml = function(data, fixForBody) {
		if (!$pasted) {
			// Convert < and > to their HTML entities.
			data = data.replace(/</g, '&lt;');
			data = data.replace(/>/g, '&gt;');
		}

		// Convert line breaks to <br>.
		data = data.replace(/(?:\r\n|\n|\r)/g, '<br>');
		
		if ($pasted) {
			$pasted = false;
			// skip
			return data;
		}
		
		// Convert & to its HTML entity.
		data = data.replace(/&/g, '&amp;');
		
		// [url]
		data = data.replace(/\[url\](.+?)\[\/url]/gi, '<a href="$1">$1</a>');
		data = data.replace(/\[url\=([^\]]+)](.+?)\[\/url]/gi, '<a href="$1">$2</a>');

		// [email]
		data = data.replace(/\[email\](.+?)\[\/email]/gi, '<a href="mailto:$1">$1</a>');
		data = data.replace(/\[email\=([^\]]+)](.+?)\[\/email]/gi, '<a href="mailto:$1">$2</a>');

		// [b]
		data = data.replace(/\[b\](.*?)\[\/b]/gi, '<b>$1</b>');

		// [i]
		data = data.replace(/\[i\](.*?)\[\/i]/gi, '<i>$1</i>');

		// [u]
		data = data.replace(/\[u\](.*?)\[\/u]/gi, '<u>$1</u>');

		// [s]
		data = data.replace(/\[s\](.*?)\[\/s]/gi, '<strike>$1</strike>');
		
		// [sub]
		data = data.replace(/\[sub\](.*?)\[\/sub]/gi, '<sub>$1</sub>');
		
		// [sup]
		data = data.replace(/\[sup\](.*?)\[\/sup]/gi, '<sup>$1</sup>');
				
		// [img]
		data = data.replace(/\[img\](.*?)\[\/img\]/gi,'<img src="$1" />');
		data = data.replace(/\[img='?(.*?)'?,(left|right)\]\[\/img\]/gi,'<img src="$1" style="float: $2" />');
		data = data.replace(/\[img='?(.*?)'?\]\[\/img\]/gi,'<img src="$1" />');
		
		// [quote]
		// data = data.replace(/\[quote\]/gi, '<blockquote>');
		// data = data.replace(/\[\/quote\]/gi, '</blockquote>');

		// [size]
		data = data.replace(/\[size=(\d+)\](.*?)\[\/size\]/gi,'<span style="font-size: $1pt">$2</span>');

		// [color]
		data = data.replace(/\[color=(.*?)\](.*?)\[\/color\]/gi,'<span style="color: $1">$2</span>');

		// [font]
		data = data.replace(/\[font='?(.*?)'?\](.*?)\[\/font\]/gi,'<span style="font-family: $1">$2</span>');

		// [align]
		data = data.replace(/\[align=(left|right|center|justify)\](.*?)\[\/align\]/gi,'<div style="text-align: $1">$2</div>');
		
		// [*]
		data = data.replace(/\[\*\](.*?)(?=\[\*\]|\[\/list\])/gi,'<li>$1</li>');
		
		// [list]
		data = data.replace(/\[list\]/gi, '<ul>');
		data = data.replace(/\[list=1\]/gi, '<ul style="list-style-type: decimal">');
		data = data.replace(/\[\/list]/gi, '</ul>');
		
		// [table]
		data = data.replace(/\[table\]/gi, '<table border="1" cellspacing="1" cellpadding="1" style="width: 500px;">');
		data = data.replace(/\[\/table\]/gi, '</table>');
		// [tr]
		data = data.replace(/\[tr\]/gi, '<tr>');
		data = data.replace(/\[\/tr\]/gi, '</tr>');
		// [td]
		data = data.replace(/\[td\]/gi, '<td>');
		data = data.replace(/\[\/td\]/gi, '</td>');
		
		// smileys
		for (var i = 0; i < this.editor.config.smiley_descriptions.length; i++) {
			var smileyCode = this.editor.config.smiley_descriptions[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
			var regExp = new RegExp('(\\s|>|^)'+WCF.String.escapeRegExp(smileyCode)+'(?=\\s|<|$)', 'gi');
			data = data.replace(regExp, '$1<img src="'+ this.editor.config.smiley_images[i] + '" class="smiley" alt="'+smileyCode+'" />');
		}

		return data;
	};
	
	/**
	 * Converts html to bbcodes.
	 */
	var toDataFormat = function(html, fixForBody) {
		if (html == '<br>' || html == '<p><br></p>') {
			return "";
		}

		// Convert <br> to line breaks.
		html = html.replace(/<br><\/p>/gi,"\n");
		html = html.replace(/<br(?=[ \/>]).*?>/gi, '\r\n');
		html = html.replace(/<p>/gi,"");
		html = html.replace(/<\/p>/gi,"\n");
		html = html.replace(/&nbsp;/gi," ");

		// [email]
		html = html.replace(/<a .*?href=(["'])mailto:(.+?)\1.*?>(.+?)<\/a>/gi, '[email=$2]$3[/email]');
		
		// [url]
		html = html.replace(/<a .*?href=(["'])(.+?)\1.*?>(.+?)<\/a>/gi, '[url=$2]$3[/url]');

		// [b]
		html = html.replace(/<(?:b|strong)>/gi, '[b]');
		html = html.replace(/<\/(?:b|strong)>/gi, '[/b]');

		// [i]
		html = html.replace(/<(?:i|em)>/gi, '[i]');
		html = html.replace(/<\/(?:i|em)>/gi, '[/i]');

		// [u]
		html = html.replace(/<u>/gi, '[u]');
		html = html.replace(/<\/u>/gi, '[/u]');

		// [s]
		html = html.replace(/<strike>/gi, '[s]');
		html = html.replace(/<\/strike>/gi, '[/s]');
		
		// [sub
		html = html.replace(/<sub>/gi, '[sub]');
		html = html.replace(/<\/sub>/gi, '[/sub]');
		
		// [sup]
		html = html.replace(/<sup>/gi, '[sup]');
		html = html.replace(/<\/sup>/gi, '[/sup]');
				
		// smileys
		html = html.replace(/<img .*?class="smiley" alt="(.*?)".*?>/gi, '$1');

		// [img]
		html = html.replace(/<img .*?class=(["'])([\w-]+)\1.*?src=(["'])(.+?)\3.*?>/gi, '[img class=$2]$4[/img]');
		html = html.replace(/<img .*?src=(["'])(.+?)\1.*?class=(["'])([\w-]+)\3.*?>/gi, '[img class=$4]$2[/img]');
		html = html.replace(/<img .*?src=(["'])(.+?)\1.*?>/gi, '[img]$2[/img]');

		// [quote]
		// html = html.replace(/<blockquote>/gi, '[quote]');
		// html = html.replace(/\n*<\/blockquote>/gi, '[/quote]');

		// [color]
		html = html.replace(/<span style="color: ?(.*?);?">(.*?)<\/span>/gi,"[color=$1]$2[/color]");

		// [size]
		html = html.replace(/<span style="font-size: ?(\d+)pt;?">(.*?)<\/span>/gi,"[size=$1]$2[/size]");

		// [font]
		html = html.replace(/<span style="font-family: ?(.*?);?">(.*?)<\/span>/gi,"[font='$1']$2[/font]");
		
		// [align]
		html = html.replace(/<div style="text-align: ?(left|center|right|justify);? ?">(.*?)<\/div>/gi,"[align=$1]$2[/align]");
		
		// [*]
		html = html.replace(/<li>/gi, '[*]');
		html = html.replace(/<\/li>/gi, '');

		// [list]
		html = html.replace(/<ul>/gi, '[list]');
		html = html.replace(/<(ol|ul style="list-style-type: decimal")>/gi, '[list=1]');
		html = html.replace(/<\/(ul|ol)>/gi, '[/list]');

		// [table]
		html = html.replace(/<table[^>]*>/gi, '[table]');
		html = html.replace(/<\/table>/gi, '[/table]');
		// [tr]
		html = html.replace(/<tr>/gi, '[tr]');
		html = html.replace(/<\/tr>/gi, '[/tr]');
		// [td]
		html = html.replace(/<td>/gi, '[td]');
		html = html.replace(/<\/td>/gi, '[/td]');
		
		// Remove remaining tags.
		html = html.replace(/<[^>]+>/g, '');

		// Restore <, > and &
		html = html.replace(/&lt;/g, '<');
		html = html.replace(/&gt;/g, '>');
		html = html.replace(/&amp;/g, '&');
		
		// Restore (and )
		html = html.replace(/%28/g, '(');
		html = html.replace(/%29/g, ')');

		// Restore %20
		html = html.replace(/%20/g, ' ');

		return html;
	}
})();
