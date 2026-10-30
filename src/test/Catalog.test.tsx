import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CatalogPage } from '../pages/CatalogPage';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';

describe('VistaAR Property Discovery & Catalog Suite', () => {
  it('renders all sample properties in the catalog initially', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    expect(screen.getByText('The Glass Pavilion')).toBeInTheDocument();
    expect(screen.getByText('The Lumina Penthouse')).toBeInTheDocument();
    expect(screen.getByText('The Azure Courtyard Estate')).toBeInTheDocument();
    expect(screen.getByText('The Solarium Industrial Loft')).toBeInTheDocument();
    
    // Result count check
    expect(screen.getByText((_, el) => el?.textContent === 'Showing 4 of 4')).toBeInTheDocument();
  });

  it('filters properties accurately via text search query', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText(/Search properties/i);

    // Search for "Tribeca"
    fireEvent.change(searchInput, { target: { value: 'Tribeca' } });
    expect(screen.getByText('The Lumina Penthouse')).toBeInTheDocument();
    expect(screen.queryByText('The Glass Pavilion')).not.toBeInTheDocument();
    expect(screen.queryByText('The Azure Courtyard Estate')).not.toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByLabelText(/Clear search input/i);
    fireEvent.click(clearBtn);
    expect(screen.getByText('The Glass Pavilion')).toBeInTheDocument();
  });

  it('filters properties by typology dropdown', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    const typeSelect = screen.getByLabelText(/Property Typology/i);

    // Select "Detached Villa / Residence"
    fireEvent.change(typeSelect, { target: { value: 'detached_house' } });
    expect(screen.getByText('The Glass Pavilion')).toBeInTheDocument();
    expect(screen.queryByText('The Lumina Penthouse')).not.toBeInTheDocument();

    // Select "Courtyard Villa"
    fireEvent.change(typeSelect, { target: { value: 'courtyard_villa' } });
    expect(screen.getByText('The Azure Courtyard Estate')).toBeInTheDocument();
    expect(screen.queryByText('The Glass Pavilion')).not.toBeInTheDocument();
  });

  it('filters properties by bedroom count', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    const bedSelect = screen.getByLabelText(/Bedrooms/i);

    // Select 4+ Bedrooms (Glass Pavilion has 4, Azure Courtyard has 5)
    fireEvent.change(bedSelect, { target: { value: '4' } });
    expect(screen.getByText('The Glass Pavilion')).toBeInTheDocument();
    expect(screen.getByText('The Azure Courtyard Estate')).toBeInTheDocument();
    expect(screen.queryByText('The Lumina Penthouse')).not.toBeInTheDocument();
    expect(screen.queryByText('The Solarium Industrial Loft')).not.toBeInTheDocument();
  });

  it('filters properties by price bracket', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    const priceSelect = screen.getByLabelText(/Price Range/i);

    // Select Under ₹1.5 Cr (₹1,24,00,000 Solarium Loft)
    fireEvent.change(priceSelect, { target: { value: 'under_1.5cr' } });
    expect(screen.getByText('The Solarium Industrial Loft')).toBeInTheDocument();
    expect(screen.queryByText('The Glass Pavilion')).not.toBeInTheDocument();

    // Select Above ₹2.5 Cr (₹3,20,00,000 Azure Courtyard)
    fireEvent.change(priceSelect, { target: { value: 'above_2.5cr' } });
    expect(screen.getByText('The Azure Courtyard Estate')).toBeInTheDocument();
    expect(screen.queryByText('The Solarium Industrial Loft')).not.toBeInTheDocument();
  });

  it('sorts properties by price ascending and area descending', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    const sortSelect = screen.getByLabelText(/Order By/i);

    // Sort by price ascending
    fireEvent.change(sortSelect, { target: { value: 'price_asc' } });
    const titles = screen.getAllByRole('heading', { level: 2 });
    expect(titles[0]).toHaveTextContent('The Solarium Industrial Loft'); // $1.24M
    expect(titles[1]).toHaveTextContent('The Glass Pavilion'); // $1.85M

    // Sort by area descending
    fireEvent.change(sortSelect, { target: { value: 'area_desc' } });
    const titlesByArea = screen.getAllByRole('heading', { level: 2 });
    expect(titlesByArea[0]).toHaveTextContent('The Azure Courtyard Estate'); // 480 m²
    expect(titlesByArea[1]).toHaveTextContent('The Glass Pavilion'); // 342 m²
  });

  it('toggles between Metric and Imperial area measurements', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    // Initially Metric
    expect(screen.getByText('342 m²')).toBeInTheDocument();

    // Toggle to Imperial
    const imperialBtn = screen.getByRole('button', { name: /Imperial \(sq ft\)/i });
    fireEvent.click(imperialBtn);

    // Verified conversion: 342 m² * 10.76391 ≈ 3,681 sq ft
    expect(screen.getByText('3,681 sq ft')).toBeInTheDocument();
  });

  it('renders an architectural empty state and clears filters cleanly', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText(/Search properties/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentSkyscraper' } });

    expect(screen.getByText(/No architectural listings match your criteria/i)).toBeInTheDocument();

    // Reset button
    const clearBtn = screen.getByRole('button', { name: /Clear All Filters/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText('The Glass Pavilion')).toBeInTheDocument();
    expect(screen.getByText('The Lumina Penthouse')).toBeInTheDocument();
  });

  it('renders missing property recovery state for invalid route', () => {
    render(
      <MemoryRouter initialEntries={['/properties/non-existent-id']}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Invalid Property Reference/i)).toBeInTheDocument();
    expect(screen.getByText(/Property "non-existent-id" was not found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Portfolio/i })).toBeInTheDocument();
  });

  it('renders matched property details for valid route', () => {
    render(
      <MemoryRouter initialEntries={['/properties/glass-pavilion']}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'The Glass Pavilion' })).toBeInTheDocument();
    expect(screen.getByText('₹1,85,00,000')).toBeInTheDocument();
    expect(screen.getByText(/Cantilevered architectural steel structure/i)).toBeInTheDocument();
    const modelMatches = screen.getAllByText(/modern-house.glb/i);
    expect(modelMatches.length).toBeGreaterThan(0);
  });

  it('formats property prices in Indian Rupees (INR) with standard lakh/crore grouping', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <CatalogPage />
      </MemoryRouter>
    );

    // Verify INR currency symbol and grouping across listings
    expect(screen.getByText('₹1,85,00,000')).toBeInTheDocument(); // Glass Pavilion
    expect(screen.getByText('₹2,45,00,000')).toBeInTheDocument(); // Lumina Penthouse
    expect(screen.getByText('₹3,20,00,000')).toBeInTheDocument(); // Azure Courtyard
    expect(screen.getByText('₹1,24,00,000')).toBeInTheDocument(); // Solarium Loft
  });
});
