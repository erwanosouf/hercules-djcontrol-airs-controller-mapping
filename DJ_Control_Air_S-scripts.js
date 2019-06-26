var DjControlAirS = {};

DjControlAirS.WHEEL_TICK = 0.00005;

DjControlAirS.SAMPLER_MODE_STOP_ON_RELEASE = false;

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
  var playing = engine.getValue(group, "play") !== 0;
  var stopOnRelease = DjControlAirS.SAMPLER_MODE_STOP_ON_RELEASE;
  if (value != 0x00 && (!playing || !stopOnRelease)) {
    engine.setValue(group, "start_play", 1);
	}
  if (stopOnRelease && value == 0x00 && playing) {
  	engine.setValue(group, "play", 0);
  }
}


DjControlAirS.shift = function(midino, control, value, status, group) {
	DjControlAirS.shiftButtonPressed = (value == 0x7f);
  midi.sendShortMsg(status, control, value);
}

// The button that enables/disables scratching
DjControlAirS.wheelTouch = function (channel, control, value, status, group) {
    //midi.sendShortMsg(0x90, 0x2d, 0x7f); // Scratch
    var deckNumber = script.deckFromGroup(group);
    if (value === 0x7F) { 
      var alpha = 1.0 / 8;
      var beta = alpha / 32;
      engine.scratchEnable(deckNumber, 128, 33 + 1/3, alpha, beta);
    } else {
      engine.scratchDisable(deckNumber);
    }
};

// The wheel that actually controls the scratching
DjControlAirS.wheelTurn = function (channel, control, value, status, group) {
    var deckNumber = script.deckFromGroup(group);
    var playing = engine.getValue(group, "play") != 0;
    var scratching = engine.isScratching(deckNumber);

    var newValue = value == 0x01 ? 1 : -1;
    if (playing) {
      if (scratching) {
        engine.scratchTick(deckNumber, newValue);
      }  else {
        engine.setValue('[Channel' + deckNumber + ']', 'jog', newValue);
      }
    } else {
      // Needle search
      var currentPosition = engine.getValue(group,"playposition");
  		var newPosition = currentPosition + DjControlAirS.WHEEL_TICK * (value == 0x01 ? 1 : -1);
  		if (newPosition < 0) {
        newPosition = 0;
      }
  		if (newPosition > 1) {
        newPosition = 1;
      }
  		engine.setValue(group, "playposition", newPosition);
    }
};
