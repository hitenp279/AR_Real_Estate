import { FloorPlanData } from '../types/floorPlan';

export const GLASS_PAVILION_FLOOR_PLAN: FloorPlanData = {
  propertyId: 'glass-pavilion',
  overallFootprint: {
    plinthWidth: 14.8, // 14.80 m (measured structural plinth)
    plinthDepth: 10.0, // 10.00 m (measured structural plinth)
    totalModelWidth: 14.92, // 14.92 m (including landscape planter foliage)
    totalHeight: 7.8, // 7.80 m (plinth ground contact to roof crest)
    provenance: 'measured',
    reconciliationNotes:
      'Structural plinth and foundation slab measure 14.80 m × 10.00 m from node modern-house_body. The total model envelope expands to 14.92 m due to peripheral landscape planter foliage (modern-house_plants).',
  },
  levels: [
    {
      id: 'level-1',
      name: 'Level 01 — Ground Floor',
      shortName: 'Ground',
      elevation: 1.0, // Finish slab at Y=1.00m
      ceilingHeight: 3.23, // Y=1.00m to mid-slab Y=4.23m
      enclosedArea: 118.5,
      outdoorArea: 29.5,
      rooms: [
        {
          id: 'gp-living',
          name: 'Grand Living Pavilion',
          level: 'level-1',
          category: 'living',
          dimensions: { width: 4.33, depth: 8.0, height: 3.23 },
          area: 34.6,
          provenance: 'illustrative',
          provenanceDetails:
            'West wing structural width (4.33 m) is measured directly from model massing; interior seating configuration is illustrative.',
          notes:
            'Double-aspect floor-to-ceiling glass envelope framing garden views with polished terrazzo slab.',
          centroid3D: [-5.0, 2.6, 0.0],
          bounds3D: {
            min: [-7.15, 1.0, -4.0],
            max: [-2.82, 4.23, 4.0],
          },
          svgPolygon: '80,120 370,120 370,580 80,580',
          labelPos: { x: 225, y: 350 },
        },
        {
          id: 'gp-entrance',
          name: 'Entrance Gallery & Foyer',
          level: 'level-1',
          category: 'circulation',
          dimensions: { width: 2.4, depth: 3.6, height: 3.23 },
          area: 8.6,
          provenance: 'illustrative',
          provenanceDetails:
            'Door width (1.09 m) and entrance frame (1.30 m at X: +1.96 m) are measured from model nodes modern-house_door_l and modern-house_frame.',
          notes:
            'Framed architectural portal with brass hardware and direct connection to central gallery.',
          centroid3D: [1.96, 2.0, 3.47],
          bounds3D: {
            min: [0.8, 1.0, 1.8],
            max: [3.2, 4.23, 4.7],
          },
          svgPolygon: '470,360 630,360 630,580 470,580',
          labelPos: { x: 550, y: 470 },
        },
        {
          id: 'gp-powder',
          name: 'Powder Room & Cloaks',
          level: 'level-1',
          category: 'service',
          dimensions: { width: 2.0, depth: 1.8, height: 3.23 },
          area: 3.6,
          provenance: 'illustrative',
          provenanceDetails:
            'Illustrative interior room layout designed within structural service core.',
          notes:
            'Concealed guest cloakroom and minimalist vanity fixture adjacent to entry gallery.',
          centroid3D: [0.2, 2.0, 2.8],
          bounds3D: {
            min: [-0.8, 1.0, 1.8],
            max: [0.8, 4.23, 3.6],
          },
          svgPolygon: '370,440 470,440 470,580 370,580',
          labelPos: { x: 420, y: 510 },
        },
        {
          id: 'gp-stair',
          name: 'Architectural Stair Core',
          level: 'level-1',
          category: 'circulation',
          dimensions: { width: 3.0, depth: 2.2, height: 3.23 },
          area: 6.6,
          provenance: 'illustrative',
          provenanceDetails:
            'Central vertical circulation shaft connecting ground slab (Y=1.00m) to upper level (Y=4.41m).',
          notes:
            'Floating timber tread staircase with glass balustrade illuminated by clerestory window.',
          centroid3D: [-1.0, 2.6, 0.0],
          bounds3D: {
            min: [-2.5, 1.0, -1.0],
            max: [0.5, 4.23, 1.2],
          },
          svgPolygon: '370,260 550,260 550,440 370,440',
          labelPos: { x: 460, y: 350 },
        },
        {
          id: 'gp-kitchen-dining',
          name: 'Gourmet Kitchen & Dining Salon',
          level: 'level-1',
          category: 'dining',
          dimensions: { width: 5.1, depth: 4.8, height: 3.23 },
          area: 24.5,
          provenance: 'illustrative',
          provenanceDetails:
            'Positioned in the East ground wing (14.25m envelope); sliding glass doors connect to verified rear terrace.',
          notes:
            'Marble waterfall preparation island, integrated appliances, and formal dining space for 10.',
          centroid3D: [4.5, 2.6, 0.5],
          bounds3D: {
            min: [2.0, 1.0, -2.5],
            max: [7.1, 4.23, 2.5],
          },
          svgPolygon: '550,120 900,120 900,440 550,440',
          labelPos: { x: 725, y: 280 },
        },
        {
          id: 'gp-terrace',
          name: 'Garden Terrace & Outdoor Lounge',
          level: 'level-1',
          category: 'outdoor',
          dimensions: { width: 4.5, depth: 3.2, height: 0.75 },
          area: 14.4,
          provenance: 'measured',
          provenanceDetails:
            'Bench foundation and outdoor seating cushions are measured directly from nodes modern-house_details_cushion_0/1.',
          notes:
            'Teak timber decking with built-in architectural bench seating and integrated planter box.',
          centroid3D: [5.7, 0.75, -3.3],
          bounds3D: {
            min: [3.5, 0.14, -4.8],
            max: [7.2, 1.0, -2.0],
          },
          svgPolygon: '550,40 900,40 900,120 550,120',
          labelPos: { x: 725, y: 80 },
        },
      ],
    },
    {
      id: 'level-2',
      name: 'Level 02 — Upper Floor',
      shortName: 'Upper',
      elevation: 4.41, // Finish slab at Y=4.41m
      ceilingHeight: 3.39, // Y=4.41m to roof crest Y=7.80m
      enclosedArea: 78.2,
      outdoorArea: 17.3,
      rooms: [
        {
          id: 'gp-primary-bed',
          name: 'Primary Bedroom Suite',
          level: 'level-2',
          category: 'bedroom',
          dimensions: { width: 4.8, depth: 4.4, height: 3.39 },
          area: 21.1,
          provenance: 'illustrative',
          provenanceDetails:
            'Calibrated to the upper East structural envelope (10.14 m width from X: -2.82 to +7.32 m).',
          notes:
            'East-facing primary retreat with floor-to-ceiling motorized glazing and panoramic horizon vistas.',
          centroid3D: [4.8, 5.8, 0.5],
          bounds3D: {
            min: [2.5, 4.41, -2.0],
            max: [7.1, 7.8, 3.0],
          },
          svgPolygon: '550,120 900,120 900,420 550,420',
          labelPos: { x: 725, y: 270 },
        },
        {
          id: 'gp-dressing',
          name: 'Walk-In Dressing Room',
          level: 'level-2',
          category: 'service',
          dimensions: { width: 2.6, depth: 2.2, height: 3.39 },
          area: 5.7,
          provenance: 'illustrative',
          provenanceDetails:
            'Illustrative custom millwork wardrobe suite backing onto primary ensuite.',
          notes:
            'Bespoke smoked oak cabinetry with integrated warm LED perimeter backlighting.',
          centroid3D: [2.0, 5.8, 1.5],
          bounds3D: {
            min: [0.8, 4.41, 0.5],
            max: [3.4, 7.8, 2.7],
          },
          svgPolygon: '370,270 550,270 550,420 370,420',
          labelPos: { x: 460, y: 345 },
        },
        {
          id: 'gp-ensuite',
          name: 'Primary Ensuite Spa',
          level: 'level-2',
          category: 'bathroom',
          dimensions: { width: 3.2, depth: 2.8, height: 3.39 },
          area: 9.0,
          provenance: 'illustrative',
          provenanceDetails:
            'Illustrative plumbing layout within the central service riser zone.',
          notes:
            'Freestanding solid stone soaking tub, rain shower enclosure, and fluted glass partition.',
          centroid3D: [2.0, 5.8, -1.0],
          bounds3D: {
            min: [0.5, 4.41, -2.5],
            max: [3.7, 7.8, 0.5],
          },
          svgPolygon: '370,120 550,120 550,270 370,270',
          labelPos: { x: 460, y: 195 },
        },
        {
          id: 'gp-guest-bed',
          name: 'Guest Suite & Studio',
          level: 'level-2',
          category: 'bedroom',
          dimensions: { width: 3.8, depth: 3.4, height: 3.39 },
          area: 12.9,
          provenance: 'illustrative',
          provenanceDetails:
            'Illustrative suite configured in the central-west upper massing above the stair core.',
          notes:
            'Flexible guest bedroom or creative studio with private closet and garden exposure.',
          centroid3D: [-1.2, 5.8, 0.5],
          bounds3D: {
            min: [-2.82, 4.41, -1.5],
            max: [0.5, 7.8, 2.5],
          },
          svgPolygon: '220,200 370,200 370,480 220,480',
          labelPos: { x: 295, y: 340 },
        },
        {
          id: 'gp-sundeck',
          name: 'Cantilevered Sun Deck',
          level: 'level-2',
          category: 'outdoor',
          dimensions: { width: 4.33, depth: 4.0, height: 1.0 },
          area: 17.3,
          provenance: 'measured',
          provenanceDetails:
            'Roof terrace footprint directly corresponds to the 4.33 m single-story West wing where no upper massing exists.',
          notes:
            'Open-air roof lounge positioned directly over the ground living pavilion with glass parapet.',
          centroid3D: [-5.0, 4.5, 0.0],
          bounds3D: {
            min: [-7.15, 4.41, -3.0],
            max: [-2.82, 5.5, 3.0],
          },
          svgPolygon: '80,120 220,120 220,520 80,520',
          labelPos: { x: 150, y: 320 },
        },
      ],
    },
  ],
};
