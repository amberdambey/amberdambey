/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlGuiForms.js
 */

"use strict";

class jlXY {
	x=0.0;
	y=0.0;
	
	constructor(x, y) {
		this.x=x;
		this.y=y;
	}
	
	toString() {
		return "("+x+", "+y+")";
	}
	
	static [Symbol.operator("+")](a, b) { // TODO: this is not standard js
		return new jlXY(a.x+b.x, a.y+b.y);
	}
	
	static [Symbol.operator("-")](a, b) {
		return new jlXY(a.x-b.x, a.y-b.y);
	}
	
	static [Symbol.operator("*")](a, b) {
		if ((typeof a)=="number") {
			return new jlXY(a*b.x, a*b.y);
		} else if ((typeof b)=="number") {
			return new jlXY(a.x*b, a.y*b);
		} else return new jlXY(a.x*b.x, a.y*b.y);
	}
	
	static get Zero() {return new jlXY(0.0, 0.0);}
	static get One() {return new jlXY(1.0, 1.0);}
	static get Right() {return new jlXY(1.0, 0.0);}
	static get Up() {return new jlXY(0.0, 1.0);}
	static get Left() {return new jlXY(-1.0, 0.0);}
	static get Down() {return new jlXY(0.0, -1.0);}
}

class jlgfControl {
	position=new jlXY(0.0, 0.0);
	size=new jlXY(0.0, 0.0);
	
	constructor() {
		
	}
}
// TODO
