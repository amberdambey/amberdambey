/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlFft.js
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

const jlubFFTWindowType={
	"Rectangular": "Rectangular", // a lame boring uninteresting fft window thats just flat and has artifacts...
	"Triangular": "Triangular", // a somewhat useful fft window but who would use it
	"Hamming": "Hamming", // ill hammer you in the hamming
	"Hann": "Hann", // default in a lot of daws
	"Blackman": "Blackman", // default in audiocontext
	"BlackmanHarris": "BlackmanHarris" // apparently the best one
}
function jlubRectangularWindow(size) {
	let w=new Float32Array(size);
	for (let n=0; n<size; n++) {
		w[n]=1.0;
	}
	return w;
}
function jlubTriangularWindow(size) {
	let w=new Float32Array(size);
	for (let n=0; n<size; n++) {
		w[n]=1.0-Math.abs(((n*2.0)/size)-1.0);
	}
	return w;
}
function jlubHammingWindow(size) {
	let TAU=2.0*Math.PI;
	
	let w=new Float32Array(size);
	for (let n=0; n<size; n++) {
		w[n]=0.54-(0.46*Math.cos((TAU*n)/size));
	}
	return w;
}
function jlubHannWindow(size) {
	let TAU=2.0*Math.PI;
	
	let w=new Float32Array(size);
	for (let n=0; n<size; n++) {
		w[n]=0.5-(0.5*Math.cos((TAU*n)/size));
	}
	return w;
}
function jlubBlackmanWindow(size) {
	let alpha=.16;
	let alpha0=(1.0-alpha)/2.0;
	let alpha1=.5;
	let alpha2=alpha*.5;
	let TAU=2.0*Math.PI;
	
	let w=new Float32Array(size);
	for (let n=0; n<size; n++) {
		w[n]=alpha0-(alpha1*Math.cos((TAU*n)/size))+(alpha2*Math.cos((2.0*TAU*n)/size));
	}
	return w;
}
function jlubBlackmanHarrisWindow(size) {
	let alpha0=0.35875;
	let alpha1=0.48829;
	let alpha2=0.14128;
	let alpha3=0.01168;
	let TAU=2.0*Math.PI;
	
	// 0.35875 - (0.48829 * COS(1.0 * n/N)) + (0.14128 * COS(2.0 * n/N)) - (0.01168 * COS(3.0 * n/N))
	
	let w=new Float32Array(size);
	for (let n=0; n<size; n++) {
		w[n]=alpha0-(alpha1*Math.cos((TAU*n)/size))+(alpha2*Math.cos((2.0*TAU*n)/size))-(alpha3*Math.cos((3.0*TAU*n)/size));
	}
	return w;
}
function jlubTimeToFreq(time) {
	let fft=new jlubFFT({"fftSize": time.length, "windowType": jlubFFTWindowType.Rectangular});
	fft._loadBlock(time);
	console.log(fft);
	let cos=new Float32Array(time.length>>1);
	let sin=new Float32Array(time.length>>1);
	fft.getFloatCosineSineData(cos, sin);
	return {"cos": cos, "sin": sin};
}
function jlubFreqToTime(cosA, sinA) {
	let cos=cosA;
	let sin=sinA;
	if (!sin) {
		cos=cosA.cos;
		sin=cosA.sin;
	}
	let TAU=2.0*Math.PI;
	let HALFTAU=Math.PI;
	let time=new Float32Array(cos.length+sin.length);
	for (let i=0; i<cos.length; i++) {
		let amp=cos[i];
		for (let j=0; j<time.length; j++) {
			time[j]+=amp*Math.cos((TAU*i*j)/time.length);
		}
	}
	for (let i=0; i<sin.length; i++) {
		let amp=sin[i];
		for (let j=0; j<time.length; j++) {
			time[j]-=amp*Math.sin((TAU*i*j)/time.length);
		}
	}
	return time;
}
class jlubFFT {
	_ctIters=11;
	_zeropad=0;
	minDecibels=-100.0;
	maxDecibels=-30.0;
	smoothingTimeConstant=.8;
	windowType=jlubFFTWindowType.Blackman;
	block=undefined;
	smoothedBlock=undefined;
	windowLut=undefined;
	get fftSize() {return 1<<this._ctIters;}
	set fftSize(v) {this._ctIters=Math.round(Math.log2(v));}
	get timeDomainSize() {return 1<<(this._ctIters-this._zeropad);}
	set timeDomainSize(v) {this._ctIters=Math.round(Math.log2(v))+this.zeropad;}
	get frequencyBinCount() {return this.fftSize>>1;}
	set frequencyBinCount(v) {this.fftSize=v<<1;}
	get zeroPaddingFactor() {return 1<<this._zeropad;}
	set zeroPaddingFactor(v) {this._zeropad=Math.round(Math.log2(v));}
	
	constructor(options) {
		if (((typeof options)=="object") && (options)) {
			if ("fftSize" in options) this.fftSize=options["fftSize"];
			if ("windowType" in options) this.windowType=options["windowType"];
			if ("minDecibels" in options) this.minDecibels=options["minDecibels"];
			if ("maxDecibels" in options) this.maxDecibels=options["maxDecibels"];
			if ("smoothingTimeConstant" in options) this.smoothingTimeConstant=options["smoothingTimeConstant"];
			if ("zeroPaddingFactor" in options) this.smoothingTimeConstant=options["zeroPaddingFactor"];
		}
	}
	
	_loadBlock(newSamples) {
		let reloadBlock=false;
		if (this.block!=undefined) {
			if (this.block.length!=this.fftSize) {
				reloadBlock=true;
			}
		} else reloadBlock=true;
		
		if (reloadBlock) {
			this.block=new Float32Array(this.fftSize);
			this.smoothedBlock=new Float32Array(this.fftSize);
			this.windowLut=this._generateWindow(this.timeDomainSize, this.fftSize);
		}
		
		// shift over
		for (let i=0; i<(this.block.length-newSamples.length); i++) {
			this.block[i]=this.block[i+newSamples.length];
		}
		for (let i=0; i<newSamples.length; i++) {
			this.block[(this.block.length-newSamples.length)+i]=newSamples[i];
		}
	}
	_generateWindow(size, arrLength) {
		let f32a=new Float32Array(arrLength);
		let generated=undefined;
		switch (this.windowType) {
			case jlubFFTWindowType.Rectangular:
				generated=jlubRectangularWindow(size);
				break;
			case jlubFFTWindowType.Triangular:
				generated=jlubTriangularWindow(size);
				break;
			case jlubFFTWindowType.Hamming:
				generated=jlubHammingWindow(size);
				break;
			case jlubFFTWindowType.Hann:
				generated=jlubHannWindow(size);
				break;
			case jlubFFTWindowType.Blackman:
				generated=jlubBlackmanWindow(size);
				break;
			case jlubFFTWindowType.BlackmanHarris:
				generated=jlubBlackmanHarrisWindow(size);
				break;
			default:
				generated=jlubRectangularWindow(size);
				break;
		}
		let j=(arrLength-size)>>1;
		for (let i=0; i<generated.length; i++) {
			f32a[j]=generated[i];
			j++;
		}
		return f32a;
	}
	
	setFFTWindowSize(size) {
		this.fftSize=size;
	}
	setFFTWindowType(type) {
		this.windowType=type;
		this.windowLut=this._generateWindow(this.timeDomainSize, this.fftSize);
	}
	
	getFloatFrequencyData(f32a) {
		// obtain the frequencies...
		let cos=new Float32Array(this.block.length);
		let sin=new Float32Array(this.block.length);
		this._t2f(this.block, cos, sin);
		for (let i=0; i<Math.min(f32a.length, cos.length); i++) {
			f32a[i]=(Math.log((cos[i]*cos[i])+(sin[i]*sin[i]))*4.34294481903251750054550939239561557769775390625)-20.0;
		}
	}
	getByteFrequencyData(ui8a) {
		// obtain the frequencies...
		let inverseLerp=function(a, b, t) {
			let bP=b-a;
			let tP=t-a;
			return tP/bP;
		};
		let cos=new Float32Array(this.block.length);
		let sin=new Float32Array(this.block.length);
		this._t2f(this.block, cos, sin);
		for (let i=0; i<Math.min(ui8a.length, cos.length); i++) {
			ui8a[i]=clamp(Math.floor(inverseLerp(this.minDecibels, this.maxDecibels, (Math.log10(Math.sqrt((cos[i]*cos[i])+(sin[i]*sin[i])))*20.0)-20.0)*256.0), 0.0, 255.0);
		}
	}
	getFloatTimeDomainData(f32a) {
		for (let i=0; i<Math.min(f32a.length, this.block.length); i++) {
			f32a[i]=this.block[i];
		}
	}
	getByteTimeDomainData(ui8a) {
		for (let i=0; i<Math.min(f32a.length, this.block.length); i++) {
			ui8a[i]=Math.floor((1.0+this.block[i])*128.0);
		}
	}
	getFloatFrequencyPhaseData(freq, phas) {
		// obtain the frequencies...
		let cos=new Float32Array(this.block.length);
		let sin=new Float32Array(this.block.length);
		this._t2f(this.block, cos, sin);
		for (let i=0; i<Math.min(freq.length, cos.length); i++) {
			freq[i]=(Math.log10(Math.sqrt((cos[i]*cos[i])+(sin[i]*sin[i])))*20.0)-20.0;
		}
		// then the phases...
		for (let i=0; i<Math.min(phas.length, cos.length); i++) {
			phas[i]=Math.atan2(cos[i], sin[i]);
		}
	}
	getFloatCosineSineData(cos, sin) {
		this._t2f(this.block, cos, sin);
	}
	
	_t2f(f32aTimeDomain, f32aFreqCos, f32aFreqSin) {
		let complex=[];
		complex.length=f32aTimeDomain.length;
		for (let i=0; i<f32aTimeDomain.length; i++) {
			complex[i]={real:f32aTimeDomain[i]*this.windowLut[i],imag:0.0};
		}
		//__env__.allocateCallStack(this._ctIters+1);
		complex=this._rdx2dit(complex);
		for (let i=0; i<Math.min(complex.length, f32aFreqCos.length); i++) {
			f32aFreqCos[i]=complex[i].real/(complex.length*.5);
		}
		for (let i=0; i<Math.min(complex.length, f32aFreqSin.length); i++) {
			f32aFreqSin[i]=complex[i].imag/(complex.length*.5);
		}
		complex=undefined;
		//__malloc__.forceGarbageCollection();
	}
	_rdx2dit(seq) {
		// radix-2 discrete inverse transform
		if (seq.length==1) {
			// lazy little shortcut! ;3
			return seq;
		} else {
			// split...
			let even=[];
			let odd=[];
			for (let i=0; i<seq.length; i+=2) {
				let hai=i>>1; // haii :3c
				even[hai]=(seq[i]);
				odd[hai]=(seq[i+1]);
			}
			even=this._rdx2dit(even);
			odd=this._rdx2dit(odd);
			let merged=[];
			merged.length=seq.length;
			for (let i=0; i<seq.length; i+=2) {
				let hai=i>>1; // haii :3c
				let evenK=even[hai];
				let oddK=odd[hai];
				let omega=(Math.PI*-i)/(seq.length);
				let omegaK={real:Math.cos(omega),imag:Math.sin(omega)};
				let real0=evenK.real+((omegaK.real*oddK.real)-(omegaK.imag*oddK.imag));
				let imag0=evenK.imag+((omegaK.real*oddK.imag)+(omegaK.imag*oddK.real));
				let real1=evenK.real-((omegaK.real*oddK.real)-(omegaK.imag*oddK.imag));
				let imag1=evenK.imag-((omegaK.real*oddK.imag)+(omegaK.imag*oddK.real));
				merged[(hai)]={real:real0,imag:imag0};
				merged[(hai)+even.length]={real:real1,imag:imag1};
			}
			return merged;
		}
	}
}

export {jlubFFT, jlubFFTWindowType, jlubTimeToFreq, jlubFreqToTime};
