/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlBufferCopyNode_h.js
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

class jlBufferCopyNode extends AudioWorkletNode {
	static async AttachToAudioContext(audioContext) {
		await audioContext.audioWorklet.addModule("effects/jlBufferCopyNode.js");
	}
	
	onbufferavailable=undefined;
	
	constructor(audioContext, options) {
		super(audioContext, "jlBufferCopyWorklet", {"numberOfInputs": 1, "numberOfOutputs": 0, "outputChannelCount": []});
		this.port.addEventListener("message", (function(msg) {
			let ev=new Event("bufferavailable");
			let frames=msg.data;
			let channels=frames[0].length;
			let frameSize=frames[0][0].length;
			let buf=new AudioBuffer({"sampleRate": this.context.sampleRate, "numberOfChannels": frames[0].length, "length": frames.length*frameSize});
			for (let i=0; i<frames.length; i++) {
				let frame=frames[i];
				for (let c=0; c<frame.length; c++) {
					let samples=frame[c];
					let bufSamps=buf.getChannelData(c);
					//buf.copyToChannel(samples, c, i*frameSize);
					for (let s=0; s<samples.length; s++) {
						bufSamps[(i*frameSize)+s]=samples[s];
					}
				}
			}
			ev.buffer=buf;
			this.dispatchEvent(ev);
			if (this.onbufferavailable) this.onbufferavailable(ev);
		}).bind(this));
		this.port.start();
	}
}

export {jlBufferCopyNode};
