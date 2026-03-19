## Mission
Build a complete, production-ready Next.js radio station landing page. This is a single-page application — one page, no routing, no additional views. Work autonomously from start to finish — do not pause for approval between steps.

## Environment setup — do this first
This is a fresh directory. Before anything else:
1. Run `npm install` to initialize the project
2. Install any additional packages required by the README tech stack
3. Confirm the dev server starts without errors before proceeding

## Required reading — do this second
Before writing any UI code:
1. Read `/docs/README.md` in full. Extract and internalize:
   - Tech stack (frameworks, libraries, versions)
   - Brand guidelines (colors, typography, tone, logo usage)
   - Any defined component conventions or folder structure
2. Read and apply the frontend web dev skill at `/mnt/skills/public/frontend-design/SKILL.md`

## Deployment context
This page will be published as a subdomain (e.g. radio.resistance.com). Design accordingly:
- No navigation links to other pages or internal routes
- The page must stand completely on its own
- Meta tags, og:image, and title should reflect subdomain deployment
- No assumptions about a parent site existing

## Page structure
Build one full-length single page. Suggested sections (adapt based on README content):
- Hero — bold station identity, mission statement, call to listen
- Player slot — a clearly marked placeholder component where the audio stream will be dropped in later (see below)
- Programming or schedule — what's on, when
- About / mission — the story and purpose of the station
- Footer — minimal, on-brand

## Audio player — placeholder only
A custom stream player component already exists and will be integrated later. Your job:
- Create a well-structured placeholder component (e.g. ``)
- Give it realistic dimensions and layout so the page looks complete without it
- Leave a clear comment: `// TODO: replace with  component`
- Do NOT build audio playback logic, use HTML audio elements, or install audio libraries

## Design directive
This is a radio station built to fight oppressive systems. Every design decision should reflect that mission:
- Visual language: raw, defiant, urgent — not polished corporate
- Tone: bold, unapologetic, community-rooted
- Aesthetic references: protest graphics, zine culture, independent press
- Typography: strong, weighted, impactful — let headlines breathe and command
- Color: use the brand palette from the README, push contrast and intensity
- Avoid: sanitized SaaS aesthetics, generic layouts, passive whitespace

## Constraints
- Match the tech stack exactly as specified in the README — do not substitute packages
- All brand colors, fonts, and naming conventions must come from the README
- Use the frontend skill patterns for component architecture and styling quality
- Single page only — no Link components routing to other views
- Every section must reflect the anti-oppression editorial identity in both copy and design

## Completion criteria
The task is complete when:
- All sections are built on one scrollable page
- The player slot placeholder is in place with a clear handoff comment
- The design is visually coherent with the brand and mission
- `npm run build` exits cleanly with no errors

Begin immediately. Do not ask for clarification — make reasonable decisions, document assumptions in code comments, and keep moving.