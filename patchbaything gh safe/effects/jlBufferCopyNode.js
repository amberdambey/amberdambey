/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlBufferCopyNode.js
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

class jlBufferCopyWorklet extends AudioWorkletProcessor {
	static get parameterDescriptors() {
		return [
			
		];
	}
	
	constructor(options) {
		//options["numberOfInputs"]=1;
		//options["numberOfOutputs"]=0;
		//options["outputChannelCount"]=[];
		super(options);
	}
	
	m_oldFrames=[];
	
	process(inputs, outputs, parameters) {
		let copyInp=[];
		copyInp.length=inputs[0].length;
		for (let i=0; i<copyInp.length; i++) {
			copyInp[i]=new Float32Array(inputs[0][i]);
		}
		this.m_oldFrames.push(copyInp);
		if (this.m_oldFrames.length>=256) {
			let tsfr=[];
			for (let x=0; x<this.m_oldFrames.length; x++) {
				let group=this.m_oldFrames[x];
				for (let y=0; y<group.length; y++) {
					let u=group[y].buffer;
					if (tsfr.indexOf(u)<0) tsfr.push(u);
				}
			}
			this.port.postMessage(this.m_oldFrames, tsfr);
			this.m_oldFrames=[];
		}
		return true;
	}
}
registerProcessor("jlBufferCopyWorklet", jlBufferCopyWorklet);
