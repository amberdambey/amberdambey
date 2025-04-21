/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jsLibreSynth version 0.0.0-0 [master]
 * A pure JavaScript libre digital audio workstation that runs in your browser.
 * 
 * Copyright (C) 2025 AmberDambey Software                                     
 * ----------------------------------------------------------------------------
 * This file is part of jsLibreSynth.
 * 
 * This program  is free  software: you  can redistribute  it and/or  modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software  Foundation,  either  version 3  of the  License, or  (at your
 * option) any later version.                                                  
 * This program is distributed in the hope that it will be useful,  but WITHOUT
 * ANY  WARRANTY;  without even  the  implied  warranty of  MERCHANTABILITY  or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License
 * for more details.                                                           
 * You should have  received a copy  of the GNU  Lesser General Public  License
 * along  with  this  program.  If  not,  see  <https://www.gnu.org/licenses/>.
 */

"use strict";

function RandomHex(c) {
	// Generate `c` random hex chars
	let s="";
	for (let i=0; i<c; i++) {
		s+=("0123456789abcdef")[Math.floor(Math.random()*16.0)];
	}
	return s;
}

function CompareHex(a, b) {
	let hex="0123456789abcdef";
	for (let i=0; i<a.length; i++) {
		let A=hex.indexOf(a[i]);
		let B=hex.indexOf(b[i]);
		if (A>B) return 1;
		if (A<B) return -1;
	}
	return 0;
}

function IsHex(v) {
	let hex="0123456789abcdef";
	for (let i=0; i<v.length; i++) {
		if (hex.indexOf(v[i])<0) return false;
	}
	return true;
}

class jlSerializableObject {
	id=""; // random uuid to identify me <3
	
	constructor(id) {
		if (((typeof id)!="string") || (id.length<1) || (!IsHex(id))) {
			this.id=RandomHex(32);
		} else {
			this.id=id;
		}
	}
}

export {RandomHex, CompareHex, IsHex, jlSerializableObject};
