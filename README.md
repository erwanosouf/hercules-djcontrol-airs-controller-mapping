# Controller Mapping README

## Useful Documents
- [MIDI Course on Mixxx Wiki](https://www.mixxx.org/wiki/doku.php/midi_crash_course)
- [Controller Mapping](https://www.mixxx.org/wiki/doku.php/midi_controller_mapping_file_format)
- [MIDI Controller Scripting](https://www.mixxx.org/wiki/doku.php/midi_scripting)

## MIDI Debug

`amidi -l` : list MIDI Devices
`amidi -p hw:1,0,0 -d` : Dumps all MIDI signals from hw:1,0,0
`amidi -p hw:1,0,0 -S "80 04 7f"` : Sends Signal "80 04 7f" to hw:1,0,0
