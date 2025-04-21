/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlProgressTrackerNode.js
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

class jlProgressTrackerWorklet extends AudioWorkletProcessor {
	static get parameterDescriptors() {
		return [
			
		];
	}
	
	constructor(options) {
		//options["numberOfInputs"]=0;
		//options["numberOfOutputs"]=1;
		//options["outputChannelCount"]=[1];
		super(options);
	}
	
	m_lastFrame=0;
	
	process(inputs, outputs, parameters) {
		if (currentFrame>=this.m_lastFrame) {
			this.port.postMessage(currentTime);
			this.m_lastFrame+=4096;
		}
		return true;
	}
}
registerProcessor("jlProgressTrackerWorklet", jlProgressTrackerWorklet);
