/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * graphtest.js
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

import {RandomHex, CompareHex, IsHex, jlSerializableObject, jlKeyframeType, jlKeyframeSmoothingFunction, jlGraphNode, jlGraphNodeParam, jlKeyframe, jlGraphNodeConnection, jlGraph, jlLiveGraphInstance} from "./utils/jlGraph.js";
import {jlMIDIEventType, jlMIDIChannelControlChangeType, jlMIDIProgramDisplayTags, jlMIDINote, jlMIDIPercusson, jlMIDIDrumKit, jlMIDIEvent, jlMIDITempoData, jlParseMIDI, jlFreqToPitch, jlPitchToFreq, jlPitchToString} from "./utils/jlMIDI.js";
import {jlProgressTrackerNode} from "./effects/jlProgressTrackerNode_h.js";
import {jlBufferCopyNode} from "./effects/jlBufferCopyNode_h.js";
import {audioBufferToWav} from "./lib/audiobuffer-to-wav/index.js";
import {jlFormattedTimecode} from "./utils/jlFormattedTimecode.js";
const _jImports=[
	{
		"from": "./utils/jlGraph.js",
		"import": [
			"RandomHex",
			"CompareHex",
			"IsHex",
			"jlSerializableObject",
			"jlKeyframeType",
			"jlKeyframeSmoothingFunction",
			"jlGraphNode",
			"jlGraphNodeParam",
			"jlKeyframe",
			"jlGraphNodeConnection",
			"jlGraph",
			"jlLiveGraphInstance"
		]
	},
	{
		"from": "./utils/jlMIDI.js",
		"import": [
			"jlMIDIEventType",
			"jlMIDIChannelControlChangeType",
			"jlMIDIProgramDisplayTags",
			"jlMIDINote",
			"jlMIDIPercusson",
			"jlMIDIDrumKit",
			"jlMIDIEvent",
			"jlMIDITempoData",
			"jlParseMIDI",
			"jlFreqToPitch",
			"jlPitchToFreq",
			"jlPitchToString"
		]
	},
	{
		"from": "./effects/jlProgressTrackerNode_h.js",
		"import": [
			"jlProgressTrackerNode"
		]
	},
	{
		"from": "./effects/jlBufferCopyNode_h.js",
		"import": [
			"jlBufferCopyNode"
		]
	},
	{
		"from": "./lib/audiobuffer-to-wav/index.js",
		"license": "MIT",
		"source": "https://github.com/Jam3/audiobuffer-to-wav",
		"import": [
			"audioBufferToWav"
		]
	},
	{
		"from": "./utils/jlFormattedTimecode.js",
		"import": [
			"jlFormattedTimecode"
		]
	}
];
(function() {
	shared["RandomHex"]=RandomHex;
	shared["CompareHex"]=CompareHex;
	shared["IsHex"]=IsHex;
	shared["jlSerializableObject"]=jlSerializableObject;
	shared["jlKeyframeType"]=jlKeyframeType;
	shared["jlKeyframeSmoothingFunction"]=jlKeyframeSmoothingFunction;
	shared["jlGraphNode"]=jlGraphNode;
	shared["jlGraphNodeParam"]=jlGraphNodeParam;
	shared["jlKeyframe"]=jlKeyframe;
	shared["jlGraphNodeConnection"]=jlGraphNodeConnection;
	shared["jlGraph"]=jlGraph;
	shared["jlLiveGraphInstance"]=jlLiveGraphInstance;
	shared["jlMIDIEventType"]=jlMIDIEventType;
	shared["jlMIDIChannelControlChangeType"]=jlMIDIChannelControlChangeType;
	shared["jlMIDIProgramDisplayTags"]=jlMIDIProgramDisplayTags;
	shared["jlMIDINote"]=jlMIDINote;
	shared["jlMIDIPercusson"]=jlMIDIPercusson;
	shared["jlMIDIDrumKit"]=jlMIDIDrumKit;
	shared["jlMIDIEvent"]=jlMIDIEvent;
	shared["jlMIDITempoData"]=jlMIDITempoData;
	shared["jlParseMIDI"]=jlParseMIDI;
	shared["jlFreqToPitch"]=jlFreqToPitch;
	shared["jlPitchToFreq"]=jlPitchToFreq;
	shared["jlPitchToString"]=jlPitchToString;
	shared["jlProgressTrackerNode"]=jlProgressTrackerNode;
	shared["jlBufferCopyNode"]=jlBufferCopyNode;
	shared["audioBufferToWav"]=audioBufferToWav;
	shared["jlFormattedTimecode"]=jlFormattedTimecode;
	
	// const [RandomHex, CompareHex, IsHex, jlSerializableObject, jlKeyframeType, jlKeyframeSmoothingFunction, jlGraphNode, jlGraphNodeParam, jlKeyframe, jlGraphNodeConnection, jlGraph, jlLiveGraphInstance, jlMIDIEventType, jlMIDIChannelControlChangeType, jlMIDIProgramDisplayTags, jlMIDINote, jlMIDIPercusson, jlMIDIDrumKit, jlMIDIEvent, jlMIDITempoData, jlParseMIDI, jlFreqToPitch, jlPitchToFreq, jlPitchToString, jlProgressTrackerNode, jlBufferCopyNode, audioBufferToWav, jlFormattedTimecode]=[shared.RandomHex, shared.CompareHex, shared.IsHex, shared.jlSerializableObject, shared.jlKeyframeType, shared.jlKeyframeSmoothingFunction, shared.jlGraphNode, shared.jlGraphNodeParam, shared.jlKeyframe, shared.jlGraphNodeConnection, shared.jlGraph, shared.jlLiveGraphInstance, shared.jlMIDIEventType, shared.jlMIDIChannelControlChangeType, shared.jlMIDIProgramDisplayTags, shared.jlMIDINote, shared.jlMIDIPercusson, shared.jlMIDIDrumKit, shared.jlMIDIEvent, shared.jlMIDITempoData, shared.jlParseMIDI, shared.jlFreqToPitch, shared.jlPitchToFreq, shared.jlPitchToString, shared.jlProgressTrackerNode, shared.jlBufferCopyNode, shared.audioBufferToWav, shared.jlFormattedTimecode];
})();

initFunc=function() {
	audio.close();
	audio=new (("AudioContext" in window)?AudioContext:webkitAudioContext)({"sampleRate": 48000, "latencyHint": "playback"});
	
	lateFuncs.push(function() {
		// Keybinds
		if (getKeyFresh(KeyCode.F)) {
			if ((window.document.webkitIsFullscreen) || (window.document.mozFullScreen) || (window.document.fullscreen)) {
				if (window.document.mozCancelFullScreen) {
					window.document.mozCancelFullScreen();
				} else if (window.document.webkitExitFullscreen) {
					window.document.webkitExitFullscreen();
				} else if (window.document.exitFullscreen) {
					window.document.exitFullscreen();
				}
				osdVerbosity=0;
			} else {
				let target=window.document.body;
				if (target.mozRequestFullScreen) {
					target.mozRequestFullScreen();
				} else if (target.webkitRequestFullscreen) {
					target.webkitRequestFullscreen();
				} else if (target.requestFullscreen) {
					target.requestFullscreen();
				}
			}
		}
		if ((input.mouseClick.left && !input.oldMouseClick.left) || (input.mouseClick.right && !input.oldMouseClick.right)) {
			let target=window.document.body;
			if (window.document.pointerLockElement || window.document.mozPointerLockElement) {
				if (window.document.mozExitPointerLock) {
					window.document.mozExitPointerLock();
				} else if (window.document.webkitExitPointerLock) {
					window.document.webkitExitPointerLock();
				} else if (window.document.exitPointerLock) {
					window.document.exitPointerLock();
				}
			} else {
				if (target.webkitRequestPointerLock) {
					target.webkitRequestPointerLock();
				} else if (target.requestPointerLock) {
					target.requestPointerLock();
				}
			}
			osdVerbosity=-1;
		} else if (input.oldMouseClick.left && !input.mouseClick.left) {
			if (window.document.pointerLockElement || window.document.mozPointerLockElement) {
				if (window.document.mozExitPointerLock) {
					window.document.mozExitPointerLock();
				} else if (window.document.webkitExitPointerLock) {
					window.document.webkitExitPointerLock();
				} else if (window.document.exitPointerLock) {
					window.document.exitPointerLock();
				}
			}
			osdVerbosity=0;
		}
	});
	
	mainFunc=function() {
		framebufferWidth=window.innerWidth;
		framebufferHeight=window.innerHeight;
		resetTransform();
		
		can.save();
		can.translate(framebufferWidth*.5, framebufferHeight*.5);
		can.fillStyle="#ffffff";
		can.font="24px OpenDyslexic, sans-serif";
		can.textAlign="center";
		can.textBaseline="middle";
		can.fillText(framebufferWidth+"x"+framebufferHeight, 0.0, 0.0);
		can.restore();
	};
	
	/*(async function() {
		let audioContext=new OfflineAudioContext(audio.destination.channelCount, 192000, audio.sampleRate);
		let graph=new jlGraph("0c56639cd98853ed0f319bf071bfa58d");
		graph.AddNode(new jlGraphNode("1bfb0b0dd291be7b3e61068268fcfbc7", AudioDestinationNode, {
			"position": {x:500.0,y:0.0},
			"width": 80.0,
			"color": 0xff40ff40,
			"label": "Master",
			"expanded": false,
			"nodeParams": {
				0: new jlGraphNodeParam({
					"connections": [
						new jlGraphNodeConnection("5327a95a1d48b4e027d9684038be3416", "74e3732ba1fcb4279abbeb4691d5092f", 0, "1bfb0b0dd291be7b3e61068268fcfbc7", 0)
					]
				})
			}
		}));
		graph.AddNode(new jlGraphNode("74e3732ba1fcb4279abbeb4691d5092f", OscillatorNode, {
			"position": {x:-14.0,y:-243.0},
			"width": 150.0,
			"color": 0xffff8040,
			"label": "Oscillator",
			"expanded": true,
			"nodeParams": {
				"frequency": new jlGraphNodeParam({
					"initialValue": 220.0,
					"animationEnabled": true,
					"animationStartTime": 0.0,
					"animationSpeed": 1.0,
					"keyframes": [
						new jlKeyframe(1, 1.0, 0, 1100.0),
						new jlKeyframe(1, 1.2, 0, 220.0),
						new jlKeyframe(1, 1.5, 0, 220.0),
						new jlKeyframe(1, 2.0, 1, 440.0),
					],
					"connections": {}
				})
			},
			"nodeFields": {
				"type": "triangle"
			},
			"nodeTimedFunctions": {
				"start": [
					0.000
				],
				"stop": [
					2.500
				]
			},
			"constructorArgs": {}
		}));
		
		let liveGraph=new jlLiveGraphInstance(graph, audioContext, 0.0);
		liveGraph.Prep();
		
		let buf=await audioContext.startRendering();
		let wav=audioBufferToWav(buf, {});
		buf=undefined;
		let blob=new Blob([wav], {"type": "audio/wav"});
		let burl=window.URL.createObjectURL(blob);
		let a=window.document.createElement("a");
		a.href=burl;
		a.download="download.wav";
		window.document.body.appendChild(a);
		a.click();
		await ({"then": function(f) {setTimeout(f, 1000);}});
		window.document.body.removeChild(a);
		window.URL.revokeObjectURL(burl);
	})();*/
	
	(async function() {
		const MASTER_GAIN=.25;
		const PERCUSSION_GAIN=MASTER_GAIN*1.5;
		const REVERB_DRY_GAIN_LEVEL=1.0;
		const REVERB_WET_GAIN_LEVEL=.1;
		const OSCILLATOR_TYPES=[
			"sawtooth", // 01
			"sawtooth", // 02
			"square",   // 03
			"sawtooth", // 04
			"triangle", // 05
			"triangle", // 06
			"sawtooth", // 07
			"sawtooth", // 08
			"sawtooth", // 09
			"sawtooth", // 10
			"sawtooth", // 11
			"sawtooth", // 12
			"sawtooth", // 13
			"sawtooth", // 14
			"square",   // 15
			"sawtooth"  // 16
		];
		const ADSR_DECAY=[
			.3,  // 01
			.3,  // 02
			5.0,  // 03
			.3,  // 04
			1.0, // 05
			1.0, // 06
			.3,  // 07
			.3,  // 08
			.3,  // 09
			.3,  // 10
			.3,  // 11
			.3,  // 12
			.3,  // 13
			.3,  // 14
			.3,  // 15
			.3   // 16
		];
		const ADSR_SUSTAIN=[
			.8, // 01
			.8, // 02
			.35, // 03
			.5, // 04
			.1, // 05
			.1, // 06
			.5, // 07
			.5, // 08
			.5, // 09
			.5, // 10
			.5, // 11
			.5, // 12
			.5, // 13
			.5, // 14
			.5, // 15
			.5  // 16
		];
		const ADSR_RELEASE=[
			1.5, // 01
			1.5, // 02
			.1, // 03
			.05, // 04
			.3,  // 05
			.3,  // 06
			.05, // 07
			.05, // 08
			.05, // 09
			.05, // 10
			.05, // 11
			.05, // 12
			.05, // 13
			.05, // 14
			.05, // 15
			.05  // 16
		];
		const VIBRATO_ENABLED=[
			true,  // 01
			true,  // 02
			false, // 03
			false, // 04
			false, // 05
			false, // 06
			true,  // 07
			true,  // 08
			true,  // 09
			false, // 10
			true,  // 11
			true,  // 12
			false, // 13
			false, // 14
			false, // 15
			false  // 16
		];
		
		const REVERB_MIXER="57234ca28aaddb57f0800351f41b830f";
		const REVERB_WET="93d0a279a1e084638547a894dd5a3309";
		const REVERB_WET_GAIN="78249ca7617428aebc4e7765e76b3985";
		const REVERB_DRY_GAIN="8ff152164a67de001a9160f295c50ef6";
		
		let spaceReverb;
		if (true) {
			let fet=await fetch("test/audio/nova.ogg");
			let abf=await fet.arrayBuffer();
			spaceReverb=await audio.decodeAudioData(abf);
		}
		
		const MASTER_NODE="ea226240cd3be1f7e3f61a901c896a5d";
		const GAIN_NODES=[
			"5cdd4a1a65cc054c5fe99ddf83aaf0f0",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f1",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f2",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f3",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f4",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f5",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f6",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f7",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f8",
			"5cdd4a1a65cc054c5fe99ddf83aaf0f9",
			"5cdd4a1a65cc054c5fe99ddf83aaf0fa",
			"5cdd4a1a65cc054c5fe99ddf83aaf0fb",
			"5cdd4a1a65cc054c5fe99ddf83aaf0fc",
			"5cdd4a1a65cc054c5fe99ddf83aaf0fd",
			"5cdd4a1a65cc054c5fe99ddf83aaf0fe",
			"5cdd4a1a65cc054c5fe99ddf83aaf0ff"
		];
		const STEREO_PANNER_NODES=[
			"647509994cc49bb1cb841d6f24a76a50",
			"647509994cc49bb1cb841d6f24a76a51",
			"647509994cc49bb1cb841d6f24a76a52",
			"647509994cc49bb1cb841d6f24a76a53",
			"647509994cc49bb1cb841d6f24a76a54",
			"647509994cc49bb1cb841d6f24a76a55",
			"647509994cc49bb1cb841d6f24a76a56",
			"647509994cc49bb1cb841d6f24a76a57",
			"647509994cc49bb1cb841d6f24a76a58",
			"647509994cc49bb1cb841d6f24a76a59",
			"647509994cc49bb1cb841d6f24a76a5a",
			"647509994cc49bb1cb841d6f24a76a5b",
			"647509994cc49bb1cb841d6f24a76a5c",
			"647509994cc49bb1cb841d6f24a76a5d",
			"647509994cc49bb1cb841d6f24a76a5e",
			"647509994cc49bb1cb841d6f24a76a5f"
		];
		const PITCH_BEND_OUT=[
			"903319f5546dafc71c59cac469551990",
			"903319f5546dafc71c59cac469551991",
			"903319f5546dafc71c59cac469551992",
			"903319f5546dafc71c59cac469551993",
			"903319f5546dafc71c59cac469551994",
			"903319f5546dafc71c59cac469551995",
			"903319f5546dafc71c59cac469551996",
			"903319f5546dafc71c59cac469551997",
			"903319f5546dafc71c59cac469551998",
			"903319f5546dafc71c59cac469551999",
			"903319f5546dafc71c59cac46955199a",
			"903319f5546dafc71c59cac46955199b",
			"903319f5546dafc71c59cac46955199c",
			"903319f5546dafc71c59cac46955199d",
			"903319f5546dafc71c59cac46955199e",
			"903319f5546dafc71c59cac46955199f"
		];
		const LFO="282a86b71b71956024e142fefc41ada0";
		const LFO_PRE="304839a0e6518837f4993c124393ad20";
		
		mainFunc=function() {
			framebufferWidth=window.innerWidth;
			framebufferHeight=window.innerHeight;
			resetTransform();
			
			can.save();
			can.translate(framebufferWidth*.5, framebufferHeight*.5);
			can.fillStyle="#ffffff";
			can.font="24px OpenDyslexic, sans-serif";
			can.textAlign="center";
			can.textBaseline="middle";
			can.fillText("Loading...", 0.0, 0.0);
			can.restore();
		};
		
		let song=await jlParseMIDI("test/midi/flourish.mid");
		let allEvents=[];
		for (let y=0; y<song.tracks.length; y++) {
			let track=song.tracks[y];
			for (let x=0; x<track.events.length; x++) {
				//if (track.events[x].timestamp>15.0) break;
				//if (([4,7,8,9,13,14]).indexOf(track.events[x].midiChannel)<0) continue;
				//if (track.events[x].midiChannel!=10) continue;
				allEvents.push(track.events[x]);
			}
		}
		allEvents.sort(function(a, b) {return a.tick-b.tick;});
		
		let channelNotes=[]; // jlGraphNodeConnection connections to the notes! ;3
		let channelGainKeyframes=[];
		let channelPanKeyframes=[];
		let channelPitchBendKeyframes=[];
		channelNotes.length=16;
		channelGainKeyframes.length=16;
		channelPanKeyframes.length=16;
		channelPitchBendKeyframes.length=16;
		for (let c=0; c<16; c++) {
			let gainKfs=[];
			let panKfs=[];
			let bendKfs=[];
			
			let peakGain=(c==9)?PERCUSSION_GAIN:MASTER_GAIN;
			
			for (let e=0; e<allEvents.length; e++) {
				let event=allEvents[e];
				if (event.midiChannel==(c+1)) {
					if (event.midiEventType==jlMIDIEventType.ChannelPitchBendChange) {
						bendKfs.push(new jlKeyframe(1, event.timestamp, 0, event.eventData.bend*200.0));
					} else if (event.midiEventType==jlMIDIEventType.ChannelControlChange) {
						if (event.midiPitch==jlMIDIChannelControlChangeType.Volume) {
							gainKfs.push(new jlKeyframe(1, event.timestamp, 0, peakGain*event.midiVelocity/128.0));
						} else if (event.midiPitch==jlMIDIChannelControlChangeType.Pan) {
							panKfs.push(new jlKeyframe(1, event.timestamp, 0, (event.midiVelocity/64.0)-1.0));
						}
					}
				}
			}
			
			channelGainKeyframes[c]=gainKfs;
			channelPanKeyframes[c]=panKfs;
			channelPitchBendKeyframes[c]=bendKfs;
		}
		
		let standardKit;
		if (true) {
			let fet=await fetch("test/audio/31.ogg");
			let abf=await fet.arrayBuffer();
			standardKit=await audio.decodeAudioData(abf);
		}
		
		let standardKitNotes={};
		for (let p=27; p<(Math.round(standardKit.duration/1.5)+27); p++) {
			let noteBuf=audio.createBuffer(standardKit.numberOfChannels, Math.floor(1.5*standardKit.sampleRate), standardKit.sampleRate);
			for (let c=0; c<noteBuf.numberOfChannels; c++) {
				standardKit.copyFromChannel(noteBuf.getChannelData(c), c, Math.floor((p-27)*1.5*standardKit.sampleRate));
			}
			standardKitNotes[p]=noteBuf;
		}
		
		let synthNodes=[];
		for (let c=0; c<16; c++) {
			if (c==9) {
				let cmap=[];
				let activeNotes=[];
				
				let mixerId=GAIN_NODES[c];
				let pitchbendId=PITCH_BEND_OUT[c];
				let drumKit=standardKitNotes;
				
				for (let e=0; e<allEvents.length; e++) {
					let event=allEvents[e];
					if (event.midiChannel==(c+1)) {
						let stopNotes=[];
						let endNotes=[];
						
						if (true) {
							// kill older notes
							let x=0;
							for (x=0; x<activeNotes.length; x++) {
								let note=activeNotes[x];
								if ((note.noteOnEvent.timestamp-2.0)>=(event.timestamp)) {
									endNotes.push(note);
									
									activeNotes.splice(x, 1);
									x--;
								}
							}
						}
						
						if (event.midiEventType==jlMIDIEventType.NoteOn) {
							if ((event.midiPitch==jlMIDIPercusson.ClosedHiHat) || (event.midiPitch==jlMIDIPercusson.PedalHiHat) || (event.midiPitch==jlMIDIPercusson.OpenHiHat)) {
								// silence any other open hi-hats
								let x=0;
								for (x=0; x<activeNotes.length; x++) {
									let note=activeNotes[x];
									if (note.noteOnEvent.midiPitch==jlMIDIPercusson.OpenHiHat) {
										endNotes.push(note);
										
										activeNotes.splice(x, 1);
										x--;
									}
								}
							}
							
							if (event.midiPitch in drumKit) {
								let bsnId=RandomHex(32);
								let bsn=new jlGraphNode(bsnId, AudioBufferSourceNode, {
									"nodeParams": {
										"detune": new jlGraphNodeParam({
											"initialValue": 0.0,
											"animationEnabled": false,
											"connections": [
												new jlGraphNodeConnection(RandomHex(32), pitchbendId, 0, bsnId, "detune")
											]
										})
									},
									"nodeFields": {
										"buffer": drumKit[event.midiPitch]
									},
									"nodeTimedFunctions": {
										"start": [
											event.timestamp
										],
										"stop": []
									},
									"constructorArgs": {}
								});
								synthNodes.push(bsn);
								let ganId=RandomHex(32);
								let gan=new jlGraphNode(ganId, GainNode, {
									"nodeParams": {
										0: new jlGraphNodeParam({
											"initialValue": 0.0,
											"animationEnabled": false,
											"connections": [
												new jlGraphNodeConnection(RandomHex(32), bsnId, 0, ganId, 0)
											]
										}),
										"gain": new jlGraphNodeParam({
											"initialValue": event.midiVelocity/64.0,
											"animationEnabled": true,
											"animationStartTime": event.timestamp,
											"animationSpeed": 1.0,
											"keyframes": [
												new jlKeyframe(1, 0.0, 0, event.midiVelocity/64.0)
											]
										})
									},
									"constructorArgs": {}
								});
								synthNodes.push(gan);
								activeNotes.push({
									"noteOnEvent": event,
									"buffersource": bsn,
									"gain": gan
								});
								cmap.push(new jlGraphNodeConnection(RandomHex(32), ganId, 0, mixerId, 0));
							}
						} else if (event.midiEventType==jlMIDIEventType.NoteOff) {
							// search notes...
							let x=0;
							for (x=0; x<activeNotes.length; x++) {
								let note=activeNotes[x];
								if (event.midiPitch==note.noteOnEvent.midiPitch) {
									stopNotes.push(note);
									
									//activeNotes.splice(x, 1);
									//x--;
								}
							}
						}
						
						for (let i=0; i<stopNotes.length; i++) {
							let note=stopNotes[i];
							
							// stop this note!
							let dTime=event.timestamp-note.noteOnEvent.timestamp;
							let bsn=note.buffersource;
							let gan=note.gain;
							
							//bsn.nodeTimedFunctions.stop.push(event.timestamp+.1);
							gan.nodeParams.gain.keyframes.push(new jlKeyframe(1, dTime, 0, gan.nodeParams.gain.keyframes[0].value));
							gan.nodeParams.gain.keyframes.push(new jlKeyframe(1, dTime+.05, 1, gan.nodeParams.gain.keyframes[0].value*.5));
						}
						
						for (let i=0; i<endNotes.length; i++) {
							let note=endNotes[i];
							
							// stop this note!
							let dTime=event.timestamp-note.noteOnEvent.timestamp;
							let bsn=note.buffersource;
							let gan=note.gain;
							
							bsn.nodeTimedFunctions.stop.push(event.timestamp);
							gan.nodeParams.gain.keyframes.push(new jlKeyframe(1, dTime, 0, gan.nodeParams.gain.keyframes[gan.nodeParams.gain.keyframes.length-1].value));
							gan.nodeParams.gain.keyframes.push(new jlKeyframe(1, dTime+.05, 1, 0.0));
							
							if (activeNotes.indexOf(note)>-1) activeNotes.splice(activeNotes.indexOf(note), 1);
						}
					}
				}
				channelNotes[c]=cmap;
				continue;
			}
			
			let cmap=[]; // links between instrument-outputs and mixer-inputs
			let activeNotes=[];
			
			let mixerId=GAIN_NODES[c];
			let pitchbendId=PITCH_BEND_OUT[c];
			
			for (let e=0; e<allEvents.length; e++) {
				let event=allEvents[e];
				if (event.midiChannel==(c+1)) {
					if (event.midiEventType==jlMIDIEventType.NoteOn) {
						let oscId=RandomHex(32);
						let osc=new jlGraphNode(oscId, OscillatorNode, {
							"nodeParams": {
								"frequency": new jlGraphNodeParam({
									"initialValue": jlPitchToFreq(event.midiPitch),
									"animationEnabled": false,
									"connections": []
								}),
								"detune": new jlGraphNodeParam({
									"initialValue": 0.0,
									"animationEnabled": false,
									"connections": [
										new jlGraphNodeConnection(RandomHex(32), pitchbendId, 0, oscId, "detune"),
										//new jlGraphNodeConnection(RandomHex(32), LFO, 0, oscId, "detune")
									]
								})
							},
							"nodeFields": {
								"type": OSCILLATOR_TYPES[c]
							},
							"nodeTimedFunctions": {
								"start": [
									event.timestamp
								],
								"stop": []
							},
							"constructorArgs": {}
						});
						synthNodes.push(osc);
						let lpsId=RandomHex(32);
						let lps=new jlGraphNode(lpsId, BiquadFilterNode, {
							"nodeParams": {
								0: new jlGraphNodeParam({
									"initialValue": 0.0,
									"animationEnabled": false,
									"connections": [
										new jlGraphNodeConnection(RandomHex(32), oscId, 0, lpsId, 0)
									]
								}),
								"Q": new jlGraphNodeParam({
									"initialValue": 0.0,
									"animationEnabled": true,
									"animationStartTime": event.timestamp,
									"animationSpeed": 1.0,
									"keyframes": [
										new jlKeyframe(1, 0.0, 0, 0.0),
										new jlKeyframe(1, 0.1, 5, -12.0, .2)
									]
								}),
								"frequency": new jlGraphNodeParam({
									"initialValue": lerp(800.0, 3000.0, event.midiVelocity/128.0),
									"animationEnabled": true,
									"animationStartTime": event.timestamp,
									"animationSpeed": 1.0,
									"keyframes": [
										new jlKeyframe(1, 0.0, 0, lerp(800.0, 3000.0, event.midiVelocity/128.0)),
										new jlKeyframe(1, 0.1, 5, lerp(300.0, 1500.0, event.midiVelocity/128.0), 1.0)
									]
								})
							},
							"nodeFields": {
								"type": "lowpass"
							},
							"nodeTimedFunctions": {},
							"constructorArgs": {}
						});
						synthNodes.push(lps);
						let ganId=RandomHex(32);
						let gan=new jlGraphNode(ganId, GainNode, {
							"nodeParams": {
								0: new jlGraphNodeParam({
									"initialValue": 0.0,
									"animationEnabled": false,
									"connections": [
										new jlGraphNodeConnection(RandomHex(32), lpsId, 0, ganId, 0)
									]
								}),
								"gain": new jlGraphNodeParam({
									"initialValue": 0.0,
									"animationEnabled": true,
									"animationStartTime": event.timestamp,
									"animationSpeed": 1.0,
									"keyframes": [
										new jlKeyframe(1, 0.01, 1, event.midiVelocity/256.0),
										new jlKeyframe(1, 0.1, 5, ADSR_SUSTAIN[c]*event.midiVelocity/256.0, ADSR_DECAY[c])
									]
								})
							},
							"constructorArgs": {}
						});
						synthNodes.push(gan);
						activeNotes.push({
							"noteOnEvent": event,
							"oscillator": osc,
							"lowpass": lps,
							"gain": gan
						});
						cmap.push(new jlGraphNodeConnection(RandomHex(32), ganId, 0, mixerId, 0));
					} else if (event.midiEventType==jlMIDIEventType.NoteOff) {
						// search notes...
						let x=0;
						for (x=0; x<activeNotes.length; x++) {
							let note=activeNotes[x];
							if (event.midiPitch==note.noteOnEvent.midiPitch) {
								// stop this note!
								let dTime=event.timestamp-note.noteOnEvent.timestamp;
								let osc=note.oscillator;
								let lps=note.lowpass;
								let gan=note.gain;
								
								osc.nodeTimedFunctions.stop.push(event.timestamp+ADSR_RELEASE[c]+.5);
								lps.nodeParams.frequency.keyframes.push(new jlKeyframe(1, dTime, 6));
								//gan.nodeParams.gain.keyframes[1].time=dTime;
								gan.nodeParams.gain.keyframes.push(new jlKeyframe(1, dTime, 0, taper(gan.nodeParams.gain.keyframes[0].value, gan.nodeParams.gain.keyframes[1].value, dTime/ADSR_DECAY[c])));
								gan.nodeParams.gain.keyframes.push(new jlKeyframe(1, dTime+ADSR_RELEASE[c], 1, 0.0));
								
								activeNotes.splice(x, 1);
								x--;
							}
						}
					}
				}
			}
			
			channelNotes[c]=cmap;
		}
		
		let graph=new jlGraph("d8aef6ff99cccde2ee8e36af244c20c7");
		graph.AddNode(new jlGraphNode(MASTER_NODE, AudioDestinationNode, {
			"nodeParams": {
				0: new jlGraphNodeParam({
					"connections": [
						new jlGraphNodeConnection(RandomHex(32), REVERB_WET_GAIN, 0, MASTER_NODE, 0),
						new jlGraphNodeConnection(RandomHex(32), REVERB_DRY_GAIN, 0, MASTER_NODE, 0)
					]
				})
			}
		}));
		graph.AddNode(new jlGraphNode(REVERB_MIXER, GainNode, {
			"nodeParams": {
				0: new jlGraphNodeParam({
					"connections": [
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x0], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x1], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x2], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x3], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x4], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x5], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x6], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x7], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x8], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0x9], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0xa], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0xb], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0xc], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0xd], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0xe], 0, REVERB_MIXER, 0),
						new jlGraphNodeConnection(RandomHex(32), STEREO_PANNER_NODES[0xf], 0, REVERB_MIXER, 0)
					]
				}),
				"gain": new jlGraphNodeParam({
					"initialValue": 1.0,
					"animationEnabled": false,
					"connections": []
				})
			}
		}));
		graph.AddNode(new jlGraphNode(REVERB_WET, ConvolverNode, {
			"nodeParams": {
				0: new jlGraphNodeParam({
					"initialValue": 0.0,
					"animationEnabled": false,
					"connections": [
						new jlGraphNodeConnection(RandomHex(32), REVERB_MIXER, 0, REVERB_WET, 0)
					]
				})
			},
			"nodeFields": {
				"buffer": spaceReverb,
				"normalize": true
			},
			"constructorArgs": {}
		}));
		graph.AddNode(new jlGraphNode(REVERB_WET_GAIN, GainNode, {
			"nodeParams": {
				0: new jlGraphNodeParam({
					"initialValue": 0.0,
					"animationEnabled": false,
					"connections": [
						new jlGraphNodeConnection(RandomHex(32), REVERB_WET, 0, REVERB_WET_GAIN, 0)
					]
				}),
				"gain": new jlGraphNodeParam({
					"initialValue": REVERB_WET_GAIN_LEVEL,
					"animationEnabled": false,
					"connections": []
				})
			}
		}));
		graph.AddNode(new jlGraphNode(REVERB_DRY_GAIN, GainNode, {
			"nodeParams": {
				0: new jlGraphNodeParam({
					"initialValue": 0.0,
					"animationEnabled": false,
					"connections": [
						new jlGraphNodeConnection(RandomHex(32), REVERB_MIXER, 0, REVERB_DRY_GAIN, 0)
					]
				}),
				"gain": new jlGraphNodeParam({
					"initialValue": REVERB_DRY_GAIN_LEVEL,
					"animationEnabled": false,
					"connections": []
				})
			}
		}));
		for (let i=0; i<16; i++) {
			let peakGain=(i==9)?PERCUSSION_GAIN:MASTER_GAIN;
			graph.AddNode(new jlGraphNode(GAIN_NODES[i], GainNode, {
				"nodeParams": {
					0: new jlGraphNodeParam({
						"initialValue": 0.0,
						"animationEnabled": false,
						"connections": channelNotes[i]
					}),
					"gain": new jlGraphNodeParam({
						"initialValue": .5*peakGain,
						"animationEnabled": true,
						"animationStartTime": 0.0,
						"animationSpeed": 1.0,
						"keyframes": channelGainKeyframes[i],
						"connections": []
					})
				}
			}));
			graph.AddNode(new jlGraphNode(STEREO_PANNER_NODES[i], StereoPannerNode, {
				"nodeParams": {
					0: new jlGraphNodeParam({
						"connections": [
							new jlGraphNodeConnection(RandomHex(32), GAIN_NODES[i], 0, STEREO_PANNER_NODES[i], 0)
						]
					}),
					"pan": new jlGraphNodeParam({
						"initialValue": 0.0,
						"animationEnabled": true,
						"animationStartTime": 0.0,
						"animationSpeed": 1.0,
						"keyframes": channelPanKeyframes[i],
						"connections": []
					})
				}
			}));
			graph.AddNode(new jlGraphNode(PITCH_BEND_OUT[i], ConstantSourceNode, {
				"nodeParams": {
					"offset": new jlGraphNodeParam({
						"initialValue": 0.0,
						"animationEnabled": true,
						"animationStartTime": 0.0,
						"animationSpeed": 1.0,
						"keyframes": channelPitchBendKeyframes[i],
						"connections": (VIBRATO_ENABLED[i])?[
							new jlGraphNodeConnection(RandomHex(32), LFO, 0, PITCH_BEND_OUT[i], 0)
						]:[]
					})
				},
				"nodeTimedFunctions": {
					"start": [
						0.0
					]
				}
			}));
		}
		graph.AddNode(new jlGraphNode(LFO_PRE, OscillatorNode, {
			"nodeParams": {
				"frequency": new jlGraphNodeParam({
					"initialValue": 6.0,
					"animationEnabled": false,
					"connections": []
				})
			},
			"nodeFields": {
				"type": "sine"
			},
			"nodeTimedFunctions": {
				"start": [
					0.000
				]
			},
			"constructorArgs": {}
		}));
		graph.AddNode(new jlGraphNode(LFO, GainNode, {
			"nodeParams": {
				0: new jlGraphNodeParam({
					"initialValue": 0.0,
					"animationEnabled": false,
					"connections": [
						new jlGraphNodeConnection(RandomHex(32), LFO_PRE, 0, LFO, 0)
					]
				}),
				"gain": new jlGraphNodeParam({
					"initialValue": 15.0,
					"animationEnabled": false,
					"connections": []
				})
			},
			"constructorArgs": {}
		}));
		for (let i=0; i<synthNodes.length; i++) {
			graph.AddNode(synthNodes[i]);
		}
		
		if (false) {
			//let fet=await fetch("test/audio/flourish sans hi-hat.wav");
			//let abf=await fet.arrayBuffer();
			//let buf=await audio.decodeAudioData(abf);
			//let absn=audio.createBufferSource();
			//let drumgain=audio.createGain();
			//absn.buffer=buf;
			//absn.connect(drumgain);
			//drumgain.gain.value=2.0;
			
			var liveGraph=new jlLiveGraphInstance(graph, audio, audio.currentTime+1.0);
			liveGraph.Prep();
			//drumgain.connect(liveGraph.nodeInstances["5cdd4a1a65cc054c5fe99ddf83aaf0f9"]);
			//absn.start(liveGraph.audioContextTimeOrigin);
			
			await ({"then": function(f) {setTimeout(f, (liveGraph.audioContextTimeOrigin-audio.currentTime)*1000.0);}});
			
			var renSize=(song.duration+2.0);
			mainFunc=function() {
				framebufferWidth=window.innerWidth;
				framebufferHeight=window.innerHeight;
				resetTransform();
				
				can.save();
				can.translate(framebufferWidth*.5, framebufferHeight*.5);
				can.fillStyle="#ffffff";
				can.font="24px OpenDyslexic, sans-serif";
				can.textAlign="center";
				can.textBaseline="middle";
				can.fillText("Playing! ^o^", 0.0, 0.0);
				can.font="24px monospace";
				can.fillText(jlFormattedTimecode(audio.currentTime-liveGraph.audioContextTimeOrigin, true), 0.0, 96.0);
				can.restore();
				
				if ((audio.currentTime-liveGraph.audioContextTimeOrigin)>=renSize) {
					audio.close();
					
					mainFunc=function() {
						framebufferWidth=window.innerWidth;
						framebufferHeight=window.innerHeight;
						resetTransform();
						
						can.save();
						can.translate(framebufferWidth*.5, framebufferHeight*.5);
						can.fillStyle="#ffffff";
						can.font="24px OpenDyslexic, sans-serif";
						can.textAlign="center";
						can.textBaseline="middle";
						can.fillText("Finished!", 0.0, 0.0);
						can.restore();
					};
				}
			};
		} else {
			var audioContext=new OfflineAudioContext(audio.destination.channelCount, audio.sampleRate*(song.duration+2.0), audio.sampleRate);
			await jlProgressTrackerNode.AttachToAudioContext(audioContext);
			await jlBufferCopyNode.AttachToAudioContext(audioContext);
			
			let liveGraph=new jlLiveGraphInstance(graph, audioContext, 0.0);
			let liveGraphOut=audioContext.createGain();
			liveGraphOut.gain.value=1.0;
			liveGraphOut.connect(audioContext.destination);
			liveGraph.destinationNode=liveGraphOut;
			liveGraph.Prep();
			
			var renSize=(song.duration+2.0);
			var renStartTime=window.performance.now()*.001;
			var renLastProgressTime=renStartTime;
			var renLastProgressRatio=0.0;
			var renLastSpeedFactor=1.0;
			var renTotalSpeedFactor=0.0;
			var renProgressUpdates=0;
			var renLastProgressSecond=0.0;
			var PROGTRACKER_TEXT_TOP="";
			var PROGTRACKER_TEXT_BOTTOM="";
			
			var renPlaylistBlocks=[]; // block={"buffer": AudioBuffer, "source": AudioBufferSourceNode, "startTime", "stopTime"}
			var renPlaylistBufferedEvents=[];
			var renPlaylistInitialDelay=audio.currentTime;
			var renPlaylistBufferSuspendThreshold=10.0;
			var renPlaylistBufferResumeThreshold=9.0;
			var renPlaylistBufferSuspendScheduled=false;
			var renPlaylistStarted=false;
			
			var renTotalTimeMissed=0.0;
			
			mainFunc=function() {
				framebufferWidth=window.innerWidth;
				framebufferHeight=window.innerHeight;
				resetTransform();
				
				can.save();
				can.translate(framebufferWidth*.5, framebufferHeight*.5);
				can.fillStyle="#ffffff";
				can.font="24px OpenDyslexic, sans-serif";
				can.textAlign="center";
				can.textBaseline="middle";
				can.fillText("Rendering...", 0.0, 0.0);
				can.font="24px monospace";
				can.textAlign="left";
				can.textBaseline="bottom";
				can.fillText(PROGTRACKER_TEXT_TOP, framebufferWidth*-.25, 96.0);
				can.textBaseline="top";
				can.fillText(PROGTRACKER_TEXT_BOTTOM, framebufferWidth*-.25, 96.0);
				can.restore();
				
				if ("suspend" in audioContext) {
					let now=audio.currentTime;
					let lastBlockStopTime=(renPlaylistBlocks.length==0)?(now-1000.0):(renPlaylistBlocks[renPlaylistBlocks.length-1].stopTime);
					
					if ((renPlaylistStarted) && (now>renPlaylistInitialDelay) && (lastBlockStopTime<now)) {
						renTotalTimeMissed+=deltaTime;
					}
					
					can.save();
					can.translate(framebufferWidth*.5, framebufferHeight*.5);
					can.fillStyle="#ffffff";
					can.font="24px OpenDyslexic, sans-serif";
					can.textAlign="center";
					can.textBaseline="middle";
					if (renTotalTimeMissed>0.0) can.fillText("Missed "+jlFormattedTimecode(renTotalTimeMissed)+" due to lag", 0.0, -24.0);
					can.restore();
					
					if (audioContext.state=="suspended") {
						can.save();
						can.translate(framebufferWidth*.5, framebufferHeight*.5);
						can.fillStyle="#ffffff";
						can.font="24px OpenDyslexic, sans-serif";
						can.textAlign="center";
						can.textBaseline="middle";
						can.fillText("(paused)", 0.0, 24.0);
						can.restore();
						if (lastBlockStopTime<=(now+renPlaylistBufferResumeThreshold)) {
							audioContext.resume();
							renPlaylistBufferSuspendScheduled=false;
							//if (renPlaylistBufferResumeThreshold>=1.0) renPlaylistBufferResumeThreshold=1.0;
							//renPlaylistBufferSuspendThreshold=lerp(renPlaylistBufferResumeThreshold*1.1, 5.0, Math.random());
							console.log("unpause :3");
						}
					} else if ((now>renPlaylistInitialDelay) && (!renPlaylistBufferSuspendScheduled)) {
						if (lastBlockStopTime>=(now+renPlaylistBufferSuspendThreshold)) {
							let nextPauseTime=renLastProgressSecond+.2;
							if (nextPauseTime<(renSize-5.0)) {
								audioContext.suspend(nextPauseTime);
								renPlaylistBufferSuspendScheduled=true;
								//renPlaylistBufferResumeThreshold=lerp(.2, 1.0, Math.random());
								console.log("pause!! :3");
							}
						}
					}
				}
			};
			
			var oProg=new jlProgressTrackerNode(audioContext);
			oProg.addEventListener("progresschange", function(e) {
				let currentTime=window.performance.now()*.001;
				let deltaTime=currentTime-renLastProgressTime;
				let elapsedTime=currentTime-renStartTime;
				let currentProgress=(e.progress*1.0)/renSize;
				let deltaProgress=currentProgress-renLastProgressRatio;
				let eta=(deltaTime/deltaProgress)*(1.0-currentProgress);
				let speedFactor=renSize/(deltaTime/deltaProgress);
				PROGTRACKER_TEXT_TOP=(Math.floor(currentProgress*100.0).toString().padStart(5, " ")+"% - "+jlFormattedTimecode(e.progress, true)+" of "+jlFormattedTimecode(renSize, true));
				PROGTRACKER_TEXT_BOTTOM=("Elapsed: "+jlFormattedTimecode(elapsedTime, true)+" (ETA: "+jlFormattedTimecode(eta, true)+", speed factor: "+(speedFactor).toFixed(6)+")");
				renLastProgressTime=currentTime;
				renLastProgressRatio=currentProgress;
				renLastSpeedFactor=speedFactor;
				renTotalSpeedFactor+=speedFactor;
				renProgressUpdates++;
				renLastProgressSecond=e.progress;
			});
			oProg.connect(audioContext.destination);
			
			var bufferCopy=new jlBufferCopyNode(audioContext);
			var renPlaylistProcessBuffer=function(e) {
				let now=Math.max(audio.currentTime, renPlaylistInitialDelay);
				let lastBlockStopTime=(renPlaylistBlocks.length==0)?(now):(renPlaylistBlocks[renPlaylistBlocks.length-1].stopTime);
				lastBlockStopTime=Math.max(lastBlockStopTime, now);
				let buffer=e.buffer;
				let source=new AudioBufferSourceNode(audio);
				source.connect(audio.destination);
				source.buffer=buffer;
				source.start(lastBlockStopTime);
				renPlaylistBlocks.push({"buffer": buffer, "source": source, "startTime": lastBlockStopTime, "stopTime": lastBlockStopTime+buffer.duration});
				
				let purged=0;
				let i=0;
				for (i=0; i<renPlaylistBlocks.length; i++) {
					let block=renPlaylistBlocks[i];
					if (now>block.stopTime) {
						renPlaylistBlocks.splice(i, 1);
						purged++;
						i--;
					}
				}
			};
			bufferCopy.addEventListener("bufferavailable", function(e) {
				renPlaylistBufferedEvents.push(e);
				if (renPlaylistStarted) {
					for (let i=0; i<renPlaylistBufferedEvents.length; i++) {
						renPlaylistProcessBuffer(renPlaylistBufferedEvents[i]);
					}
					renPlaylistBufferedEvents=[];
				} else {
					if (renLastProgressSecond>=10.0) renPlaylistStarted=true;
				}
			});
			liveGraphOut.connect(bufferCopy);
			
			let buf=await audioContext.startRendering();
			
			mainFunc=function() {
				framebufferWidth=window.innerWidth;
				framebufferHeight=window.innerHeight;
				resetTransform();
				
				can.save();
				can.translate(framebufferWidth*.5, framebufferHeight*.5);
				can.fillStyle="#ffffff";
				can.font="24px OpenDyslexic, sans-serif";
				can.textAlign="center";
				can.textBaseline="middle";
				can.fillText("Encoding...", 0.0, 0.0);
				can.restore();
			};
			
			let wav=audioBufferToWav(buf, {});
			buf=undefined;
			let blob=new Blob([wav], {"type": "audio/wav"});
			let burl=window.URL.createObjectURL(blob);
			let a=window.document.createElement("a");
			a.href=burl;
			a.download="download.wav";
			window.document.body.appendChild(a);
			a.click();
			await ({"then": function(f) {setTimeout(f, 1000);}});
			window.document.body.removeChild(a);
			window.URL.revokeObjectURL(burl);
			
			mainFunc=function() {
				framebufferWidth=window.innerWidth;
				framebufferHeight=window.innerHeight;
				resetTransform();
				
				can.save();
				can.translate(framebufferWidth*.5, framebufferHeight*.5);
				can.fillStyle="#ffffff";
				can.font="24px OpenDyslexic, sans-serif";
				can.textAlign="center";
				can.textBaseline="middle";
				can.fillText("Finished!", 0.0, 0.0);
				can.restore();
			};
		}
	})();
};

addLoadProgress();
