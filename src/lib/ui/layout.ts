import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import { int32ParamSpec, registerClass } from '../common/gjs.js';

@registerClass({
	Properties: {
		source: GObject.ParamSpec.object('source', null, null, GObject.ParamFlags.READWRITE, Clutter.Actor),
		x: int32ParamSpec('x', GObject.ParamFlags.READWRITE, 0),
		y: int32ParamSpec('y', GObject.ParamFlags.READWRITE, 0),
	},
})
export class FitConstraint extends Clutter.Constraint {
	private _source: Clutter.Actor;
	private _x: number = 0;
	private _y: number = 0;

	constructor(source: Clutter.Actor, enabled: boolean) {
		super({
			enabled: enabled,
		});

		this._source = source;
	}

	get source() {
		return this._source;
	}

	set source(source: Clutter.Actor) {
		this._source = source;
		if (this.actor) this.actor.queue_relayout();
		this.notify('source');
	}

	get x() {
		return this._x;
	}

	set x(x: number) {
		this._x = x;
		if (this.actor) this.actor.queue_relayout();
		this.notify('x');
	}

	get y() {
		return this._y;
	}

	set y(y: number) {
		this._y = y;
		if (this.actor) this.actor.queue_relayout();
		this.notify('y');
	}

	override vfunc_update_allocation(_actor: Clutter.Actor, allocation: Clutter.ActorBox): void {
		const [width, height] = allocation.get_size();
		const [sw, sh] = this.source.allocation.get_size();

		const x = Math.max(0, Math.min(this.x, sw - width));
		const y = Math.max(0, Math.min(this.y, sh - height));
		allocation.set_origin(x, y);
	}
}

@registerClass({
	Properties: {
		'expansion': GObject.ParamSpec.double('expansion', null, null, GObject.ParamFlags.READWRITE, 0, 1, 1),
		'enable-collapse': GObject.ParamSpec.boolean('enable-collapse', null, null, GObject.ParamFlags.READWRITE, true),
	},
})
export class CollapsibleHeaderLayout extends Clutter.BinLayout {
	private _expansion: number = 1;
	private _enableCollapse: boolean = true;

	get expansion() {
		return this._expansion;
	}

	set expansion(value: number) {
		if (this._expansion === value) return;
		this._expansion = value;
		this.notify('expansion');

		this.layout_changed();
	}

	get enableCollapse() {
		return this._enableCollapse;
	}

	set enableCollapse(value: boolean) {
		if (this._enableCollapse === value) return;
		this._enableCollapse = value;
		this.notify('enable-collapse');
		this.layout_changed();
	}

	override vfunc_get_preferred_height(container: Clutter.Actor, for_width: number): [number, number] {
		let [min, nat] = [0, 0];

		const child = container.first_child;
		if (child) {
			[min, nat] = child.get_preferred_height(for_width);

			if (this._enableCollapse) {
				min *= this._expansion;
				nat *= this._expansion;
			}
		}

		return [Math.floor(min), Math.floor(nat)];
	}

	override vfunc_allocate(container: Clutter.Actor, allocation: Clutter.ActorBox): void {
		const child = container.first_child;
		if (child) {
			const [_cmin, cnat] = child.get_preferred_height(allocation.get_width());

			const delta = Math.min(allocation.get_height() - cnat, 0);
			const y = allocation.y1 + delta;
			const box = Clutter.ActorBox.new(allocation.x1, y, allocation.x2, y + cnat);
			child.allocate(box);
		}
	}
}
