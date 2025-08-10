# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AR (Augmented Reality) marketing landing page for Tech Connect, a service that helps businesses integrate AR technology into their marketing materials like business cards, flyers, catalogs, and product labels. The site utilizes PalanAR as the underlying AR platform.

## Architecture

### Core Files
- `index.html` - Single-page application with all sections inline
- `style.css` - Custom styles with Tailwind CSS integration and CSS custom properties
- `organic-particles-simple.js` - Optimized Three.js particle system for hero background
- `assets/` - AR demo images and static assets

### Technology Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (no build process)
- **CSS Framework**: Tailwind CSS (CDN) + custom utility classes
- **3D Graphics**: Three.js (r128) with performance optimizations for mobile
- **Animations**: AOS (Animate On Scroll) library
- **Forms**: Netlify Forms with spam protection
- **Fonts**: Google Fonts (Noto Sans JP primary, Montserrat accent)

### Critical Design Patterns

#### CSS Architecture
- CSS custom properties in `:root` for consistent theming (`--navy`, `--accent-yellow`)
- Tailwind `@layer utilities` for component-style classes (`.btn-primary`, `.hero-card`, etc.)
- Mobile-first responsive design with careful attention to performance

#### Performance Optimizations
- Particle system adapts count based on screen size (2000/3500/5000 particles)
- WebGL detection with static fallback (`hero-static-bg` class)
- Tab visibility API pauses animations when not visible
- Debounced resize handling (150ms) to prevent performance issues

#### Form Integration
- Netlify Forms with hidden blueprint form for SPA detection
- Honeypot field for spam protection (`bot-field`)
- Custom validation with accessible error handling

## Business Context

### Service Tiers (Pricing Section)
1. **Simple AR Start**: ¥10,000 - Uses PalanAR free plan, includes credit display
2. **Original AR**: ¥15,000 - Template-based with no credit display  
3. **Custom Made**: Quote-based - Full custom development

### PalanAR Integration
- Tech Connect is a PalanAR certified partner
- Free plan suitable for small projects only
- Paid plans required for high-volume or advanced features
- Monthly costs are external service fees, not Tech Connect charges

## Development Workflows

### Making Style Changes
- Always test on mobile first - particle system has mobile-specific optimizations
- Use existing CSS custom properties before adding new colors
- Maintain high contrast ratios (WCAG AA) especially for buttons
- Test WebGL fallback by disabling hardware acceleration

### Content Updates
- Hero catchphrases: Update both main title and sub-elements for consistency
- Pricing: All prices are tax-inclusive (税込) - maintain this pattern
- Navigation: Update all three nav instances (desktop, mobile, footer) simultaneously

### Performance Considerations
- Hero particle system is performance-critical - test changes on low-end mobile devices
- AOS animations should have appropriate delays (100ms increments)
- Form submissions are handled by Netlify - no server-side code needed

## Deployment

Static site deployed via:
- **Primary**: GitHub Pages (techconnect-em.github.io/ar_lp)
- **Alternative**: Netlify (includes form handling)
- No build process required - direct deployment from repository files

### Git Workflow
- All changes should include both commit and push (`git push origin main`)
- Commit messages should be descriptive and include the 🤖 signature template
- Test major style changes locally before pushing to prevent layout breaks