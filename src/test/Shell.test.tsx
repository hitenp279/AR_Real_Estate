import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('VistaAR Shell & Navigation Suite', () => {
  it('renders the brand logo and core value proposition on HomePage', () => {
    render(<App />);

    // Brand and logo check
    expect(screen.getAllByText(/Vista/i)[0]).toBeInTheDocument();
    
    // Headline check
    const headlineMatches = screen.getAllByText(/Explore your future home/i);
    expect(headlineMatches.length).toBeGreaterThan(0);

    // CTA check
    const exploreButtons = screen.getAllByRole('link', { name: /Explore Properties/i });
    expect(exploreButtons.length).toBeGreaterThan(0);
  });

  it('renders navigation links in header', () => {
    render(<App />);

    const propertiesLinks = screen.getAllByRole('link', { name: /Explore Properties/i });
    expect(propertiesLinks[0]).toBeInTheDocument();

    const arLinks = screen.getAllByRole('link', { name: /AR Experience/i });
    expect(arLinks[0]).toBeInTheDocument();
  });

  it('opens and closes the Attribution & Licensing Modal', () => {
    render(<App />);

    // Trigger button in Navbar
    const creditsBtn = screen.getByLabelText(/View Licensing and 3D Model Credits/i);
    expect(creditsBtn).toBeInTheDocument();

    fireEvent.click(creditsBtn);

    // Verify modal appeared with CC-BY-4.0 and Visthétique details
    expect(screen.getByText(/Licensing & 3D Asset Attribution/i)).toBeInTheDocument();
    const authorMatches = screen.getAllByText(/Visthétique/i);
    expect(authorMatches.length).toBeGreaterThan(0);

    const licenseMatches = screen.getAllByText(/CC BY 4\.0/i);
    expect(licenseMatches.length).toBeGreaterThan(0);

    expect(screen.getByText(/Grab3D — Modern House/i)).toBeInTheDocument();

    // Close button via label
    const closeBtn = screen.getByLabelText(/Close licensing modal/i);
    fireEvent.click(closeBtn);

    // Modal should be dismissed
    expect(screen.queryByText(/Licensing & 3D Asset Attribution/i)).not.toBeInTheDocument();
  });

  it('contains legal disclaimer and footer links', () => {
    render(<App />);

    expect(screen.getByText(/Sample architectural demonstration platform/i)).toBeInTheDocument();
    const authorMatches = screen.getAllByText(/Visthétique/i);
    expect(authorMatches.length).toBeGreaterThan(0);
  });
});
