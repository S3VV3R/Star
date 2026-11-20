# STELLAR ENGINE

**HARNESS THE POWER OF A STAR**

A browser-based stellar engineering experience built with React, Vite, Three.js, React Three Fiber, Drei, GLSL, GSAP, Zustand, Rapier and Web Audio. All scene geometry, stellar textures, orbital collectors and sound are generated procedurally. Barlow fonts are optional remote enhancements; system fonts provide an offline fallback. No backend, paid API, video or external 3D asset is required.

## Run

Use Node.js 22.12 or newer.

The download includes a compiled `dist/` directory. On Windows, extract the archive and double-click `START.cmd`. Alternatively, run `node serve.mjs` and open http://127.0.0.1:4173. This launch path needs no package installation or network connection; leave the server window open while using the site.

For development and a fresh Vite build:

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Open the Local URL printed by Vite. Serve `dist/` through HTTP; do not open `index.html` with a `file://` URL.

`npm run build:portable` provides a Webpack/TypeScript alternative that produces the same self-contained static application. The included release was compiled with this path from locally cached dependencies; the Vite path and GitHub deployment require validation where npm and hosting are reachable.

## Mission walkthrough

1. Choose **Initialize System**, then **Activate Terminal** in the Observation Nexus. The physical terminal in the station is also clickable, and E performs the current zone interaction.
2. Move to **Solar Harvest**. In Engineer mode, keep at least 61% of the collectors active and align them below 15°. The rendered arrays physically rotate with the control.
3. Visit the **Reactor Chamber**. Maintain more than 650 MW and less than 70°C for five simulation seconds. Increase cooling if necessary.
4. In **Solar Storm**, enable storm protection, set cooling high and start the 35-second trial. Finish below 95°C without shutting down. Protection feathers the arrays and reduces both exposure and power.
5. Disable protection if more output is needed, return below 70°C, and choose **Ignite Stellar Engine** in Ascension. The camera pulls away as the energy network synchronizes. Continue exploring or reset through the pause menu.

All five zones remain reachable for inspection. Final ignition is gated by successful engineering milestones.

## Controls

| Input | Action |
| --- | --- |
| Drag / wheel in orbit mode | Rotate / zoom |
| C or camera button | Switch orbit / free flight |
| Click scene in free flight | Capture mouse |
| Hold right mouse button | Look when pointer lock is unavailable |
| WASD | Move |
| Space / left Ctrl | Ascend / descend |
| Left Shift | Boost |
| E | Current zone interaction |
| Click collector or node | Inspect |
| F | Focus selected object |
| Esc | Pause |
| Scroll in Cinema | Scrub camera path |

On a touchscreen, free flight exposes a movement joystick, a drag-to-look region and vertical/interact buttons. Engineer sliders, menus, camera controls and zone navigation support touch.

## Rendering and scale

- Animated 3D domain-warped photosphere, granulation, dark patches, additive corona and procedural prominence curves.
- 3,600 logical collectors. LOW renders 1,000 representatives; MEDIUM renders 2,400; ULTRA renders all 3,600. Collector parts use GPU instancing, with deterministic eccentric inclined orbits.
- Ring structures, six energy relays and power-dependent plasma transmission curves.
- Station and reactor are human-scale coordinate partitions. Their exterior scene is rebased around the station. This avoids expressing literal astronomical metre coordinates in one float scene.
- Free-flight velocity scales with distance. Near/far planes adapt to scene scale. Station walls, windows, floor, ceiling, terminals and reactor use Rapier colliders. Exterior flight prevents entry into the stellar core; individual swarm panels do not have rigid-body collision shapes.
- MEDIUM / ULTRA use bloom, vignette and tone mapping. The postprocessing target uses no MSAA to avoid black frames on incompatible graphics paths. LOW removes the postprocessing composer and reduces scene complexity. With Automatic graphics adjustment enabled, sustained low frame rate selects LOW. Choosing a graphics preset manually disables automatic adjustment; the toggle can re-enable it. Background tabs, settings and the initial shader warmup are excluded from automatic sampling. Performance depends on device and browser.
- Cinematic motion uses a spline; transitions and final pullback use GSAP easing. Reduced-motion settings stop automatic cinematic drift while retaining manual exploration.
- WebGL loss displays a recovery overlay. Reload is available if automatic browser restoration fails.

## Energy model

This is a fictional, scaled engineering simulation, not a prediction of full-star energy harvesting. The ring supports and visible transmission beams are science-fiction abstractions. Exterior audio is equipment sonification / cinematic sound design, not sound traveling through vacuum.

Collected power = 2,200 MW × active fraction × cos(incidence angle) × stellar activity × protection factor. Transmission efficiency is 91%. Distribution demand is 12 MW per percentage point. Surplus allocation charges an 800 MWh reservoir; unmet demand draws from it. Storage is integrated as MW × seconds / 3,600. Waste heat, active cooling and passive heat rejection determine temperature with an effective thermal capacity. At 120°C the system trips; restart requires cooling below 80°C. The simulation clock can pause or accelerate independently of rendering.

## GitHub Pages

Push this project to the `main` branch of your repository. In GitHub **Settings → Pages → Source**, choose **GitHub Actions**. The included `.github/workflows/deploy.yml` runs simulation tests and deploys the committed `dist/` release. Rebuild locally after source changes and commit the updated `dist/`.

Vite uses `base: './'`: asset URLs remain relative, so the build can run at a domain root or under a repository directory. There is no path-based router. The `.openai/hosting.json` file belongs to the private Sites deployment and is not required by GitHub Pages.

Minification and tree shaking reduce production size; browser-delivered code remains inspectable. No secrets belong in frontend source.

## Project map

`src/stellar/` — star and corona; `src/megastructure/` — collectors, rings and relays; `src/zones/` — station and reactor interiors; `src/systems/` — energy, orbits and audio; `src/camera/` — navigation and cinematic camera; `src/shaders/` — procedural materials; `src/ui/` — responsive menus and engineering tools; `src/store/` — simulation and mission state.

## Verification

`npm test` covers alignment, MW/MWh conversion, storage bounds, shutdown, cooling, protected and unprotected storm outcomes, ignition conditions, pause and deterministic periodic orbits. Browser/device observations are recorded separately in `VALIDATION.md`. Do not interpret a passing production build as a guarantee of 60 FPS or photorealistic physical accuracy.


Подготовка к публикации: [PUSH-TO-GITHUB.md](PUSH-TO-GITHUB.md).
