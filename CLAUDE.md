# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**New Disruptors Media React Site** - Modern React 18 + TypeScript + Vite application with comprehensive blog development roadmap. This is the **PRIMARY DEVELOPMENT FOCUS** within the multi-platform Disruptors Media environment.

**GitHub Repository**: https://github.com/TechIntegrationLabs/disruptorsmedia.react.git

## Commands

### Development
```bash
npm install       # Install dependencies
npm run dev       # Vite development server (http://localhost:5173)
npm run build     # Production build with TypeScript compilation
npm run preview   # Preview production build locally
```

### Quality Control
```bash
npm run lint      # ESLint with TypeScript support
npm run type-check # TypeScript compilation check (not implemented yet)
npm test          # Test suite (not implemented yet)
```

## Architecture

### Technology Stack
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6 
- **Styling**: CSS modules with planned Tailwind CSS v4 + shadcn/ui migration
- **HTTP Client**: Axios for API integration (planned: modern fetch with TypeScript)
- **Animations**: GSAP (business license required)
- **Utilities**: clsx for conditional class names
- **Blog System**: MDX + gray-matter + Fuse.js search
- **SEO**: React Helmet Async (planned implementation)

### Project Structure
```
src/
├── components/
│   ├── common/           # Shared components
│   └── layout/           # Header, Footer components
├── pages/                # Route components (Home, About, Services, etc.)
├── styles/               # CSS modules and global styles
├── assets/               # Static assets (images, fonts, etc.)
└── main.tsx             # Application entry point
```

### Current Implementation
- **Basic SPA** with Header/Footer layout and 6 main routes
- **Responsive header** with mobile hamburger menu
- **CSS-based styling** with custom fonts (OT Neue Montreal, PP Supply Mono)
- **Route-based navigation** using React Router
- **Image assets** in public/images/ and public/fonts/

## Blog Development Plan

### Critical Context
The primary development goal is implementing a comprehensive **MDX-powered blog system**. See `BLOG_DEVELOPMENT_PLAN.md` for the complete 10-week roadmap covering:

**Phase 1 (Weeks 1-2)**: MDX setup, basic blog pages, content management
**Phase 2 (Weeks 3-4)**: Table of contents, syntax highlighting, reading progress
**Phase 3 (Weeks 5-6)**: Search (Fuse.js), tags, categories, filtering
**Phase 4 (Weeks 7-8)**: SEO optimization, performance, image management
**Phase 5 (Weeks 9-10)**: Interactive components, user engagement features

### Planned Architecture Additions
```
src/
├── components/
│   ├── blog/             # Blog listing, cards, search, pagination
│   ├── post/             # Post content, navigation, TOC, progress
│   └── search/           # Search functionality components
├── content/
│   └── blog/             # MDX blog posts organized by year
├── lib/
│   ├── blog/             # MDX processing, posts management
│   ├── utils/            # SEO, date formatting, reading time
│   └── types/            # TypeScript definitions
├── hooks/                # Custom hooks for blog functionality
└── pages/
    ├── Blog.tsx          # Main blog listing
    ├── BlogPost.tsx      # Individual post pages
    └── BlogCategory.tsx  # Category-specific pages
```

### Planned Dependencies
- **Content**: @mdx-js/react, gray-matter, remark/rehype ecosystem
- **Design**: shadcn/ui, Tailwind CSS v4, @tailwindcss/typography
- **Search**: Fuse.js (client-side), future Algolia integration
- **Features**: react-syntax-highlighter, react-intersection-observer
- **SEO**: React Helmet Async, structured data support

## Integration Context

### Multi-Platform Environment
This React app is part of a larger Disruptors Media ecosystem:
- **Legacy React site**: disruptorsmedia.com/public/ (maintenance only)
- **Laravel CMS backend**: admin.disruptorsmedia.com/ (API provider)
- **API Integration**: Existing REST endpoints for content management

### API Integration Points
Current Laravel API endpoints that may be consumed:
- `GET /api/homepage-settings` - Homepage content configuration
- `GET /api/header-data` - Header/navigation data
- `GET /api/featured-clients` - Client logos and information
- `GET /api/projects` - Portfolio items
- `GET /api/website-meta` - SEO metadata

### Expected Environment Variables
```bash
VITE_APP_BASE_URL=http://localhost:8000/api  # Laravel backend API
VITE_GITHUB_REPO=https://github.com/TechIntegrationLabs/disruptorsmedia.react.git
```

## Development Guidelines

### Code Patterns
- **TypeScript interfaces** for all props and API responses
- **CSS Modules** for component-specific styles
- **React hooks** for state management
- **Functional components** with proper TypeScript typing
- **Error boundaries** for robust error handling

### File Organization
- **Pages**: Route-level components in `/pages/`
- **Components**: Reusable UI in `/components/` with co-located CSS
- **Assets**: Static files in `/public/` directory
- **Types**: Shared TypeScript definitions in dedicated files

### Styling Approach
- **Current**: CSS modules with custom properties
- **Planned**: Migration to Tailwind CSS v4 + shadcn/ui
- **Typography**: Custom fonts with fallback system
- **Responsive**: Mobile-first approach with breakpoint utilities

## Common Development Tasks

### Adding New Pages
1. Create component in `src/pages/ComponentName.tsx`
2. Add corresponding CSS file if needed
3. Update routing in `src/App.tsx`
4. Add navigation links in `Header.tsx`

### Blog Development Workflow
1. **Follow BLOG_DEVELOPMENT_PLAN.md phases**
2. **Setup MDX processing** before content creation
3. **Implement shadcn/ui components** for consistent design
4. **Test with sample content** before full migration
5. **Optimize performance** throughout development

### Component Development
1. **Use TypeScript interfaces** for all props
2. **Co-locate CSS modules** with components
3. **Implement responsive design** from mobile-up
4. **Add error boundaries** for production resilience

## Important Notes

### Development Priorities
1. **PRIMARY**: Blog system implementation (see BLOG_DEVELOPMENT_PLAN.md)
2. **SECONDARY**: API integration with existing Laravel backend
3. **MAINTENANCE**: Keep existing pages functional during blog development

### Technical Considerations
- **GSAP License**: Business license required for commercial animations
- **Build Target**: Modern browsers with ES2020+ support
- **Performance**: Target Lighthouse scores > 95
- **SEO**: React Helmet integration planned for meta management

### Migration Context
- **Content Migration**: From Laravel CMS to MDX format
- **URL Preservation**: Maintain existing route structure
- **API Compatibility**: Preserve existing API contracts
- **Asset Optimization**: Implement responsive images and CDN