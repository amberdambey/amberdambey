/* 
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * 
 * jlMIDI.js
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

const jlMIDIEventType={
	"NoteOn": "NoteOn", // A note has started playing. Dispatched to the instrument manager. (MIDI: 0b1001[channel], 0b0[note], 0b0[velocity])
	"NoteOff": "NoteOff", // A note has finished playing. Dispatched to either an individual voice or the instrument manager, depending on the polyphony setting. (MIDI: 0b1000[channel], 0b0[note], 0b0[velocity])
	"NotePitchBendChange": "NotePitchBendChange", // (Nonstandard MIDI event) An individual note's pitch bend is changing. Dispatched to each voice.
	"NoteModulationChange": "NoteModulationChange", // (Nonstandard MIDI event) An individual note's modulation is changing. Dispatched to each voice.
	"NoteAfterpressure": "NoteAfterpressure", // A note has been pressed further from when the note first started. (MIDI: 0b1010[channel], 0b0[note], 0b0[velocity])
	"ChannelPitchBendChange": "ChannelPitchBendChange", // A channel's pitch bend is changing. Dispatched to all voices and the instrument manager. (MIDI: 0b1110[channel], 0b0[LSB*7], 0b0[MSB*7])
	"ChannelModulationChange": "ChannelModulationChange", // A channel's modulation is changing. Dispatched to all voices and the instrument manager.
	"ChannelAfterpressure": "ChannelAfterpressure", // Ambiguous description. (MIDI: 0b1101[channel], 0b0[velocity])
	"ChannelVolumeChange": "ChannelVolumeChange", // A channel's volume is changing. Dispatched to an instrument's mixer.
	"ChannelPanChange": "ChannelPanChange", // A channel's pan is changing. Dispatched to an instrument's mixer.
	"ChannelProgramChange": "ChannelProgramChange", // The channel's instrument program is about to be replaced. Dispatched to all objects associated with the instrument **BEFORE** the instrument is reloaded/changed.
	"ChannelBankChange": "ChannelBankChange", // The channel's instrument bank is about to change, although the program will remain the same. Dispatched to all objects associated with the instrument **BEFORE** the instrument is reloaded/changed.
	"ChannelControlChange": "ChannelControlChange", // A channel control change event was encountered. Dispatched to the instrument manager.
	"GlobalTempoChange": "GlobalTempoChange", // The song tempo has changed. This event is dispatched **AFTER** the tempo change is applied. Dispatched to sequencers and automation scripts only.
	"GlobalTimeSigChange": "GlobalTimeSigChange", // The song time signature has changed.
	"MiscEvent": "MiscEvent", // Another event.
	"SystemExclusiveEvent": "SystemExclusiveEvent", // SysEx event
	"MetaEvent": "MetaEvent", // Meta event
};
const jlMIDIChannelControlChangeType={
	"BankSelectMSB": 0, // (GM-2) 121 for melodic instruments, 120 for percussion/drum kit
	"Modulation": 1, // Frequency up/down intensity
	"BreathController": 2, // (GM-2)
	"FootController": 4, // (GM-2) Often a foot pedal
	"PortamentoTime": 5, // (GM-2) Non-polyphonic synthesizers should respond to this
	"DataEntryMSB": 6, // (GM-2)
	"Volume": 7, // Channel volume
	"Pan": 10, // Channel fade/pan
	"Expression": 11, // Channel expression
	"BankSelectLSB": 32, // (GM-2) The instrument bank to use on the next program change event
	"DataEntryLSB": 38, // (GM-2)
	"Pedal01": 64, // Sustain
	"PortamentoState": 65, // (GM-2)
	"Pedal02": 66, // Sostenuto
	"Pedal03": 67, // Soft
	"SoundVar": 70, // (GM-2) Sound variation
	"Timbre": 71, // (GM-2)
	"EnvRelease": 72, // (GM-2) ADSR envelope release time
	"EnvAttack": 73, // (GM-2) ADSR envelope attack time
	"Brightness": 74, // (GM-2) Brightness (synth high-pass strength)
	"EnvDecay": 75, // (GM-2) ADSR envelope decay time
	"VibratoFreq": 76, // (GM-2) Vibrato frequency/rate
	"VibratoDepth": 77, // (GM-2) Vibrato depth/intensity
	"VibratoDelay": 78, // (GM-2) Vibrato delay
	"Effect01": 91, // (GM-2) Reverb
	"Effect02": 92, // (GM-2)
	"Effect03": 93, // (GM-2) Chorus
	"Effect04": 94, // (GM-2) Detune
	"Effect05": 95, // (GM-2) Phaser
	"Unknown100": 100, // (GM-2)
	"Unknown101": 101, // (GM-2)
	"Reset": 121, // Reset all controllers
	"Panic": 123, // All notes off
};
const jlMIDIProgramDisplayTags=[
	[ // 0 (inaccessible)
		"NonstandardPgmNo", // 000 or 401
		"NonstandardPgmNo", // 402
		"NonstandardPgmNo", // 403
		"NonstandardPgmNo", // 404
		"NonstandardPgmNo", // 405
		"NonstandardPgmNo", // 406
		"NonstandardPgmNo", // 407
		"NonstandardPgmNo", // 408
	],
	[ // 1
		"AcousticGrandPno", // 001 GrnPiano
		"WideAcstGrandPno", // 002 WdeGnPno
		"DarkAcstGrandPno", // 003 DrkGnPno
	],
	[ // 2
		"BrigAcstGrandPno", // 004 BritGPno
		"WideBrgAcstGnPno", // 005 WdBrGPno
	],
	[ // 3
		"ElectricGrandPno", // 006 ElGPiano
		"WideElecGrandPno", // 007 WdElGPno
	],
	[ // 4
		"Honky Tonk Piano", // 008 HnkyTonk
		"WideHonkyTonkPno", // 009 WdHnkTnk
	],
	[ // 5
		"ElectricPiano 01", // 010 E. Piano
		"DetunedElecPno01", // 011 DtnE.Pno
		"ElectricPno01Var", // 012 E.PnoVar
		"ClassicElectrPno", // 013 60sE.Pno
	],
	[ // 6
		"ElectricPiano 02", // 014 E.Piano2
		"DetunedElecPno02", // 015 DtnEPno2
		"ElectricPno02Var", // 016 EPnoVar2
		"ElectricPianoLgn", // 017 E.PnoLgn
		"ElectricPianoPhs", // 018 E.PnoPhs
	],
	[ // 7
		"Harpsichord     ", // 019 Hpsicord
		"CoupledHarpsicho", // 020 CplHpscd
		"Wide Harpsichord", // 021 WideHpsc
		"Open Harpsichord", // 022 OpenHpsc
	],
	[ // 8
		"Clavinet", // 023
		"Pulse Clavinet  ", // 024 PlsClvnt
	],
	
	[ // 9
		"Celesta ", // 025
	],
	[ // 10
		"Glockenspiel    ", // 026 Glcknspl
	],
	[ // 11
		"Music Box       ", // 027 MusicBox
	],
	[ // 12
		"Vibraphone      ", // 028 Vibrphne
		"Wet Vibraphone  ", // 029 WetVbphn
	],
	[ // 13
		"Marimba ", // 030
		"Wide Marimba    ", // 031 WdMarimb
	],
	[ // 14
		"Xylophone       ", // 032 Xylophne
	],
	[ // 15
		"Tubular Bells   ", // 033 TblrBell
		"Church Bells    ", // 034 ChrchBll
		"Carillon", // 035
	],
	[ // 16
		"Dulcimer", // 036
	],
	
	[ // 17
		"Drawbar Organ   ", // 037 DrawbOrg
		"Detuned Organ 01", // 038 DtnOrgan
		"60sOrgan", // 039
		"Organ 04", // 040
	],
	[ // 18
		"Percussion Organ", // 041 PercOrgn
		"Detuned Organ 02", // 042 DtnOrgn2
		"Organ 05", // 043
	],
	[ // 19
		"Rock Organ      ", // 044 RockOrgn
	],
	[ // 20
		"Church Organ 01 ", // 045 ChrchOrg
		"Church Organ 02 ", // 046 CrchOrg2
		"Church Organ 03 ", // 047 ChchOrg3
	],
	[ // 21
		"Reed Organ      ", // 048 ReedOrgn
		"Puff Organ      ", // 049 PuffOrgn
	],
	[ // 22
		"French Accordion", // 050 FrnAcrdn
		"ItalianAccordion", // 051 ItlAcrdn
	],
	[ // 23
		"Harmonica       ", // 052 Hrmonica
	],
	[ // 24
		"Bandoneon       ", // 053 Bndoneon
	],
	
	[ // 25
		"Nylon Guitar 01 ", // 054 NylonGtr
		"Ukulele ", // 055
		"OpenNylonGuitar ", // 056 OpenNGtr
		"Nylon Guitar 02 ", // 057 NlnGtr 2
	],
	[ // 26
		"Steel Guitar    ", // 058 SteelGtr
		"12StringSteelGtr", // 059 12StrGtr
		"Mandolin", // 060
		"SteelAndBody    ", // 061 Stl+Body
	],
	[ // 27
		"Jazz Guitar 01  ", // 062 Jazz Gtr
		"Lap Steel Guitar", // 063 LpStlGtr
	],
	[ // 28
		"Clean Guitar    ", // 064 CleanGtr
		"Chorus Guitar   ", // 065 Chrs Gtr
		"Mid Tone Guitar ", // 066 MdTn Gtr
	],
	[ // 29
		"MutedElecGuitar ", // 067 MtdE.Gtr
		"Funk Guitar 01  ", // 068 Funk Gtr
		"Funk Guitar 02  ", // 069 FnkGtr 2
		"Jazz Guitar 02  ", // 070 JazzGtr2
	],
	[ // 30
		"OverdrivenGuitar", // 071 OvrdvGtr
		"Guitar Pinch    ", // 072 GtrPinch
	],
	[ // 31
		"DistortionGuitar", // 073 DstrnGtr
		"Feedback Guitar ", // 074 FdbckGtr
		"DsRtmGtr", // 075
	],
	[ // 32
		"Guitar Harmonics", // 076 GtrHrmnc
		"Guitar Feedback ", // 077 GtrFdbck
	],
	
	[ // 33
		"Acoustic Bass   ", // 078 Bass Gtr
	],
	[ // 34
		"Fingered Bass   ", // 079 FngrBass
		"Finger Slap     ", // 080 FngrSlap
	],
	[ // 35
		"Picked Bass     ", // 081 PickBass
	],
	[ // 36
		"Fretless Bass   ", // 082 FtlsBass
	],
	[ // 37
		"Slap Bass 01    ", // 083 SlapBass
	],
	[ // 38
		"Slap Bass 02    ", // 084 SlpBass2
	],
	[ // 39
		"Synth Bass 01   ", // 085 SynBass1
		"Synth Bass 101  ", // 086 SnBss101
		"Synth Bass 03   ", // 087 SynBass3
		"Clavi Bass      ", // 088 ClavBass
		"Hammer Bass     ", // 089 HmmrBass
	],
	[ // 40
		"Synth Bass 02   ", // 090 SynBass2
		"Synth Bass 04   ", // 091 SynBass4
		"Rubber Bass     ", // 092 RubrBass
		"Attack Pulse    ", // 093 AtkPulse
	],
	
	[ // 41
		"Violin  ", // 094
		"Slow Violin     ", // 095 SlwVioln
	],
	[ // 42
		"Viola   ", // 096
	],
	[ // 43
		"Cello   ", // 097
	],
	[ // 44
		"Contrabass      ", // 098 Cntrabss
	],
	[ // 45
		"Tremolo Strings ", // 099 TrmStrgs
	],
	[ // 46
		"PizzicatoStrings", // 100 Pzzicato
	],
	[ // 47
		"Harp    ", // 101
		"Yangqin ", // 102
	],
	[ // 48
		"Timpani ", // 103
	],
	
	[ // 49
		"String Ensemble ", // 104 Strings 
		"OrchestraStrings", // 105 OrchStgs
		"60s Strings     ", // 106 60sStrgs
	],
	[ // 50
		"SlwStrEn", // 107
	],
	[ // 51
		"SynStr01", // 108
		"SynStr03", // 109
	],
	[ // 52
		"SynStr02", // 110
	],
	[ // 53
		"Choir Aahs 01   ", // 111 ChoirAhs
		"Choir Aahs 02   ", // 112 ChrAahs2
	],
	[ // 54
		"VoiceOoh", // 113
		"Humming ", // 114
	],
	[ // 55
		"Synth Voice     ", // 115 SynVoice
		"Analog Voice    ", // 116 AngVoice
	],
	[ // 56
		"Orchestral Hit  ", // 117 Orch.Hit
		"Bass Hit", // 118
		"6th Hit ", // 119
		"Euro Hit", // 120
	],
	
	[ // 57
		"Trumpet ", // 121
		"Dark Trumpet    ", // 122 DarkTmpt
	],
	[ // 58
		"Trombone"/*+" 01     "*/, // 123
		"Trombone 02     ", // 124 Trombne2
		"Bright Trombone ", // 125 BghTmbne
	],
	[ // 59
		"Tuba    ", // 126
	],
	[ // 60
		"Muted Trumpet 01", // 127 MuteTmpt
		"Muted Trumpet 02", // 128 MuteTpt2
	],
	[ // 61
		"French Horn 01  ", // 129 FrnchHrn
		"French Horn 02  ", // 130 FrncHrn2
	],
	[ // 62
		"Brass Section 01", // 131 BrassSec
		"Brass Section 02", // 132 BrssSec2
	],
	[ // 63
		"Synth Brass 01  ", // 133 SynBrass
		"Synth Brass 03  ", // 134 SynBrss3
		"Analog Brass 01 ", // 135 AngBrass
		"JumpBrss", // 136
	],
	[ // 64
		"Synth Brass 02  ", // 137 SynBrss2
		"Synth Brass 04  ", // 138 SynBrss4
		"Analog Brass 02 ", // 139 AngBrss2
	],
	
	[ // 65
		"Soprano Sax     ", // 140 Spor.Sax
	],
	[ // 66
		"Alto Sax", // 141
	],
	[ // 67
		"TenorSax", // 142
	],
	[ // 68
		"Baritone Sax    ", // 143 Brit.Sax
	],
	[ // 69
		"Oboe    ", // 144
	],
	[ // 70
		"English Horn    ", // 145 Eng.Horn
	],
	[ // 71
		"Bassoon ", // 146
	],
	[ // 72
		"Clarinet", // 147
	],
	
	[ // 73
		"Piccolo ", // 148
	],
	[ // 74
		"Flute   ", // 149
	],
	[ // 75
		"Recorder", // 150
	],
	[ // 76
		"PanFlute", // 151
	],
	[ // 77
		"Blown Bottle    ", // 152 BlwnBtl 
	],
	[ // 78
		"Shakuhachi      ", // 153 Shkhachi
	],
	[ // 79
		"Whistle ", // 154
	],
	[ // 80
		"Ocarina ", // 155
	],
	
	[ // 81
		"Square Lead     ", // 156 Sqr.Lead
		"Square Wave     ", // 157 Sqr.Wave
		"SineWave", // 158
	],
	[ // 82
		"Saw Lead", // 159
		"Saw Wave", // 160
		"Doctor Solo     ", // 161 DoctorSl
		"Natural Lead    ", // 162 Ntl.Lead
		"Sequenced Saw   ", // 163 Seq. Saw
	],
	[ // 83
		"Synth Calliope  ", // 164 SyntClpe
	],
	[ // 84
		"Chiffer Lead    ", // 165 ChiffrLd
	],
	[ // 85
		"Charang ", // 166
		"WireLead", // 167
	],
	[ // 86
		"Solo Synth Vox  ", // 168 SlSynVox
	],
	[ // 87
		"5th Saw Wave    ", // 169 5th Saw 
	],
	[ // 88
		"Bass and Lead   ", // 170 Bass+Ld 
		"Delayed Lead    ", // 171 Delay.Ld
	],
	
	[ // 89
		/*"New Age Pad     ", */ "Fantastia Pad   ", // 172 NewAgePd
	],
	[ // 90
		"Warm Pad", // 173
		"Sine Pad", // 174
	],
	[ // 91
		"Polysynth Pad   ", // 175 PlysynPd
	],
	[ // 92
		"Space Voice Pad ", // 176 SpcVcPad
		"Itopia  ", // 177
	],
	[ // 93
		"Bowed Glass Pad ", // 178 BowGlsPd
	],
	[ // 94
		"MetalPad", // 179
	],
	[ // 95
		"Halo Pad", // 180
	],
	[ // 96
		"SweepPad", // 181
	],
	
	[ // 97
		"Ice Rain", // 182
	],
	[ // 98
		"Soundtrack      ", // 183 Sndtrack
	],
	[ // 99
		"Crystal ", // 184
		"Synth Mallet    ", // 185 SynthMlt
	],
	[ // 100
		"Atmosphere      ", // 186 Atmsphre
	],
	[ // 101
		"Brightness      ", // 187 Brgtness
	],
	[ // 102
		"Goblin  ", // 188
	],
	[ // 103
		"EchoDrop", // 189
		"EchoBell", // 190
		"Echo Pan", // 191
	],
	[ // 104
		"StarThem", // 192
	],
	
	[ // 105
		"Sitar 01", // 193
		"Sitar 02", // 194
	],
	[ // 106
		"Banjo   ", // 195
	],
	[ // 107
		"Shamisen", // 196
	],
	[ // 108
		"Koto    ", // 197
		"Taisho Koto     ", // 198 Tshgto
	],
	[ // 109
		"Kalimba ", // 199
	],
	[ // 110
		"Bagpipe ", // 200
	],
	[ // 111
		"Fiddle  ", // 201
	],
	[ // 112
		"Shanai  ", // 202
	],
	
	[ // 113
		"Chimes  ", // 203
	],
	[ // 114
		"Agogo   ", // 204
	],
	[ // 115
		"Steel Drums     ", // 205 StlDrums
	],
	[ // 116
		"Woodblock       ", // 206 Wdblock 
		"Castinet", // 207
	],
	[ // 117
		"Taiko   ", // 208
		"BassDrum", // 209
	],
	[ // 118
		"Melodic Tom 01  ", // 210 MldcToms
		"Melodic Tom 02  ", // 211 MldcTom2
	],
	[ // 119
		"Synth Drum      ", // 212 SyntDrum
		"808 Tom ", // 213
		"ElectricPercussn", // 214 E.Percsn
	],
	[ // 120
		"Reverse Cymbal  ", // 215 Rvs.Cymb
	],
	
	[ // 121
		"GuitarFret   SFX", // 216 GtrFrtFX
		"GuitarCut    SFX", // 217 GtrCutFX
		"StringSlap   SFX", // 218 StrSlpFX
	],
	[ // 122
		"Breath       SFX", // 219 BreathFX
		"FluteKeyClickSFX", // 220 FKeyCkFX
	],
	[ // 123
		"Seashore     SFX", // 221 Shore FX
		"Rain         SFX", // 222 Rain  FX
		"Thunder      SFX", // 223 ThnudrFX
		"Wind         SFX", // 224 Wind  FX
		"Stream       SFX", // 225 StreamFX
		"Bubble       SFX", // 226 BubbleFX
	],
	[ // 124
		"Bird 01      SFX", // 227 Bird  FX
		"Dog          SFX", // 228 Dog   FX
		"HorseGallop  SFX", // 229 Horse FX
		"Bird 02      SFX", // 230 Bird2 FX
	],
	[ // 125
		"Telephone 01 SFX", // 231 PhnRngFX
		"Telephone 02 SFX", // 232 PnRng2FX
		"DoorCreaking SFX", // 233 DorOpnFX
		"DoorClosing  SFX", // 234 DorClsFX
		"Scratch      SFX", // 235 ScrtchFX
		"WindChime    SFX", // 236 WndChmFX
	],
	[ // 126
		"Helicopter   SFX", // 237 HlcptrFX
		"CarEngine    SFX", // 238 EngineFX
		"CarStop      SFX", // 239 CrBrksFX
		"CarPass      SFX", // 240 CrPassFX
		"CarCrash     SFX", // 241 CrCrshFX
		"Siren        SFX", // 242 Siren FX
		"Train        SFX", // 243 Train FX
		"Jetplane     SFX", // 244 JetplnFX
		"Starship     SFX", // 245 SpcshpFX
		"Burst        SFX", // 246 Burst FX
	],
	[ // 127
		"Applause     SFX", // 247 ApplseFX
		"Laughter     SFX", // 248 Laugh FX
		"Screaming    SFX", // 249 ScreamFX
		"Punch        SFX", // 250 Punch FX
		"HeartBeat    SFX", // 251 Heart FX
		"Footstep     SFX", // 252 Step  FX
	],
	[ // 128
		"GunShot      SFX", // 253 GunShtFX
		"MachineGun   SFX", // 254 MchnGnFX
		"LaserGun     SFX", // 255 RayGunFX
		"Explosion    SFX", // 256 ExplsnFX
	],
	[ // Unsequenced/uncategorized
		"Sampled 01      ", // 300
		"Sampled 02      ", // 301
		"Sampled 03      ", // 302
		"Sampled Loop    ", // 303
		"Sampled Reverse ", // 304
		"Sampled FX 01   ", // 305
		"Sampled FX 02   ", // 306
		"Sampled FX 03   ", // 307
		"Sampled FX 04   ", // 308
		"Sampled FX 05   ", // 309
	]
];
const jlMIDINote={
	"C": (0*12)+0,
	"Cs": (0*12)+1,
	"Df": (0*12)+1,
	"D": (0*12)+2,
	"Ds": (0*12)+3,
	"Ef": (0*12)+3,
	"E": (0*12)+4,
	"F": (0*12)+5,
	"Fs": (0*12)+6,
	"Gf": (0*12)+6,
	"G": (0*12)+7,
	"Gs": (0*12)+8,
	"Af": (0*12)+8,
	"A": (0*12)+9,
	"As": (0*12)+10,
	"Bf": (0*12)+10,
	"B": (0*12)+11,
	
	"C0": (1*12)+0,
	"Cs0": (1*12)+1,
	"Df0": (1*12)+1,
	"D0": (1*12)+2,
	"Ds0": (1*12)+3,
	"Ef0": (1*12)+3,
	"E0": (1*12)+4,
	"F0": (1*12)+5,
	"Fs0": (1*12)+6,
	"Gf0": (1*12)+6,
	"G0": (1*12)+7,
	"Gs0": (1*12)+8,
	"Af0": (1*12)+8,
	"A0": (1*12)+9,
	"As0": (1*12)+10,
	"Bf0": (1*12)+10,
	"B0": (1*12)+11,
	
	"C1": (2*12)+0,
	"Cs1": (2*12)+1,
	"Df1": (2*12)+1,
	"D1": (2*12)+2,
	"Ds1": (2*12)+3,
	"Ef1": (2*12)+3,
	"E1": (2*12)+4,
	"F1": (2*12)+5,
	"Fs1": (2*12)+6,
	"Gf1": (2*12)+6,
	"G1": (2*12)+7,
	"Gs1": (2*12)+8,
	"Af1": (2*12)+8,
	"A1": (2*12)+9,
	"As1": (2*12)+10,
	"Bf1": (2*12)+10,
	"B1": (2*12)+11,
	
	"C2": (3*12)+0,
	"Cs2": (3*12)+1,
	"Df2": (3*12)+1,
	"D2": (3*12)+2,
	"Ds2": (3*12)+3,
	"Ef2": (3*12)+3,
	"E2": (3*12)+4,
	"F2": (3*12)+5,
	"Fs2": (3*12)+6,
	"Gf2": (3*12)+6,
	"G2": (3*12)+7,
	"Gs2": (3*12)+8,
	"Af2": (3*12)+8,
	"A2": (3*12)+9,
	"As2": (3*12)+10,
	"Bf2": (3*12)+10,
	"B2": (3*12)+11,
	
	"C3": (4*12)+0,
	"Cs3": (4*12)+1,
	"Df3": (4*12)+1,
	"D3": (4*12)+2,
	"Ds3": (4*12)+3,
	"Ef3": (4*12)+3,
	"E3": (4*12)+4,
	"F3": (4*12)+5,
	"Fs3": (4*12)+6,
	"Gf3": (4*12)+6,
	"G3": (4*12)+7,
	"Gs3": (4*12)+8,
	"Af3": (4*12)+8,
	"A3": (4*12)+9,
	"As3": (4*12)+10,
	"Bf3": (4*12)+10,
	"B3": (4*12)+11,
	
	"C4": (5*12)+0,
	"Cs4": (5*12)+1,
	"Df4": (5*12)+1,
	"D4": (5*12)+2,
	"Ds4": (5*12)+3,
	"Ef4": (5*12)+3,
	"E4": (5*12)+4,
	"F4": (5*12)+5,
	"Fs4": (5*12)+6,
	"Gf4": (5*12)+6,
	"G4": (5*12)+7,
	"Gs4": (5*12)+8,
	"Af4": (5*12)+8,
	"A4": (5*12)+9,
	"As4": (5*12)+10,
	"Bf4": (5*12)+10,
	"B4": (5*12)+11,
	
	"C5": (6*12)+0,
	"Cs5": (6*12)+1,
	"Df5": (6*12)+1,
	"D5": (6*12)+2,
	"Ds5": (6*12)+3,
	"Ef5": (6*12)+3,
	"E5": (6*12)+4,
	"F5": (6*12)+5,
	"Fs5": (6*12)+6,
	"Gf5": (6*12)+6,
	"G5": (6*12)+7,
	"Gs5": (6*12)+8,
	"Af5": (6*12)+8,
	"A5": (6*12)+9,
	"As5": (6*12)+10,
	"Bf5": (6*12)+10,
	"B5": (6*12)+11,
	
	"C6": (7*12)+0,
	"Cs6": (7*12)+1,
	"Df6": (7*12)+1,
	"D6": (7*12)+2,
	"Ds6": (7*12)+3,
	"Ef6": (7*12)+3,
	"E6": (7*12)+4,
	"F6": (7*12)+5,
	"Fs6": (7*12)+6,
	"Gf6": (7*12)+6,
	"G6": (7*12)+7,
	"Gs6": (7*12)+8,
	"Af6": (7*12)+8,
	"A6": (7*12)+9,
	"As6": (7*12)+10,
	"Bf6": (7*12)+10,
	"B6": (7*12)+11,
	
	"C7": (8*12)+0,
	"Cs7": (8*12)+1,
	"Df7": (8*12)+1,
	"D7": (8*12)+2,
	"Ds7": (8*12)+3,
	"Ef7": (8*12)+3,
	"E7": (8*12)+4,
	"F7": (8*12)+5,
	"Fs7": (8*12)+6,
	"Gf7": (8*12)+6,
	"G7": (8*12)+7,
	"Gs7": (8*12)+8,
	"Af7": (8*12)+8,
	"A7": (8*12)+9,
	"As7": (8*12)+10,
	"Bf7": (8*12)+10,
	"B7": (8*12)+11,
	
	"C8": (9*12)+0,
	"Cs8": (9*12)+1,
	"Df8": (9*12)+1,
	"D8": (9*12)+2,
	"Ds8": (9*12)+3,
	"Ef8": (9*12)+3,
	"E8": (9*12)+4,
	"F8": (9*12)+5,
	"Fs8": (9*12)+6,
	"Gf8": (9*12)+6,
	"G8": (9*12)+7,
	"Gs8": (9*12)+8,
	"Af8": (9*12)+8,
	"A8": (9*12)+9,
	"As8": (9*12)+10,
	"Bf8": (9*12)+10,
	"B8": (9*12)+11,
	
	"C9": (10*12)+0,
	"Cs9": (10*12)+1,
	"Df9": (10*12)+1,
	"D9": (10*12)+2,
	"Ds9": (10*12)+3,
	"Ef9": (10*12)+3,
	"E9": (10*12)+4,
	"F9": (10*12)+5,
	"Fs9": (10*12)+6,
	"Gf9": (10*12)+6,
	"G9": (10*12)+7
};
const jlMIDIPercusson={
	"HighQ": 24+3,
	"Slap": 24+4,
	"ScratchPush": 24+5,
	"ScratchPull": 24+6,
	"Sticks": 24+7,
	"SquareClick": 24+8,
	"MetronomeClick": 24+9,
	"MetronomeBell": 24+10,
	"KickDrum02": 24+11,
	
	"KickDrum01": 36,
	"SideStick": 36+1,
	"SnareDrum01": 36+2,
	"HandClap": 36+3,
	"SnareDrum02": 36+4,
	"LowTom02": 36+5,
	"ClosedHiHat": 36+6,
	"LowTom01": 36+7,
	"PedalHiHat": 36+8,
	"MidTom02": 36+9,
	"OpenHiHat": 36+10,
	"MidTom01": 36+11,
	
	"HighTom02": 48,
	"CrashCymbal": 48+1,
	"HighTom01": 48+2,
	"RideCymbal": 48+3,
	"ChineseCymbal": 48+4,
	"RideBell": 48+5,
	"Tambourine": 48+6,
	"SplashCymbal": 48+7,
	"Cowbell": 48+8,
	"CrashCymbal02": 48+9,
	"Vibraslap": 48+10,
	"RideCymbal02": 48+11,
	
	"HighBongo": 60,
	"LowBongo": 60+1,
	"MuteHighConga": 60+2,
	"OpenHighConga": 60+3,
	"LowConga": 60+4,
	"HighTimbale": 60+5,
	"LowTimbale": 60+6,
	"HighAgogo": 60+7,
	"LowAgogo": 60+8,
	"Cabasa": 60+9,
	"Maracas": 60+10,
	"ShortWhistle": 60+11,
	
	"LongWhistle": 72,
	"ShortGuiro": 72+1,
	"LongGuiro": 72+2,
	"Claves": 72+3,
	"HighWoodblock": 72+4,
	"LowWoodblock": 72+5,
	"MuteCuica": 72+6,
	"OpenCuica": 72+7,
	"MuteTriangle": 72+8,
	"OpenTriangle": 72+9,
	"Shaker": 72+10,
	"Jingle": 72+11,
	
	"BellTree": 84,
	"Castinets": 84+1,
	"MuteSurdo": 84+2,
	"OpenSurdo": 84+3,
	
	"Reserved01": 103,
	"Reserved02": 104,
	"Reserved03": 105,
	"Reserved04": 106,
	"Reserved05": 107
};
const jlMIDIDrumKit={
	"Standard": 1,
	"Room": 9,
	"Power": 17,
	"Electronic": 25,
	"TR808": 26,
	"Jazz": 33,
	"Brush": 41,
	"Orchestra": 49,
	"SoundFX": 57
};
class jlMIDIEvent {
	timestamp=0.0; // Timestamp of the event in seconds
	tick=0; // Epoch (always zero when constructed)
	midiEventType=jlMIDIEventType.MiscEvent;
	midiChannel=1; // (1-16)
	midiTrack=0; // (0-9999)
	midiProgram=1; // (1-128) Implied
	midiPitch=0; // (0-127) first byte
	midiVelocity=0; // (0-127) second byte
	eventData={};
	
	constructor(time, type, chan, track, prog, pitch, vel, dat) {
		this.timestamp=time;
		this.midiEventType=type;
		this.midiChannel=chan;
		this.midiTrack=track;
		this.midiProgram=prog;
		this.midiPitch=pitch;
		this.midiVelocity=vel;
		this.eventData=dat;
	}
	
	// Convert the event to MIDI bytes
	toMIDI() {
		let bytes=[];
		
		switch (this.midiEventType) {
			case jlMIDIEventType.NoteOn: if (true) {
				bytes.push(0b10010000+(this.midiChannel-1));
				bytes.push(this.midiPitch);
				bytes.push(this.midiVelocity);
				break;
			}
			case jlMIDIEventType.NoteOff: if (true) {
				bytes.push(0b10000000+(this.midiChannel-1));
				bytes.push(this.midiPitch);
				bytes.push(this.midiVelocity);
				break;
			}
			case jlMIDIEventType.NoteAfterpressure: if (true) {
				bytes.push(0b10100000+(this.midiChannel-1));
				bytes.push(this.midiPitch);
				bytes.push(this.midiVelocity);
				break;
			}
			case jlMIDIEventType.ChannelPitchBendChange: if (true) {
				//bytes.push(0b01111111);
				bytes.push(0b11100000+(this.midiChannel-1));
				let bendWord=this.eventData.bend+1.0;
				bendWord*=8192.0;
				bendWord=Math.round(bendWord);
				bytes.push((bendWord   )&0b01111111);
				bytes.push((bendWord>>7)&0b01111111);
				break;
			}
			case jlMIDIEventType.ChannelAfterpressure: if (true) {
				bytes.push(0b11010000+(this.midiChannel-1));
				bytes.push(this.midiVelocity);
				break;
			}
			case jlMIDIEventType.ChannelProgramChange: if (true) {
				//if (this.tick>32)
				//bytes.push(0b01111111);
				bytes.push(0b11000000+(this.midiChannel-1));
				bytes.push(this.midiPitch);
				break;
			}
			case jlMIDIEventType.ChannelControlChange: if (true) {
				//bytes.push(0b01111111);
				bytes.push(0b10110000+(this.midiChannel-1));
				bytes.push(this.midiPitch);
				bytes.push(this.midiVelocity);
				break;
			}
			case jlMIDIEventType.SystemExclusiveEvent: if (true) {
				bytes.push(0b01111111);
				break;
			}
			default: if (true) {
				bytes.push(0b01111111);
				break;
			}
		}
		
		return bytes;
	}
}
class jlMIDITempoData {
	effectiveOnTick=0; // Events at and after this tick are scaled by this data.
	timestampAtTick=0.0; // Timestamp in seconds at the effective tick
	secondsPerTick=1.0; // Length of each tick in seconds
	
	constructor(eoT, tat, spt) {
		this.effectiveOnTick=eoT;
		this.timestampAtTick=tat;
		this.secondsPerTick=spt;
	}
}
async function jlParseMIDI(url) {
	let MidiFormat=-1; // 0: One-track, 1: Multiple tracks in one sequence, 2: Multiple sequences, 3: Multiple sequences with multiple tracks each
	let MidiTrackCount=0; // Number of tracks (Format=1) or sequences (Format=2|3)
	var MidiTiming=0; // <32768: ticks per fourth note, >=32768: ticks per frame
	var MidiTempoData=[];
	
	let tracks=[]; // MIDI tracks
	
	let fet=await fetch(url);
	var abf=await fet.arrayBuffer();
	var data=new DataView(abf);
	
	let jump=[]; // Jump pointer stack for length-dependent operations
	var b=0; // Byte index
	
	// Functions related to reading the MIDI file
	var next=function() { // Read 1 byte
		if (b>=abf.byteLength) {
			// Overflow case
			let byte=((b%32)==0)?0b10000000:0b00000000;
			b++;
			return byte;
		}
		let byte=data.getUint8(b);
		b++;
		return byte;
	};
	var next16be=function() { // Read a big-endian 16-bit integer
		let word=(next()<<8)|(next());
		return word;
	};
	var next32be=function() { // Read a big-endian 32-bit integer
		let word=(((next()<<8)|next()<<8)|next()<<8)|next();
		return word;
	};
	var nextVlq=function() { // Read the next variable-length quantity (VLQ)
		let val=0;
		for (let lmt=0; lmt<4; lmt++) {
			let bt=next();
			let vA=bt&0b01111111;
			
			val=val<<7;
			val+=vA;
			
			if (bt<128) break;
		}
		return val;
	};
	
	// Functions related to converting data
	var ticksToSeconds=function(ticks) { // Convert ticks into seconds
		return ticks;
	};
	
	// Header
	if (true) {
		// MThd
		let shouldBeMThd="";
		for (let i=0; i<4; i++) {
			shouldBeMThd+=String.fromCharCode(next());
		}
		
		if (shouldBeMThd!="MThd") {
			throw new DOMException("Not a MIDI file!");
		}
		
		jump.push(next32be()+b);
		
		// Format
		MidiFormat=next16be();
		MidiTrackCount=next16be();
		MidiTiming=next16be();
		
		b=jump.pop();
		
		console.log("Track arrangement: "+MidiFormat);
		console.log("Track count: "+MidiTrackCount);
		console.log("Event timecode format: "+MidiTiming);
	}
	
	// Tracks
	let trackIndex=0;
	while (b<abf.byteLength) {
		if (true) {
			// MTrk
			let shouldBeMTrk="";
			for (let i=0; i<4; i++) {
				shouldBeMTrk+=String.fromCharCode(next());
			}
			
			if (shouldBeMTrk!="MTrk") {
				throw new DOMException("Invalid chunk header at offset "+b+" (0x"+b.toString(16)+"). Expected \"MTrk\", read "+shouldBeMTrk);
			}
		}
		
		let track={"label": undefined, "events": [], "textData": [], "finalTick": 0};
		let tLength=next32be();
		
		jump.push(tLength+b);
		
		// Read events
		let tick=0;
		let trackEnd=jump[jump.length-1];
		while (b<jump[jump.length-1]) {
			let deltaStep=nextVlq();
			tick+=deltaStep;
			
			let skipEvent=false; // Set to TRUE to exclude this event from the sequence
			let skipTrack=false; // Set to TRUE to skip to the next track
			let jly=new jlMIDIEvent(0.0, jlMIDIEventType.MiscEvent, 1, 0, 1, 0, 0, {});
			jly.midiTrack=trackIndex;
			jly.tick=tick;
			jly.timestamp=ticksToSeconds(tick);
			
			jly.midiEventType=jlMIDIEventType.MiscEvent;
			jly.midiChannel=1; // (1-16)
			jly.midiProgram=1; // (1-128) Implied
			jly.midiPitch=0; // (0-127) first byte
			jly.midiVelocity=0; // (0-127) second byte
			jly.eventData={};
			jly.rawMidiData=[];
			let eventStartingByte=b;
			
			// Check the event type
			let ftB=next(); // First byte
			
			let ln=(ftB>>4); // Lower nybble
			let un=(ftB&0b00001111); // Upper nybble
			switch (ln) {
				case 0b0000:
				case 0b0001:
				case 0b0010:
				case 0b0011:
				case 0b0100:
				case 0b0101:
				case 0b0110:
				case 0b0111:
					console.warn("Possible missed byte at offset "+b+" (0x"+b.toString(16)+"). (read 0x"+(ftB.toString(16))+")");
					break;
				case 0b1000: if (true) { // Note off
					jly.midiEventType=jlMIDIEventType.NoteOff;
					jly.midiChannel=un+1;
					jly.midiPitch=next();
					jly.midiVelocity=next();
					break;
				}
				case 0b1001: if (true) { // Note on
					jly.midiEventType=jlMIDIEventType.NoteOn;
					jly.midiChannel=un+1;
					jly.midiPitch=next();
					jly.midiVelocity=next();
					break;
				}
				case 0b1010: if (true) { // Afterpressure
					jly.midiEventType=jlMIDIEventType.NoteAfterpressure;
					jly.midiChannel=un+1;
					jly.midiPitch=next();
					jly.midiVelocity=next();
					break;
				}
				case 0b1011: if (true) { // Control change
					jly.midiEventType=jlMIDIEventType.ChannelControlChange;
					jly.midiChannel=un+1;
					jly.midiPitch=next();
					jly.midiVelocity=next();
					break;
				}
				case 0b1100: if (true) { // Program change
					jly.midiEventType=jlMIDIEventType.ChannelProgramChange;
					jly.midiChannel=un+1;
					jly.midiPitch=next();
					break;
				}
				case 0b1101: if (true) { // Channel afterpressure
					jly.midiEventType=jlMIDIEventType.ChannelAfterpressure;
					jly.midiChannel=un+1;
					jly.midiPitch=next();
					jly.midiVelocity=next();
					skipEvent=true;
					break;
				}
				case 0b1110: if (true) { // Pitch bend
					jly.midiEventType=jlMIDIEventType.ChannelPitchBendChange;
					jly.midiChannel=un+1;
					jly.eventData.bend=((next()|(next()<<7))/8192.0)-1.0;
					break;
				}
				case 0b1111: if (true) {
					if (ln==0) { // System-exclusive
						jly.midiEventType=jlMIDIEventType.SystemExclusiveEvent;
						let sexSize=next32be(); // big sex
						jump.push(sexSize+b);
						jly.eventData.sysExPayload=[0xf0];
						for (let q=0; q<sexSize; q++) {
							jly.eventData.sysExPayload.push(next());
						}
						b=jump.pop();
					} else if (ln==7) { // Headerless sysex
						jly.midiEventType=jlMIDIEventType.SystemExclusiveEvent;
						let sexSize=nextVlq(); // bigger sex :O
						jump.push(sexSize+b);
						jly.eventData.sysExPayload=[];
						for (let q=0; q<sexSize; q++) {
							jly.eventData.sysExPayload.push(next());
						}
						b=jump.pop();
					} else if (ln==15) { // Track metadata
						let nxb=next(); // Next byte
						let mSz=nextVlq(); // Metadata payload size
						jump.push(mSz+b);
						
						let bytes=[];
						for (let q=0; q<mSz; q++) {
							bytes.push(next());
						}
						jly.midiEventType=jlMIDIEventType.MetaEvent;
						jly.eventData.metaType=nxb;
						jly.eventData.metaPayload=bytes;
						
						b=jump.pop();
						
						// Process events
						if (nxb==0x2f) { // End-of-track
							track.finalTick=tick;
						} else if (nxb==0x51) { // Tempo
							let microsecondsPerTick=0;
							for (let kq=0; kq<mSz; kq++) {
								microsecondsPerTick=microsecondsPerTick<<8;
								microsecondsPerTick+=bytes[kq];
							}
							
							if (MidiTiming<32768) {
								// MIDI timing is in ticks per quarter note
								microsecondsPerTick/=MidiTiming;
							} else {
								// Negative SMPTE
								let nsmpte=(MidiTiming>>8)&0b01111111;
								nsmpte=(nsmpte^0b01111111)+1;
								let frameRate=24.0;
								if (nsmpte==24) frameRate=24.0;
								if (nsmpte==25) frameRate=25.0;
								if (nsmpte==29) frameRate=29.97;
								if (nsmpte==30) frameRate=30.0;
								
								// Sample resolution
								let sampRes=(MidiTiming&0b11111111);
								if (sampRes==0) sampRes=256; // Avoid division by zero
								microsecondsPerTick=(frameRate*1000000.0)/(sampRes*1.0);
							}
							jly.midiEventType=jlMIDIEventType.GlobalTempoChange;
							jly.eventData={
								"microsecondsPerTick": microsecondsPerTick,
								"ticksPerQuarterNote": MidiTiming
							};
							let timeScaler=1.0;
							MidiTempoData.push(new jlMIDITempoData(tick, 0.0, microsecondsPerTick/(1000000.0*timeScaler)));
						} else if (nxb==0x58) { // Timesig
							jly.midiEventType=jlMIDIEventType.GlobalTimeSigChange;
							jly.midiPitch=bytes[0];
							jly.midiVelocity=1<<(bytes[1]&0b0111);
							jly.eventData.midiClocksPerMTick=bytes[2];
						}
					}
					break;
				}
				default: if (true) {
					//throw new DOMException("Illegal event type encountered at offset "+b+" (0x"+b.toString(16)+"). Read "+ln);
					b++;
					while (next()<128) {
						if (b>=trackEnd) {
							skipTrack=true;
							break;
						}
					}
					b--;
					skipEvent=true;
					break;
				}
			}
			
			// Exit here if the track is skipped
			if (skipTrack) break;
			
			// Save the raw bytes
			let eventByteLength=b-eventStartingByte; // Store the length of the event
			jly.rawMidiData.length=eventByteLength;
			for (let xe=0; xe<eventByteLength; xe++) {
				jly.rawMidiData[xe]=data.getUint8(eventStartingByte+xe); // Write the raw data
			}
			
			if (!skipEvent) track.events.push(jly);
		}
		
		b=jump.pop();
		
		if (tick>=4503599627370496) console.warn("Warning! This sequence stores timecodes which are too large to be represented as floating-point values while preserving accuracy. The sequence may sound \"jittery\" as a result.");
		
		// Track metadata
		
		// Track label
		track.label="";
		for (let g=0; g<track.events.length; g++) {
			let ev=track.events[g];
			if (ev.midiEventType==jlMIDIEventType.MetaEvent) {
				if (([0x01, 0x03, 0x04]).indexOf(ev.eventData.metaType)>-1) {
					track.label=String.fromCharCode.apply(String.fromCharCode, ev.eventData.metaPayload);
					break;
				}
			}
		}
		console.log("Track "+trackIndex+": "+track.label);
		
		// Track instrument name
		for (let g=0; g<track.events.length; g++) {
			let ev=track.events[g];
			if (ev.midiEventType==jlMIDIEventType.MetaEvent) {
				if (ev.eventData.metaType==0x04) {
					track.instrumentName=String.fromCharCode.apply(String.fromCharCode, ev.eventData.metaPayload);
					break;
				}
			}
		}
		
		// Track name
		for (let g=0; g<track.events.length; g++) {
			let ev=track.events[g];
			if (ev.midiEventType==jlMIDIEventType.MetaEvent) {
				if (ev.eventData.metaType==0x03) {
					track.trackName=String.fromCharCode.apply(String.fromCharCode, ev.eventData.metaPayload);
					break;
				}
			}
		}
		
		// Misc. text
		for (let g=0; g<track.events.length; g++) {
			let ev=track.events[g];
			if (ev.midiEventType==jlMIDIEventType.MetaEvent) {
				if (([0x01, 0x02, 0x05, 0x06, 0x07]).indexOf(ev.eventData.metaType)>-1) {
					track.textData.push((["Text", "Copyright", "Lyric", "Marker", "Cue"])[([0x01, 0x02, 0x05, 0x06, 0x07]).indexOf(ev.eventData.metaType)]+": "+String.fromCharCode.apply(String.fromCharCode, ev.eventData.metaPayload));
					console.log(track.textData[track.textData.length-1]);
				}
			}
		}
		
		// Tracky track things
		tracks[trackIndex]=track;
		
		trackIndex++;
		if (trackIndex>=MidiTrackCount) break;
	}
	
	// Sort **ALL** events
	let allEvents=[];
	for (let y=0; y<tracks.length; y++) {
		let track=tracks[y];
		for (let x=0; x<track.events.length; x++) {
			allEvents.push(track.events[x]);
		}
	}
	
	allEvents.sort(function(a, b) {return a.tick-b.tick;});
	
	// Scale tempo of all events
	let lastTick=0;
	let elapsed=0.0;
	let tempoChangeIndex=0;
	for (let e=0; e<allEvents.length; e++) {
		// TODO: optimize
		let currentTempoData=MidiTempoData[tempoChangeIndex];
		let nextTempoData=undefined;
		let lastChange=false;
		if (tempoChangeIndex<(MidiTempoData.length-1)) nextTempoData=MidiTempoData[tempoChangeIndex+1]; else lastChange=true;
		
		let jly=allEvents[e];
		
		if (!lastChange) if (jly.tick>=nextTempoData.effectiveOnTick) {
			tempoChangeIndex++;
		}
		
		jly.timestamp=elapsed+((jly.tick-lastTick)*currentTempoData.secondsPerTick);
		lastTick=jly.tick;
		elapsed=jly.timestamp;
	}
	
	return {
		"tracks": tracks,
		"duration": elapsed
	};
}
function jlFreqToPitch(hz) {
	return (Math.log2(hz/440.0)*12.0)+69.0;
}
function jlPitchToFreq(mid) {
	return Math.pow(2.0, (mid-69.0)/12.0)*440.0;
}
function jlPitchToString(mid, errDigits) {
	let pitch=Math.round(mid);
	let err=mid-pitch;
	let octave=Math.floor(pitch/12);
	let note=pitch-(octave*12);
	let notes=["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
	let errText="";
	if (errDigits>0) {
		errText+=(err>=0)?"+":"-";
		errText+=Math.abs(err).toFixed(errDigits);
	}
	return notes[note]+((octave-1).toString())+errText;
}

export {jlMIDIEventType, jlMIDIChannelControlChangeType, jlMIDIProgramDisplayTags, jlMIDINote, jlMIDIPercusson, jlMIDIDrumKit, jlMIDIEvent, jlMIDITempoData, jlParseMIDI, jlFreqToPitch, jlPitchToFreq, jlPitchToString};
