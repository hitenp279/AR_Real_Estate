import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  formatLength,
  formatDimensions,
  formatArea,
  formatElevation,
  METERS_TO_FEET,
  SQ_METERS_TO_SQ_FEET,
} from '../utils/dimensionUnits';
import { FloorPlanViewer } from '../components/floorplan/FloorPlanViewer';
import { GLASS_PAVILION_FLOOR_PLAN } from '../data/floorPlans';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';

describe('Dimension & Unit Conversion Utilities', () => {
  it('converts meters to feet with expected precision', () => {
    expect(formatLength(14.8, 'metric')).toBe('14.8 m');
    const expectedFeet = (14.8 * METERS_TO_FEET).toFixed(1);
    expect(formatLength(14.8, 'imperial')).toBe(`${expectedFeet} ft`);
  });

  it('formats dual dimensions correctly in metric and imperial', () => {
    expect(formatDimensions(14.8, 10.0, 'metric')).toBe('14.8 m × 10.0 m');
    expect(formatDimensions(14.8, 10.0, 'imperial')).toContain('ft ×');
  });

  it('converts square meters to square feet accurately', () => {
    expect(formatArea(100, 'metric')).toBe('100.0 m²');
    const expectedSqFt = Math.round(100 * SQ_METERS_TO_SQ_FEET);
    expect(formatArea(100, 'imperial')).toBe(`${expectedSqFt.toLocaleString()} sq ft`);
  });

  it('formats architectural elevation levels', () => {
    expect(formatElevation(1.0, 'metric')).toBe('+1.00 m elev.');
    expect(formatElevation(4.41, 'metric')).toBe('+4.41 m elev.');
    expect(formatElevation(1.0, 'imperial')).toContain('+3.3 ft elev.');
  });
});

describe('FloorPlanViewer Component', () => {
  it('renders structural plinth dimensions and architectural scale elements', () => {
    render(<FloorPlanViewer floorPlan={GLASS_PAVILION_FLOOR_PLAN} />);

    expect(
      screen.getByText(/Structural Plinth Footprint/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/14.8 m × 10.0 m/i)).toBeInTheDocument();
    expect(screen.getByText(/Measured 3D Base/i)).toBeInTheDocument();
  });

  it('renders ground level rooms initially', () => {
    render(<FloorPlanViewer floorPlan={GLASS_PAVILION_FLOOR_PLAN} />);

    expect(screen.getByText('Grand Living Pavilion')).toBeInTheDocument();
    expect(screen.getByText('Entrance Gallery & Foyer')).toBeInTheDocument();
    expect(screen.getByText('Gourmet Kitchen & Dining Salon')).toBeInTheDocument();
    expect(screen.getByText('Garden Terrace & Outdoor Lounge')).toBeInTheDocument();
  });

  it('switches between Level 01 and Level 02 and displays upper floor rooms', () => {
    render(<FloorPlanViewer floorPlan={GLASS_PAVILION_FLOOR_PLAN} />);

    const upperLevelBtn = screen.getByRole('button', { name: /Upper/i });
    fireEvent.click(upperLevelBtn);

    expect(screen.getByText('Primary Bedroom Suite')).toBeInTheDocument();
    expect(screen.getByText('Primary Ensuite Spa')).toBeInTheDocument();
    expect(screen.getByText('Cantilevered Sun Deck')).toBeInTheDocument();
  });

  it('triggers onSelectZone when a room is clicked and displays provenance details', () => {
    const handleSelectZone = vi.fn();
    render(
      <FloorPlanViewer
        floorPlan={GLASS_PAVILION_FLOOR_PLAN}
        selectedZone={GLASS_PAVILION_FLOOR_PLAN.levels[0].rooms[0]}
        onSelectZone={handleSelectZone}
      />
    );

    const inspector = screen.getByTestId('room-inspector-panel');
    expect(inspector).toBeInTheDocument();
    expect(screen.getByText('Illustrative Space Planning')).toBeInTheDocument();
    expect(
      screen.getByText(/West wing structural width \(4.33 m\) is measured directly from model massing/i)
    ).toBeInTheDocument();
  });

  it('displays measured provenance badge for 3D-verified elements like Garden Terrace', () => {
    const terraceRoom = GLASS_PAVILION_FLOOR_PLAN.levels[0].rooms.find(
      r => r.id === 'gp-terrace'
    )!;

    render(
      <FloorPlanViewer
        floorPlan={GLASS_PAVILION_FLOOR_PLAN}
        selectedZone={terraceRoom}
      />
    );

    const inspector = screen.getByTestId('room-inspector-panel');
    expect(inspector).toBeInTheDocument();
    expect(screen.getAllByText('Measured from 3D Model').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Bench foundation and outdoor seating cushions are measured directly from nodes/i)
    ).toBeInTheDocument();
  });

  it('toggles metric and imperial units through toolbar controls', () => {
    const handleUnitChange = vi.fn();
    render(
      <FloorPlanViewer
        floorPlan={GLASS_PAVILION_FLOOR_PLAN}
        activeUnit="metric"
        onUnitChange={handleUnitChange}
      />
    );

    const imperialBtn = screen.getByRole('button', {
      name: /Switch to Imperial units/i,
    });
    fireEvent.click(imperialBtn);
    expect(handleUnitChange).toHaveBeenCalledWith('imperial');
  });
});

describe('PropertyDetailPage Floor Plan Integration & Split View', () => {
  it('renders View Mode Switcher on Glass Pavilion and allows toggling to 2D Floor Plan', () => {
    render(
      <MemoryRouter initialEntries={['/properties/glass-pavilion']}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify View Switcher controls
    expect(screen.getByRole('button', { name: /Split View/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3D Model/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2D Floor Plan/i })).toBeInTheDocument();

    // Verify Architectural Honesty Section
    expect(
      screen.getByTestId('provenance-disclosure-section')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Architectural Honesty Standard: Geometry Reconciliations & Provenance/i)
    ).toBeInTheDocument();
  });
});
