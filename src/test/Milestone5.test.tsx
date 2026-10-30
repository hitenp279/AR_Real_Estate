import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LUMINA_PENTHOUSE_ROOMS, APARTMENT_WAYPOINTS } from '../data/apartmentRooms';
import { InteriorRoomDirector } from '../components/viewer/InteriorRoomDirector';
import { ModelViewerAR } from '../components/ar/ModelViewerAR';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';

describe('Interior Room Navigation Coordinates & Waypoints', () => {
  it('defines 5 calibrated interior rooms with valid coordinates and FOVs', () => {
    expect(LUMINA_PENTHOUSE_ROOMS).toHaveLength(5);
    const roomIds = LUMINA_PENTHOUSE_ROOMS.map(r => r.id);
    expect(roomIds).toEqual(['living', 'kitchen', 'office', 'bath', 'bedroom']);

    for (const room of LUMINA_PENTHOUSE_ROOMS) {
      expect(room.eyePosition).toHaveLength(3);
      expect(room.targetPosition).toHaveLength(3);
      expect(room.fov).toBeGreaterThanOrEqual(50);
      expect(room.fov).toBeLessThanOrEqual(75);
      expect(room.areaSqm).toBeGreaterThan(0);
      expect(room.provenance).toBe('measured');

      // Verify associated waypoint exists
      expect(APARTMENT_WAYPOINTS[room.waypointId]).toBeDefined();
    }
  });

  it('defines connected corridor waypoints along the circulation spine', () => {
    expect(APARTMENT_WAYPOINTS.westHall).toBeDefined();
    expect(APARTMENT_WAYPOINTS.centerSpine).toBeDefined();
    expect(APARTMENT_WAYPOINTS.eastHall).toBeDefined();
    expect(APARTMENT_WAYPOINTS.centerSpine.connectedWaypoints).toContain('westHall');
    expect(APARTMENT_WAYPOINTS.centerSpine.connectedWaypoints).toContain('eastHall');
  });
});

describe('InteriorRoomDirector Component', () => {
  it('renders all 5 room selector chips with names and areas', () => {
    render(
      <InteriorRoomDirector
        rooms={LUMINA_PENTHOUSE_ROOMS}
        activeRoom={null}
        onSelectRoom={vi.fn()}
      />
    );

    expect(screen.getByText('Grand Living Salon')).toBeInTheDocument();
    expect(screen.getByText("Chef's Kitchen & Dining")).toBeInTheDocument();
    expect(screen.getByText('Executive Studio & Office')).toBeInTheDocument();
    expect(screen.getByText('Primary Ensuite & Laundry Spa')).toBeInTheDocument();
    expect(screen.getByText('Master Bedroom Suite')).toBeInTheDocument();
  });

  it('triggers onSelectRoom callback when a room chip is clicked', () => {
    const handleSelectRoom = vi.fn();
    render(
      <InteriorRoomDirector
        rooms={LUMINA_PENTHOUSE_ROOMS}
        activeRoom={null}
        onSelectRoom={handleSelectRoom}
      />
    );

    const livingBtn = screen.getByRole('button', { name: /Grand Living Salon/i });
    fireEvent.click(livingBtn);

    expect(handleSelectRoom).toHaveBeenCalledWith(LUMINA_PENTHOUSE_ROOMS[0]);
  });

  it('displays active room specification drawer and provenance badge', () => {
    render(
      <InteriorRoomDirector
        rooms={LUMINA_PENTHOUSE_ROOMS}
        activeRoom={LUMINA_PENTHOUSE_ROOMS[0]}
        onSelectRoom={vi.fn()}
      />
    );

    expect(screen.getByTestId('room-director-inspector')).toBeInTheDocument();
    expect(screen.getByText('South-West Panoramic Lounge')).toBeInTheDocument();
    expect(screen.getByText('Measured from 3D Model')).toBeInTheDocument();
    expect(
      screen.getByText(/Position calibrated to verified 3D furniture nodes/i)
    ).toBeInTheDocument();
  });

  it('renders Exterior Overview button when a room is active', () => {
    const handleSelectRoom = vi.fn();
    render(
      <InteriorRoomDirector
        rooms={LUMINA_PENTHOUSE_ROOMS}
        activeRoom={LUMINA_PENTHOUSE_ROOMS[2]}
        onSelectRoom={handleSelectRoom}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Return to exterior overview/i });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleSelectRoom).toHaveBeenCalledWith(null);
  });
});

describe('ModelViewerAR Component', () => {
  it('renders model-viewer container with honest AR placement disclosure', () => {
    render(
      <ModelViewerAR
        modelUrl="/models/modern_apartment_optimized.glb"
        propertyTitle="The Lumina Penthouse"
      />
    );

    expect(screen.getByTestId('model-viewer-ar-container')).toBeInTheDocument();
    expect(
      screen.getByText(/AR Verification Standard:/i)
    ).toBeInTheDocument();
  });

  it('opens desktop QR code modal when "Experience on Phone in AR" is clicked', () => {
    render(
      <ModelViewerAR
        modelUrl="/models/modern_apartment_optimized.glb"
        propertyTitle="The Lumina Penthouse"
      />
    );

    const qrBtn = screen.getByRole('button', { name: /Open Mobile AR QR Code/i });
    fireEvent.click(qrBtn);

    expect(screen.getByTestId('ar-qr-modal')).toBeInTheDocument();
    expect(
      screen.getByText('Place Residence in Your Space')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Scan with an Android or compatible smartphone camera/i)
    ).toBeInTheDocument();
  });
});

describe('PropertyDetailPage Lumina Penthouse Integration', () => {
  it('renders Lumina Penthouse with Interior Room Director and Optimization disclosure', () => {
    render(
      <MemoryRouter initialEntries={['/properties/lumina-penthouse']}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify Interior Room Director is present
    expect(screen.getByTestId('interior-room-director')).toBeInTheDocument();

    // Verify Optimization Disclosure is present
    expect(
      screen.getByTestId('apartment-provenance-disclosure')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Engineering Audit & Architectural Geometry Calibration: The Lumina Penthouse/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/24.74 MB/i)
    ).toBeInTheDocument();
  });
});
