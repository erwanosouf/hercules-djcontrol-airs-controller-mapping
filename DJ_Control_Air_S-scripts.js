var DjControlAirS = {};

DjControlAirS.WHEEL_TICK = 0.0001;

DjControlAirS.shiftButtonPressed = false;

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

DjControlAirS.sampler = function(midino, control, value, status, group) {
  if (DjControlAirS.shiftButtonPressed && value != 0x00) {
    engine.setValue(group, "LoadSelectedTrack", 1);
    return;
  }
  if (value != 0x00 && engine.getValue(group, "play") === 0) {
    engine.setValue(group, "start_play", 1);
	}
  if (value == 0x00 && engine.getValue(group, "play") !== 0) {
  	engine.setValue(group, "play", 0);
  }
}


DjControlAirS.shift = function(midino, control, value, status, group) {
	DjControlAirS.shiftButtonPressed = (value == 0x7f);
  midi.sendShortMsg(status, control, value);
}

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
    } else if (engine.getValue(group, "play") == 0) {
      var currentPosition = engine.getValue(group,"playposition");
  		var newPosition = currentPosition + DjControlAirS.WHEEL_TICK * (value == 0x01 ? 1 : -1);
  		if (newPosition < 0) {
        newPosition = 0;
      }
  		if (newPosition > 1) {
        newPosition = 1;
      }
  		engine.setValue(group, "playposition", newPosition);
    } else {
      engine.setValue('[Channel' + deckNumber + ']', 'jog', newValue);
    }
};
