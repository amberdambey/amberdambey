/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlGraph.js
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

import {RandomHex, CompareHex, IsHex, jlSerializableObject} from "./jlSerializableObject.js";
const _jImports=[
	{
		"from": "./jlSerializableObject.js",
		"import": [
			"RandomHex",
			"CompareHex",
			"IsHex",
			"jlSerializableObject"
		]
	}
];
(function() {
	shared["RandomHex"]=RandomHex;
	shared["CompareHex"]=CompareHex;
	shared["IsHex"]=IsHex;
	shared["jlSerializableObject"]=jlSerializableObject;
	
	// const [RandomHex, CompareHex, IsHex, jlSerializableObject]=[shared.RandomHex, shared.CompareHex, shared.IsHex, shared.jlSerializableObject];
})();

const jlKeyframeType={
	"Event": "Event",
	"AParam": "AParam"
};
const jlKeyframeSmoothingFunction={
	"Instant": "Instant",
	"Linear": "Linear",
	"Exponential": "Exponential",
	"Logarithmic": "Logarithmic",
	"Bezier": "Bezier",
	"Taper": "Taper",
	"TaperEnd": "TaperEnd",
	"Freeze": "Freeze"
};

class jlGraphNode extends jlSerializableObject {
	nodePrototype=undefined;
	nodeParams={}; // dictionary of parameters by their name, plus inputs that are number-indexed ;3
	nodeFields={};
	nodeTimedFunctions={};
	constructorArgs=undefined;
	
	position={x:0.0,y:0.0}; // wheres this node?
	width=150.0; // how big??
	color=0xffff8040; // (0xAARRGGBB) visual color
	label=""; // display text for this node
	expanded=true; // expanded/collapsed :3c
	
	constructor(id, nodePrototype, options) {
		super(id);
		this.nodePrototype=nodePrototype;
		
		if ((options) && ((typeof options)=="object")) {
			if ("position" in options) this.position=options["position"];
			if ("width" in options) this.width=options["width"];
			if ("color" in options) this.color=options["color"];
			if ("label" in options) this.label=options["label"];
			if ("expanded" in options) this.expanded=options["expanded"];
			
			if ("nodePrototype" in options) this.nodePrototype=options["nodePrototype"];
			if ("nodeParams" in options) this.nodeParams=options["nodeParams"];
			if ("nodeFields" in options) this.nodeFields=options["nodeFields"];
			if ("nodeTimedFunctions" in options) this.nodeTimedFunctions=options["nodeTimedFunctions"];
			if ("constructorArgs" in options) this.constructorArgs=options["constructorArgs"];
		}
	}
	
	// construct an instance of this node and set any fields as needed...
	CreateNode(liveGraph) {
		if (this.nodePrototype==AudioDestinationNode) {
			return liveGraph.destinationNode;
		} else {
			let con=this.nodePrototype;
			let node=new con(liveGraph.audioContext, this.constructorArgs);
			let fields=Object.keys(this.nodeFields);
			for (let i=0; i<fields.length; i++) {
				let field=fields[i];
				let fieldVal=this.nodeFields[field];
				node[field]=fieldVal;
			}
			return node;
		}
	}
	
	// link it all together!!!!!
	ConnectNode(liveGraph, nodeInstance) {
		let plugs=Object.keys(this.nodeParams);
		for (let i=0; i<plugs.length; i++) {
			let pl=plugs[i];
			let param=this.nodeParams[pl];
			if (pl==(parseInt(pl).toString())) {
				// wire it up!!!
				for (let j=0; j<param.connections.length; j++) {
					let connection=param.connections[j];
					let fromNodeInstance=liveGraph.nodeInstances[connection.fromNodeId];
					fromNodeInstance.connect(nodeInstance, connection.fromParam, parseInt(pl));
				}
			} else {
				param.AttachToAudioParam(liveGraph, nodeInstance[pl]);
			}
		}
	}
	
	// send the timed functions x3c
	TimeNode(liveGraph, nodeInstance) {
		let funcs=Object.keys(this.nodeTimedFunctions);
		for (let i=0; i<funcs.length; i++) {
			let func=funcs[i];
			let timing=this.nodeTimedFunctions[func];
			for (let i=0; i<timing.length; i++) {
				nodeInstance[func](liveGraph.AbsoluteTimecode(timing[i]));
			}
		}
	}
}

class jlGraphNodeParam {
	initialValue=0.0;
	animationEnabled=false;
	animationStartTime=0.0;
	animationSpeed=1.0;
	keyframes=[];
	connections=[]; // things which are connected TO this param, and **NOT** things this param itself connects to!!!
	
	constructor(options) {
		if ((options) && ((typeof options)=="object")) {
			if ("initialValue" in options) this.initialValue=options["initialValue"];
			if ("animationEnabled" in options) this.animationEnabled=options["animationEnabled"];
			if ("animationStartTime" in options) this.animationStartTime=options["animationStartTime"];
			if ("animationSpeed" in options) this.animationSpeed=options["animationSpeed"];
			if ("keyframes" in options) this.keyframes=options["keyframes"];
			if ("connections" in options) this.connections=options["connections"];
		}
	}
	
	AttachToAudioParam(liveGraph, aParam) {
		// first things first: connections!!!
		for (let i=0; i<this.connections.length; i++) {
			let connection=this.connections[i];
			let fromNodeInstance=liveGraph.nodeInstances[connection.fromNodeId];
			fromNodeInstance.connect(aParam, connection.fromParam);
		}
		
		// next: keyframes...
		aParam.value=this.initialValue;
		if (this.animationEnabled) {
			let formTime=(function(t) {
				return this.liveGraph.AbsoluteTimecode((t/this.animationSpeed)+this.animationStartTime);
			}).bind({"animationStartTime": this.animationStartTime, "animationSpeed": this.animationSpeed, "liveGraph": liveGraph});
			let scaleTime=(function(t) {
				return this.liveGraph.RelativeTimecode(t/this.animationSpeed);
			}).bind({"animationStartTime": this.animationStartTime, "animationSpeed": this.animationSpeed, "liveGraph": liveGraph});
			
			aParam.setValueAtTime(this.initialValue, formTime(0.0));
			let lastVal=this.initialValue;
			let lastTime=0.0;
			for (let kI=0; kI<this.keyframes.length; kI++) {
				let k=this.keyframes[kI];
				if (k.keyframeType==jlKeyframeType.Event) continue; // skip events
				
				let nextTime=k.time;
				let deltaTime=nextTime-lastTime;
				switch (k.keyframeSmoothingFunction) {
					case jlKeyframeSmoothingFunction.Instant: if (true) {
						aParam.setValueAtTime(k.value, formTime(k.time));
						lastVal=k.value;
						break;
					}
					case jlKeyframeSmoothingFunction.Linear: if (true) {
						aParam.linearRampToValueAtTime(k.value, formTime(k.time));
						lastVal=k.value;
						break;
					}
					case jlKeyframeSmoothingFunction.Exponential: if (true) {
						if (k.value==0.0) {
							aParam.setValueAtTime(0.0, formTime(lastTime));
						} else if (lastVal==0.0) {
							aParam.setValueAtTime(0.0, formTime(lastTime));
							aParam.setValueAtTime(k.value, formTime(k.time));
						} else {
							aParam.exponentialRampToValueAtTime(k.value, formTime(k.time));
						}
						lastVal=k.value;
						break;
					}
					case jlKeyframeSmoothingFunction.Logarithmic: if (true) {
						let curve=new Float32Array(Math.ceil(liveGraph.audioContext.sampleRate*deltaTime));
						for (let G=0; G<curve.length; G++) {
							let s=G/curve.length;
							curve[G]=Math.log(lerp(Math.exp(lastVal), Math.exp(k.value), s));
						}
						aParam.setValueCurveAtTime(curve, formTime(lastTime), scaleTime(deltaTime));
						lastVal=k.value;
						break;
					}
					case jlKeyframeSmoothingFunction.Bezier: if (true) {
						let curve=new Float32Array(Math.ceil(liveGraph.audioContext.sampleRate*deltaTime));
						let curveHandleA=k.curveHandleA;
						let curveHandleB=k.curveHandleB;
						for (let G=0; G<curve.length; G++) {
							// guess the inverse of the horizontal curve function (TODO: this code is terribly unoptimized and slow! i could probably just gradiate using derivatives buuuuuuuut thats too hard -_-)
							let t=G/curve.length; // unweighted time
							let guess=.5;
							let guessStep=.25;
							for (let i=0; i<52; i++) {
								let guessVal=(3.0*(1.0-guess)*(1.0-guess)*(guess)*(curveHandleA.weight))+(3.0*(1.0-guess)*(guess)*(guess)*(curveHandleB.weight))+(guess*guess*guess);
								if (guessVal<t) {
									guess+=guessStep;
									guessStep*=.5;
								} else if (guessVal>t) {
									guess-=guessStep;
									guessStep*=.5;
								} else break;
							}
							let T=guess; // weighted time
							
							let r=(3.0*(1.0-T)*(1.0-T)*(T)*(curveHandleA.ratio))+(3.0*(1.0-T)*(T)*(T)*(curveHandleB.ratio))+(T*T*T); // ratio
							curve[G]=(lastVal*(1-r))+(k.value*r);
						}
						aParam.setValueCurveAtTime(curve, formTime(lastTime), scaleTime(deltaTime));
						lastVal=k.value;
						break;
					}
					case jlKeyframeSmoothingFunction.Taper: if (true) {
						aParam.setTargetAtTime(k.value, formTime(lastTime), scaleTime(1.0/k.decayRate));
						let t=Math.exp(deltaTime/k.decayRate);
						lastVal=(k.value*t)+(lastVal*(1.0-t));
						break;
					}
					case jlKeyframeSmoothingFunction.TaperEnd: if (true) {
						aParam.setValueAtTime(lastVal, formTime(nextTime));
						break;
					}
					case jlKeyframeSmoothingFunction.Freeze: if (true) {
						aParam.setValueAtTime(lastVal, formTime(nextTime));
						break;
					}
				}
				lastTime=nextTime;
			}
			
			// WHEW!!!!!!! glad thats over x3c
		}
	}
}

class jlKeyframe {
	time=0.0; // time in seconds for this keyframe
	keyframeType=jlKeyframeType.Event; // what kind of keyframe is this?
	
	// for jlKeyframeType.AParam keyframes:
	keyframeSmoothingFunction=jlKeyframeSmoothingFunction.Instant; // Smoothing function to use
	value=0.0; // The value the param will have at the time of this keyframe. This is the starting value for taper keyframes
	curveHandleA={"weight": .5, "ratio": 0.0}; // For bezier keyframes. Weight (0.0-1.0) is the horizontal position of the curve handle where 1.0 is further from the keyframe. Ratio is the ratio from 0.0 (last keyframe's value) to 1.0 (this keyframe's value).
	curveHandleB={"weight": .5, "ratio": 1.0}; // For bezier keyframes. Weight (0.0-1.0) is the horizontal position of the curve handle where 1.0 is further from the keyframe. Ratio is the ratio from 0.0 (last keyframe's value) to 1.0 (this keyframe's value).
	targetValue=0.0; // For taper keyframes. The value this keyframe is falling/rising toward.
	decayRate=1.0; // For taper keyframes. Decay rate of this keyframe in keyframe units.
	
	/*
	* new jlKeyframe(0, [TIME]);
	*       Construct an Event keyframe which triggers an event on TIME.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	* 
	* ## INSTANT ##
	* new jlKeyframe(1, [TIME], 0, [FINAL]);
	*       Construct an AParam keyframe which reaches its target immediately on TIME. The initial value maintained from the previous keyframe will persist for the duration of this keyframe.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	*       [FINAL]
	*       - The state this parameter will remain at until the next keyframe.
	* 
	* ## LINEAR ##
	* new jlKeyframe(1, [TIME], 1, [FINAL]);
	*       Construct an AParam keyframe which linearly interpolates from its initial state to its final state, reaching its target on TIME. The initial value maintained from the previous keyframe will gradually be changed into the final value of this keyframe over its duration.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	*       [FINAL]
	*       - The state this parameter will remain at until the next keyframe.
	* 
	* ## EXPONENTIAL ##
	* new jlKeyframe(1, [TIME], 2, [FINAL]);
	*       Construct an AParam keyframe which proportionately scales the parameter's value until reaching its target. This is useful for controlling the frequency of a periodic function, such as an oscillator; where melodic pitch is a logarithmic function of its frequency. Should either the initial value or the final value be zero, the parameter's value will remain at zero for the duration of the keyframe. Negative values are clamped to zero while positive values remain as they are. Should both values be negative, their absolute values will be used instead; and the parameter will be appropriately negative.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	*       [FINAL]
	*       - The state this parameter will remain at until the next keyframe.
	* 
	* ## LOGARITHMIC ##
	* new jlKeyframe(1, [TIME], 3, [FINAL]);
	*       Construct an AParam keyframe which scales the parameter's value as if it were a logarithmic function of a linear value. This is useful for values which are on a logarithmic scale, such as decibels, where linearity is desired. Should either the initial value or the final value be positive infinity, the parameter's value will remain at positive infinity for the duration of the keyframe. Should the initial and final values both be infinity of opposite signs, only the initial sample or the final sample, depending on which has the value of negative infinity, will take on the value of negative infinity.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	*       [FINAL]
	*       - The state this parameter will remain at until the next keyframe.
	* 
	* ## BEZIER ##
	* new jlKeyframe(1, [TIME], 4, [FINAL], [IN_WEIGHT], [IN_RATIO], [OUT_WEIGHT], [OUT_RATIO]);
	*       Construct an AParam keyframe which follows a cubic Bézier curve function as defined by IN_WEIGHT, IN_RATIO, OUT_WEIGHT, and OUT_RATIO.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	*       [FINAL]
	*       - The state this parameter will remain at until the next keyframe.
	*       [IN_WEIGHT]
	*       - A positive value between 0.0 and 1.0 determining the significance of the initial portion of the curve throughout the keyframe. Values closer to 1.0 will produce a flatter initial portion of the curve. Values closer to 0.0 will cause a sharper dropoff into the rest of the curve. Should either this value or the value of [OUT_WEIGHT] exceed zero in such a way where the first-order derivative of the timing cubic Bézier function would result in a negative value within the intended time range, both this value and the value of [OUT_WEIGHT] will be set to exactly 1.0, even if one of them was less than 1.0. Negative numbers are clamped to zero.
	*       [IN_RATIO]
	*       - The initial bend ratio of the curve. Values closer to 0.0 bias this portion of the curve toward the initial value, while values closer to 1.0 bias this portion of the curve toward the final value. By changing this value and [IN_WEIGHT], you are able to precisely control the starting slope and curvature of the initial half of the curve.
	*       [OUT_WEIGHT]
	*       - A positive value between 0.0 and 1.0 determining the significance of the final portion of the curve throughout the keyframe. Values closer to 1.0 will produce a flatter final portion of the curve; while values closer to 0.0 will cause a sharper dropoff into the rest of the curve. Should either this value or the value of [IN_WEIGHT] exceed zero in such a way where the first-order derivative of the timing cubic Bézier function would result in a negative value within the intended time range, both this value and the value of [IN_WEIGHT] will be set to exactly 1.0, even if one of them was less than 1.0. Negative numbers are clamped to zero.
	*       [OUT_RATIO]
	*       - The final bend ratio of the curve. Values closer to 0.0 bias this portion of the curve toward the initial value, while values closer to 1.0 bias this portion of the curve toward the final value. By changing this value and [OUT_WEIGHT], you are able to precisely control the ending slope and curvature of the final half of the curve.
	* 
	* ## TAPER ##
	* new jlKeyframe(1, [TIME], 5, [TARGET], [INVERSE_HALFLIFE]);
	*       Construct an AParam keyframe which begins continuously altering the parameter's value, independent of future keyframes, until encountering an AParam keyframe with the TaperEnd smoothing function or a subsequent Taper smoothing function with a different TARGET and/or INVERSE_HALFLIFE. In the absence of a TaperEnd AParam keyframe, this keyframe will hold its final value until a new keyframe, as if a TaperEnd AParam keyframe is present at the same time as TIME. The gradation starts at the time of the last keyframe's ending point.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	*       [TARGET]
	*       - The state this parameter will gradate toward. The parameter's value will never exactly equal its target, unless its initial value happened to be equal to the target, or unless [INVERSE_HALFLIFE] is greater than or equal to 2 to the power of 23 (8388608.0).
	*       [INVERSE_HALFLIFE]
	*       - The decay rate of this gradation. Larger values will increase the rate at which the parameter reaches its target, while smaller values lead to a smoother curve. If this value is negative, the parameter will gradate away from, rather than toward, its target. If this value is negative infinity, the parameter's value will freeze at zero (or the closest value to zero within its legal range) for the duration of the gradation. If this value is exactly zero, the parameter's value will remain unchanged.
	* 
	* ## TAPEREND ##
	* new jlKeyframe(1, [TIME], 6);
	*       Construct an AParam keyframe which cancels a currently active gradation from a prior AParam keyframe with the Taper smoothing function, if any. If there is no active gradation or if one has already been cancelled, this keyframe has identical behavior to a keyframe on the same TIME with a smoothing function of Freeze.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	* 
	* ## FREEZE ##
	* new jlKeyframe(1, [TIME], 7);
	*       Construct an AParam keyframe which interrupts any changes to the parameter's value until TIME. The initial value maintained from the previous keyframe will persist for the duration of this keyframe.
	*       
	*       [TIME]
	*       - The timecode of this event in seconds.
	*/
	constructor() {
		this.time=arguments[1];
		this.keyframeType=([jlKeyframeType.Event, jlKeyframeType.AParam])[arguments[0]];
		
		if (this.keyframeType==jlKeyframeType.AParam) {
			this.keyframeSmoothingFunction=([jlKeyframeSmoothingFunction.Instant, jlKeyframeSmoothingFunction.Linear, jlKeyframeSmoothingFunction.Exponential, jlKeyframeSmoothingFunction.Logarithmic, jlKeyframeSmoothingFunction.Bezier, jlKeyframeSmoothingFunction.Taper, jlKeyframeSmoothingFunction.TaperEnd, jlKeyframeSmoothingFunction.Freeze])[arguments[2]];
			switch (this.keyframeSmoothingFunction) {
				case jlKeyframeSmoothingFunction.Instant:
					this.value=arguments[3];
					break;
				case jlKeyframeSmoothingFunction.Linear:
					this.value=arguments[3];
					break;
				case jlKeyframeSmoothingFunction.Exponential:
					this.value=arguments[3];
					break;
				case jlKeyframeSmoothingFunction.Logarithmic:
					this.value=arguments[3];
					break;
				case jlKeyframeSmoothingFunction.Bezier:
					this.value=arguments[3];
					this.curveHandleA={"weight": arguments[4], "ratio": arguments[5]};
					this.curveHandleB={"weight": arguments[6], "ratio": arguments[7]};
					break;
				case jlKeyframeSmoothingFunction.Taper:
					this.value=arguments[3];
					this.decayRate=arguments[4];
					break;
				case jlKeyframeSmoothingFunction.TaperEnd:
					break;
				case jlKeyframeSmoothingFunction.Freeze:
					break;
			}
		} else {
			// TODO
		}
	}
}

class jlGraphNodeConnection extends jlSerializableObject {
	fromNodeId=""; // the jlGraphNode this connection originates from
	fromParam=0; // either the output index (number, starting from zero) or some string index thingy which is on the jlGraphNode
	toNodeId=""; // the jlGraphNode i link to!!!
	toParam=0; // either a number for the input index or a param name
	
	constructor(id, fromId, fromParam, toId, toParam) {
		super(id);
		this.fromNodeId=fromId;
		this.fromParam=fromParam;
		this.toNodeId=toId;
		this.toParam=toParam;
	}
}

class jlGraph extends jlSerializableObject {
	graphNodes={};
	graphNodeIDs=[];
	
	constructor(id) {
		super(id);
	}
	
	SortGraphNodes() {
		this.graphNodeIDs.sort(CompareHex);
	}
	
	AddNode(node) {
		this.graphNodes[node.id]=node;
		if (this.graphNodeIDs.indexOf(node.id)<0) this.graphNodeIDs.push(node.id);
	}
	
	RemoveNode(node) {
		delete this.graphNodes[node.id];
		this.graphNodeIDs.splice(this.graphNodeIDs.indexOf(node.id), 1);
	}
}

class jlLiveGraphInstance {
	graph=undefined; // jlGraph
	audioContext=undefined; // either an OfflineAudioContext or a live AudioContext
	audioContextTimeOrigin=0.0; // starting timestamp ;3
	nodeInstanceIDs=[];
	nodeInstances={};
	destinationNode=undefined; // likely audioContext.destination, or perhaps some mixer?
	
	constructor(graph, aCtx, aCtxTimeOrigin) {
		this.graph=graph;
		this.audioContext=aCtx;
		this.audioContextTimeOrigin=aCtxTimeOrigin;
		this.destinationNode=aCtx.destination;
	}
	
	Prep() {
		// start by creating all of the nodes, but not linking them or anything yet...
		for (let i=0; i<this.graph.graphNodeIDs.length; i++) {
			let id=this.graph.graphNodeIDs[i];
			let gn=this.graph.graphNodes[id];
			let ln=gn.CreateNode(this);
			
			this.nodeInstanceIDs.push(id);
			this.nodeInstances[id]=ln;
		}
		
		// now link them (^w^ >-< ^w^)
		for (let i=0; i<this.nodeInstanceIDs.length; i++) {
			let id=this.nodeInstanceIDs[i];
			let gn=this.graph.graphNodes[id];
			let ln=this.nodeInstances[id];
			
			gn.ConnectNode(this, ln);
			gn.TimeNode(this, ln);
		}
	}
	
	AbsoluteTimecode(tc) {
		return tc+this.audioContextTimeOrigin;
	}
	
	RelativeTimecode(tc) {
		return tc;
	}
}

export {RandomHex, CompareHex, IsHex, jlSerializableObject, jlKeyframeType, jlKeyframeSmoothingFunction, jlGraphNode, jlGraphNodeParam, jlKeyframe, jlGraphNodeConnection, jlGraph, jlLiveGraphInstance};
