import wave, math, struct

def make_wav(filename, samples, sample_rate=44100):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        for s in samples:
            v = int(max(-32768, min(32767, s * 32767)))
            f.writeframes(struct.pack('<h', v))

# BGM: A simple 4 second loop
# Notes: C4(261.63), E4(329.63), G4(392.00), A4(440.00)
notes = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63, 196.00]
bgm_samples = []
sr = 44100
note_length = int(sr * 0.5) # half a second per note

for note in notes:
    for i in range(note_length):
        t = i / sr
        # Square wave for retro feel
        val = 0.2 if math.sin(2 * math.pi * note * t) > 0 else -0.2
        # Simple envelope
        env = 1.0 - (i / note_length)
        bgm_samples.append(val * env)

make_wav('assets/bgm.wav', bgm_samples)
