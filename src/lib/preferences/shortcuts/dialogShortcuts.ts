import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { registerClass } from '../../common/gjs.js';
import { makeResettable } from '../utils.js';
import { ShortcutRow } from './shortcutRow.js';

@registerClass()
export class DialogShortcuts extends Adw.PreferencesGroup {
	constructor(_ext: ExtensionPreferences) {
		super({
			title: _('Dialog'),
		});

		const openDialog = new ShortcutRow(_('Open Clipboard Dialog'), '', true);
		this.add(openDialog);

		const toggleIncognito = new ShortcutRow(_('Toggle Incognito Mode'), '', true);
		this.add(toggleIncognito);

		// Bind properties
		const settings = _ext.getSettings();
		settings.bind('open-clipboard-dialog-shortcut', openDialog, 'shortcuts', Gio.SettingsBindFlags.DEFAULT);
		settings.bind('toggle-incognito-mode-shortcut', toggleIncognito, 'shortcuts', Gio.SettingsBindFlags.DEFAULT);

		makeResettable(openDialog, settings, 'open-clipboard-dialog-shortcut');
		makeResettable(toggleIncognito, settings, 'toggle-incognito-mode-shortcut');
	}
}
