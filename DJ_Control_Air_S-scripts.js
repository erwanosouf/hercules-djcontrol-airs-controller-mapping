var DjControlAirS = {};

DjControlAirS.init  = function(id) {
  DjControlAirS.id = id;

  // extinguish all LEDs
  for (var i = 79; i<79; i++) {
    midi.sendShortMsg(0x90, i, 0x00);
  }

  midi.sendShortMsg(0x90, 0x3B, 0x7f); // headset volume "-" button LED (always on)
  midi.sendShortMsg(0x90, 0x3C, 0x7f); // headset volume "+" button LED (always on)

  if (engine.getValue("[Master]", "headMix") > 0.5) {
    midi.sendShortMsg(0x90, 0x39, 0x7f); // headset "Mix" button LED
  } else {
    midi.sendShortMsg(0x90, 0x3A, 0x7f); // headset "Cue" button LED
  }

  // Set soft-takeover for all Sampler volumes
  for (var i = engine.getValue("[Master]","num_samplers"); i>=1; i--) {
    engine.softTakeover("[Sampler" + i + "]", "pregain", true);
  }

  // Set soft-takeover for all applicable Deck controls
  // Useless as not Controlled by a Script.
  /*
  for (var i = engine.getValue("[Master]","num_decks"); i>=1; i--) {
    engine.softTakeover("[Channel" + i + "]", "volume", true);
    engine.softTakeover("[Channel" + i + "]", "filterHigh", true);
    engine.softTakeover("[Channel" + i + "]", "filterMid", true);
    engine.softTakeover("[Channel" + i + "]", "filterLow", true);
    engine.softTakeover("[Channel" + i + "]", "rate", true);
  }

  engine.softTakeover("[Master]","crossfader", true);
  */
  /*
  engine.connectControl("[Channel1]", "beat_active", "HerculesAir.beatProgressDeckA")
  engine.connectControl("[Channel1]", "play", "HerculesAir.playDeckA")

  engine.connectControl("[Channel2]", "beat_active", "HerculesAir.beatProgressDeckB")
  engine.connectControl("[Channel2]", "play", "HerculesAir.playDeckB")
  */
  print ("DjControlAirS[" + id + "] : initialized.");
};

DjControlAirS.shutdown = function() {
  print('DjControlAirS:Shutdown');
};


DjControlAirS.test = function (channel, control, value, status, group) {
    // your custom code goes here
};

// The button that enables/disables scratching
DjControlAirS.wheelTouch = function (channel, control, value, status, group) {
    var deckNumber = script.deckFromGroup(group);
    if ((status & 0xF0) === 0x90) {    // If button down
        if (value === 0x7F) {  // Some wheels send 0x90 on press and release, so you need to check the value
          var alpha = 1.0 / 8;
          var beta = alpha / 32;
          engine.scratchEnable(deckNumber, 128, 33 + 1/3, alpha, beta);
        }
    } else {    // If button up
        engine.scratchDisable(deckNumber);
    }
};

// The wheel that actually controls the scratching
DjControlAirS.wheelTurn = function (channel, control, value, status, group) {
    var newValue = -(value - 64);
    // In either case, register the movement
    var deckNumber = script.deckFromGroup(group);

    if (engine.isScratching(deckNumber)) {
        engine.scratchTick(deckNumber, newValue);
    } /*else if (engine.getValue(group, "play") == 0) {
  		var new_position = engine.getValue(group,"playposition") + 0.008 * (value == 0x01 ? 1 : -1)
  		if(new_position<0) new_position = 0
  		if(new_position>1) new_position = 1
  		engine.setValue(group, "playposition", new_position);
    }*/ else {
      engine.setValue('[Channel' + deckNumber + ']', 'jog', newValue);
    }
};
