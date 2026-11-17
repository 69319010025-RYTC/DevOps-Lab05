# Velocity Ford F-250 Jigsaw Puzzle

## Plan

1. Prepare the puzzle image and create a browser-based layout.
2. Build a 4 x 5 board with 20 puzzle slots.
3. Generate each piece using a portion of the image background.
4. Allow dragging pieces onto any slot, then validate the target.
5. If the piece is placed in the wrong slot, reset the puzzle and play an error sound.
6. If all 20 pieces are correctly placed, show a win message and play success sounds.

## Run locally

Open the project folder in a browser, or serve it with a simple local server:

```bash
cd /Users/mac22/DevOps-Lab05
python3 -m http.server 8000
```

Then open:

http://localhost:8000

## Files

- `index.html` – page structure
- `style.css` – layout and design
- `script.js` – puzzle logic, drag/drop validation, and sound effects
- `velocity-ford-f-250-restomod-1-1671140013.jpg` – puzzle image

## Game rules

- Drag a piece to any slot.
- A correct placement locks the piece in place.
- A wrong placement triggers a restart.
- All pieces must be correct to win.
