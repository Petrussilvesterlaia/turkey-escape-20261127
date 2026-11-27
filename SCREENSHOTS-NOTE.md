# Screenshots — to be taken by the main agent

This directory is intentionally empty in this build session. The main agent
will capture 3 real browser screenshots of the game itself and place them
here before submitting:

- `1-start.jpg` — title screen (`?shot=start&seed=1`)
- `2-play.jpg` — a run in play with the HUD (`?shot=play&seed=1`)
- `3-end.jpg` — the caught end screen with restart (`?shot=end&seed=1`)

Each must be a PNG or JPEG, at most 256 KiB, long side at most 1280 px and
short side at least 480 px. Do not place any other image here.
