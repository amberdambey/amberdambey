/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlProgressTrackerNode_h.js
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

class jlProgressTrackerNode extends AudioWorkletNode {
	static async AttachToAudioContext(audioContext) {
		await audioContext.audioWorklet.addModule("effects/jlProgressTrackerNode.js");
	}
	
	onprogresschange=undefined;
	
	constructor(audioContext, options) {
		super(audioContext, "jlProgressTrackerWorklet", {"numberOfInputs": 0, "numberOfOutputs": 1, "outputChannelCount": [1]});
		this.port.addEventListener("message", (function(msg) {
			let ev=new Event("progresschange");
			ev.progress=msg.data;
			this.dispatchEvent(ev);
			if (this.onprogresschange) this.onprogresschange(ev);
		}).bind(this));
		this.port.start();
	}
}

export {jlProgressTrackerNode};
