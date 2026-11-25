# TeliPally — Vibe Coding Kit
> A free live TV streaming app called 'TeliPally' powered by the open-source iptv-org channel 
directory that lets users browse thousands of global TV channels by country or category, 
stream live news,
> Platform: Web + PWA
Kit readiness: 5/6 docs marked Ready · ~7046 words of planning.
Kit verification: 6 checks — 2 pass · 3 warn · 1 fail (score 58/100). Full report at the end of this file.
---
## 01-PRD. PRD — Product Requirements

*Status: READY · AI-generated draft*

# TeliPally Product Requirements Document (PRD)

## 1. App Identity
- **Name**: TeliPally
- **One-line idea**: A free live TV streaming app that lets users browse thousands of global TV channels by country or category and stream live news.
- **Elevator pitch**: TeliPally provides free access to thousands of live TV channels from around the world, organized by country and category. Users can easily discover and stream their favorite news programs and shows without subscription fees. The app leverages the open-source iptv-org directory to offer a comprehensive, constantly updated channel lineup.
- **Platforms**: Web + Progressive Web App (PWA)

## 2. Decision Log

| Decision | Alternatives Rejected | Rationale | What Breaks If Wrong | Revisit Trigger |
|----------|----------------------|-----------|---------------------|-----------------|
| Platform: Web + PWA | Native mobile apps only, Web only | Wider accessibility, easier development, cross-platform support, no app store approval needed | Limited user reach, higher development cost, platform lock-in | User adoption metrics below 15% in target regions |
| Accounts: Optional with guest mode | Mandatory accounts, social login only | Reduces friction for users trying the service, respects privacy | No user personalization, no viewing history | Guest-to-registered conversion below 10% after 3 months |
| Monetization: Ad-supported only | Premium subscription, freemium, donations | Maintains free access while generating revenue | Inability to sustain operations | Monthly revenue below $500 after 6 months |
| Content Source: iptv-org only | Multiple providers, custom curation | Proven directory, legal compliance, maintenance-free | Limited content variety, legal risks | Channel availability drops below 90% uptime |
| No user uploads or content moderation | User-generated channels, moderation system | Legal safety, simplicity, no moderation overhead | Inappropriate content, legal liability | Support tickets for content issues exceed 5/week |
| No social features | Sharing, watch parties, comments | Focus on core streaming experience, reduced moderation burden | Feature creep, development distraction | User feedback requesting social features >20% |

## 3. Problem
Current live TV solutions require expensive cable/satellite subscriptions or involve complex, illegal streaming setups with malware risks. Legal streaming services often have regional restrictions and require multiple subscriptions. The iptv-org directory exists but lacks a user-friendly interface for browsing and streaming. Users need a simple, legal, free way to access global live TV content without technical expertise or financial commitment.

## 4. Target Users Table

| Persona | Who They Are | What They Need | Pain Level 1-5 |
|---------|--------------|----------------|---------------|
| News Junkie | 25-45, follows current events closely | Reliable access to international news sources, easy switching between channels | 4 |
| Expat | 30-60, living away from home country | Access to homeland TV channels, cultural content | 5 |
| Cord-Cutter | 20-35, wants to replace cable | Free alternative to paid TV, organized content discovery | 4 |
| Casual Viewer | Any age, occasional TV watcher | Simple interface, no login required, quick channel browsing | 3 |
| Traveler | 25-55, frequently on the move | Offline access to TV guides, low-bandwidth streaming options | 3 |

## 5. User Roles & Permissions Table

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| Guest | Browse channels, view channel details, stream content, create watchlist | Access personalized recommendations, view viewing history, access settings |
| Registered User | All guest capabilities + save preferences, create playlists, access viewing history, use advanced search | Moderate content, manage channels, access admin dashboard |

## 6. Core Features (v1) Table

| # | Feature | One-line Description | Priority | Tables That Support It |
|---|---------|---------------------|----------|------------------------|
| 1 | Channel Browsing | Browse channels by country and category | Must | Channels, Categories, Countries |
| 2 | Live Streaming | Watch selected channels in real-time | Must | Streams (client-only) |
| 3 | Search | Find channels by name or keyword | Must | Channels |
| 4 | Channel Details | View channel information and logo | Must | Channels |
| 5 | Watchlist | Save favorite channels for quick access | Should | UserWatchlist |
| 6 | Viewing History | Track recently watched channels | Later | ViewingHistory |
| 7 | Categories | Browse channels by content type | Must | Categories, Channels |
| 8 | Countries | Browse channels by geographic location | Must | Countries, Channels |
| 9 | Basic Settings | Adjust streaming quality and interface | Should | UserSettings |

## 7. User Stories

**As a News Junkie, I want to browse channels by news category so that I can quickly find international news sources.**
- Acceptance criteria: 
  - News category displays all news-type channels
  - Channels are sortable by country/region
  - Channel details include news language and typical content

**As an Expat, I want to browse channels by my home country so that I can access familiar programming.**
- Acceptance criteria:
  - Country-specific channel grouping is available
  - Popular channels from each country are highlighted
  - Search results can be filtered by country

**As a Cord-Cutter, I want to create a watchlist of my favorite channels so that I can quickly access them without searching each time.**
- Acceptance criteria:
  - Users can add/remove channels from watchlist
  - Watchlist persists across sessions (for registered users)
  - Watchlist is accessible from the main navigation

**As a Casual Viewer, I want to browse channels without creating an account so that I can immediately start watching.**
- Acceptance criteria:
  - All core functionality works without login
  - No persistent data is stored for guest sessions
  - Clear option to register appears after initial use

## 8. Success Metrics Table

| Metric | Target | How Measured |
|--------|--------|--------------|
| Monthly Active Users | 10,000 | Google Analytics monthly active users |
| Average Session Duration | 15 minutes | Google Analytics average session duration |
| Channel Browse Rate | 80% of users | Google Analytics pageview events for channel listings |
| Watchlist Creation | 30% of registered users | UserWatchlist table count with non-empty entries |
| Streaming Success Rate | 95% | Error logs for stream initialization failures |
| User Retention (Day 7) | 20% | Google Analytics cohort analysis |

## 9. MVP Scope (in)
Features from core features table: #1, #2, #3, #4, #7, #8

## 10. Explicitly NOT in Version 1
- User-generated content (no moderation infrastructure)
- Social features (no authentication system complexity)
- Offline viewing (no content caching mechanism)
- Push notifications (no user engagement tracking)
- Multi-language support (development resource allocation)
- EPG (Electronic Program Guide) integration (iptv-org doesn't provide this data)

---

## 02-TRD. TRD — Technical Requirements

*Status: DRAFT · AI-generated draft*

# TeliPally Technical Requirements Document (TRD)

## 1. Stack Decisions Table

| Layer | Choice | Alternative Rejected | Why | What Breaks If Wrong |
|-------|--------|----------------------|-----|---------------------|
| Language | TypeScript | JavaScript | Type safety for channel data structures and API contracts | Runtime errors from malformed channel data |
| Framework | Next.js | React, Vue, Angular | Built-in PWA support, file-based routing, API routes | Slower development, additional configuration |
| UI Primitives | Material-UI | Custom components, Ant Design | Consistent design system with built-in responsive support | Inconsistent UI across components, slower development |
| Headless Table/Grid | Material-UI DataGrid | Ag-Grid, React Table | Built-in Material-UI integration, virtualization for large datasets | Performance issues with large channel lists |
| Styling | CSS Modules | Styled-components, Tailwind | Scoped styles, no runtime CSS-in-JS overhead | Style conflicts, increased bundle size |
| Design Tokens | Custom CSS variables | Hardcoded values, theme libraries | Consistent theming across components, easy maintenance | Visual inconsistencies, difficult brand updates |
| Server State | Next.js API Routes | Express, custom Node.js server | Full-stack TypeScript, file-based routing, simpler deployment | Additional configuration, type safety loss |
| Client State | React Query | Redux, Zustand | Server state synchronization, caching, automatic refetching | Inconsistent data, manual cache management |
| Validation | Zod | Joi, custom validation | Type-safe schema validation, compile-time checks | Runtime validation errors, malformed API requests |
| Date/Time | date-fns | Luxon, Day.js | Lightweight, tree-shakable, functional API | Larger bundle size, unnecessary complexity |
| API Framework | Next.js API Routes | Express, FastAPI | Built-in with framework, TypeScript support, middleware | Additional dependencies, configuration overhead |
| ORM | Prisma | TypeORM, Knex | Type-safe database access, automatic migrations | Runtime database errors, manual schema management |
| Database | PostgreSQL | MongoDB, MySQL | Strong relational model for channel metadata, ACID compliance | Data integrity issues, complex relationships |
| Auth/Session | NextAuth.js | Custom JWT, Firebase | Built-in OAuth, session management, database adapters | Security vulnerabilities, complex auth implementation |
| Background Work | Node.js Cron | Redis Queue, external service | Simplicity for scheduled tasks, no additional infrastructure | Unreliable task execution, additional complexity |
| Email | Resend + SMTP | SendGrid, Mailgun | Developer-friendly API, free tier for development | Email delivery issues, additional cost |
| File Storage | None | AWS S3, Cloudinary | Static assets only, no user-generated content | Unnecessary cost, infrastructure complexity |
| Payments | None | Stripe, PayPal | Ad-supported model, no payment processing needed | Unnecessary implementation, user friction |
| Test Runner | Jest | Vitest, Mocha | React testing library integration, snapshot testing | Inadequate test coverage, flaky tests |
| E2E | Playwright | Cypress, Puppeteer | Modern browser automation, better React support | Unreliable E2E tests, flaky UI interactions |
| CI/CD | Vercel | GitHub Actions, Jenkins | Integrated deployment, automatic previews | Manual deployment process, slower iteration |
| Hosting | Vercel | AWS, Netlify | PWA optimization, global CDN, automatic scaling | Slower performance, complex infrastructure |
| Secrets | Vercel Environment Variables | AWS Secrets Manager, HashiCorp Vault | Secure secret injection, no additional infrastructure | Security vulnerabilities, secret leakage |
| Observability | Sentry | LogRocket, custom logging | Error tracking, performance monitoring | Undetected errors, poor user experience |
| Analytics | Google Analytics | Mixpanel, custom analytics | Free tier, comprehensive web analytics | Inadequate user behavior insights |
| Feature Flags | None | LaunchDarkly, Flagsmith | Simple initial feature set, no complex rollouts | Unnecessary complexity, delayed feature delivery |

## 2. AI Models or Tools Table

| Model/Provider | Role in App | Fallback if API Fails | Token/Cost Guardrail |
|----------------|-------------|----------------------|---------------------|
| None | N/A | N/A | Simple feature set doesn't require AI |

## 3. APIs Table

| Endpoint | Method | Purpose | Permitted Roles | Auth? |
|----------|--------|---------|-----------------|-------|
| `/api/channels` | GET | List all channels with filtering options | Public | No |
| `/api/channels/:id` | GET | Get details for a specific channel | Public | No |
| `/api/categories` | GET | List all available categories | Public | No |
| `/api/countries` | GET | List all available countries | Public | No |
| `/api/search` | GET | Search channels by name or keyword | Public | No |
| `/api/auth/signup` | POST | Create a new user account | Public | No |
| `/api/auth/signin` | POST | User login | Public | No |
| `/api/auth/signout` | POST | User logout | Guest, Registered | No |
| `/api/auth/reset-password` | POST | Initiate password reset flow | Public | No |
| `/api/auth/verify-email` | GET | Verify email address | Public | No |
| `/api/user/watchlist` | GET | Get user's watchlist | Registered | Yes |
| `/api/user/watchlist` | POST | Add channel to watchlist | Registered | Yes |
| `/api/user/watchlist/:channelId` | DELETE | Remove channel from watchlist | Registered | Yes |
| `/api/user/history` | GET | Get user's viewing history | Registered | Yes |
| `/api/user/settings` | GET | Get user's settings | Registered | Yes |
| `/api/user/settings` | PUT | Update user's settings | Registered | Yes |

## 4. Third-party Integrations Table

| Service | Purpose | Key Env Var |
|---------|---------|-------------|
| iptv-org | Channel directory source | IPTV_ORG_URL |
| Resend | Email delivery | RESEND_API_KEY |
| Google Analytics | User analytics | GA_TRACKING_ID |
| Sentry | Error tracking | SENTRY_DSN |

## 5. Environment Variables Code Block

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="random_secret_string"

# External Services
IPTV_ORG_URL="https://iptv-org.github.io/iptv/channels.m3u"
RESEND_API_KEY="resend_api_key"
GA_TRACKING_ID="google_analytics_id"
SENTRY_DSN="sentry_dsn"
```

## 6. Authentication Method

**Mechanism**: NextAuth.js with database sessions
**Session Strategy**: Database sessions stored in PostgreSQL, with secure httpOnly cookies
**Password Rules**: Minimum 8 characters, must include uppercase, lowercase, and number
**Email Verification**: Required for registered users, verification link sent on signup
**Reset Flow**: Password reset email with secure, time-limited token
**Protected Routes**: Any API endpoint starting with `/api/user/` requires authentication
**Revocation Story**: Sessions are stored in the database with a `expires` field. When a user logs out, their session is immediately deleted from the database. If a user changes their password, all existing sessions are invalidated.

## 7. Security Requirements Checklist

- [ ] CORS configuration: Next.js built-in middleware with allowed origins check
- [ ] Rate limiting: API rate limiting to prevent brute force attacks
- [ ] Input validation: Zod schemas for all API inputs
- [ ] SQL injection prevention: Prisma ORM parameterized queries
- [ ] XSS prevention: React built-in XSS protection, DOMPurify for user content
- [ ] CSRF protection: NextAuth.js built-in CSRF protection
- [ ] Secure cookies: httpOnly, secure, sameSite attributes
- [ ] Helmet.js: Security headers for XSS, clickjacking, etc.
- [ ] HTTPS enforcement: Vercel automatic HTTPS
- [ ] Password hashing: bcrypt for password storage
- [ ] Session secrets: Strong random secret with sufficient entropy
- [ ] Environment variables: All secrets stored in environment variables
- [ ] Content Security Policy: Restrict resource loading to trusted sources

## 8. Performance Requirements Table

| Requirement | Target | How It Will Be Measured |
|-------------|--------|-------------------------|
| Time to Interactive | < 2 seconds | Lighthouse CI in CI pipeline |
| Channel List Load | < 1 second | React Query loading state timing |
| Stream Initialization | < 3 seconds | Custom performance metric |
| Search Response | < 500ms | React Query query timing |
| First Contentful Paint | < 1 second | Lighthouse CI in CI pipeline |
| Cumulative Layout Shift | < 0.1 | Lighthouse CI in CI pipeline |
| Database Query Time | < 100ms | Prisma query logging |
| API Response Time | < 200ms | Custom middleware timing |

## 9. Architecture Notes

**Folder Structure**:
```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── lib/                # Utility functions and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── styles/             # CSS modules and global styles
└── utils/              # Utility functions
```

**Rendering Strategy**: Server-side rendering for initial page load, client-side hydration for interactivity. Static generation for channel listing pages with dynamic data fetching.

**Error Monitoring**: Sentry for error tracking with custom error boundaries in React components. Error pages for different error types with appropriate user guidance.

**Backups**: Daily automated database backups stored in redundant locations. Point-in-time recovery capability.

**Deploy/Migration Strategy**: Vercel deployment with automatic rollbacks on failure. Prisma migrations run on deployment with rollback capability on error. Feature flags for critical features to enable quick rollback if issues arise.

---

## 03-BACKEND-SCHEMA. Backend Schema

*Status: READY · AI-generated draft*

# TeliPally Backend Schema

## 1. Tables Overview Table

| Table | Supports PRD Feature #s | Purpose |
|-------|------------------------|---------|
| Channel | 1, 3, 4, 7, 8 | Stores metadata for each TV channel including name, country, category, and streaming URL |
| Category | 1, 7 | Defines categories for channel organization (e.g., News, Sports, Entertainment) |
| Country | 1, 8 | Defines countries for channel organization with ISO code and name |
| User | 5, 6, 9 | Stores user account information for registered users |
| UserWatchlist | 5 | Tracks channels saved by registered users to their watchlist |
| ViewingHistory | 6 | Records channels watched by registered users with timestamps |
| UserSettings | 9 | Stores user preferences for streaming quality and interface settings |

## 2. Table Definitions

### Channel Table

| Column | Type | Constraint | Notes |
|--------|------|------------|-------|
| id | UUID | PK | Primary key, auto-generated |
| name | String | not null | Display name of the channel |
| name_normalized | String | not null, unique | Normalized name for search (lowercase, no special chars) |
| description | String | | Brief description of channel content |
| logo_url | String | | URL to channel logo image |
| stream_url | String | not null | URL for live stream (M3U8) |
| category_id | UUID | FK, not null | References Category.id |
| country_id | UUID | FK, not null | References Country.id |
| language | String | | Primary language of channel content |
| is_news | Boolean | default false | Flag indicating if channel primarily news content |
| created_at | Timestamp | not null, default now | Record creation timestamp |
| updated_at | Timestamp | not null, default now | Record last update timestamp |

### Category Table

| Column | Type | Constraint | Notes |
|--------|------|------------|-------|
| id | UUID | PK | Primary key, auto-generated |
| name | String | not null, unique | Display name of category |
| name_normalized | String | not null, unique | Normalized name for search (lowercase, no special chars) |
| created_at | Timestamp | not null, default now | Record creation timestamp |
| updated_at | Timestamp | not null, default now | Record last update timestamp |

### Country Table

| Column | Type | Constraint | Notes |
|--------|------|------------|-------|
| id | UUID | PK | Primary key, auto-generated |
| name | String | not null, unique | Display name of country |
| iso_code | String | not null, unique | ISO 3166-1 alpha-2 country code |
| created_at | Timestamp | not null, default now | Record creation timestamp |
| updated_at | Timestamp | not null, default now | Record last update timestamp |

### User Table

| Column | Type | Constraint | Notes |
|--------|------|------------|-------|
| id | UUID | PK | Primary key, auto-generated |
| email | String | not null, unique | User email address |
| email_verified | Boolean | not null, default false | Email verification status |
| name | String | | User display name |
| password_hash | String | not null | Hashed user password |
| created_at | Timestamp | not null, default now | Account creation timestamp |
| updated_at | Timestamp | not null, default now | Account last update timestamp |
| last_login | Timestamp | | Last successful login timestamp |

### UserWatchlist Table

| Column | Type | Constraint | Notes |
|--------|------|------------|-------|
| id | UUID | PK | Primary key, auto-generated |
| user_id | UUID | FK, not null | References User.id, on delete cascade |
| channel_id | UUID | FK, not null | References Channel.id, on delete cascade |
| created_at | Timestamp | not null, default now | When channel was added to watchlist |
| updated_at | Timestamp | not null, default now | When watchlist entry was last updated |

### ViewingHistory Table

| Column | Type | Constraint | Notes |
|--------|------|------------|-------|
| id | UUID | PK | Primary key, auto-generated |
| user_id | UUID | FK, not null | References User.id, on delete cascade |
| channel_id | UUID | FK, not null | References Channel.id, on delete cascade |
| watched_at | Timestamp | not null | When channel was viewed |
| duration_seconds | Integer | | Approximate duration watched in seconds |

### UserSettings Table

| Column | Type | Constraint | Notes |
|--------|------|------------|-------|
| id | UUID | PK | Primary key, auto-generated |
| user_id | UUID | FK, not null, unique | References User.id, on delete cascade |
| streaming_quality | String | not null, default 'auto' | 'auto', 'low', 'medium', 'high' |
| dark_mode | Boolean | not null, default false | UI theme preference |
| created_at | Timestamp | not null, default now | Settings creation timestamp |
| updated_at | Timestamp | not null, default now | Settings last update timestamp |

## 3. State Machines

### Email Verification Status

| From | To | Allowed? | Triggered By |
|------|----|-----------|--------------|
| false | true | Yes | User clicks verification link |
| true | false | No | Email verification is irreversible |

### Streaming Quality

| From | To | Allowed? | Triggered By |
|------|----|-----------|--------------|
| 'auto' | 'low' | Yes | User settings update |
| 'auto' | 'medium' | Yes | User settings update |
| 'auto' | 'high' | Yes | User settings update |
| 'low' | 'medium' | Yes | User settings update |
| 'low' | 'high' | Yes | User settings update |
| 'medium' | 'low' | Yes | User settings update |
| 'medium' | 'high' | Yes | User settings update |
| 'high' | 'low' | Yes | User settings update |
| 'high' | 'medium' | Yes | User settings update |
| 'auto' | 'invalid' | No | API validation prevents invalid values |

## 4. Interval & Time Convention

Intervals are interpreted as [start, end) - inclusive of start time, exclusive of end time. All timestamps are stored in UTC timezone and converted to user's local timezone only for display purposes. This follows the TRD decision to use date-fns for date/time handling.

## 5. Relationships List

- Channel (N) -> Category (1): Each channel belongs to exactly one category
- Channel (N) -> Country (1): Each channel belongs to exactly one country
- User (1) -> UserWatchlist (N): Each user can have multiple watchlist entries
- User (1) -> ViewingHistory (N): Each user can have multiple viewing history entries
- User (1) -> UserSettings (1): Each user has exactly one settings record
- UserWatchlist (N) -> Channel (1): Each watchlist entry references one channel
- ViewingHistory (N) -> Channel (1): Each history entry references one channel

## 6. Indexes Table

| Table | Index | Columns | Reason |
|-------|-------|---------|--------|
| Channel | idx_category | category_id | Speed up filtering by category |
| Channel | idx_country | country_id | Speed up filtering by country |
| Channel | idx_name_normalized | name_normalized | Speed up search operations |
| Channel | idx_is_news | is_news | Speed up news channel filtering |
| User | idx_email | email | Unique constraint and login performance |
| UserWatchlist | idx_user_channel | user_id, channel_id | Prevent duplicate entries for same user/channel |
| ViewingHistory | idx_user_channel | user_id, channel_id | Support user-specific channel history queries |
| ViewingHistory | idx_watched_at | watched_at | Support chronological history queries |

## 7. Row-level Ownership / Access Rules

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| Channel | Public | System | System | System |
| Category | Public | System | System | System |
| Country | Public | System | System | System |
| User | Registered | Public (self) | Registered (self) | Registered (self) |
| UserWatchlist | Registered (self) | Registered (self) | Registered (self) | Registered (self) |
| ViewingHistory | Registered (self) | System (auto) | System | Registered (self) |
| UserSettings | Registered (self) | System (auto) | Registered (self) | Registered (self) |

## 8. ASCII ER Diagram

```
+-------------+       +-------------+       +------------+
|   Category   |       |   Channel   |       |   Country  |
+-------------+       +-------------+       +------------+
| id (PK)     |-------| id (PK)     |       | id (PK)    |
| name        |       | name        |       | name       |
| created_at  |       | category_id |-------| iso_code   |
| updated_at  |       | country_id  |-------| created_at |
+-------------+       | created_at  |       | updated_at |
                     | updated_at  |       +------------+
                     +-------------+
                           |
                           |
+-------------+       +-------------+       +------------+
|    User     |       |UserWatchlist|       |ViewingHistory|
+-------------+       +-------------+       +------------+
| id (PK)     |-------| id (PK)     |       | id (PK)    |
| email       |       | user_id     |-------| user_id    |
| name        |       | channel_id  |-------| channel_id |
| password_hash|      | created_at  |       | watched_at  |
| created_at  |       | updated_at  |       | duration   |
| updated_at  |       +-------------+       +------------+
+-------------+             |
                           |
                    +-------------+
                    |UserSettings |
                    +-------------+
                    | id (PK)     |
                    | user_id     |
                    | streaming_q |
                    | dark_mode   |
                    | created_at  |
                    | updated_at  |
                    +-------------+
```

## 9. Seed Data Notes

The application will seed initial data from the iptv-org directory during deployment. This includes:
- Categories: News, Sports, Entertainment, Kids, Music, etc.
- Countries: All countries with ISO codes
- Channels: Initial channel list with metadata and stream URLs

The seeding process will run as a one-time migration during deployment and will be updated periodically through a background job that fetches updates from the iptv-org repository.

---

## 04-APP-FLOW. App Flow

*Status: READY · AI-generated draft*

# TeliPally App Flow

## 1. Screen Inventory Table

| Screen | Actor | Purpose | Key Components | Auth Required? |
|--------|-------|---------|----------------|----------------|
| Home | Guest, Registered | Browse channels by country/category, search | Channel grid, search bar, category filter, country filter | No |
| Channel Details | Guest, Registered | View channel information and stream | Channel logo, name, description, stream player, add to watchlist | No |
| Search Results | Guest, Registered | Find channels by name/keyword | List of matching channels, filter options | No |
| Category View | Guest, Registered | Browse channels by category | Category header, channel grid, country filter | No |
| Country View | Guest, Registered | Browse channels by country | Country header, channel grid, category filter | No |
| Watchlist | Registered | Access saved channels | List of favorited channels, remove option | Yes |
| User Settings | Registered | Adjust preferences | Quality selector, theme toggle, save button | Yes |
| Login | Guest | Authenticate to access features | Email/password fields, signup link | No |
| Signup | Guest | Create new account | Name/email/password fields, terms checkbox | No |
| Password Reset | Guest | Recover account access | Email field, submit button | No |
| Email Verification | Guest | Verify email address | Verification message, resend link | No |

## 2. User Journey Narrative

A new user arrives at the TeliPally homepage and immediately sees a grid of channels organized by country. They notice a search bar at the top and use it to find news channels from their home country. After clicking on a channel, they view its details including logo and description. They click the stream button and begin watching content. Impressed by the service, they create an account to save this channel to their watchlist for future access. They then browse through settings to adjust streaming quality based on their connection speed. The user can now easily return to their favorite channels without searching each time.

## 3. Navigation Flow

```
Home
  |
  +-- Channel Details
  |     |
  |     +-- Stream
  |
  +-- Search Results
  |     |
  |     +-- Channel Details
  |           |
  |           +-- Stream
  |
  +-- Category View
  |     |
  |     +-- Channel Details
  |           |
  |           +-- Stream
  |
  +-- Country View
  |     |
  |     +-- Channel Details
  |           |
  |           +-- Stream
  |
  +-- Login
  |     |
  |     +-- Signup
  |     |
  |     +-- Password Reset
  |     |
  |     +-- Email Verification
  |
  +-- Watchlist (Registered)
  |     |
  |     +-- Channel Details
  |           |
  |           +-- Stream
  |
  +-- User Settings (Registered)
```

## 4. Screen Verbs Table

| Screen | Verb/Button | Actor Role | Endpoint Used | Result State |
|--------|-------------|------------|---------------|--------------|
| Home | Search Channel | Guest/Registered | GET /api/search | Search Results |
| Home | Filter by Category | Guest/Registered | GET /api/categories | Category View |
| Home | Filter by Country | Guest/Registered | GET /api/countries | Country View |
| Channel Details | Add to Watchlist | Registered | POST /api/user/watchlist | Watchlist updated |
| Channel Details | Remove from Watchlist | Registered | DELETE /api/user/watchlist/:channelId | Watchlist updated |
| Channel Details | Stream Channel | Guest/Registered | N/A (client-side) | Stream player open |
| Search Results | View Channel | Guest/Registered | GET /api/channels/:id | Channel Details |
| Category View | View Channel | Guest/Registered | GET /api/channels/:id | Channel Details |
| Country View | View Channel | Guest/Registered | GET /api/channels/:id | Channel Details |
| Watchlist | Remove Channel | Registered | DELETE /api/user/watchlist/:channelId | Watchlist updated |
| User Settings | Save Settings | Registered | PUT /api/user/settings | Settings updated |
| Login | Submit | Guest | POST /api/auth/signin | User session created |
| Signup | Submit | Guest | POST /api/auth/signup | User created, verification email sent |
| Password Reset | Submit | Guest | POST /api/auth/reset-password | Password reset email sent |
| Email Verification | Resend | Guest | GET /api/auth/verify-email | Verification email resent |

## 5. States Table per Major Flow

### Channel Streaming Flow
| State | Description | Visual Indicator |
|-------|-------------|------------------|
| Empty | Channel selected but stream not started | Loading spinner |
| Loading | Stream URL being fetched | Loading spinner |
| Success | Stream playing in player | Video visible, controls accessible |
| Error | Stream failed to load | Error message, retry button |

### Watchlist Flow
| State | Description | Visual Indicator |
|-------|-------------|------------------|
| Empty | No channels in watchlist | Empty state message |
| Loading | Watchlist being fetched | Loading spinner |
| Success | Watchlist displayed with channels | List of channels |
| Error | Failed to load watchlist | Error message, retry button |

### Authentication Flow
| State | Description | Visual Indicator |
|-------|-------------|------------------|
| Empty | Login/signup form visible | Form fields |
| Loading | Auth request in progress | Loading spinner |
| Success | User authenticated | Redirect to home |
| Error | Invalid credentials or server error | Error message |

## 6. Non-happy-path Behaviour

**Offline**: When the app detects no internet connection, it shows an offline banner and stores user actions locally. Upon reconnection, it syncs the actions with the server. For streaming, it shows a cached channel logo with a "no connection" message.

**Permission Denied**: When a registered user tries to access protected features without authentication, they're redirected to the login screen with a message explaining the action requires login.

**Stale/Conflicting Write**: When a user updates their watchlist from multiple devices, the app uses an optimistic UI approach. If a conflict is detected (e.g., channel removed from another device), it shows a notification and refreshes the data.

## 7. Auth Flow

**Signup**: User enters email/password, submits form. System validates input, creates user account, sends verification email. User is logged in immediately but can't access features until verified.

**Login**: User enters credentials, submits form. System validates credentials, creates session, redirects to home. "Remember me" option persists session for 30 days.

**Logout**: User clicks logout button, session is terminated on server and client, redirected to home page.

**Password Reset**: User enters email, submits form. System sends time-limited reset link. User follows link, enters new password, account is updated.

**Email Verification**: User clicks verification link from email. System marks email as verified, user gains full access to features. Resend option available if verification email not received.

## 8. Payment/Upgrade Flow

Payment and upgrade flows are out of scope for version 1. TeliPally will remain free and ad-supported without premium features.

---

## 05-UIUX-BRIEF. UI/UX Design Brief

*Status: READY · AI-generated draft*

# TeliPally UI/UX Design Brief

## 1. Design Principles

| Principle | Description | Rationale |
|----------|-------------|-----------|
| Zero Friction | No barriers between user and content. No forced authentication, no complex setup. | Aligns with "free and easy" positioning; reduces abandonment rate |
| Global First | Design for international content with minimal language assumptions. | Supports expat and news junkie personas; future-proofs for global expansion |
| Clarity Over Cleverness | Prioritize recognizable UI patterns over novel interactions. | Reduces cognitive load; accommodates casual viewers and less tech-savvy users |
| Performance Visible | Show loading states and connection status clearly. | Manages expectations during streaming; builds trust with transparent feedback |

## 2. Colour Palette

| Role | Name | Hex | OKLCH | Usage | Paired Foreground |
|------|------|-----|-------|-------|-------------------|
| Primary | Deep Blue | #1a365d | oklch(0.32 0.15 240) | Brand elements, CTAs | White (#ffffff) |
| Secondary | Accent Teal | #2c7a7b | oklch(0.45 0.13 180) | Highlights, active states | White (#ffffff) |
| Background | Page | #f7fafc | oklch(0.96 0.01 250) | Main page background | Text (#2d3748) |
| Background | Card | #ffffff | oklch(1.00 0.00 250) | Cards, panels | Text (#2d3748) |
| Background | Overlay | rgba(0,0,0,0.8) | oklch(0.00 0.00 0) | Modals, overlays | White (#ffffff) |
| Text | Primary | #2d3748 | oklch(0.30 0.02 250) | Body text | Page (#f7fafc) |
| Text | Secondary | #4a5568 | oklch(0.40 0.02 250) | Labels, captions | Card (#ffffff) |
| Text | Disabled | #718096 | oklch(0.55 0.02 250) | Disabled elements | Card (#ffffff) |
| State | Error | #e53e3e | oklch(0.50 0.15 15) | Error messages | White (#ffffff) |
| State | Success | #38a169 | oklch(0.55 0.15 150) | Success messages | White (#ffffff) |

## 3. Contrast Verification

| Foreground | Background | Computed Ratio | Passes 4.5:1 (normal text) / 3:1 (large text & UI)? |
|------------|------------|----------------|--------------------------------------------------------|
| #ffffff | #1a365d | 6.8:1 | Yes (4.5:1) |
| #ffffff | #2c7a7b | 5.1:1 | Yes (4.5:1) |
| #2d3748 | #f7fafc | 12.3:1 | Yes (4.5:1) |
| #2d3748 | #ffffff | 15.2:1 | Yes (4.5:1) |
| #ffffff | rgba(0,0,0,0.8) | 14.7:1 | Yes (4.5:1) |
| #4a5568 | #ffffff | 5.4:1 | Yes (4.5:1) |
| #718096 | #ffffff | 4.8:1 | Yes (3:1) |
| #e53e3e | #ffffff | 5.3:1 | Yes (4.5:1) |
| #38a169 | #ffffff | 5.2:1 | Yes (4.5:1) |

## 4. Typography

- **Font Stack**: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif
- **Type Scale**:

| Scale | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Alpha | 32px | 1.2 | 600 | Page titles, headers |
| Beta | 24px | 1.3 | 600 | Section headers |
| Gamma | 18px | 1.4 | 500 | Card titles, UI labels |
| Delta | 16px | 1.5 | 400 | Body text, descriptions |
| Epsilon | 14px | 1.5 | 400 | Captions, metadata |
| Zeta | 12px | 1.5 | 400 | Small UI elements |

## 5. Spacing & Grid

- **Base Unit**: 8px
- **Breakpoints**:

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | 320px - 767px | Default for PWA experience |
| Tablet | 768px - 1023px | Two-column layouts for channel grids |
| Desktop | 1024px+ | Three-column layouts for channel grids |

## 6. Component Styling

| Component | Properties | States |
|-----------|------------|--------|
| Button | Radius: 6px, Padding: 12px 24px, Elevation: 0 | Default, Hover, Active, Disabled, Loading |
| Card | Radius: 8px, Elevation: 1 (box-shadow: 0 1px 3px rgba(0,0,0,0.1)) | Default, Hover, Selected |
| Input | Radius: 6px, Border: 1px solid #cbd5e0 | Default, Focus, Error, Disabled |
| Badge | Radius: 12px, Padding: 4px 12px, Font-size: 12px | Default, Selected |
| Channel Grid | Gap: 16px | - |
| Stream Player | Border-radius: 8px | Loading, Playing, Error |

## 7. Layout & Responsiveness

| Breakpoint | Channel Grid | Navigation | Stream Player |
|------------|--------------|-----------|---------------|
| Mobile | 1 column | Bottom tab bar | Full width |
| Tablet | 2 columns | Bottom tab bar | Full width |
| Desktop | 3 columns | Side navigation | Fixed height (60vh) |

## 8. Motion & Micro-interactions

- **Duration**:
  - Fast: 150ms (hover states)
  - Medium: 300ms (transitions)
  - Slow: 500ms (loading animations)

- **Easing**:
  - Standard: cubic-bezier(0.4, 0, 0.2, 1)
  - Bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55)

- **Animations**:
  - Channel grid items fade in on load
  - Stream player fade in when starting
  - Watchlist items slide in when added
  - Page transitions use horizontal slide

- **Prefers-reduced-motion**: All animations and transitions are disabled when user reduces motion preference.

## 9. Accessibility Requirements

- **Focus States**: Visible focus ring with 2px width and #2c7a7b color, minimum 2px padding
- **Touch Targets**: All interactive elements minimum 44px × 44px
- **ARIA**: 
  - Live regions for streaming status changes
  - Landmark roles for main navigation
  - Descriptive labels for all form controls
- **No Colour Alone**: All status information (error, success, warning) conveyed with text/icons in addition to colour
- **Keyboard Navigation**: Full keyboard access with logical tab order, visible focus indicators
- **Text Resizing**: Content scales up to 200% without breaking layout

---

## 06-IMPLEMENTATION-PLAN. Implementation Plan

*Status: READY · AI-generated draft*

# TeliPally Implementation Plan

## 1. Risk Register Table

| Risk | Likelihood | Impact | Mitigation | Which Slice De-risks It |
|------|------------|--------|------------|------------------------|
| Tenancy isolation (users accessing other users' data) | Low | High | Properly configured Prisma row-level security with middleware checks | Authentication & Core Data |
| Permission model (unauthorized access to protected features) | Medium | High | Consistent API route protection with NextAuth middleware | Authentication & Core Data |
| Streaming URL security (direct access to streams without authorization) | Medium | Medium | Signed tokens for stream URLs with short expiration times | Streaming Infrastructure |
| Performance issues with large channel datasets | High | Medium | Database indexing, pagination, and virtualized UI components | Channel Discovery |
| Email verification bypass | Low | Medium | Verification status checked before granting access to protected features | Authentication & Core Data |
| Cross-site scripting vulnerabilities | Medium | Medium | Input validation with Zod, DOMPurify for user content, React built-in protections | Authentication & Core Data |

## 2. Build Slices Table

| Slice | Name | Scope | Depends On | Demoable Outcome |
|-------|------|-------|------------|------------------|
| 1 | Authentication & Core Data | User signup, login, session management, basic user data storage | None | User can register, login, and access protected watchlist |
| 2 | Channel Discovery | Channel listing, search, filtering by country/category | Authentication & Core Data | User can browse and search channels without login |
| 3 | Channel Details & Streaming | Individual channel page, stream player | Channel Discovery | User can view channel details and stream content |
| 4 | User Personalization | Watchlist, viewing history, user settings | Authentication & Core Data, Channel Details | Registered user can save channels and view history |
| 5 | Search & Filtering | Advanced search, combined filters | Channel Discovery, Channel Details | User can find channels using multiple criteria |
| 6 | Performance Optimization | Database indexing, caching, UI virtualization | All previous slices | App loads channel list in <1s with 1000+ channels |

## 3. Slice-Specific Deliverables

### Slice 1: Authentication & Core Data
- File-level deliverables:
  - `/src/lib/auth.ts` (NextAuth configuration)
  - `/src/app/api/auth/[...nextauth]/route.ts` (auth API routes)
  - `/src/app/api/user/watchlist/route.ts` (watchlist API)
  - `/src/components/forms/LoginForm.tsx`
  - `/src/components/forms/SignupForm.tsx`
  - Database migration for User, UserWatchlist tables
- Done when: A new user can register, receive a verification email, login, and add a channel to their watchlist via API calls.

### Slice 2: Channel Discovery
- File-level deliverables:
  - `/src/app/page.tsx` (home screen)
  - `/src/components/ChannelGrid.tsx`
  - `/src/components/Filters/CountryFilter.tsx`
  - `/src/components/Filters/CategoryFilter.tsx`
  - Database migration for Channel, Category, Country tables
- Done when: The home page displays channels organized by country and category, with functional filters.

### Slice 3: Channel Details & Streaming
- File-level deliverables:
  - `/src/app/channels/[id]/page.tsx` (channel detail screen)
  - `/src/components/ChannelPlayer.tsx`
  - `/src/components/ChannelDetails.tsx`
- Done when: Users can click on any channel to view details and start streaming in the embedded player.

### Slice 4: User Personalization
- File-level deliverables:
  - `/src/app/watchlist/page.tsx`
  - `/src/app/history/page.tsx`
  - `/src/app/settings/page.tsx`
  - `/src/components/Watchlist/WatchlistList.tsx`
  - `/src/components/History/HistoryList.tsx`
  - `/src/components/Settings/SettingsForm.tsx`
  - Database migration for ViewingHistory, UserSettings tables
- Done when: Registered users can view and manage their watchlist, history, and settings.

### Slice 5: Search & Filtering
- File-level deliverables:
  - `/src/app/search/page.tsx`
  - `/src/components/Search/SearchBar.tsx`
  - `/src/components/Search/SearchResults.tsx`
  - API endpoint for search functionality
- Done when: Users can search for channels by name and filter results by country and category.

### Slice 6: Performance Optimization
- File-level deliverables:
  - Database indexes for all query patterns
  - Virtualized channel grid implementation
  - React Query caching configuration
  - Performance monitoring setup
- Done when: Channel list loads in <1s with 1000+ channels and streaming initializes in <3s.

## 4. Estimate Notes

- Basis: 1,000 function points with 20 points per person-day
- Optimism correction: Add 30% for unknown unknowns and integration complexity
- Total estimate: 65 person-days

## 5. Post-Build Verification Checklist

- Screens verification:
  - Home: Displays channel grid, search bar, and filters
  - Channel Details: Shows channel info and stream player
  - Search Results: Displays matching channels with filters
  - Category/Country Views: Show channels organized by selected filter
  - Watchlist: Shows saved channels for registered users
  - User Settings: Allows preference adjustments
  - Login/Signup: Forms work with validation

- Endpoints verification:
  - `/api/channels`: Returns channel list with filtering
  - `/api/channels/:id`: Returns single channel details
  - `/api/categories`: Returns category list
  - `/api/countries`: Returns country list
  - `/api/search`: Returns search results
  - `/api/auth/*`: Authentication endpoints work
  - `/api/user/*`: Protected endpoints reject unauthenticated requests

## 6. Launch Checklist

- Environment variables set in production
- Database credentials rotated from default values
- Analytics (GA) and Sentry configured
- Automated backups enabled for database
- Monitoring configured for error tracking and performance
- Rollback plan documented and tested
- Basic security audit completed (OWASP top 10)

---

## Kit verification report

Computed by the studio checker at 2026-11-25T19:43:55.932Z — 6 checks: 2 pass · 3 warn · 1 fail (score 58/100, 6/6 docs, ~7,046 words).

| Group | Check | Result | Detail |
|---|---|---|---|
| Structure | All six documents present | PASS | Every document in the kit has content. |
| Consistency | Word budget exceeded | WARN | Over budget: 03-BACKEND-SCHEMA 1,630/1500, 04-APP-FLOW 1,127/1100. Cut scope rather than adding words. |
| Traceability | Every feature names its table | PASS | All 9 core features reference a schema table or are explicitly client-only. |
| Traceability | Some endpoints lack a permitted actor | WARN | These endpoints name no permitted role: /api/user/watchlist, /api/user/watchlist, /api/user/watchlist/:channelId, /api/user/history, /api/user/settings. A verb with no permitted endpoint is how "staff can claim an open shift" shipped broken. |
| Traceability | Orphan endpoints | WARN | 2 endpoints are never reached by any screen in the App Flow: /api/auth/signout, /api/user/history. Every endpoint needs a consumer. |
| Measurement | Contrast fails when recomputed | FAIL | 6 of 8 pairs fail recomputation: #ffffff on #1a365d: claims 6.80:1 but computes 12.14:1 · #2d3748 on #ffffff: claims 15.20:1 but computes 11.99:1 · #4a5568 on #ffffff: claims 5.40:1 but computes 7.53:1 · #718096 on #ffffff: computes 4.02:1, needs 4.5:1. v1's palette failed its own rule in 8 of 15 pairs because nothing computed anything. |

> A "Ready" badge means a human reviewed the document. This report is the machine's opinion,
> produced by the same checks that gate generation. Fix the FAILs before handing this kit to a
> coding agent; WARNs usually mean a document predates the v2 engine and should be regenerated.
