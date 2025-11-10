import Gio from 'gi://Gio';

import type { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export class Icon {
	// Enum members
	public static Clipboard = new Icon('clipboard-symbolic');
	public static ClipboardDisabled = new Icon('clipboard-disabled-symbolic');
	public static SearchClipboard = new Icon('search-clipboard-symbolic');

	public static Action = new Icon('media-playback-start-symbolic', true);
	public static Keyboard = new Icon('keyboard-symbolic');
	public static Settings = new Icon('settings-symbolic');

	public static Add = new Icon('list-add-symbolic', true);
	public static Undo = new Icon('edit-undo-symbolic', true);
	public static DragHandle = new Icon('list-drag-handle-symbolic', true);
	public static Edit = new Icon('document-edit-symbolic', true);
	public static Next = new Icon('go-next-symbolic', true);
	public static Show = new Icon('view-reveal-symbolic', true);
	public static Hide = new Icon('view-conceal-symbolic', true);
	public static ViewList = new Icon('view-list-symbolic', true);
	public static Help = new Icon('help-about-symbolic', true);
	public static Check = new Icon('object-select-symbolic', true);
	public static CheckOutline = new Icon('check-round-outline-symbolic');
	public static Volume = new Icon('audio-volume-high-symbolic', true);

	public static Search = new Icon('system-search-symbolic', true);
	public static Down = new Icon('pan-down-symbolic', true);
	public static Left = new Icon('pan-start-symbolic', true);
	public static Right = new Icon('pan-end-symbolic', true);

	public static ViewMore = new Icon('view-more-symbolic', true);
	public static Delete = new Icon('user-trash-symbolic', true);
	public static Pin = new Icon('pin-symbolic');
	public static Tag = new Icon('tag-symbolic');

	public static MissingImage = new Icon('image-missing-symbolic', true);
	public static Warning = new Icon('dialog-warning-symbolic', true);
	public static Duration = new Icon('duration-symbolic');

	public static Text = new Icon('text-symbolic');
	public static Code = new Icon('folder-code-legacy-symbolic');
	public static Image = new Icon('image-symbolic');
	public static File = new Icon('file-symbolic');
	public static Folder = new Icon('folder-symbolic');
	public static Link = new Icon('link-symbolic');
	public static Character = new Icon('character-symbolic');
	public static Color = new Icon('color-symbolic');

	// Implementation
	private readonly _name: string;
	private readonly _system: boolean;

	private constructor(name: string, system: boolean = false) {
		this._name = name;
		this._system = system;
	}

	public get name() {
		return this._name;
	}

	public load(ext: Extension): Gio.Icon {
		if (this._system) {
			return Gio.icon_new_for_string(this.name);
		} else {
			return Gio.Icon.new_for_string(`${ext.path}/icons/hicolor/scalable/actions/${this.name}.svg`);
		}
	}
}
