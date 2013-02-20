/**
 * Provides custom buttons for CKEditor.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2013 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 */
(function() {
	/**
	 * Enables this plugin.
	 */
	CKEDITOR.plugins.add('wbutton', {
		requires: [ 'button' ],
		init: function(editor) {
			if (!__CKEDITOR_BUTTONS.length) {
				return;
			}
			
			var $pluginName = 'wbutton';
			editor.addCommand($pluginName, {
				canUndo: true,
				exec: function(editor) {
					// TODO: do something!
					console.debug("exec()");
					console.debug(editor);
				}
			});
			
			for (var $i = 0, $length = __CKEDITOR_BUTTONS.length; $i < $length; $i++) {
				var $button = __CKEDITOR_BUTTONS[$i];
				
				editor.ui.addButton($button.name, {
					command: $pluginName,
					icon: $button.icon,
					label: $button.label
				});
			}
		}
	});
})();
