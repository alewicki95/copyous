import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import type GSound from 'gi://GSound';
import Gio from 'gi://Gio';

import type { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import type { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { registerClass } from './gjs.js';

export const Sound = {
	None: 'none',

	// Gnome sounds
	Click: 'click',
	Hum: 'hum',
	String: 'string',
	Swing: 'swing',

	// Xdg sounds
	Message: 'message',
	MessageNewInstant: 'message-new-instant',
	Bell: 'bell',
	DialogWarning: 'dialog-warning',
} as const;

export type Sound = (typeof Sound)[keyof typeof Sound];

export async function tryCreateSoundManager(ext: Extension | ExtensionPreferences): Promise<SoundManager | null> {
	try {
		const gsound = (await import('gi://GSound')).default;
		return new SoundManager(gsound, ext);
	} catch {
		return null;
	}
}

@registerClass({
	Properties: {
		sound: GObject.ParamSpec.string('sound', null, null, GObject.ParamFlags.READWRITE, Sound.None),
		volume: GObject.ParamSpec.double('volume', null, null, GObject.ParamFlags.READWRITE, -20, 20, 0),
	},
})
export class SoundManager extends GObject.Object {
	private _GSound: typeof GSound;
	private _context: GSound.Context;
	private readonly _sounds: { [sound in Sound]?: string | null } = {};

	private _sound: Sound = Sound.None;
	private _volume: number = 0.0;

	constructor(gsound: typeof GSound, ext: Extension | ExtensionPreferences) {
		super();

		this._GSound = gsound;
		this._context = new gsound.Context();
		this._context.init(null);
		this._sounds = SoundManager.initSounds();

		// Bind properties
		const settings = ext.getSettings();
		settings.bind('sound', this, 'sound', Gio.SettingsBindFlags.DEFAULT);
		settings.bind('volume', this, 'volume', Gio.SettingsBindFlags.DEFAULT);
	}

	private static initSounds(): { [sound in Sound]?: string | null } {
		const sounds: { [sound in Sound]?: string | null } = {};

		// Locate gnome sounds
		for (const dir of GLib.get_system_data_dirs()) {
			const gnomeSounds = Gio.File.new_build_filenamev([dir, 'sounds', 'gnome', 'default', 'alerts']);
			if (gnomeSounds.query_exists(null)) {
				for (const sound of [Sound.Click, Sound.Hum, Sound.String, Sound.Swing]) {
					const file = gnomeSounds.get_child(`${sound}.ogg`);
					if (file.query_exists(null)) {
						sounds[sound] = file.get_path();
					}
				}
			}
		}

		// Xdg sounds should always exist
		sounds[Sound.Message] = null;
		sounds[Sound.MessageNewInstant] = null;
		sounds[Sound.Bell] = null;
		sounds[Sound.DialogWarning] = null;

		return sounds;
	}

	get sound() {
		return this._sound;
	}

	set sound(sound: Sound) {
		this._sound = sound;
		this.notify('sound');
	}

	get volume() {
		return this._volume;
	}

	set volume(volume: number) {
		this._volume = volume;
		this.notify('volume');
	}

	hasSound(sound: Sound): boolean {
		return sound in this._sounds;
	}

	playSound(sound?: Sound, volume?: number): void {
		sound ??= this._sound;
		volume ??= this._volume;
		if (!(sound in this._sounds)) return;

		const file = this._sounds[sound];
		if (file == null) {
			// Xdg sound
			this._context.play_simple(
				{
					[this._GSound.ATTR_EVENT_ID]: sound,
					[this._GSound.ATTR_CANBERRA_VOLUME]: volume.toString(),
				},
				null,
			);
		} else {
			// Gnome sound
			this._context.play_simple(
				{
					[this._GSound.ATTR_MEDIA_FILENAME]: file,
					[this._GSound.ATTR_CANBERRA_VOLUME]: volume.toString(),
				},
				null,
			);
		}
	}
}
