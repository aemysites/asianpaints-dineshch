
## 2026-10-19 — asianpaints.com single-page replica

- A DA metadata row appended after the block's last `</div>` lands OUTSIDE the metadata table and renders as body text; insert rows before the block's closing `</div>`. A `JSON-LD` metadata row inside the block is rendered server-side by the pipeline as `<script type="application/ld+json">` (12 KB worked) — no client-side injection needed.
- chrome-explore on a source with a timed splash dialog (opens ~8 s after load, sets a localStorage flag) needs `--warmup <same url>`; otherwise the dialog eats the pointer and the contract records no hover menus. Timed chat bubbles and focus rings still show up as "states" with whole-header/viewport crops — they need an owner decision to clear, an agent cannot sign one.
- `dynamics-check video-plays` reads a loop wrap as "not playing" when the clip (3 s) is shorter than the sample gap; confirm with a two-sample probe before treating it as a defect.
- Unpushed code changes need `POST admin.hlx.page/code/<org>/<repo>/<branch>/<path>` with the IMS bearer to land on the code bus when the sync app lags; check served files with `curl --compressed` (a gzip body greps as empty).
