var DjControlAirS = {};

DjControlAirS.init = function (id, debugging) {

}

DjControlAirS.shutdown = function() {

}

DjControlAirS.test = function (channel, control, value, status, group) {
    // your custom code goes here
}

// The button that enables/disables scratching
DjControlAirS.wheelTouch = function (channel, control, value, status, group) {
    if ((status & 0xF0) === 0x90) {    // If button down
        //if (value === 0x7F) {  // Some wheels send 0x90 on press and release, so you need to check the value
        var alpha = 1.0 / 8;
        var beta = alpha / 32;
        engine.scratchEnable(deckNumber, 128, 33 + 1/3, alpha, beta);
    } else {    // If button up
        engine.scratchDisable(deckNumber);
    }
}

// The wheel that actually controls the scratching
DjControlAirS.wheelTurn = function (channel, control, value, status, group) {
    var newValue = value - 64;

    // In either case, register the movement
    if (engine.isScratching(MyController.currentDeck)) {
        engine.scratchTick(deckNumber, newValue); // Scratch!
    } else {
        engine.setValue('[Channel' + deckNumber + ']', 'jog', newValue); // Pitch bend
    }
}
