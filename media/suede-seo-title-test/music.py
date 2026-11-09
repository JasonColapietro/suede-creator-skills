#!/usr/bin/env python3
"""Original minimal electronic bed for the Suede SEO video (36.5s, 120 BPM, A minor)."""
import sys, wave
import numpy as np

SR = 44100
DUR = 36.5
BPM = 120
BEAT = 60 / BPM
N = int(SR * DUR)
out = np.zeros((N, 2))
rng = np.random.default_rng(7)
SCENES = [0, 4.2, 9.0, 13.8, 18.6, 23.4, 28.6, 32.8]


def place(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    out[i:i + len(sig), 0] += sig * gain * l
    out[i:i + len(sig), 1] += sig * gain * r


def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.16)


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    s = rng.standard_normal(n)
    s = np.diff(s, prepend=0)  # crude high-pass
    return s * env(n, 0.001, 0.08 if open_ else 0.018) * 0.5


def clap():
    n = int(0.3 * SR); s = rng.standard_normal(n)
    e = sum(env(n, 0.001, 0.012) * (np.arange(n) >= int(k * SR)) for k in (0, 0.01, 0.02)) + env(n, 0.001, 0.09) * 0.6
    s = np.convolve(s, np.ones(4) / 4, "same")
    return s * e * 0.6


def note(freq, length, kind="pluck"):
    n = int(length * SR); t = np.arange(n) / SR
    if kind == "pluck":
        s = sum(np.sin(2 * np.pi * freq * h * t) / h for h in (1, 2, 3, 4))
        return s * env(n, 0.003, 0.18) * 0.35
    if kind == "bass":
        s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
        return s * env(n, 0.01, 0.35) * 0.6
    if kind == "pad":
        s = sum(np.sin(2 * np.pi * freq * (1 + d) * t) for d in (-0.004, 0, 0.004))
        a = np.minimum(1, t / 0.6) * np.minimum(1, (length - t) / 0.6)
        return s * a * 0.08


def whoosh(length=0.6):
    n = int(length * SR); s = rng.standard_normal(n)
    k = np.linspace(2, 40, n).astype(int)
    sm = np.array([s[max(0, i - k[i]):i + 1].mean() for i in range(n)])
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return sm * shape * 1.4


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)

# A minor progression: Am - F - C - G, one bar (4 beats) each
CHORDS = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]
BASS = [45, 41, 36, 43]
bar = 4 * BEAT
nbars = int(DUR / bar) + 1

for b in range(nbars):
    t0 = b * bar
    ch = CHORDS[b % 4]
    intro = t0 < 2 * bar          # first 4s: pad + plucks only
    outro = t0 >= DUR - 2 * bar   # last bars thin out
    for m in ch:
        place(note(hz(m), bar + 0.3, "pad"), t0, 1.0, (m % 3 - 1) * 0.4)
    # arpeggio, 16ths
    arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]
    for s in range(16):
        if intro and s % 2:
            continue
        place(note(hz(arp[s % 4]), 0.3, "pluck"), t0 + s * BEAT / 4, 0.55 if s % 4 == 0 else 0.35, 0.3 if s % 2 else -0.3)
    if intro:
        continue
    for q in range(4):
        tb = t0 + q * BEAT
        place(kick(), tb, 0.9)
        place(hat(), tb + BEAT / 2, 0.35, 0.2)
        place(hat(), tb + BEAT / 4, 0.12, -0.2)
        place(hat(), tb + 3 * BEAT / 4, 0.12, -0.2)
        if q in (1, 3) and not outro:
            place(clap(), tb, 0.45)
        place(note(hz(BASS[b % 4]), BEAT * 0.9, "bass"), tb + (BEAT / 2 if q % 2 else 0), 0.5)
    if b % 4 == 3:
        place(hat(True), t0 + 3.5 * BEAT, 0.3)

# transition hits on each scene change
for s in SCENES[1:]:
    place(whoosh(0.6), s - 0.45, 0.25)
    place(note(hz(81), 0.6, "pluck"), s, 0.4)

# end hit + tail
place(kick(), 32.8, 1.0)
place(note(hz(45), 3.0, "pad") * 6, 32.8, 0.5)

# master: gentle low-pass smoothing, fade in/out, normalize
for c in range(2):
    out[:, c] = np.convolve(out[:, c], np.ones(3) / 3, "same")
fade = np.ones(N)
fi, fo = int(0.3 * SR), int(2.5 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo)
out *= fade[:, None]
out = np.tanh(out * 1.2)
out /= np.max(np.abs(out)) / 0.89

pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", sys.argv[1])
