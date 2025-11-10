import GObject from 'gi://GObject';
import St from 'gi://St';

import { registerClass } from '../../common/gjs.js';

interface ConstructorProps {
	tabWidth: number;
}

/**
 * Remove leading/trailing blank lines (empty lines or lines containing just spaces/tabs)
 * @param text The text to trim
 */
export function trim(text: string): string {
	return text.replace(/^(\s*\n)*/, '').replace(/(\n\s*)*$/, '');
}

/**
 * Normalize indentation by replacing tabs with spaces and removing any leading indentation
 * @param text The text to normalize
 * @param tabWidth The number of spaces in a tab
 */
export function normalizeIndentation(text: string, tabWidth: number): string {
	// Replace tabs with spaces
	text = text.replaceAll('\t', ' '.repeat(tabWidth));

	// Remove leading indentation
	let length = Number.MAX_SAFE_INTEGER;
	for (const match of text.matchAll(/^ *(?! |$)/gm)) {
		length = Math.min(length, match[0].length);
	}

	if (length === Number.MAX_SAFE_INTEGER) return text;

	return text.replace(new RegExp('^' + ' '.repeat(length), 'gm'), '');
}

@registerClass({
	Properties: {
		'text': GObject.ParamSpec.string('text', null, null, GObject.ParamFlags.READWRITE, ''),
		'tab-width': GObject.ParamSpec.int('tab-width', null, null, GObject.ParamFlags.READWRITE, 1, 8, 4),
	},
})
export class Label extends St.Label {
	private _tabWidth: number = 4;
	private _text: string = '';

	constructor(props: Partial<St.Label.ConstructorProps> & Partial<ConstructorProps>) {
		super(props);

		const params = {
			...{ tabWidth: 4 },
			...props,
		} as ConstructorProps;

		this._tabWidth = params.tabWidth;
		this.updateLabel();
	}

	override get text() {
		return this._text;
	}

	override set text(text: string) {
		if (this._text === text) return;

		this._text = text;
		this.updateLabel();
		this.notify('text');
	}

	get tabWidth() {
		return this._tabWidth;
	}

	set tabWidth(tabWidth: number) {
		if (this._tabWidth === tabWidth) return;
		this._tabWidth = tabWidth;
		this.updateLabel();
		this.notify('tab-width');
	}

	private updateLabel() {
		this.clutter_text.text = normalizeIndentation(trim(this.text), this.tabWidth);
	}
}
