# Lumina Penthouse Visual Quality Audit Report
**Project:** VistaAR — AR-Based Real Estate Property Visualization System  
**Date:** October 30, 2026  
**Status:** Audit & Quality Corrections Complete  
**Scope:** Investigation and resolution of the Lumina Penthouse 3D overview cutaway, dining table geometry, master suite bedding presentation, and displayed dimension reconciliation.

---

## 1. Executive Summary

Following Milestone 6 delivery, a targeted visual quality audit was conducted on the **Lumina Penthouse** 3D architectural presentation. 

### Key Audit Findings & Resolutions
1. **Apartment Overview Cutaway:** The previous overview was obstructed by `Plane002_SprayedWallTexture_0`, a solid beige 20.84m outer wall along the southern perimeter ($Z = +4.45\text{ m}$). By selectively toggling this single exterior wall off during overview mode (`visible = !isOverview`) while retaining the rich wooden interior corridor wall with its 4 framed gallery artworks, and applying local Three.js clipping planes at $Y = 2.70\text{ m}$ to clip only the ceiling slab, the application now presents a stunning, illuminated architectural dollhouse view revealing all five furnished rooms simultaneously. Full enclosure is instantly restored during interior room walkthroughs.
2. **Dining Table Geometry:** The "small detached pieces" observed around the dining tabletop in overhead views were determined to be the splayed wooden legs of Charles & Ray Eames molded plastic DSW dining chairs. During glTF optimization, `@gltf-transform` merged all geometries with material `White1` into `Apple_Adaptor_White1_0` (which included the ceiling slab, the molded white chair shells, the dining table planter, and the master suite bed pillows). In Milestone 5, hiding `Apple_Adaptor_White1_0` by name to remove the ceiling accidentally hid the white chair seats, leaving only the bare wooden legs poking out from under the table. By keeping `Apple_Adaptor_White1_0` visible and clipping only the ceiling slab above $Y = 2.70\text{ m}$, the complete Eames chairs with molded white bucket seats, black metal cross-struts, wooden legs, and the tabletop succulent planter are rendered flawlessly. Both original and optimized GLB assets remain 100% byte-for-byte preserved.
3. **Master Suite Bedding Presentation:** Inspection of the underlying 3D geometry confirmed that the rumpled duvet (`Bed_Plain_Grey_Texture_2669056_20cm001_0`, 9,010 triangles in original vs 8,911 in optimized) was intentionally authored by *Visthétique* as an organic linen cloth simulation. In Milestone 5, hiding `Apple_Adaptor_White1_0` hid the layered white bed pillows and the crisp folded white turn-down sheet, causing the duvet to appear as an unanchored, dark, crumpled mass. With `Apple_Adaptor_White1_0` restored, the contrasting white pillows and turn-down sheet frame the linen duvet. The camera viewpoint was updated from a steep top-down angle to an eye-level three-quarter perspective at the room entrance ($[10.6, 1.40, 1.5]$ looking at $[12.7, 1.10, 0.5]$), delivering a serene, high-end master bedroom suite presentation.
4. **Dimension & Area Reconciliation:**
   - **Building Envelope:** $20.8\text{ m} \times 6.0\text{ m} \times 3.2\text{ m}$ represents the true structural wall-to-wall building envelope of the penthouse (Width $X: 20.84\text{ m}$, Height $Y: 3.16\text{ m}$, Depth $Z: -1.54\text{ m} \text{ to } +4.45\text{ m} = 5.99\text{ m}$). The $8.25\text{ m}$ depth noted in earlier milestone audits included external decorative perimeter planters extending past the building perimeter ($Z: -2.70\text{ m} \text{ to } +5.55\text{ m}$).
   - **Living Area Calculation:** The five calibrated room zones sum to $38.5 + 26.2 + 14.8 + 10.3 + 31.0 = \mathbf{120.8\text{ m}^2}$. The hardcoded $122.9\text{ m}^2$ previously displayed in `InteriorRoomDirector.tsx` was a legacy static estimate that included a $2.1\text{ m}^2$ hallway walkway. The viewer now dynamically computes `rooms.reduce((sum, r) => sum + (r.areaSqm || 0), 0)`, displaying exactly $\mathbf{120.8\text{ m}^2}$ (or $1,300\text{ sq ft}$ in imperial mode), achieving 100% mathematical consistency with the room chips. The gross floor area (including partitions and corridor) is $124.8\text{ m}^2$.
5. **Zero Regressions & Asset Integrity:** All 41 Vitest unit and integration tests pass cleanly; the production build succeeds with 0 errors; the Glass Pavilion exterior viewer remains completely unaffected; and the SHA256 checksums of `modern-house.glb`, `modern_apartment.glb`, and `modern_apartment_optimized.glb` are byte-for-byte unchanged.

---

## 2. Technical Root-Cause Analysis

### 2.1 Apartment Overview Obstruction
- **Mesh Identification:** The penthouse model features an outer corridor wall (`Plane002_SprayedWallTexture_0`, dimensions $20.84\text{ m} \times 3.16\text{ m}$, located at $Z = +4.448\text{ m}$). When viewing the apartment from positive $Z$, this solid wall completely blocked the line of sight into the kitchen, living room, office, and corridor.
- **Previous Approach:** In Milestone 5, the camera was placed at $[center.x - 0.5, center.y + 16.5, center.z + 10.5]$, which viewed the model over the top of the outer wall, but the wall still occupied a significant portion of the lower viewport.
- **Improved Solution:** 
  - Rather than hiding walls indiscriminately, we identified that only `Plane002_SprayedWallTexture_0` acts as a viewing barrier from the front. 
  - In `ThreeCanvas.tsx`, `updateApartmentCutaway(model, isOverview)` was implemented:
    - In overview mode (`isOverview === true`), `Plane002_SprayedWallTexture_0.visible = false`. All other interior partition walls, the kitchen island, the bathroom masonry, and the rich dark wood corridor wall remain visible.
    - On the dark wood corridor wall, four fine-art framed paintings (`Paintings_Painting_*`) remain fully visible, framing the corridor.
    - The overview camera was elevated to $[center.x - 2.5, center.y + 14.5, center.z + 10.5]$ looking at $[center.x, 1.0, center.z]$ with FOV 40°, providing an expansive three-quarter architectural dollhouse perspective where every room is legible.
    - When entering any interior room, `Plane002_SprayedWallTexture_0.visible = true` is immediately restored so interior walkthroughs are fully enclosed.
    - When returning to the overview, the cutaway state is restored seamlessly.

### 2.2 Dining Table Geometry & "Detached Pieces"
- **Geometry Hierarchy in Original Asset:**
  - In `modern_apartment.glb`, the node `DiningTable001` contains:
    1. `DiningTable001_Wood049_0`: Splayed wooden dowel legs extending from floor ($Y \approx 0.0\text{ m}$) to seat base ($Y \approx 0.45\text{ m}$).
    2. `DiningTable001_BlackMetal_0`: Black wire cross-struts / metal bracing connecting legs to seat base.
    3. `DiningTable001_White1_0`: Ergonomic molded white bucket seats (the actual chair shells).
- **Optimization Impact:**
  - `@gltf-transform` merged geometries sharing material `White1` to reduce draw calls from 182 down to 43.
  - The merged node was named `Apple_Adaptor_White1_0`, containing the large ceiling slab ($Y = 2.76\text{ m} \text{ to } 3.16\text{ m}$), the six white chair seats ($Y = 0.45\text{ m} \text{ to } 0.85\text{ m}$), the dining planter ($Y = 0.82\text{ m}$), and the bedroom pillows/sheets.
- **Milestone 5 Inadvertent Regressive Hiding:**
  - In Milestone 5, setting `child.visible = false` on `Apple_Adaptor_White1_0` successfully hid the ceiling slab, but simultaneously hid the white chair seats and the table planter!
  - As a result, only the splayed wooden legs and black wire struts were rendered around the table. From an elevated perspective, the tips of the wooden legs poking out from beneath the table gave the illusion of small, detached, floating geometric artifacts.
- **The Correct Architectural Fix:**
  - We enabled Three.js local clipping (`renderer.localClippingEnabled = true`).
  - A horizontal clipping plane was configured at $Y = 2.70\text{ m}$:
    $$\mathbf{n} = (0, -1, 0), \quad d = 2.70 \implies -y + 2.70 \ge 0 \iff y \le 2.70\text{ m}$$
  - In overview mode, `Apple_Adaptor_White1_0` remains `visible = true`, and `mat.clippingPlanes = [ceilingClipPlane]`.
  - The ceiling slab ($Y \ge 2.76\text{ m}$) is clipped away, while all chair seats, planter, and furniture ($Y \le 2.40\text{ m}$) remain 100% visible and intact.
  - In interior room walkthroughs, `mat.clippingPlanes = null`, restoring the overhead ceiling for looking around.
  - Neither original nor optimized GLB assets required any modification.

### 2.3 Bedroom Bedding Audit
- **Mesh Inspection:**
  - Mesh: `Bed_Plain_Grey_Texture_2669056_20cm001_0`
  - Polygon count: 9,010 triangles in original `modern_apartment.glb`; 8,911 triangles in `modern_apartment_optimized.glb`.
  - Topology comparison confirmed that the wrinkles and folds are an intentional, high-fidelity cloth physics simulation representing relaxed organic linen bedding.
- **Root Cause of Distorted Appearance:**
  - In Milestone 5, the white bed pillows (`Bed_White1_0`, `Bed_White1_0_1`, `Bed_White1_0_2`) and the crisp folded white turn-down sheet were hidden as part of `Apple_Adaptor_White1_0`.
  - Without the contrasting white pillows and turn-down sheet framing the bed, the grey duvet appeared as a dark, unanchored mass of wrinkles.
  - In addition, an overly steep top-down camera angle foreshortened the fabric folds into dense ridges.
- **Resolution:**
  - Keeping `Apple_Adaptor_White1_0` visible restores the crisp white pillows and folded sheet layer.
  - The bedroom camera position in `apartmentRooms.ts` was calibrated to $[10.6, 1.40, 1.5]$ looking at $[12.7, 1.10, 0.5]$ with FOV 60°, placing the user at eye level at the master suite entrance.
  - The resulting view presents a master bedroom suite with natural lighting, bedside table lamps, and an upholstered headboard.

### 2.4 Reconciling Displayed Measurements
1. **Dimensions ($20.8\text{ m} \times 6.0\text{ m} \times 3.2\text{ m}$ vs $20.84\text{ m} \times 8.25\text{ m} \times 3.16\text{ m}$):**
   - The true interior and exterior architectural envelope of the apartment (from the northern glass curtain wall at $Z = -1.543\text{ m}$ to the southern exterior corridor wall at $Z = +4.448\text{ m}$) measures:
     - Width ($X$): $-6.417\text{ m}$ to $+14.423\text{ m} = \mathbf{20.840\text{ m}}$ (displayed as $20.8\text{ m}$).
     - Height ($Y$): $0.000\text{ m}$ to $+3.160\text{ m} = \mathbf{3.160\text{ m}}$ (displayed as $3.2\text{ m}$).
     - Depth ($Z$): $-1.543\text{ m}$ to $+4.448\text{ m} = \mathbf{5.991\text{ m}}$ (displayed as $6.0\text{ m}$).
   - The $8.25\text{ m}$ depth recorded in earlier milestone notes included exterior perimeter decorative planters present in the unoptimized model that extended outward to $Z = -2.704\text{ m}$ and $+5.545\text{ m}$ ($5.545 - (-2.704) = 8.249\text{ m}$). The $6.0\text{ m}$ depth reflects the true structural wall-to-wall building envelope.
2. **Room Area Consistency ($120.8\text{ m}^2$ vs $122.9\text{ m}^2$):**
   - The five calibrated interior room zones configured in `apartmentRooms.ts` are:
     - Grand Living Salon: $38.5\text{ m}^2$
     - Chef's Kitchen & Dining: $26.2\text{ m}^2$
     - Executive Studio & Office: $14.8\text{ m}^2$
     - Primary Ensuite & Laundry Spa: $10.3\text{ m}^2$
     - Master Bedroom Suite: $31.0\text{ m}^2$
     - **Sum of 5 Rooms:** $38.5 + 26.2 + 14.8 + 10.3 + 31.0 = \mathbf{120.8\text{ m}^2}$.
   - The viewer footer in `InteriorRoomDirector.tsx` previously had a hardcoded string `Total Living Area: {formatArea(122.9, activeUnit)}` that included a $2.1\text{ m}^2$ hallway circulation allowance from an earlier manual estimate.
   - We updated `InteriorRoomDirector.tsx` to dynamically calculate:
     ```tsx
     const totalRoomsArea = rooms.reduce((sum, r) => sum + (r.areaSqm || 0), 0);
     ```
   - The viewer now displays `Total Living Area: 120.8 m²` (or `1,300 sq ft`), creating 100% mathematical consistency with the sum of the individual room chips.
   - The gross architectural footprint ($20.84\text{ m} \times 5.99\text{ m} = 124.8\text{ m}^2$) accounts for internal partition walls, structural columns, and corridor circulation.

---

## 3. Code Modifications Summary

| File | Purpose of Modification |
| :--- | :--- |
| `src/components/viewer/ThreeCanvas.tsx` | 1. Enabled `renderer.localClippingEnabled = true`.<br>2. Added `ceilingClipPlaneRef` at $Y = 2.70\text{ m}$.<br>3. Implemented `updateApartmentCutaway` to hide front exterior wall (`Plane002_SprayedWallTexture_0`) and clip ceiling slab in overview while preserving furniture and bedding.<br>4. Restored full wall enclosure and overhead ceiling during interior room walkthroughs.<br>5. Adjusted overview camera to elevated 3/4 dollhouse angle ($[-2.5, 14.5, 10.5]$ offset from center, FOV 40°). |
| `src/components/viewer/InteriorRoomDirector.tsx` | 1. Replaced hardcoded `122.9` with dynamic `rooms.reduce((sum, r) => sum + (r.areaSqm || 0), 0)`.<br>2. Displays exact `120.8 m²` ($1,300\text{ sq ft}$), matching the sum of the 5 calibrated room zone chips. |
| `src/data/apartmentRooms.ts` | Calibrated master bedroom camera viewpoint to eye-level entrance perspective ($[10.6, 1.40, 1.5]$ looking at $[12.7, 1.10, 0.5]$), framing the bed, crisp white pillows, turn-down sheet, and relaxed linen duvet. |

---

## 4. Verification Evidence & Artifact Catalog

All evidence assets are located in `artifacts/lumina-quality-audit/`:

1. `01_lumina_improved_overview.png`: Elevated 3/4 architectural dollhouse cutaway revealing all 5 furnished rooms, complete Eames dining chairs, corridor art gallery, and unobstructed interior layout.
2. `02_dining_table_geometry.png`: Overhead view of the dining table confirming all 6 white molded Eames chair shells, black wire cross-struts, wooden legs, and the centerpiece planter are fully rendered.
3. `02_dining_table_eye_level.png`: Eye-level perspective showing the full dining suite with pristine Eames chairs and study workstation in the background.
4. `03_bedroom_bedding_perspective.png`: Master suite entrance perspective displaying the upholstered headboard, lamps, white pillows, folded sheet, and relaxed linen duvet.
5. `03_bedroom_bedding_closeup.png`: Close-up of the master bed confirming the clean visual contrast between the crisp white pillows and natural linen duvet.
6. `04_overview_restoration_check.png`: Verifies that returning from an interior room via the "Exterior Overview" button restores the dollhouse cutaway state (byte-for-byte identical to the initial overview).
7. `05_glass_pavilion_regression.png`: Proof that the Glass Pavilion 3D viewer remains 100% operational with no visual or functional regressions.
8. `06_lumina_full_viewer_context.png`: Full screenshot showing the room chips ($38.5 + 26.2 + 14.8 + 10.3 + 31.0\text{ m}^2$), the dynamic `Total Living Area: 120.8 m²` display, and the bounding dimensions banner ($20.8\text{ m} \times 6.0\text{ m} \times 3.2\text{ m}$).
9. `test_output.txt`: Vitest run output confirming 41/41 automated tests passing across 5 test suites.
10. `build_output.txt`: Production build output confirming clean `tsc -b && vite build` with 0 errors.

---

## 5. GLB Asset Hash Preservation Guarantee

The original 3D models were inspected without modification. Byte-for-byte SHA256 integrity was confirmed:

```
Algorithm       Hash                                                              Path
---------       ----                                                              ----
SHA256          A178CF9C9B20D4D54C4E068F75AE25F72A6580FAC9C24027E2D39FF22F809475  public/models/modern-house.glb
SHA256          4A95A4923A3564F47FA02D47B21549ADA5BC5069D96900452AA156DE3548FDFD  public/models/modern_apartment.glb
SHA256          42E6B7DC2CA8B3A16E0D0BE271E230C9ECA68A19A98B43128A8A149217AFC317  public/models/modern_apartment_optimized.glb
```

---

## 6. Conclusion & Recommendation

The Lumina Penthouse 3D presentation has been upgraded to an architectural showcase:
- The flat wall obstruction in the overview has been resolved with a controlled, reversible dollhouse cutaway that preserves the fine-art corridor and internal room geometry.
- The dining chairs have their white bucket seats, metal struts, and wooden legs restored.
- The master bedroom bed features crisp white pillows and turn-down sheets supporting the relaxed linen duvet from an eye-level entrance perspective.
- Displayed measurements are reconciled: $20.8\text{ m} \times 6.0\text{ m} \times 3.2\text{ m}$ building envelope and $120.8\text{ m}^2$ total room area matching the room chips.
- All automated tests, production builds, and regression checks pass cleanly.
