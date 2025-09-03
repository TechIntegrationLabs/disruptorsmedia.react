# Ecosystem Registry - DisruptorEcosystem

## Overview

This document serves as the **master registry** for all repositories, applications, and modules within the DisruptorEcosystem. It is automatically synchronized across all connected repositories to ensure every repo has complete context about the ecosystem structure, relationships, and current development status.

**Last Updated**: January 2025 (Auto-sync enabled)
**Registry Version**: 1.0

## Core Applications

### 1. Onboarding System
- **Path**: `/apps/onboarding/`
- **GitHub**: Private repository
- **Status**: 🟢 **PRODUCTION READY** - Fully functional business intake system
- **Technology**: Next.js 15 + TypeScript + Turbopack
- **Port**: 3000
- **Key Features**: Apify + OpenAI integration, database migrations, health checks
- **Commands**: `npm run dev`, `npm run build`, `npm run health`

### 2. BizBrainOS
- **Path**: `/apps/bizbrainos/`
- **GitHub**: Private repository
- **Status**: 🟡 **PRD STAGE** - Business Brain exploration platform
- **Technology**: Next.js 15 + TypeScript
- **Port**: 3001
- **Key Features**: Business intelligence dashboard, data visualization
- **Commands**: `npm run dev`, `npm run build`, `npm run lint`

### 3. ClientOps
- **Path**: `/apps/clientops/`
- **GitHub**: Private repository
- **Status**: 🟡 **PRD STAGE** - Agency operations platform
- **Technology**: Next.js 15 + TypeScript
- **Port**: Default Next.js
- **Key Features**: Project management, client communication, workflow automation
- **Commands**: `npm run dev`, `npm run build`, `npm run type-check`

### 4. ControlPlane
- **Path**: `/apps/controlplane/`
- **GitHub**: Private repository
- **Status**: 🟡 **PRD STAGE** - Administrative command center
- **Technology**: Next.js + Prisma + TypeScript
- **Port**: Default Next.js
- **Key Features**: Database management, system monitoring, admin tools
- **Commands**: `npm run dev`, `npm run db:migrate`, `npm run health`

### 5. Business Brain Manager
- **Path**: `/apps/business-brain-manager/`
- **GitHub**: Private repository
- **Status**: 🟡 **ACTIVE DEVELOPMENT** - Business Brain management with OpenAI orchestration
- **Technology**: Node.js + SQLite + TypeScript
- **Port**: Default Node.js
- **Key Features**: AI agent orchestration, business profile management
- **Commands**: `npm run dev`, `npm run seed`, `npm run start`

### 6. Disruptors Media Site (Multi-Platform)
- **Path**: `/apps/disruptors-media-site/`
- **Status**: 🔴 **COMPLEX MULTI-PLATFORM** - Three interconnected systems

#### 6a. New React Site (PRIMARY)
- **Path**: `/apps/disruptors-media-site/disruptorsmedia.react/`
- **GitHub**: `https://github.com/TechIntegrationLabs/disruptorsmedia.react.git`
- **Status**: 🟢 **ACTIVE DEVELOPMENT** - Primary development focus
- **Technology**: React 18 + TypeScript + Vite
- **Port**: 5173 (Vite default)
- **Key Features**: MDX blog system, shadcn/ui, GSAP animations, standalone operation
- **Commands**: `npm run dev`, `npm run build`, `npm run lint`

#### 6b. Laravel CMS Backend
- **Path**: `/apps/disruptors-media-site/admin.disruptorsmedia.com/`
- **GitHub**: No independent repo (part of parent)
- **Status**: 🟡 **MAINTENANCE MODE** - API provider for multiple frontends
- **Technology**: Laravel 9 + MySQL + PHP
- **Port**: 8000 (PHP artisan serve)
- **Key Features**: Content management, API endpoints, media storage
- **Commands**: `php artisan serve`, `php artisan migrate`

#### 6c. Legacy Site
- **Path**: `/apps/disruptors-media-site/disruptorsmedia.com/`
- **GitHub**: No independent repo (part of parent)
- **Status**: 🔴 **MAINTENANCE MODE** - Critical fixes only
- **Technology**: HTML/JS/React hybrid
- **Port**: 3000 (React dev server)
- **Key Features**: Existing client site, being replaced by React site
- **Commands**: `npm start`, `npm run build`

### 7. DisruptorSiteNew
- **Path**: `/apps/disruptorsitenew/`
- **GitHub**: Private repository
- **Status**: 🟢 **COMPLETE** - React 19 marketing website
- **Technology**: React 19 + Create React App
- **Port**: 3000
- **Key Features**: Modern marketing site, complete implementation
- **Commands**: `npm start`, `npm run build`, `npm test`

## Shared Services & Infrastructure

### Website Modules System
- **Path**: `/website-modules/`
- **GitHub**: Various independent repositories
- **Status**: 🟢 **PRODUCTION-READY** - Modular website functionality system
- **Key Modules**:
  - `auto-blog-module/` - AI-powered blog content generation
  - `ai-module-agent/` - AI-powered module generation tools
  - `longtail-landing-pages-generator/` - Dynamic landing page creation

### Shared Components
- **Path**: `/shared/`
- **Status**: 🟡 **ACTIVE** - Shared resources and utilities
- **Components**:
  - `/assets/` - Client tools and media projects
  - `/types/` - Shared TypeScript type definitions
  - `/modules/site-standards/` - Universal site rules and compliance

### Platform Services
- **Path**: `/services/`
- **Status**: 🟡 **DEVELOPMENT** - Modular data processing workflows
- **Components**: 
  - `/pipelines/` - Data processing workflows

## Development Infrastructure

### Ecosystem Scripts
- **Path**: `/scripts/`
- **Status**: 🟢 **ACTIVE** - Ecosystem-wide automation
- **Key Scripts**:
  - `claude-docs-sync.js` - Documentation management
  - `env-sync.js` - Environment variable synchronization
  - `ecosystem-sync-automator.js` - Automated ecosystem synchronization
  - `master-orchestrator.js` - Ecosystem-wide command orchestration

### AI Agent System
- **Status**: 🟢 **OPERATIONAL** - 10+ specialized agents for code quality
- **Core Agents**:
  - `business-brain-architect` - Business Brain schema consistency
  - `ecosystem-compliance-guardian` - Architectural alignment
  - `pipeline-orchestration-specialist` - Data processing optimization
  - `multi-app-coordinator` - Cross-app consistency
  - `vercel-deployment-optimizer` - Deployment management
  - `claude-code-docs-manager` - Documentation synchronization

### Conditional Agents
- **module-subagent** - Activates for website module projects
- **GSAP specialist** - Animation and performance optimization
- **Laravel specialist** - Backend and API optimization

## Repository Relationships

### Independent Repositories
1. **disruptorsmedia.react** - Standalone with optional ecosystem integration
2. **Individual website modules** - Self-contained functionality packages
3. **Client tools suite** - Independent Vite + React 19 applications

### Integrated Repositories
- **Core applications** - Shared environment, documentation, and deployment
- **Shared services** - Common resources across multiple applications
- **Development tools** - Ecosystem-wide automation and quality control

### Hybrid Repositories
- **Disruptors Media Site** - Multi-platform with both integrated and independent components

## Technology Standards

### Frontend Frameworks
- **Primary**: React 18/19 with TypeScript
- **Meta-Framework**: Next.js 15 with Turbopack
- **Build Tools**: Vite (standalone), Turbopack (Next.js)
- **State Management**: React hooks, Zustand for complex state

### Backend Technologies
- **Database**: Neon Postgres with Prisma ORM
- **API**: tRPC for type-safe APIs, REST for external integrations
- **Queue System**: Vercel Queue for async processing
- **Caching**: Upstash Redis

### Styling & UI
- **CSS Framework**: Tailwind CSS v4 with custom design systems
- **Component Library**: shadcn/ui with Radix UI primitives
- **Animations**: GSAP (business license required)

### Infrastructure
- **Hosting**: Vercel-first with DigitalOcean backup
- **Functions**: Vercel Functions with Active CPU
- **Storage**: Vercel Blob for file storage
- **CDN**: Vercel Edge Network

### AI Integration
- **Services**: OpenAI, Anthropic via AI Gateway
- **Scraping**: Apify, Playwright Cloud, Firecrawl
- **MCP Servers**: Configured for Vercel, external services, and agent orchestration

## Development Commands

### Repository-Level Commands
```bash
# Website Modules Management
npm run module:create     # Create new module with templates
npm run module:validate   # Validate module compliance
npm run module:build      # Build all modules

# Documentation Management
npm run docs:sync         # Sync Claude Code documentation
npm run docs:validate     # Validate documentation consistency

# Environment Management
npm run env:sync          # Sync environment variables across apps
npm run env:setup         # Initial environment setup

# Master Orchestrator
npm run master            # Run master orchestrator
npm run master:health     # Check health of all services
npm run master:setup      # Setup all applications

# Site Standards
npm run rules:check       # Check all apps for rule violations
npm run rules:validate    # Validate all site rules

# Session Management
npm run session:start     # Start Claude session tracking
npm run claude:autostart # Auto-start Claude session
```

### Application-Specific Ports
- **Onboarding**: 3000 (Next.js default)
- **BizBrainOS**: 3001
- **Disruptors Media React**: 5173 (Vite default)
- **Disruptors Media Legacy**: 3000 (React dev server)
- **Laravel Backend**: 8000 (PHP artisan serve)
- **DisruptorSiteNew**: 3000 (Create React App)

## Integration Patterns

### API Integration
- **Internal APIs**: tRPC for type-safe communication
- **External APIs**: REST with TypeScript interfaces
- **Authentication**: Multi-factor with magic links
- **Rate Limiting**: Built-in protection for all public APIs

### Data Flow
```
User Interface (React/Next.js)
           ↓
State Management (Hooks/Zustand)
           ↓
API Layer (tRPC/REST)
           ↓
Database (Neon Postgres + Prisma)
           ↓
External Services (OpenAI, Apify, etc.)
```

### Deployment Patterns
- **Independent**: Each app deploys separately (disruptorsmedia.react)
- **Coordinated**: Shared deployment pipeline (core apps)
- **Staged**: Sequential deployment with dependencies
- **Blue-Green**: Zero-downtime production deployments

## Quality Standards

### Code Quality
- **TypeScript**: Strict mode across all applications
- **ESLint**: Consistent linting rules ecosystem-wide
- **Prettier**: Automated code formatting
- **Testing**: Jest + React Testing Library + Playwright

### Performance Standards
- **Core Web Vitals**: All metrics in "Good" range
- **Lighthouse Scores**: Performance > 95, Accessibility > 95
- **Bundle Size**: Optimized with tree shaking and code splitting
- **Loading Times**: < 2 seconds Time to Interactive

### Security Standards
- **Authentication**: Role-based access control (RBAC)
- **API Security**: Rate limiting, input validation, CORS configuration
- **Data Protection**: End-to-end encryption for sensitive data
- **Dependency Security**: Regular vulnerability scanning

## Business Context

### Revenue Streams
- **Freemium SaaS**: BizBrainOS with tiered pricing
- **Agency Licensing**: ClientOps platform
- **API Monetization**: Business Brain data access
- **White-Label Solutions**: Custom ecosystem deployments

### Target Markets
- **Primary**: Mid-market businesses seeking AI marketing solutions
- **Secondary**: Agencies needing operational tools and automation
- **Tertiary**: Enterprise clients requiring custom business intelligence

### Competitive Advantages
- **AI-First Approach**: Integrated AI throughout all applications
- **Modular Architecture**: Flexible deployment and customization options
- **Performance Excellence**: Superior loading times and user experience
- **Comprehensive Platform**: End-to-end business intelligence and marketing automation

## Ecosystem Health Monitoring

### Health Check Endpoints
- **Onboarding**: `npm run health` - System health verification
- **ControlPlane**: `npm run health` - Database and service status
- **Disruptors Media React**: Built-in health monitoring (planned)

### Performance Monitoring
- **Real-time Metrics**: Response times, error rates, throughput
- **Business Analytics**: User engagement, conversion rates, retention
- **Infrastructure Monitoring**: Resource utilization, scaling events

### Quality Assurance
- **Automated Testing**: Continuous integration with quality gates
- **Code Review**: Peer review for all changes across applications
- **Security Scanning**: Regular dependency and vulnerability assessments

## Future Roadmap

### Q1 2025 Priorities
1. **Disruptors Media React Blog System** - Complete MDX implementation
2. **Performance Optimization** - Achieve Lighthouse > 95 across all apps
3. **Documentation Completeness** - Ensure all repos have comprehensive docs

### Q2 2025 Enhancements
1. **Advanced AI Integration** - Enhanced personalization across platforms
2. **Cross-App Data Sharing** - Business Brain integration with all applications
3. **White-Label Platform** - Customizable deployments for enterprise clients

### Q3 2025 Scaling
1. **International Expansion** - Multi-language and regional support
2. **Enterprise Features** - Advanced reporting, analytics, and customization
3. **API Marketplace** - Public APIs for third-party integrations

## Support and Maintenance

### Documentation Locations
- **Master Documentation**: This file (ECOSYSTEM_REGISTRY.md)
- **Application-Specific**: Each app's CLAUDE.md and README.md
- **Technical Specifications**: PRD.md files for detailed requirements
- **Development Guides**: Setup and workflow documentation

### Issue Tracking
- **Cross-Ecosystem Issues**: Central GitHub project board
- **Application-Specific**: Individual repository issue trackers
- **Documentation Issues**: Tracked in master repository

### Emergency Procedures
- **Production Issues**: Immediate rollback capabilities
- **Security Incidents**: Automated alerting and response procedures
- **Performance Degradation**: Auto-scaling and optimization protocols

---

## Registry Synchronization

**Auto-Sync Status**: ✅ Enabled
**Last Sync**: January 2025
**Next Sync**: Triggered by ecosystem changes
**Sync Scope**: All connected repositories and applications

This registry is automatically updated when:
- New applications are added to the ecosystem
- Repository relationships change
- Technology stacks are updated
- Business priorities shift
- Integration patterns evolve

---

**Document Maintained By**: Ecosystem automation scripts
**Manual Updates**: Quarterly review and validation
**Version Control**: Tracked across all connected repositories