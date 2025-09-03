# Disruptors Media React Site

> Next-generation AI marketing agency website built with React 19 + TypeScript + Vite

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.8.3-blue)
![React](https://img.shields.io/badge/react-19.1.1-blue)
![Vite](https://img.shields.io/badge/vite-7.1.2-purple)

## Overview

The Disruptors Media React Site is a modern, high-performance web application that serves as the primary digital presence for Disruptors Media's AI marketing agency. This **standalone repository** can be developed, deployed, and maintained independently while offering optional integration with the broader DisruptorEcosystem.

🔗 **Repository**: https://github.com/TechIntegrationLabs/disruptorsmedia.react.git  
🏗️ **Status**: Active Development  
📚 **Documentation**: Comprehensive standalone documentation included  
⚡ **Standalone**: Complete self-sufficient operation

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev    # Start development server on http://localhost:5173
```

### Blog Automation Setup

```bash
npm run blog:setup      # Interactive setup wizard
npm run blog:test       # Test connections
npm run blog:dry-run    # Test publishing (no files created)
npm run blog:publish    # Publish approved posts
```

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Shared components
│   └── layout/           # Header, Footer components
├── pages/                # Route components + Blog system
│   ├── Blog.tsx         # Blog listing page
│   ├── BlogPost.tsx     # Individual blog post page
│   └── ...              # Other pages (Home, About, Services, etc.)
├── content/
│   └── blog/            # MDX blog posts (auto-generated)
│       ├── 2024/
│       └── 2025/
└── styles/              # CSS modules and global styles

scripts/blog-automation/  # Automated publishing system
├── services/            # Google APIs + OpenAI integration
├── publishPosts.js      # Main automation script
├── scheduler.js         # Cron job scheduling
└── setup.js            # Interactive setup wizard

public/
├── images/blog/         # AI-generated blog images
└── ...                 # Static assets
```

## 🤖 Blog Automation System

### Features

- **Google Sheets Integration** - Reads blog queue from your spreadsheet
- **Google Docs Content** - Extracts full article text automatically  
- **AI Image Generation** - Creates feature + content images with DALL-E 3
- **MDX Blog Posts** - Generates complete files with SEO frontmatter
- **Automated Scheduling** - Publishes based on approval + date conditions
- **Deployment Integration** - Supports Vercel, Netlify, GitHub Actions

### Publishing Logic

Posts are automatically published when **ALL** conditions are met:

✅ **Column O = "YES"** (Approval status)  
✅ **Publish Date ≤ Today** (Date-based scheduling)  
✅ **Valid Google Docs URL** (Column B contains docs.google.com link)

### Quick Commands

```bash
# Setup (run once)
npm run blog:setup

# Testing  
npm run blog:test              # Test all API connections
npm run blog:dry-run           # Simulate publishing

# Publishing
npm run blog:publish           # Publish approved posts

# Scheduling
npm run blog:schedule-setup    # Show cron job instructions
```

## 🏗️ Architecture

### Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6 
- **Styling**: CSS modules → Tailwind CSS v4 + shadcn/ui (planned)
- **HTTP Client**: Axios → modern fetch with TypeScript (planned)
- **Animations**: GSAP (business license required)
- **Blog System**: MDX + gray-matter + Fuse.js search
- **SEO**: React Helmet Async (planned implementation)

### Current Implementation

- ✅ Basic SPA with Header/Footer layout and 6 main routes
- ✅ Responsive header with mobile hamburger menu
- ✅ Blog listing and individual post pages
- ✅ CSS-based styling with custom fonts
- ✅ Route-based navigation using React Router
- ✅ Complete blog automation system

### Blog System Integration

The automation system integrates seamlessly with the React blog:

- **Generated Content**: MDX files with complete frontmatter
- **Images**: AI-generated, optimized (JPEG + WebP)
- **SEO**: Ready for React Helmet integration
- **Routing**: `/blog` and `/blog/:year/:slug` routes configured
- **Components**: Blog listing + individual post components ready

## 📋 Development Commands

### Main Application

```bash
npm install       # Install dependencies
npm run dev       # Development server (Vite)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

### Blog Automation

```bash
# Setup & Testing
npm run blog:setup              # Interactive setup wizard
npm run blog:test               # Test all API connections

# Publishing  
npm run blog:publish            # Publish approved posts
npm run blog:dry-run           # Test run (no files created)

# Scheduling
npm run blog:schedule-setup     # Cron job setup instructions
```

## 🔧 Configuration

### Environment Setup

The blog automation requires:

1. **Google Service Account** (Sheets + Docs APIs)
2. **OpenAI API Key** (DALL-E image generation)  
3. **Spreadsheet Access** (shared with service account)

Run `npm run blog:setup` for interactive configuration.

### Blog Development Plan

This project follows a comprehensive 10-week blog development roadmap:

- **Phase 1**: MDX setup, basic pages ✅
- **Phase 2**: Table of contents, syntax highlighting (planned)
- **Phase 3**: Search (Fuse.js), tags, categories (planned)
- **Phase 4**: SEO optimization, performance (planned)  
- **Phase 5**: Interactive components, engagement (planned)

See `BLOG_DEVELOPMENT_PLAN.md` for complete details.

### Integration Context

This React app is part of the larger Disruptors Media ecosystem:

- **Legacy React site**: `disruptorsmedia.com/public/` (maintenance only)
- **Laravel CMS backend**: `admin.disruptorsmedia.com/` (API provider)
- **API Integration**: Existing REST endpoints for content

## 🚀 Deployment

### Production Build

```bash
npm run build     # Creates dist/ directory
npm run preview   # Test production build locally
```

### Automated Deployment

The blog automation system supports:

- **Vercel**: Automatic deployment on git push
- **Netlify**: CLI-based deployment  
- **GitHub Actions**: Copy `scripts/blog-automation/github-action.yml`
- **Manual**: Local build + upload

Set `DEPLOYMENT_METHOD` in `.env` for integrated deployment.

## 📚 Documentation

### Blog Automation

- **Quick Start**: `scripts/blog-automation/QUICKSTART.md`
- **Complete Setup**: `scripts/blog-automation/SETUP.md`
- **API Reference**: `scripts/blog-automation/README.md`
- **Development Plan**: `BLOG_DEVELOPMENT_PLAN.md`

### Component Development

- **TypeScript**: All components use interfaces for props
- **Styling**: Co-located CSS modules
- **Responsive**: Mobile-first design approach
- **Error Handling**: Error boundaries for production resilience

## 🔍 Key Files

- `src/App.tsx` - Main application with routing
- `src/pages/Blog.tsx` - Blog listing with search/filtering
- `src/pages/BlogPost.tsx` - Individual post display
- `scripts/blog-automation/publishPosts.js` - Main automation
- `scripts/blog-automation/.env` - Configuration file
- `BLOG_DEVELOPMENT_PLAN.md` - Complete development roadmap

## 🛠️ Development Guidelines

### File Organization

- **Pages**: Route-level components in `/pages/`
- **Components**: Reusable UI in `/components/` with co-located CSS
- **Content**: Auto-generated MDX files in `/content/blog/`
- **Assets**: Static files in `/public/` directory

### Blog Content

- **Generated**: Automated system creates complete MDX files
- **Manual**: Edit in Google Docs, approve in Google Sheets
- **Images**: AI-generated, stored in `/public/images/blog/`
- **SEO**: Complete frontmatter with meta tags and structured data

## 📞 Support

For setup help or issues:

1. **Test Connections**: `npm run blog:test`
2. **Check Logs**: `scripts/blog-automation/logs/`
3. **Documentation**: Complete setup guides available
4. **Debug Mode**: Set `DEBUG=true` in `.env`

---

**🎉 Ready to automate your blog publishing with AI-powered content and images!**