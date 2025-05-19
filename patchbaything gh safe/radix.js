"use strict";

/* radix.js Compact Single-file
 * 
 * Copyright (C) 2024-2025 AmberDambey Software (git.sr.ht/~amberdambey/radixjs)
 * (TODO: license)
 * 
 * It is safe to replace all occurances of the "let" keyword with the "var" keyword if it improves support on older browsers (such as NWF on Wii U and 3DS)
 */

const GraphicsQuality={Fastest:0,Fast:1,Normal:2,Best:3};
const KeyCode={Any:-1,None:-2,Other:0,Backspace:8,Tab:9,KeypadEqual:12,Return:13,Shift:16,Ctrl:17,Alt:18,PauseBreak:19,CapsLock:20,Escape:27,Space:32,PageUp:33,PageDown:34,End:35,Home:36,LeftArrow:37,UpArrow:38,RightArrow:39,DownArrow:40,PrintScreen:44,Insert:45,Delete:46,Alpha0:48,Alpha1:49,Alpha2:50,Alpha3:51,Alpha4:52,Alpha5:53,Alpha6:54,Alpha7:55,Alpha8:56,Alpha9:57,Semicolon:59,Equal:61,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Meta:91,Z:90,Context:93,Keypad0:96,Keypad1:97,Keypad2:98,Keypad3:99,Keypad4:100,Keypad5:101,Keypad6:102,Keypad7:103,Keypad8:104,Keypad9:105,KeypadMultiply:106,KeypadPlus:107,KeypadMinus:109,KeypadPeriod:110,KeypadDivide:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,ScrollLock:145,Minus:173,Comma:188,Period:190,Slash:191,BackQuote:192,NumLock:144,LeftBracket:219,Backslash:220,RightBracket:221,Quote:222};
const KeyCodeAliases=[{inp:189,outp:173},{inp:187,outp:61},{inp:186,outp:59}];

var framebufferWidth=1280;
var framebufferHeight=720;
var fillFramebuffer=true;
var graphicsPreset=2;
var osdVerbosity=0;
var initFunc=function() {};
var mainFunc=function() {
	osdVerbosity=9999;
	interceptUserEvents=false;
	
	can.save();
	can.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
	can.fillStyle="#0060c0";
	can.fillRect(0.0, 0.0, can.canvas.width, can.canvas.height);
	can.restore();
	
	can.save();
	can.fillStyle="#ffffff";
	can.font="128px sans-serif";
	can.textAlign="left";
	can.textBaseline="middle";
	can.fillText(":(", 200.0, 180.0);
	can.font="72px sans-serif";
	can.textAlign="left";
	can.textBaseline="middle";
	can.fillText("Fallback mainFunc", 200.0, 300.0);
	can.font="24px sans-serif";
	can.textAlign="left";
	can.textBaseline="middle";
	var lines=[
		"Nothing has loaded therefore there is nothing to do!",
		"This is either because there's nothing *to* load or",
		"there was an error *in the process of* loading, most likely",
		"the latter, unless you've loaded radix.js by itself somehow.",
		"Please open the JavaScript console in your browser",
		"(usually Ctrl+Shift+I or F12, then select \"Console\")",
		"and diagnose or report any errors as applicable."
	];
	for (var i=0; i<lines.length; i++) {
		can.fillText(lines[i], 200.0, 480.0+(((i+.5)-(lines.length*.5))*24.0));
	}
	can.restore();
};
var loadWaitFunc=function() {
	can.translate(framebufferWidth*.5, framebufferHeight*.75);
	can.fillStyle="#ffffff";
	can.fillRect(-250, -20, 500, 40);
	can.fillStyle="#000000";
	can.fillRect(-248, -18, 496, 36);
	can.fillStyle="#4080ff";
	if (loadWait.loadingProgress>=loadWait.loadingMax) can.fillStyle="#000000";
	can.fillRect(-246, -16, 492*Math.min(loadWait.loadingProgress/(loadWait.loadingMax-0), 1.0), 32);
	resetTransform();
	can.translate(framebufferWidth*.5, framebufferHeight*.5);
	can.font="72px OpenDyslexic, sans-serif";
	can.textAlign="center";
	can.textBaseline="middle";
	can.fillStyle="#ffffff";
	if ((loadWait.loadingProgress+0)<loadWait.loadingMax) can.fillText("Loading", 0, 0);
	resetTransform();
	can.translate(framebufferWidth*.5, framebufferHeight*.75);
	can.font="22px OpenDyslexic, sans-serif";
	can.fillStyle="#ffffff";
	if ((!loadWait.interactionMet) && (loadWait.loadingProgress>=loadWait.loadingMax)) {
		can.fillText("(Press any key to continue)", 0, 0);
	}
};
var earlyFuncs=[];
var lateFuncs=[];
var persistentStorage={};
var input={
	keys:[],
	oldKeys:[],
	freshKeys:[],
	keyEventsInOrder:[],
	joysticks:[],
	oldJoysticks:[],
	mouse:new XY(0.0, 0.0),
	oldMouse:new XY(0.0, 0.0),
	unscaledMouse:new XY(0.0, 0.0),
	oldUnscaledMouse:new XY(0.0, 0.0),
	scaledMouse:new XY(0.0, 0.0),
	oldScaledMouse:new XY(0.0, 0.0),
	mouseOnScreen:false,
	oldMouseOnScreen:false,
	touch:[],
	oldTouch:[],
	accel:new XYZ(0.0, 0.0, 0.0),
	oldAccel:new XYZ(0.0, 0.0, 0.0),
	gyro:new XYZ(0.0, 0.0, 0.0),
	oldGyro:new XYZ(0.0, 0.0, 0.0),
	mouseClick:{left:false,right:false,middle:false},
	oldMouseClick:{left:false,right:false,middle:false},
	mouseScroll:0.0,
	oldMouseScroll:0.0,
	mouseScrollX:0.0,
	oldMouseScrollX:0.0,
	mouseScrollZ:0.0,
	oldMouseScrollZ:0.0,
	discreteScrollSensitivity:1.0,
	continuousScrollSensitivity:1.0,
	penPressure:0.0,
	penClick:{draw:false,a:false,b:false,erase:false},
	penTilt:new XY(0.0, 0.0),
	joystickMappings:{
		"Nintendo Wii Remote Pro Controller (Vendor: 057e Product: 0330)":{
			joystickAxes:{
				leftx:0,
				lefty:1,
				leftDeadzone:.15,
				rightx:2,
				righty:3,
				rightDeadzone:.15,
				ltaxis:-1,
				rtaxis:-1
			},
			joystickButtons:{
				a:1,
				b:0,
				x:2,
				y:3,
				lb:4,
				rb:5,
				lt:6,
				rt:7,
				select:8,
				start:9,
				leftc:11,
				rightc:12,
				dup:13,
				ddown:14,
				dleft:15,
				dright:16,
				menu:10
			},
		},
		defaultMapping:{
			joystickAxes:{
				leftx:0,
				lefty:1,
				leftDeadzone:.1,
				rightx:2,
				righty:3,
				rightDeadzone:.1,
				ltaxis:-1,
				rtaxis:-1
			},
			joystickButtons:{
				a:1,
				b:0,
				x:3,
				y:2,
				lb:4,
				rb:5,
				lt:6,
				rt:7,
				select:8,
				start:9,
				leftc:10,
				rightc:11,
				dup:12,
				ddown:13,
				dleft:14,
				dright:15,
				menu:16
			},
		}
	},
	touchMapsToMouse:true,
	usingTouchscreen:false,
	ignoreMouseClicksUntilReleased:false
};
var rawInput={
	mouseX:0.0,
	mouseY:0.0,
	scaledMouseX:0.0,
	scaledMouseY:0.0,
	lastMouseX:0.0,
	lastMouseY:0.0,
	newKeys:[],
	oldKeys:[],
	keyEventsInOrder:[],
	gamepads:[],
	touches:[],
	accelSensor:undefined,
	gyroSensor:undefined,
	lastMouseButtonState:0,
	accumulatedScroll:0.0,
	accumulatedScrollX:0.0,
	accumulatedScrollZ:0.0,
	penPressure:0.0,
	penTiltX:0.0,
	penTiltY:0.0,
	penButtonState:0,
	mouseLeave:true,
	lastTouchEvent:undefined,
	lastTouchEventFresh:false
};

var loadWait={
	loadingProgress:0.0,
	loadingMax:0.0,
	loadingFinished:false,
	interactionMet:false
};

var platformDetection={
	hardware:{
		keyboard:true,
		mouse:true,
		touchscreen:false,
		attachedJoystick:false,
		accelerometer:false,
		gyroscope:false,
		stylusPen:false,
		supportsWebGL:false,
		supportsAudioContext:true,
		supportsWebGL2:false,
		hasOnScreenKeyboard:false
	},
	sdkAvailable:{
		wiiUInternetBrowser:false,
		nintendoWebFramework:false,
		electron:false,
		nodejs:false,
		new3dsInternetBrowser:false
	},
	wiiUInternetBrowser:{
		
	},
	nintendoWebFramework:{
		wiiU:{
			gamepadBattery:6, // Read-only; 0-no battery, 1-very low battery, 2-low battery, 3-half charged battery, 4-mostly charged battery, 5-fully charged battery, 6-charging
			connectJoysticksForProControllers:true, // true/false; set this to true to connect joysticks for Wii U Pro Controllers
			connectJoysticksForWiiRemotes:false, // true/false; set this to true to connect joysticks for Wii Remotes
			connectJoysticksForClassicControllers:true, // true/false; set this to true to connect joysticks for Classic Controllers/Classic Controller Pros
			increaseMaxBtControllersTo7:false, // true/false; set this to true to allow up to 7 Bluetooth controllers to be connected at once, set it to false to only allow up to 4
			mapGamepadTouchscreenToMouse:true, // true/false; set this to true to send left clicks whenever the gamepad touchscreen is being touched. Virtual touchpoints cannot be disabled
			mapWiiRemoteCursorToMouse:true, // true/false; set this to true to move the cursor position to match the P1 Wii Remote. Tracking is assisted with MotionPlus
			showWiiRemoteCursors:true, // true/false; set this to true to show the wiimote cursors on the TV and gamepad. There is no way to hide the shadows of the cursors when this is false
			mapWiiMotionPlusToGyro:false, // true/false; set this to true to map the accelerometer AND gyroscope of the P1 wiimote to the motion sensors instead of the gamepad
			acceptUsbKeyboard:true, // true/false; set this to true to let the USB keyboard be used for keyboard events
			showSwkbd:function(promptText, defaultText, characterMax, style) {return prompt(promptText, defaultText);}, // Show the on-screen keyboard and let the player type up to characterMax letters. Set style to 0 for ordinary text input with no line breaks, 1 for numbers only, 2 for no special characters, 3 for text with line breaks, and 4 for passwords.
			showMessage:function(promptText) {alert(promptText);}, // Open a dialog box
			showError:function(errorCode, errorBody) {alert(errorBody);}, // Display an error message with the specified error code and body. Erro code should be one of nwf.system.SystemErrorCode enum.
			openManual:function() {}, // Open the game's emanual
			tvScreenViewport:undefined, // Set this to a XYMatrix of the transformation to be applied to the tv screen viewport or leave it as null for the entire canvas
			gamepadScreenViewport:undefined, // Set this to a XYMatrix of the transformation to be applied to the gamepad screen viewport or leave it as null for the entire canvas
			gamepad2ScreenViewport:undefined, // Set this to be the same as gamepadScreenViewport if you want to see the game screen on the second gamepad. This won't do anything in practice since it's ignored by nwf. :P
			allowHomeMenu:true // true/false; set this to false to block the home menu
		},
		new3ds:{
			consoleBattery:6, // Read-only; 0-no battery, 1-very low battery, 2-low battery, 3-half charged battery, 4-mostly charged battery, 5-fully charged battery, 6-charging
			topScreenViewport:undefined, // Set this to a XYMatrix of the transformation to be applied to the top screen viewport or leave it as null for the entire canvas
			touchScreenViewport:undefined, // Set this to a XYMatrix of the transformation to be applied to the bottom screen viewport or leave it as null for the entire canvas
			showSwkbd:function(promptText, defaultText, characterMax) {return prompt(promptText, defaultText);}, // Show the on-screen keyboard and let the player type up to characterMax letters and no line breaks. characterMax cannot exceed 32
			showMessage:function(promptText) {alert(promptText);}, // Open a dialog box
			allowHomeMenu:true // true/false; set this to false to block the home menu
		},
		nintendoSwitch:{
			systemBattery:100, // Read-only; battery charge in percent [0-100],
			systemBatteryCharging:true, // Read-only true/false; true whenever connected to power, even if it isn't charging
			docked:false, // Read-only true/false, true when the switch is docked and displaying on a tv
			handheld:false, // Read-only true/false; true when the switch is out of the dock and displaying on its screen with BOTH joycons attached
			acceptHandheld:true, // true/false; set this to false to require wireless controllers
			acceptSingleJoycons:false, // true/false; set this to false to block horizontal joycons. This will convert them into vertical joycons or open the controller applet
			acceptDoubleJoycons:true, // true/false; set this to false to block gripped joycons. This will open the controller applet when you try to read from any player's joystick
			acceptLeftVerticalJoycons:false, // true/false; set this to false to block single vertical left joycons. This will convert them to horizontal joycons or open the controller applet
			acceptRightVerticalJoycons:false, // true/false; set this to false to block single vertical right joycons. This will convert them to horizontal joycons or open the controller applet
			acceptProControllers:true, // true/false; set this to false to block pro controllers. This will disconnect them
			showSwkbd:function(promptText, defaultText, characterMax, style) {return prompt(promptText, defaultText);}, // Show the on-screen keyboard and let the player type up to characterMax letters. Set style to 0 for ordinary text input with no line breaks, 1 for numbers only, 2 for no special characters, 3 for text with line breaks, and 4 for passwords.
			showMessage:function(promptText) {alert(promptText);}, // Open a dialog box
			openMiiApplet:function() {return -1;}, // Open the mii selector/creator menu, then return the mii id that was selected or -1 if it was cancelled
			openBrowserApplet:function(url) {return 0;}, // Open a limited web browser to this url
			openControllerApplet:function(minControllers, maxControllers, disconnectAllControllers) {return 0;}, // Open the controller applet waiting for between minControllers [1-8] and maxControllers [1-8] to be connected. If disconnectAllControllers is true, all connected controllers will be disconnected. This will return 0 if the user connects the expected number of controllers or -1 if it was cancelled.
			requestNsoAccess:function() {return 1;}, // CALL THIS FUNCTION BEFORE USING XMLHttpRequest, WebSockets, OR LOADING EXTERNAL CONTENT!!! This will return 1 if the user has an NSO subscription and can access these features, otherwise 0 if they do not.
			selectUser:function() {return 0x80000001;} // Open the user selection prompt, then return the user id that was chosen. VERY IMPORTANT CALL THIS BEFORE SAVING!!!
		},
		any:{
			showSwkbd:function(promptText, defaultText, characterMax) {return prompt(promptText, defaultText);},
			showMessage:function(promptText) {alert(promptText);},
			consoleModel:"", // This will start with "WUP" if it is a Wii U, "CTR"/"SPR"/"FTR"/"KTR"/"RED"/"JAN" if it is a 3DS, or "HAC" if it is a Switch
			openMiiverse:function(olvPage, olvAction, olvPostData) {return -1;}, // Refer to documentation. Only for wii u and 3ds
			openEShop:function(eshopPage, eshopData) {return -1;} // Open the eshop on eshopPage: 0-home page, 1-this game or the game with the title id eshopData, 2-this game's dlc menu, 3-the dlc item specified by eshopData
		}
	}
};

const mainCan=window.document.createElement("canvas");
mainCan.style.width=window.innerWidth+"px";
mainCan.style.height=window.innerHeight+"px";
mainCan.style.position="fixed";
mainCan.style.left="0px";
mainCan.style.top="0px";
mainCan.style.backgroundColor="#000000";
var can=mainCan.getContext("2d");
var audio=new window.AudioContext({latencyHint:"interactive",sampleRate:48000});
var defaultTransform=new XYMatrix(1, 0, 0, 1, 0, 0);
var oldTime=0.0;
var newTime=0.0;
var exitTime=0.0;
var deltaTime=0.0;
var deltaTimeSamples=[];
var deltaTimeSampleLimit=64;
var avgDeltaTime=0.0;
var avgFramerate=0.0;
var vsyncDelay=0.0;
var onFirstFrame=true;
var frameCount=0;
var willSkipNextFrame=false;
var willResizeMainCanNextFrame=true;
var willSkipClearingNextFrame=false;
var interceptUserEvents=true;
var preventAppQuit=false;
var preventAppQuitMessage="";

function rdxPolyfill() {
	// When using NWF mode the polyfill will be this:
	// - You may use input and rawInput for the gamepad touchscreen, wiimote position, 3ds screen touch, switch touchscreen, etc.
	// - You may read from joysticks via input.joysticks and input.oldJoysticks as usual :3
	//   - The names are as follows:
	//   - Gamepad: "Wii U GamePad (WUP-010)"
	//   - Wii U Pro Con: "Wii U Pro Controller (WUP-005)"
	//   - Wiimote: "Wii Remote (RVL-003)", "Wii Remote Plus (RVL-036)", "Wii Remote Plus (RVL-003)" (wiimote+mpls)
	//     - 1 maps to y, 2 maps to x
	//     - for nunchuk, the stick is the left stick, which will always be clicked, C maps to LB and Z maps to LT.
	//   - Classic Con: "Wii U Pro Controller (RVL-005)", "Wii U Pro Controller (RVL-???)"
	//     - Even on the original classiccon, the triggers are digital (0.0 or 1.0) under padscore
	//   - Switch Joycon: "Joy-Con (L)", "Joy-Con (R)", "Dual Joy-Con (L+R)"
	//     - When HORIZONTAL: north maps to X, east maps to A, south maps to B, west maps to Y, SL maps to LB, SR maps to RB, L/R/ZL/ZR are ignored, +/- both map to start, and the stick is the left joystick.
	//   - Switch Pro Con: "Pro Controller (Pro Controller)"
	//     - Gamecube adapter: "Pro Controller (WUP-028)"
	//     - Dual joycons behaving like a pro controller: "Pro Controller (Joy-Con (L))"
	//     - Other controllers: "Pro Controller (HORI Fight Pad)"
	//   - Old3ds (no c-stick): "Joystick (System input)"
	//   - New3ds: "New Nintendo 3DS"
	// - You can just use `polyNavigator.language` to get the language
	// - Call window.close to return to the launcher (wii u menu or home menu)
	// - The wii u gamepad/3ds/nintendo switch gyroscope and accelerometer data are provided in input
	// - Audio from the gamepad/3ds mic is the only audio device reported by `polyNavigator.getUserMedia(...)`
	// - Appending HTML elements into the document body will have them appear on the top/TV screen
	// - Appending HTML elements as children of the mainCan will have them appear on the bottom/gamepad screen
	// - WebAssembly is provided by JVOOWA wasm. The JIT interpreter is known to be very slow.
	// - AudioContext is provided through JVOOPF Media:
	//   - The audio is rendered to a blob URL with rolling PCM data (switch) or a series of base64 data urls for .wav files played in sequence (wii u & 3ds). For this reason please avoid longer sounds and sound effects with AC. Realtime audio manipulation will sound choppy. Your best bet is to render it to an OfflineAudioContext then use jvoopfm.AudioBuffer.prototype.asBase64() or jvoopfm.AudioBuffer.prototype.asBlob() and set the result as the src of an audio element.
	//   - Pseudo-worklet nodes and script processor nodes are unsupported. Even if pseudo-worklet nodes were supported, jvoo does not provide pseudo-worklets or pseudo-namespaces.
	//   - There is an unavoidable latency of at least 1 full second on Nintendo 3DS legacy (CTR/SPR/FTR) platforms.
	// - globalCompositeOperation with any value beside source-over will be handled with JVOOM Painter (extremely slow pixel manipulation!)
	// - JVOOPF Media provides getUserMedia and it supports the gamepad camera (512x512@20Hz), 3ds front camera (768x512@20Hz), 3ds outer cameras (768x512x2@20Hz), and the joycon IR cameras (max resolution of 128x256@4Hz, although refresh rate increases as the resolution decreases).
	//   - Some of these sources may be rotated 90 degrees counterclockwise and/or have the red and blue color channels swapped.
	//   - JVOOPF Media also supports the gamepad mic ("Input (Audio device)"), 3ds internal mic ("Input (Internal Microphone-01)"), 3ds headset mic ("Input (BUS-00)"), wii u karaoke mic ("Input (UAC Headset-01)"), wii speak ("Input (Audio device-01)"), nintendo switch headphone port ("Input (Headset Microphone-01)"), nintendo switch usb mic ("Input (USB Audio-01)"), and wii u karaoke mic plugged in to the switch usb ("Input (Headset Microphone-02)").
	// - Controller rumble is not possible on Wii U :(
	// - Controller rumble on Nintendo Switch uses the gamepad haptic actuator API, where the effect's weak magnitude is the amplitude and the effect's strong magnitude is the frequency divided by 330 Hz.
	// - The touchscreen on the nintendo switch will always map to mouse input.
	// - localStorage object can be used for save data. Keep in mind that the "persistentStorage" key is user-specific, and the "unreservedAccess" key is console-specific.
	// - Webrtc, websocket, xmlhttprequest, 3rd party resources, and other network operations **REQUIRE** a nintendo switch online subscription. Please call requestNsoAccess before doing anything.
	// - Setting preventAppQuit to true will block the home menu!
	// - Setting interceptUserEvents to false will show wiimote cursors and allow page scrolling
	// - Setting osdVerbosity to 4 will reveal NWF system information.
}

function rdxInitPrep() {
	// Insert the framebuffer
	window.document.body.appendChild(mainCan);
}

function resizeMainCan() {
	// Don't immediately resize the viewport otherwise if SilvHTML is using the Vulkan 1.2 accelerated context it will get reset every frame
	willResizeMainCanNextFrame=true;
	mainCan.style.width=window.innerWidth+"px";
	mainCan.style.height=window.innerHeight+"px";
	resetTransform();
	
	// HOTFIX: Firefox smooth resize when entering fullscreen or hiding the toolbar causes crashes [TODO: don't check the user agent string]
	if ((window.navigator.userAgent.indexOf("Firefox")>=0) || (window.navigator.userAgent.indexOf("Gecko")>=0)) willSkipNextFrame=true;
}

function resetCan() {
	resetTransform();
	can.clippingCoordinateSpace="local";
	can.clippingPath=new Path2D();
	can.direction="inherit";
	can.fillStyle="#ffffff";
	can.fillStyleCoordinateSpace="local";
	can.filter="none";
	can.font="22px sans-serif";
	can.fontKerning="auto";
	can.fontStretch="normal";
	can.fontVariantCaps="normal";
	can.globalAlpha=1.0;
	can.globalCompositeOperation="source-over";
	can.imageNegativeSizeBehavior="preserve-orientation";
	can.imageReadNoise=false;
	can.imageSmoothingEnabled=true;
	can.letterSpacing=0;
	can.lineCap="butt";
	can.lineDashOffset=0;
	can.lineJoin="miter";
	can.lineWidth=1.0;
	can.measureTextNoise=false;
	can.path=new Path2D();
	can.shadowBlur=0.0;
	can.shadowColor="#00000000";
	can.shadowCookie="";
	can.shadowOffsetCoordinateSpace="global";
	can.shadowOffsetX=0.0;
	can.shadowOffsetY=0.0;
	can.strokeStyle="#ffffff";
	can.textAlign="left";
	can.textBaseline="alphabetic";
	can.textMaxWidthBehavior="shrink";
	can.wordSpacing=0;
	
	if (graphicsPreset==GraphicsQuality.Fastest) {
		can.imageSmoothingEnabled=false;
		can.imageSmoothingQuality="low";
		can.miterLimit=2;
		can.textRendering="optimizeSpeed";
	}
	
	if (graphicsPreset==GraphicsQuality.Fast) {
		can.imageSmoothingEnabled=true;
		can.imageSmoothingQuality="low";
		can.miterLimit=4;
		can.textRendering="optimizeSpeed";
	}
	
	if (graphicsPreset==GraphicsQuality.Normal) {
		can.imageSmoothingEnabled=true;
		can.imageSmoothingQuality="medium";
		can.miterLimit=10;
		can.textRendering="auto";
	}
	
	if (graphicsPreset==GraphicsQuality.Best) {
		can.imageSmoothingEnabled=true;
		can.imageSmoothingQuality="high";
		can.miterLimit=20;
		can.textRendering="optimizeLegibility";
	}
}

function clearScreen() {
	if (willSkipClearingNextFrame) {
		willSkipClearingNextFrame=false;
		return;
	}
	
	can.save();
	resetCan();
	can.setTransform(1, 0, 0, 1, 0, 0);
	can.fillStyle="#000000";
	can.clearRect(0, 0, can.canvas.width, can.canvas.height);
	resetTransform();
	can.fillRect(0, 0, framebufferWidth, framebufferHeight);
	can.restore();
}

function drawOSD() {
	let drawLine=function(text) {
		let textWidth=can.measureText(text).width;
		can.fillStyle="#000000";
		can.globalAlpha=.5;
		can.fillRect(0, 0, textWidth, 16);
		can.globalAlpha=1.0;
		can.fillStyle="#ffffff";
		can.fillText(text, 0, 0);
	};
	
	resetCan();
	can.setTransform(1, 0, 0, 1, 0, 0);
	can.scale(window.devicePixelRatio, window.devicePixelRatio);
	if (osdVerbosity<=-1) return;
	can.font="16px monospace";
	can.textBaseline="top";
	drawLine("FPS: "+(avgFramerate.toFixed(3)), 0, 0);
	can.translate(0, 16);
	if (osdVerbosity<=0) return;
	let lowestFramerate=1.0/deltaTimeSamples[0];
	let highestFramerate=1.0/deltaTimeSamples[0];
	for (let x=0; x<deltaTimeSamples.length; x++) {
		if ((1.0/deltaTimeSamples[x])<lowestFramerate) lowestFramerate=1.0/deltaTimeSamples[x];
		if ((1.0/deltaTimeSamples[x])>highestFramerate) highestFramerate=1.0/deltaTimeSamples[x];
	}
	drawLine("Min: "+(lowestFramerate.toFixed(3))+", "+"Max: "+(highestFramerate.toFixed(3))+", "+"RenderTime: "+Math.max(0.0, vsyncDelay).toFixed(3)+", "+"CodeTime: "+Math.max(0.0, deltaTime-vsyncDelay).toFixed(3), 0, 0);
	can.translate(0, 16);
	if (osdVerbosity<=1) return;
	drawLine("Graphics Preset: "+graphicsPreset, 0, 0);
	can.translate(0, 16);
	if (osdVerbosity<=2) return;
	drawLine("Joysticks: "+input.joysticks, 0, 0);
	can.translate(0, 16);
	drawLine("Keys: "+input.keys, 0, 0);
	can.translate(0, 16);
	drawLine("Touchpoints: "+input.touch, 0, 0);
	if (input.mouseOnScreen) {
		can.translate(0, 16);
		drawLine("Mouse: "+input.mouse, 0, 0);
	}
	can.translate(0, 16);
	drawLine("Gyroscope: "+input.gyro, 0, 0);
	can.translate(0, 16);
	drawLine("Accelerometer: "+input.accel, 0, 0);
	if (input.mouseClick.left) {
		can.translate(0, 16);
		drawLine("Left click", 0, 0);
	}
	if (input.mouseClick.right) {
		can.translate(0, 16);
		drawLine("Right click", 0, 0);
	}
	if (input.mouseClick.middle) {
		can.translate(0, 16);
		drawLine("Middle click", 0, 0);
	}
	can.translate(0, 16);
	drawLine("Scroll: ("+(input.mouseScroll.toFixed(1))+", "+(input.mouseScrollX.toFixed(1))+", "+(input.mouseScrollZ.toFixed(1))+")", 0, 0);
	if (platformDetection.sdkAvailable.nintendoWebFramework) {
		can.translate(0, 16);
		drawLine("Using Nintendo Web Framework", 0, 0);
		can.translate(0, 16);
		drawLine("Device Model: "+platformDetection.nintendoWebFramework.any.consoleModel, 0, 0);
	}
}

function readInput() {
	input.oldKeys=input.keys;
	input.oldJoysticks=input.joysticks;
	input.oldMouse=input.mouse;
	input.oldUnscaledMouse=input.unscaledMouse;
	input.oldScaledMouse=input.scaledMouse;
	input.oldTouch=input.touch;
	input.oldAccel=input.accel;
	input.oldGyro=input.gyro;
	input.oldMouseClick=input.mouseClick;
	input.oldMouseScroll=input.mouseScroll;
	input.oldMouseScrollX=input.mouseScrollX;
	input.oldMouseScrollZ=input.mouseScrollZ;
	input.oldMouseOnScreen=input.mouseOnScreen;
	input.keyEventsInOrder=rawInput.keyEventsInOrder;
	
	// Clear input.keys from the last frame
	input.keys=[];
	input.freshKeys=[];
	rawInput.keyEventsInOrder=[];
	// Sanitize the key codes to ensure browser and keyboard layout compatibility
	sanitizeKeyCodes(rawInput.oldKeys);
	sanitizeKeyCodes(rawInput.newKeys);
	// Check the freshness of key events in order
	for (let i=0; i<input.keyEventsInOrder.length; i++) {
		let fresh=true;
		for (let j=0; j<input.oldKeys.length; j++) {
			if (input.oldKeys[j]==input.keyEventsInOrder[i].keyCode) {
				fresh=false;
				break;
			}
		}
		input.keyEventsInOrder[i].fresh=fresh;
	}
	// Fill input.keys with values from last frame's keys while excluding keys which were released
	for (let i=0; i<input.oldKeys.length; i++) {
		let unique=true;
		for  (let j=0; j<rawInput.oldKeys.length; j++) {
			if (rawInput.oldKeys[j]==input.oldKeys[i]) unique=false;
		}
		if (unique) input.keys.push(input.oldKeys[i]);
	}
	// Insert the newly pressed keys
	while (rawInput.newKeys.length>0) {
		// Always add the current raw key into freshKeys, even if there are duplicates
		input.freshKeys.push(rawInput.newKeys[0]);
		
		let unique=true;
		for (let i=0; i<input.keys.length; i++) {
			if (rawInput.newKeys[0]==input.keys[i]) unique=false;
		}
		if (unique) input.keys.push(rawInput.newKeys.splice(0, 1)[0]); else rawInput.newKeys.splice(0, 1);
	}
	// Filter keys which have been released but are still in rawInput.newKeys (ex. pressed and released on the same frame)
	while (rawInput.oldKeys.length>0) {
		let i;
		for (i=0; i<input.keys.length; i++) {
			if (rawInput.oldKeys[0]==input.keys[i]) {
				input.keys.splice(i, 1);
				i--;
			}
		}
		rawInput.oldKeys.splice(0, 1);
	}
	
	input.joysticks=[];
	while (input.joysticks.length<input.oldJoysticks.length) {
		let dummy=new Joystick(new Thumbstick(new XY(0.0, 0.0), false), new Thumbstick(new XY(0.0, 0.0), false), new Dpad(false, false, false, false), new Buttons(false, false, false, false, false, false, 0.0, 0.0, false, false, false), {connected:false}, false);
		input.joysticks.push(dummy);
	}
	rawInput.gamepads=navigator.getGamepads();
	for (let i=0; i<rawInput.gamepads.length; i++) {
		let gp=rawInput.gamepads[i];
		if (gp==undefined) continue;
		while (input.joysticks.length<=gp.index) {
			let dummy=new Joystick(new Thumbstick(new XY(0.0, 0.0), false), new Thumbstick(new XY(0.0, 0.0), false), new Dpad(false, false, false, false), new Buttons(false, false, false, false, false, false, 0.0, 0.0, false, false, false), {connected:false}, false);
			input.joysticks.push(dummy);
		}
		input.joysticks[gp.index]=joystickFromGamepad(gp);
	}
	
	if ("nwf" in window) {
		platformDetection.sdkAvailable.nintendoWebFramework=true;
		if (nwf.system.isWiiU) {
			platformDetection.nintendoWebFramework.any.consoleModel="WUP-001";
			
		}
		// Read controllers (Nintendo Web Framework)
		let WiiUGamePad=nwf.input.WiiUGamePad.getController(0);
		if (WiiUGamePad.connected) {
			let joystick=new Joystick(new Thumbstick(new XY(0.0, 0.0), false), new Thumbstick(new XY(0.0, 0.0), false), new Dpad(false, false, false, false), new Buttons(false, false, false, false, false, false, 0.0, 0.0, false, false, false), {id:"Wii U GamePad (WUP-010)", index:0, connected:true}, true);
			joystick.left.stick.x=WiiUGamePad.leftStick.movementX;
			joystick.left.stick.y=-WiiUGamePad.leftStick.movementY;
			joystick.right.stick.x=WiiUGamePad.rightStick.movementX;
			joystick.right.stick.y=-WiiUGamePad.rightStick.movementY;
			// 65536 (TV button)
			if ((WiiUGamePad.buttons.buttonValue&131072)!=0) joystick.right.click=true;
			if ((WiiUGamePad.buttons.buttonValue&262144)!=0) joystick.left.click=true;
			// 524288
			// 1048576
			// 2097152
			// 4194304
			// 8388608
			if ((WiiUGamePad.buttons.buttonValue&256)!=0) joystick.dpad.down=true;
			if ((WiiUGamePad.buttons.buttonValue&512)!=0) joystick.dpad.up=true;
			if ((WiiUGamePad.buttons.buttonValue&1024)!=0) joystick.dpad.right=true;
			if ((WiiUGamePad.buttons.buttonValue&2048)!=0) joystick.dpad.left=true;
			if ((WiiUGamePad.buttons.buttonValue&4096)!=0) joystick.buttons.y=true;
			if ((WiiUGamePad.buttons.buttonValue&8192)!=0) joystick.buttons.x=true;
			if ((WiiUGamePad.buttons.buttonValue&16384)!=0) joystick.buttons.b=true;
			if ((WiiUGamePad.buttons.buttonValue&32768)!=0) joystick.buttons.a=true;
			// 1 (Power button)
			// 2 (HOME button)
			if ((WiiUGamePad.buttons.buttonValue&4)!=0) joystick.buttons.select=true;
			if ((WiiUGamePad.buttons.buttonValue&8)!=0) joystick.buttons.start=true;
			if ((WiiUGamePad.buttons.buttonValue&16)!=0) joystick.buttons.rb=true;
			if ((WiiUGamePad.buttons.buttonValue&32)!=0) joystick.buttons.lb=true;
			if ((WiiUGamePad.buttons.buttonValue&64)!=0) joystick.buttons.rt=true;
			if ((WiiUGamePad.buttons.buttonValue&128)!=0) joystick.buttons.lt=true;
			input.joysticks.length=0;
			input.joysticks.push(joystick);
		}
		// Read each Wii U Pro Controller individually
		for (let conInd=0; conInd<4; conInd++) {
			let WiiUProController=nwf.input.WiiUProController.getController(conInd);
			if (WiiUProController.connected) {
				let joystick=new Joystick(new Thumbstick(new XY(0.0, 0.0), false), new Thumbstick(new XY(0.0, 0.0), false), new Dpad(false, false, false, false), new Buttons(false, false, false, false, false, false, 0.0, 0.0, false, false, false), {id:"Wii U Pro Controller (WUP-005)", index:conInd+1, connected:true}, true);
				let buttonBitmask=WiiUProController.buttons.buttonValue;
				joystick.left.stick.x=WiiUProController.leftStick.movementX;
				joystick.left.stick.y=-WiiUProController.leftStick.movementY;
				joystick.right.stick.x=WiiUProController.rightStick.movementX;
				joystick.right.stick.y=-WiiUProController.rightStick.movementY;
				if ((buttonBitmask&65536)!=0)  joystick.right.click=true;
				if ((buttonBitmask&131072)!=0) joystick.left.click=true;
				// 262144
				// 524288
				// 1048576
				// 2097152
				// 4194304
				// 8388608
				// 256 (Power button)
				if ((buttonBitmask&512)!=0)    joystick.buttons.rb=true;
				if ((buttonBitmask&1024)!=0)   joystick.buttons.start=true;
				// 2048 (HOME button)
				if ((buttonBitmask&4096)!=0)   joystick.buttons.select=true;
				if ((buttonBitmask&8192)!=0)   joystick.buttons.lb=true;
				if ((buttonBitmask&16384)!=0)  joystick.dpad.down=true;
				if ((buttonBitmask&32768)!=0)  joystick.dpad.right=true;
				if ((buttonBitmask&1)!=0)      joystick.dpad.up=true;
				if ((buttonBitmask&2)!=0)      joystick.dpad.left=true;
				if ((buttonBitmask&4)!=0)      joystick.buttons.rt=1.0;
				if ((buttonBitmask&8)!=0)      joystick.buttons.x=true;
				if ((buttonBitmask&16)!=0)     joystick.buttons.a=true;
				if ((buttonBitmask&32)!=0)     joystick.buttons.y=true;
				if ((buttonBitmask&64)!=0)     joystick.buttons.b=true;
				if ((buttonBitmask&128)!=0)    joystick.buttons.lt=1.0;
				input.joysticks.push(joystick);
			}
		}
	}
	
	// Fetch the mouse cursor position from rawInput
	input.mouse=new XY(rawInput.mouseX, rawInput.mouseY);
	input.unscaledMouse=new XY(rawInput.mouseX, rawInput.mouseY);
	input.scaledMouse=new XY(rawInput.scaledMouseX, rawInput.scaledMouseY);
	// Adjust for DPI scaling
	input.mouse.x*=window.devicePixelRatio;
	input.mouse.y*=window.devicePixelRatio;
	rawInput.scaledMouseX=rawInput.mouseX*window.devicePixelRatio;
	rawInput.scaledMouseY=rawInput.mouseY*window.devicePixelRatio;
	// Convert the mouse cursor coordinates into a number between -.5 and .5
	input.mouse.x/=can.canvas.width;
	input.mouse.y/=can.canvas.height;
	input.mouse.x-=.5;
	input.mouse.y-=.5;
	// Determine whether to proceed horizontally or vertically
	let aspectRatio=((can.canvas.width*1.0)/(can.canvas.height*1.0))/((framebufferWidth*1.0)/(framebufferHeight*1.0));
	if ((aspectRatio>=1.0)==fillFramebuffer) {
		// Correct horizontally
		input.mouse.x*=aspectRatio;
	} else {
		// Correct vertically
		input.mouse.y/=aspectRatio;
	}
	// Scale to framebuffer size
	input.mouse.x*=framebufferWidth;
	input.mouse.y*=framebufferHeight;
	// Pivot at the upper-left corner
	input.mouse.x+=framebufferWidth*.5;
	input.mouse.y+=framebufferHeight*.5;
	
	input.mouseOnScreen=((rawInput.mouseLeave==true)?false:true);
	if (input.touchMapsToMouse) {
		if (input.usingTouchscreen && (rawInput.touches.length==0)) {
			rawInput.mouseLeave=true; // This will take effect next frame
		}
	}
	
	input.touch=[];
	for (let i=0; i<rawInput.touches.length; i++) {
		let lastTouch=undefined;
		for (let si=0; si<input.oldTouch.length; si++) {
			if (input.oldTouch[si].id==rawInput.touches[i].identifier) {
				lastTouch=input.oldTouch[si];
			}
		}
		input.touch.push({
			position:localPointFromGlobalPoint(new XY(rawInput.touches[i].clientX, rawInput.touches[i].clientY)),
			rawPosition:new XY(rawInput.touches[i].clientX, rawInput.touches[i].clientY),
			initialPosition:localPointFromGlobalPoint(new XY(rawInput.touches[i].clientX, rawInput.touches[i].clientY)),
			initialRawPosition:localPointFromGlobalPoint(new XY(rawInput.touches[i].clientX, rawInput.touches[i].clientY)),
			oldPosition:localPointFromGlobalPoint(new XY(rawInput.touches[i].clientX, rawInput.touches[i].clientY)),
			oldRawPosition:localPointFromGlobalPoint(new XY(rawInput.touches[i].clientX, rawInput.touches[i].clientY)),
			screenTime:0.0,
			distance:0.0,
			id:rawInput.touches[i].identifier
		});
		if (lastTouch!=undefined) {
			input.touch[input.touch.length-1].screenTime=lastTouch.screenTime+deltaTime;
			input.touch[input.touch.length-1].initialPosition=lastTouch.initialPosition;
			input.touch[input.touch.length-1].initialRawPosition=lastTouch.initialRawPosition;
			input.touch[input.touch.length-1].oldPosition=lastTouch.position;
			input.touch[input.touch.length-1].oldRawPosition=lastTouch.rawPosition;
		}
	}
	
	input.accel=new XYZ(0.0, 0.0, 0.0);
	if (rawInput.accelSensor!=undefined) input.accel=new XYZ(rawInput.accelSensor.x*1.0, rawInput.accelSensor.y*1.0, rawInput.accelSensor.z*1.0);
	
	input.gyro=new XYZ(0.0, 0.0, 0.0);
	if (rawInput.gyroSensor!=undefined) input.gyro=new XYZ(rawInput.gyroSensor.x*1.0, rawInput.gyroSensor.y*1.0, rawInput.gyroSensor.z*1.0);
	
	input.mouseClick={left:(rawInput.lastMouseButtonState&1)>0,right:(rawInput.lastMouseButtonState&2)>0,middle:(rawInput.lastMouseButtonState&4)>0};
	if (input.touchMapsToMouse && input.usingTouchscreen) {
		if ((rawInput.touches.length>0)) {
			input.mouseClick.left=true;
		} else {
			input.mouseClick.left=false;
		}
	}
	if (input.ignoreMouseClicksUntilReleased) {
		if ((!input.mouseClick.left) && (!input.mouseClick.right) && (!input.mouseClick.middle)) input.ignoreMouseClicksUntilReleased=false;
		input.mouseClick.left=false;
		input.mouseClick.right=false;
		input.mouseClick.middle=false;
	}
	
	input.mouseScroll=rawInput.accumulatedScroll;
	input.mouseScrollX=rawInput.accumulatedScrollX;
	input.mouseScrollZ=rawInput.accumulatedScrollZ;
	rawInput.accumulatedScroll=0.0;
	rawInput.accumulatedScrollX=0.0;
	rawInput.accumulatedScrollZ=0.0;
	
	input.penPressure=rawInput.penPressure;
	input.penTilt=new XY(rawInput.penTiltX, rawInput.penTiltY);
	input.penClick={draw:false,a:false,b:false,erase:false}; // TODO
}
function JoystickFromGamepad(gp) {
	let map=input.joystickMappings.defaultMapping;
	if (gp.id in input.joystickMappings) map=input.joystickMappings[gp.id];
	let ja=map.joystickAxes;
	let jb=map.joystickButtons;
	let left=new Thumbstick(new XY(gp.axes[ja.leftx], gp.axes[ja.lefty]), gp.buttons[jb.leftc].pressed);
	if (fastDistanceXY(ZeroXY, left.stick)<(ja.leftDeadzone*ja.leftDeadzone)) left.stick=new XY(0.0, 0.0); else {
		let mag=linearDistanceXY(ZeroXY, left.stick);
		let nor=new XY(left.stick.x/mag, left.stick.y/mag);
		left.stick=lerpXY(ZeroXY, nor, (mag-ja.leftDeadzone)/(1.0-ja.leftDeadzone));
	}
	let right=new Thumbstick(new XY(gp.axes[ja.rightx], gp.axes[ja.righty]), gp.buttons[jb.rightc].pressed);
	if (fastDistanceXY(ZeroXY, right.stick)<(ja.rightDeadzone*ja.rightDeadzone)) right.stick=new XY(0.0, 0.0); else {
		let mag=linearDistanceXY(ZeroXY, right.stick);
		let nor=new XY(right.stick.x/mag, right.stick.y/mag);
		right.stick=lerpXY(ZeroXY, nor, (mag-ja.rightDeadzone)/(1.0-ja.rightDeadzone));
	}
	let Dpad=new Dpad(gp.buttons[jb.dup].pressed, gp.buttons[jb.dright].pressed, gp.buttons[jb.dleft].pressed, gp.buttons[jb.ddown].pressed);
	let buttons=new Buttons(gp.buttons[jb.a].pressed, gp.buttons[jb.b].pressed, gp.buttons[jb.x].pressed, gp.buttons[jb.y].pressed, gp.buttons[jb.lb].pressed, gp.buttons[jb.rb].pressed, gp.buttons[jb.lt].value, gp.buttons[jb.rt].value, gp.buttons[jb.start].pressed, gp.buttons[jb.select].pressed, gp.buttons[jb.menu].pressed);
	if (ja.ltaxis>-1) buttons.lt=gp.axes[ja.ltaxis];
	if (ja.rtaxis>-1) buttons.rt=gp.axes[ja.rtaxis];
	// (a, b, x, y, lb, rb, lt, rt, start, select, menu)
	let jos=new Joystick(left, right, Dpad, buttons, gp, gp.connected);
	return jos;
}
function sanitizeKeyCodes(rawKeys) {
	for (let i=0; i<rawKeys.length; i++) {
		// TODO: replace this with a lookup table for efficiency
		for (let j=0; j<KeyCodeAliases.length; j++) {
			if (rawKeys[i]==KeyCodeAliases[j].inp) {
				rawKeys[i]=KeyCodeAliases[j].outp;
				break;
			}
		}
	}
}
function localPointFromGlobalPoint(glbpnt) {
	let locpnt=new XY(glbpnt.x, glbpnt.y);
	// Adjust for DPI scaling
	locpnt.x*=window.devicePixelRatio;
	locpnt.y*=window.devicePixelRatio;
	// Convert the coordinates into a number between -.5 and .5
	locpnt.x/=can.canvas.width;
	locpnt.y/=can.canvas.height;
	locpnt.x-=.5;
	locpnt.y-=.5;
	// Determine whether to proceed horizontally or vertically
	let aspectRatio=((can.canvas.width*1.0)/(can.canvas.height*1.0))/((framebufferWidth*1.0)/(framebufferHeight*1.0));
	if ((aspectRatio>=1.0)==fillFramebuffer) {
		// Correct horizontally
		locpnt.x*=aspectRatio;
	} else {
		// Correct vertically
		locpnt.y/=aspectRatio;
	}
	// Scale to framebuffer size
	locpnt.x*=framebufferWidth;
	locpnt.y*=framebufferHeight;
	// Pivot at the upper-left corner
	locpnt.x+=framebufferWidth*.5;
	locpnt.y+=framebufferHeight*.5;
	return locpnt;
}

function resetTransform() {
	can.setTransform(1, 0, 0, 1, 0, 0);
	if (((mainCan.width*framebufferHeight)>=(mainCan.height*framebufferWidth))==fillFramebuffer) {
		can.translate((mainCan.width-(mainCan.height*(framebufferWidth/framebufferHeight)))/2.0, 0.0);
		can.translate(-.5*framebufferWidth, -.5*framebufferHeight);
		can.scale(mainCan.height/framebufferHeight, mainCan.height/framebufferHeight);
		can.translate(0.0, (framebufferHeight/mainCan.height)*framebufferHeight*.5);
		can.translate((framebufferHeight/mainCan.height)*framebufferWidth*.5, 0.0);
	} else {
		can.translate(0.0, (mainCan.height-(mainCan.width*(framebufferHeight/framebufferWidth)))/2.0);
		can.translate(-.5*framebufferWidth, -.5*framebufferHeight);
		can.scale(mainCan.width/framebufferWidth, mainCan.width/framebufferWidth);
		can.translate((framebufferWidth/mainCan.width)*framebufferWidth*.5, 0.0);
		can.translate(0.0, (framebufferWidth/mainCan.width)*framebufferHeight*.5);
	}
	let x=can.getTransform();
	defaultTransform=new XYMatrix(x.m11, x.m12, x.m21, x.m22, x.m41, x.m42);
}

function frame(newTime) {
	if (willSkipNextFrame) {
		willSkipNextFrame=false;
		if ("requestAnimationFrame" in window) {
			window.requestAnimationFrame(frame);
		} else if ("webkitRequestAnimationFrame" in window) {
			window.webkitRequestAnimationFrame(frame);
		} else {
			let targetFps=1000.0/30.0;
			
			setTimeout(function() {frame(Date.now());}, (Math.ceil(newTime/targetFps)*targetFps)-newTime);
		}
		return -1;
	}
	if (willResizeMainCanNextFrame) {
		willResizeMainCanNextFrame=false;
		mainCan.width=window.innerWidth*window.devicePixelRatio;
		mainCan.height=window.innerHeight*window.devicePixelRatio;
	}
	
	vsyncDelay=(Date.now()-exitTime)*.001;
	let willDrawOSDThisFrame=true;
	//try {
		// Clear the screen from the last frame
		clearScreen();
		resetTransform();
		
		// Save old deltaTime
		if (oldTime!=0.0) deltaTimeSamples.push(deltaTime);
		if (deltaTimeSamples.length>deltaTimeSampleLimit) deltaTimeSamples.splice(0, deltaTimeSamples.length-deltaTimeSampleLimit);
		
		// Calculate average deltaTime value
		avgDeltaTime=0.0;
		for (let i=0; i<deltaTimeSamples.length; i++) {
			if (!(deltaTimeSamples[i]>=0.0)) continue;
			avgDeltaTime+=deltaTimeSamples[i];
		}
		avgDeltaTime/=deltaTimeSampleLimit*1.0;
		avgFramerate=1.0/avgDeltaTime;
		
		// Calculate deltaTime
		deltaTime=(newTime-oldTime)*.001;
		if (deltaTime<0.0) deltaTime-=Math.floor(deltaTime);
		if (deltaTime>=.5) deltaTime=.5;
		if (!(deltaTime>=0.0)) deltaTime=.1;
		oldTime=newTime;
		
		// Read input
		readInput();
		
		// Draw a pleasant loading screen if necessary
		if ((loadWait.loadingProgress>=loadWait.loadingMax) && (loadWait.interactionMet)) {
			// Determine whether to execute initFunc
			if (onFirstFrame) {
				onFirstFrame=false;
				
				// Load persistent storage
				loadPersistentStorage();
				if (true) {
					let controllerMappings=window.localStorage.getItem("custom_joystick_layouts");
					if (controllerMappings!=undefined) {
						let maps=JSON.parse(controllerMappings);
						let gamepadIds=Object.keys(maps);
						for (let i=0; i<gamepadIds.length; i++) {
							let gpid=gamepadIds[i];
							input.joystickMappings[gpid]=maps[gpid];
						}
					}
				}
				
				// Setup motion sensors
				try {
					rawInput.accelSensor=new Accelerometer({frequency:60});
					rawInput.gyroSensor=new Gyroscope({frequency:60});
				} catch (exce) {}
				
				// Run initFunc
				initFunc();
			}
			
			// Execute early functions
			for (let i=0; i<earlyFuncs.length; i++) {
				earlyFuncs[i]();
			}
			
			// Execute the main function
			mainFunc();
			
			// Execute late functions
			for (let i=0; i<lateFuncs.length; i++) {
				lateFuncs[i]();
			}
			
			frameCount++;
		} else {
			willDrawOSDThisFrame=false;
			loadWaitFunc();
		}
		
		// Finalize
		// TODO: separate function
		rawInput.lastMouseX=rawInput.mouseX;
		rawInput.lastMouseY=rawInput.mouseY;
		rawInput.lastTouchEventFresh=false;
	/*} catch (exc) {
		resetCan();
		can.setTransform(1, 0, 0, 1, 0, 0);
		can.fillStyle="#000000";
		can.fillRect(0, 0, can.canvas.width, 48);
		can.fillStyle="#ffffff";
		can.font="16px monospace";
		can.textBaseline="top";
		can.fillText("Exception occurred", 0, 0);
		can.fillText(exc, 0, 16);
		can.fillText("The exception will be sent to your debugger.", 0, 32);
		throw exc;
		return;
	}*/
	
	exitTime=Date.now();
	
	if (willDrawOSDThisFrame) drawOSD();
	if ("requestAnimationFrame" in window) {
		window.requestAnimationFrame(frame);
	} else if ("webkitRequestAnimationFrame" in window) {
		window.webkitRequestAnimationFrame(frame);
	} else {
		let targetFps=1000.0/60.0;
		
		setTimeout(function() {frame(Date.now());}, (Math.ceil(newTime/targetFps)*targetFps)-newTime);
		//setTimeout(function() {frame(Date.now());}, Math.floor(Math.random()*400.0));
	}
}

function genericPreventDefault(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	if (interceptUserEvents) e.preventDefault();
}
function genericLogEvent(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	console.log(e);
}
function addLoadProgress() {
	loadWait.loadingProgress++;
}
function genericInteraction() {
	loadWait.interactionMet=true;
}
function pollMouse(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	rawInput.lastMouseX=rawInput.mouseX;
	rawInput.lastMouseY=rawInput.mouseY;
	rawInput.mouseX=e.clientX;
	rawInput.mouseY=e.clientY;
	rawInput.scaledMouseX=e.clientX*window.devicePixelRatio;
	rawInput.scaledMouseY=e.clientY*window.devicePixelRatio;
	rawInput.mouseLeave=false;
	input.usingTouchscreen=false;
	
	if (input.touchMapsToMouse) {
		if (input.touch.length>0) {
			input.usingTouchscreen=true;
			if (input.touch.length>0) {
				rawInput.mouseX=input.touch[0].rawPosition.x;
				rawInput.mouseY=input.touch[0].rawPosition.y;
				rawInput.scaledMouseX=input.touch[0].rawPosition.x*window.devicePixelRatio;
				rawInput.scaledMouseY=input.touch[0].rawPosition.y*window.devicePixelRatio;
			}
		}
	}
}
function pollPen(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	if ("pointerType" in e) {
		if (e.pointerType=="pen") {
			let hardness=.5;
			if ("pressure" in e) {
				hardness=e.pressure;
			} else if ("force" in e) {
				hardness=e.force;
			} else if ("webkitForce" in e) {
				hardness=e.webkitForce;
			}
			
			rawInput.penPressure=hardness;
			
			let tiltX=0.0;
			let tiltY=0.0;
			if (("tiltX" in e) && ("tiltY" in e)) {
				tiltX=e.tiltX;
				tiltY=e.tiltY;
			} else if ("altitudeAngle" in e) {
				let alt=0.0;
				let azi=0.0;
				if ("altitudeAngle" in e) {alt=e.altitudeAngle};
				if ("azimuthAngle" in e) {azi=e.azimuthAngle};
				let mag=Math.cos(alt)*90.0;
				tiltX=Math.cos(azi)*mag;
				tiltY=Math.sin(azi)*mag;
			}
			
			rawInput.penTiltX=tiltX;
			rawInput.penTiltY=tiltY;
		}
	}
	
	pollMouse(e);
	
	rawInput.lastTouchEvent=e;
	rawInput.lastTouchEventFresh=true;
}
function setMouseOffScreen(ev) {
	rawInput.mouseLeave=true;
	
	if (input.touchMapsToMouse) {
		if (input.usingTouchscreen || input.touch.length>0) {
			input.usingTouchscreen=true;
			if (input.touch.length>0) {
				rawInput.mouseLeave=false;
			}
		}
	}
}
function pollKeysDown(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	rawInput.newKeys.push(e.keyCode);
	rawInput.keyEventsInOrder.push(new KeyEvent(e.keyCode, true));
	
	if (interceptUserEvents) {
		// Generic
		if ((e.keyCode==9) || (e.keyCode==93) || ((e.keyCode>=112) && (e.keyCode<=123))) e.preventDefault();
		
		// Firefox
		if ((e.keyCode==191) || (e.keyCode==222) || (e.keyCode==8) || (e.keyCode==111)) e.preventDefault();
	}
}
function pollKeysUp(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	rawInput.oldKeys.push(e.keyCode);
	rawInput.keyEventsInOrder.push(new KeyEvent(e.keyCode, false));
}
function mouseClickHandler(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	input.usingTouchscreen=false;
	rawInput.lastMouseButtonState=e.buttons;
	if (interceptUserEvents) e.preventDefault();
}
function mouseScrollHandler(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	if (!e.ctrlKey) {
		rawInput.accumulatedScroll+=e.wheelDeltaY*((e.deltaMode!=0)?input.discreteScrollSensitivity:input.continuousScrollSensitivity);
		rawInput.accumulatedScrollX+=e.wheelDeltaX*((e.deltaMode!=0)?input.discreteScrollSensitivity:input.continuousScrollSensitivity);
	} else {
		rawInput.accumulatedScrollZ+=e.wheelDeltaY*((e.deltaMode!=0)?input.discreteScrollSensitivity:input.continuousScrollSensitivity);
	}
	
	if (interceptUserEvents) e.preventDefault();
}
function handleTouchpoints(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	rawInput.touches=e.touches;
	if (interceptUserEvents) e.preventDefault();
	
	if (input.touchMapsToMouse) {
		if (input.usingTouchscreen || rawInput.touches.length>0) {
			input.usingTouchscreen=true;
			if (rawInput.touches.length>0) {
				rawInput.mouseLeave=false;
				rawInput.mouseX=rawInput.touches[0].clientX;
				rawInput.mouseY=rawInput.touches[0].clientY;
				rawInput.scaledMouseX=rawInput.touches[0].clientX*window.devicePixelRatio;
				rawInput.scaledMouseY=rawInput.touches[0].clientX*window.devicePixelRatio;
				rawInput.lastMouseButtonState|=1;
			} else {
				rawInput.lastMouseButtonState=rawInput.lastMouseButtonState&6;
			}
		} else {
			rawInput.mouseLeave=true;
		}
	}
	
	rawInput.lastTouchEvent=e;
	rawInput.lastTouchEventFresh=true;
}
function clearInput() {
	rawInput.mouseLeave=true;
	rawInput.lastMouseButtonState=0;
	// TODO: don't use input, use rawInput instead somehow
	input.keys=[];
}
function addJoystick(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	rawInput.gamepads.push(e.gamepad);
}
function removeJoystick(ev) {
	let e;
	if (ev==undefined) e=window.event; else e=ev;
	
	// Nothing to do...
}

function getKey(key) {
	if (key==KeyCode.Any) return input.keys.length>0;
	for (let i=0; i<input.keys.length; i++) {
		if (input.keys[i]==key) return true;
	}
	return false;
}
function getKeyDown(key) {
	for (let i=0; i<input.keys.length; i++) {
		if (input.keys[i]==key) {
			for (let j=0; j<input.oldKeys.length; j++) {
				if (input.oldKeys[j]==key) return false;
			}
			return true;
		}
	}
	return false;
}
function getKeyUp(key) {
	for (let i=0; i<input.oldKeys.length; i++) {
		if (input.oldKeys[i]==key) {
			for (let j=0; j<input.keys.length; j++) {
				if (input.keys[j]==key) return false;
			}
			return true;
		}
	}
	return false;
}
function getKeyFresh(key) {
	for (let i=0; i<input.freshKeys.length; i++) {
		if (input.freshKeys[i]==key) return true;
	}
	return false;
}

const RDXFramebufferCapture={
	"vtrack": undefined,
	"muxer": undefined,
	"_captureStep": function() {
		let muxer=RDXFramebufferCapture.muxer;
		if (muxer==undefined) return -1;
		
		//muxer.stream.requestFrame();
		RDXFramebufferCapture.vtrack.requestFrame();
	},
	"_captureFrz": function(e) {
		let a=window.document.createElement("a");
		var blob=window.URL.createObjectURL(e.data);
		a.href=blob;
		a.download="download.webm";
		window.document.body.appendChild(a);
		a.click();
		window.document.body.removeChild(a);
		if ("__malloc__" in window) {
			__malloc__.queueOperation("collect", function(e) {e.preventDefault();  window.URL.revokeObjectURL(blob);}, {"passive": false});
		}
	},
	"ContentType": "video/webm; codecs=av1",
	"AudioBitrate": 0,
	"AudioVBRMode": "constant",
	"VideoBitrate": 24000,
	"StartCapture": function() {
		let captureSource=mainCan;
		let captureStream=undefined;
		
		if ("captureStream" in captureSource) captureStream=captureSource.captureStream(0); else {
			if ("mozCaptureStream" in captureSource) captureStream=captureSource.mozCaptureStream(0);
			if ("msCaptureStream" in captureSource) captureStream=captureSource.msCaptureStream(0);
		}
		
		this.vtrack=captureStream.getTracks()[0];
		this.muxer=new window.MediaRecorder(captureStream, {"mimeType": this.ContentType, "audioBitsPerSecond": this.AudioBitrate*1000.0, "videoBitsPerSecond": this.VideoBitrate*1000.0, "audioBitrateMode": this.AudioVBRMode});
		this.muxer.start();
		
		lateFuncs.push(this._captureStep);
	},
	"EndCapture": function() {
		this.muxer.addEventListener("dataavailable", this._captureFrz);
		this.muxer.stop();
		
		lateFuncs.splice(lateFuncs.indexOf(this._captureStep), 1);
		this.vtrack=undefined;
		this.muxer=undefined;
	}
};

// TODO: it's probably best to wait for all polyfills to load before attaching DOM listeners to elements. this might fix race conditions in ie10/ie11/legacyedge
// also, some multithreaded JS engines like V8 used in blink/chromium may have unexpected behaviour with setInterval/setTimeout, especially since scripts run asynchronously from page loading
setTimeout(rdxInitPrep, 10);
setTimeout(resizeMainCan, 10);
setTimeout(frame, 100);
mainCan.addEventListener("contextmenu", genericPreventDefault);
window.addEventListener("contextmenu", genericPreventDefault);
window.addEventListener("resize", resizeMainCan);
window.addEventListener("mousemove", pollMouse);
window.addEventListener("mousedown", mouseClickHandler);
window.addEventListener("mouseup", mouseClickHandler);
window.addEventListener("keydown", pollKeysDown);
window.addEventListener("keyup", pollKeysUp);
window.addEventListener("wheel", mouseScrollHandler, {passive:false});
window.addEventListener("blur", clearInput);
mainCan.addEventListener("mouseout", setMouseOffScreen);
window.addEventListener("gamepadconnected", addJoystick);
window.addEventListener("gamepaddisconnected", removeJoystick);
window.addEventListener("keypress", genericInteraction);
window.addEventListener("touchend", genericInteraction);
window.addEventListener("mouseup", genericInteraction);
window.addEventListener("touchstart", handleTouchpoints, {passive:false});
window.addEventListener("touchmove", handleTouchpoints, {passive:false});
window.addEventListener("touchend", handleTouchpoints);
window.addEventListener("touchcancel", handleTouchpoints);
window.addEventListener("pointermove", pollPen);
window.onbeforeunload=function(ev) {
	if (preventAppQuit) {
		return preventAppQuitMessage;
	}
};


// Library functions
function XY(x, y) {
	this.x=x;
	this.y=y;
}
XY.prototype.toString=function() {
	return "("+this.x.toString()+", "+this.y.toString()+")";
};
function XYZ(x, y, z) {
	this.x=x;
	this.y=y;
	this.z=z;
}
XYZ.prototype.toString=function() {
	return "("+this.x.toString()+", "+this.y.toString()+", "+this.z.toString()+")";
};
const ZeroXY=new XY(0.0, 0.0);
const OneXY=new XY(1.0, 1.0);
function XYMatrix(xbx, ybx, xby, yby, xbc, ybc) {
	this.xbx=xbx; // X' by oX (Scaling horizontally)
	this.ybx=ybx; // Y' by oX (Skewing/Shearing/Rotation)
	this.xby=xby; // X' by oY (Skewing/Shearing/Rotation)
	this.yby=yby; // Y' by oY (Scaling vertically)
	this.xbc=xbc; // X' by one (Translation horizontally)
	this.ybc=ybc; // Y' by one (Translation vertically)
	
	// Think of it like:
	// +-------------+
	// | xbx xby xbc |
	// | ybx yby ybc |
	// | 0.0 0.0 1.0 |
	// +-------------+
}
const IdentityXYM=new XYMatrix(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
function transformXY(v, mat) {
	// Transform vector `v` by matrix `mat`
	return new XY((v.x*mat.xbx)+(v.y*mat.xby)+(1.0*mat.xbc), (v.x*mat.ybx)+(v.y*mat.yby)+(1.0*mat.ybc));
}
function transformXYM(mata, matb) {
	// Transform matrix `mata` by `matb`
	let matc=new XYMatrix(mata.xbx, mata.ybx, mata.xby, mata.yby, mata.xbc, mata.ybc);
	// TODO: Fully multiply the matrices
	matc.xbx=(matb.xbx*mata.xbx)+(matb.xby*mata.ybx);
	matc.ybx=(matb.ybx*mata.xbx)+(matb.yby*mata.xby);
	matc.xby=(matb.xby*mata.yby)+(matb.xbx*mata.ybx);
	matc.yby=(matb.yby*mata.yby)+(matb.ybx*mata.xby);
	matc.xbc+=(matb.xbc*mata.xbx)+(matb.ybc*mata.xby);
	matc.ybc+=(matb.ybc*mata.yby)+(matb.xbc*mata.ybx);
	return matc;
}
function XYMTranslate(offsetX, offsetY) {
	return new XYMatrix(1.0, 0.0, 0.0, 1.0, offsetX, offsetY);
}
function XYMScale(scaleX, scaleY) {
	return new XYMatrix(scaleX, 0.0, 0.0, scaleY, 0.0, 0.0);
}
function XYMRotate(rotation) {
	let cos=Math.cos(rotation);
	let sin=Math.sin(rotation);
	return new XYMatrix(cos, sin, -sin, cos, 0.0, 0.0);
}
function lerp(a, b, t) {
	// Value between `a` and `b` at `t`
	return (a*(1.0-t))+(b*t);
}
function taper(a, b, t) {
	// Step from `a` to `b` by `t`, but never exactly reach `b`
	return lerp(a, b, 1.0-Math.pow(Math.E, -t));
}
function step(a, b, t) {
	// Step from `a` to `b` by at most `t`
	let A=a*1.0;
	let B=b*1.0;
	let T=Math.abs(t);
	if (A>B) {
		A-=T;
		if (A<=B) return B;
	} else {
		A+=T;
		if (A>B) return B;
	}
	return A;
}
function clamp(t, m, M) {
	// Clamp `t` to be within [`m`-`M`]
	return Math.max(m, Math.min(M, t));
}
function lerpXY(a, b, t) {
	// Point across `a` and `b` at `t`
	return new XY(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
}
function taperXY(a, b, t) {
	// Step from `a` to `b` by `t`, but never exactly reach `t`
	return new XY(taper(a.x, b.x, t), taper(a.y, b.y, t));
}
function lerpXYZ(a, b, t) {
	// Point across `a` and `b` at `t`
	return new XYZ(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
}
function taperXYZ(a, b, t) {
	// Step from `a` to `b` by `t`, but never exactly reach `t`
	return new XYZ(taper(a.x, b.x, t), taper(a.y, b.y, t), taper(a.z, b.z, t));
}
function angleXY(a) {
	// Angle of `a` relative to (1, 0)
	if ((a.x==0.0) && (a.y==0.0)) return 0.0;
	if (Math.abs(a.x)>Math.abs(a.y)) {
		return Math.atan(a.y/a.x)+(a.x<0?-Math.PI:0.0);
	} else {
		return -Math.atan(a.x/a.y)+(a.y<0?-Math.PI/2.0:Math.PI/2.0);
	}
}
function normalizedXY(a) {
	let magn=linearDistanceXY(ZeroXY, a);
	if (magn==0.0) return new XY(1.0, 0.0);
	return new XY(a.x/magn, a.y/magn);
}
function fastDistanceXY(a, b) {
	// Distance between `a` and `b` used for comparisons only
	let dA=(a.x-b.x);
	let dB=(a.y-b.y);
	return (dA*dA)+(dB*dB);
}
function linearDistanceXY(a, b) {
	// Euclidean distance between `a` and `b`
	let dA=(a.x-b.x);
	let dB=(a.y-b.y);
	return Math.sqrt((dA*dA)+(dB*dB));
}
function fastDistanceXYZ(a, b) {
	// Distance between `a` and `b` used for comparisons only
	let dA=(a.x-b.x);
	let dB=(a.y-b.y);
	let dC=(a.z-b.z);
	return (dA*dA)+(dB*dB)+(dC*dC);
}
function linearDistanceXYZ(a, b) {
	// Euclidean distance between `a` and `b`
	let dA=(a.x-b.x);
	let dB=(a.y-b.y);
	let dC=(a.z-b.z);
	return Math.sqrt((dA*dA)+(dB*dB)+(dC*dC));
}
function dotProductXY(a, b) {
	// Dot product of `a` and `b`
	return (a.x*b.x)+(a.y*b.y);
}
function Joystick(left, right, Dpad, buttons, gamepad, connected) {
	this.left=left;
	this.right=right;
	this.dpad=dpad;
	this.buttons=buttons;
	this.gamepad=gamepad;
	this.connected=connected;
}
Joystick.prototype.toString=function() {
	let st="Left stick: ";
	st+=this.left.toString();
	st+=", Right stick: ";
	st+=this.right.toString();
	st+=", Dpad: ";
	st+=this.dpad.toString();
	st+=", Buttons: ";
	st+=this.buttons.toString();
	if (this.connected) st+=", Connected";
	return st;
};
function Thumbstick(stick, click) {
	this.stick=stick;
	this.click=click;
}
Thumbstick.prototype.toString=function() {
	return this.stick.toString()+(this.click?"c":"");
};
function Dpad(up, right, left, down) {
	this.up=up;
	this.right=right;
	this.left=left;
	this.down=down;
}
Dpad.prototype.toString=function() {
	let st="";
	if (this.up) st+="U";
	if (this.right) st+="R";
	if (this.left) st+="L";
	if (this.down) st+="D";
	return st;
};
function Buttons(a, b, x, y, lb, rb, lt, rt, start, select, menu) {
	this.a=a;
	this.b=b;
	this.x=x;
	this.y=y;
	this.lb=lb;
	this.rb=rb;
	this.lt=lt;
	this.rt=rt;
	this.start=start;
	this.select=select;
	this.menu=menu;
}
Buttons.prototype.toString=function() {
	let st="";
	if (this.a) st+="A";
	if (this.b) st+="B";
	if (this.x) st+="X";
	if (this.y) st+="Y";
	if (this.lb) st+="L";
	if (this.rb) st+="R";
	if (this.select) st+="s";
	if (this.start) st+="S";
	if (this.menu) st+="M";
	if (this.lt>=.5) st+="zl";
	if (this.rt>=.5) st+="zr";
	return st;
};
function KeyEvent(unsanitizedKeyCode, pressed, fresh) {
	let la=[unsanitizedKeyCode];
	sanitizeKeyCodes(la);
	let correctedKeyCode=la[0];
	this.keyCode=correctedKeyCode;
	this.pressed=(pressed?true:false);
	this.released=!this.pressed;
	this.fresh=fresh;
}
function rgb(r, g, b) {
	return "rgb("+r+","+g+","+b+")";
}
function rgba(r, g, b, a) {
	return "rgba("+r+","+g+","+b+","+a+")";
}
function savePersistentStorage() {
	window.localStorage.setItem("persistent_storage", window.JSON.stringify(persistentStorage));
	window.localStorage.setItem("custom_joystick_layouts", window.JSON.stringify(input.joystickMappings));
}
function loadPersistentStorage() {
	let s=window.localStorage.getItem("persistent_storage");
	if (s!=undefined) {
		persistentStorage=window.JSON.parse(s);
	}
}

// Toolkit functions
async function rdxDialogOK(header, content) {
	alert(header+"\n"+content);
	return 1;
}
async function rdxDialogOKCancel(header, content) {
	let res=confirm(header+"\n"+content);
	return res?1:-1;
}
async function rdxColorPicker(color) {
	var cp=window.document.createElement("input");
	cp.type="color";
	cp.value=color;
	cp.title="Toolkit color selector";
	cp.placeholder="Enter color code...";
	cp.style.position="fixed";
	cp.style.left="0px";
	cp.style.top="0px";
	window.document.body.appendChild(cp);
	interceptUserEvents=false;
	cp.focus();
	cp.click();
	await ({then:function(yes, no) {setTimeout(yes, 100);}});
	await ({then:function(yes, no) {cp.addEventListener("change", yes);  cp.addEventListener("blur", yes);}});
	let res=cp.value;
	cp.type="hidden";
	window.document.body.removeChild(cp);
	cp=undefined;
	interceptUserEvents=true;
	return res;
}
async function rdxCombobox(options) {
	let styler=function(el) {
		let s=el.style;
		s.font="36px OpenDyslexic, sans-serif";
		if (el instanceof HTMLOptGroupElement) {
			s.font="italic 18px OpenDyslexic, sans-serif";
		}
	};
	
	var slc=window.document.createElement("select");
	let opts=[];
	for (let i=0; i<options.length; i++) {
		let ent=options[i];
		let ins=undefined;
		if ((typeof ent)=="string") {
			ins=window.document.createElement("option");
			ins.innerText=ent;
			styler(ins);
		} else if (((typeof ent)=="object") && (ent)) {
			if ("length" in ent) {
				ins=window.document.createElement("optgroup");
				let lbl="";
				if (ent.toString==Array.prototype.toString) lbl=""; else lbl=ent.toString();
				ins.label=lbl;
				for (let j=0; j<ent.length; j++) {
					let cld=window.document.createElement("option");
					cld.innerText=ent[j].toString();
					styler(cld);
					ins.appendChild(cld);
				}
				styler(ins);
			} else {
				let ts=ent.toString();
				ins=window.document.createElement("option");
				ins.innerText=ts;
				styler(ins);
			}
		} else ins=window.document.createElement("hr");
		opts.push(ins);
	}
	for (let i=0; i<opts.length; i++) {
		slc.appendChild(opts[i]);
	}
	slc.title="Toolkit combobox";
	slc.style.position="fixed";
	slc.style.left="0px";
	slc.style.top="0px";
	window.document.body.appendChild(slc);
	interceptUserEvents=false;
	slc.focus();
	slc.click();
	await ({then:function(yes, no) {slc.addEventListener("change", yes);  slc.addEventListener("blur", yes);}});
	let res=slc.value;
	window.document.body.removeChild(slc);
	slc=undefined;
	interceptUserEvents=true;
	return res;
}
