/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlFormattedTimecode.js
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

function jlFormattedTimecode(time, full) {
	let t=Math.abs(time);
	if (!(t<359999.999)) t=359999.999;
	let negative=(time<0.0);
	
	let msec=Math.floor(t*1000.0);
	let sec=Math.floor(t);
	msec-=sec*1000;
	let min=Math.floor(sec/60.0);
	sec-=min*60;
	let hr=Math.floor(min/60.0);
	min-=hr*60;
	
	let formatted="s";
	let numStr="";
	
	numStr=msec.toString();
	while (numStr.length<3) {numStr="0"+numStr;}
	formatted="."+numStr+formatted;
	
	numStr=sec.toString();
	while (numStr.length<2) {numStr="0"+numStr;}
	formatted=numStr+formatted;
	
	if ((min>0) || (hr>0) || full) {
		numStr=min.toString();
		while (numStr.length<2) {numStr="0"+numStr;}
		formatted=numStr+"m "+formatted;
		
		if ((hr>0) || full) {
			numStr=hr.toString();
			while (numStr.length<2) {numStr="0"+numStr;}
			formatted=numStr+"h "+formatted;
		}
	}
	
	if (negative) formatted="-"+formatted; else if (full) formatted=" "+formatted;
	return formatted;
}

export {jlFormattedTimecode};
