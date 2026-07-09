import wave, math, struct, random

def make_wav(filename, samples, sample_rate=44100):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        for s in samples:
            v = int(max(-32768, min(32767, s * 32767)))
            f.writeframes(struct.pack('<h', v))

# Zap sound: high frequency burst with noise
zap_samples = []
length = int(44100 * 0.1) # 100ms
for i in range(length):
    t = i / 44100.0
    val = math.sin(2 * math.pi * 3000 * t) * random.uniform(-1, 1)
    env = 1.0 - (t / 0.1)
    zap_samples.append(val * env * 0.3)
make_wav('assets/zap.wav', zap_samples)
