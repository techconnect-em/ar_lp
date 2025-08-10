# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AR (Augmented Reality) marketing landing page for Tech Connect, a service that helps businesses integrate AR technology into their marketing materials like business cards, flyers, catalogs, and product labels.

## Architecture

### Core Files
- `index.html` - Main landing page with complete AR marketing site
- `style.css` - Custom styles with Tailwind CSS integration and custom CSS variables
- `organic-particles-simple.js` - Three.js particle system for hero section background animation
- `images/` - Static assets directory

### Technology Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **CSS Framework**: Tailwind CSS (loaded via CDN)
- **3D Graphics**: Three.js (r128) for particle animations
- **Animations**: AOS (Animate On Scroll) library
- **Fonts**: Google Fonts (Noto Sans JP, Montserrat)

### Design System
The site uses a consistent design system with CSS custom properties:
- Navy blue (`--navy: #2B4570`) for primary text and backgrounds
- Accent yellow (`--accent-yellow: #F9E547`) for highlights and CTAs
- Custom Tailwind utility classes for consistent theming

### Key Features
1. **Hero Section**: Smartphone-like container with 3D particle background
2. **AR Service Sections**: Problem/solution presentation, benefits, services, pricing
3. **Interactive Elements**: FAQ accordion, contact form, mobile navigation
4. **Responsive Design**: Mobile-first approach with responsive breakpoints

## Development Notes

### CSS Architecture
- Uses CSS custom properties for consistent theming
- Tailwind CSS utilities extended with custom classes
- Component-based CSS organization in `style.css`

### JavaScript Components
- `OrganicParticleSystem`: Three.js-based particle animation system
- Mobile menu toggle functionality
- Smooth scrolling navigation
- FAQ accordion interactions
- Form validation and submission

### Content Management
The main catchphrases are located in the hero section:
- Main catchphrase: Line 313-315 in `index.html`
- Sub catchphrases: Line 318-321 in `index.html`

### Loading Strategy
The site implements a loading screen system that:
1. Shows loading animation while dependencies load
2. Initializes Three.js particle system
3. Sets up AOS animations
4. Initializes basic functionality (navigation, forms, etc.)

## Deployment

This is a static site repository designed to be deployed to:
- GitHub Pages (recommended)
- Netlify
- Vercel
- Any static hosting service

No build process is required - the site runs directly from the HTML/CSS/JS files.