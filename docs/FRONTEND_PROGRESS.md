# Frontend Progress

## Current State
The frontend now has a much stronger shared system and is ready for backend work to begin without losing UI direction.

## Global System
- Neutral, near-monochrome visual system applied in `public/css/output.css`
- Shared tokens for:
  - app background
  - surfaces
  - typography colors
  - borders
  - shadows
  - radii
- Modern sans typography stack based on `Inter` fallbacks
- Reusable page header pattern
- Unified button, input, card, dropdown, badge, and modal styles

## Reusable Interaction System
- Shared modal logic in `public/js/modals.js`
- Open/close API based on:
  - `data-modal-open`
  - `data-modal-close`
  - `data-modal`
- Archive modal variant enabled by:
  - `data-modal-archive`
  - `data-modal-archive-item`
- Escape and backdrop close behavior implemented globally

## Profile
- Profile page cleaned visually and aligned with the global system
- `Editar perfil` uses archive modal behavior
- Gear button now opens a dropdown instead of a direct modal
- Dropdown actions:
  - Cambiar contrasena
  - Cambiar correo
- Both actions open dedicated archive modals
- Password and email forms include:
  - inline help text
  - inline errors
  - success / saving states
  - mock save flow in client-side JS

## Players
- Player cards redesigned toward a more premium/editorial direction
- Current visible player info:
  - number
  - name
  - category
  - age
- Controller derives a mock age from category ranges for now
- Layout currently favors 2 cards per row in desktop

## Events
- Event cards redesigned to be compact and more professional
- Match outcomes now derive clearer labels:
  - Victoria
  - Derrota
  - Empate
- Event cards open a detail modal
- Event detail modal closes back into the same card with archive behavior

## Championships
- Championships page redesigned to match the same compact + detail pattern
- Championship cards now align better with profile and events
- Profile championships section updated to follow the same language
- Championship detail modal opens from card and returns to the same card

## Home Feed
- Feed cards distinguish better between:
  - announcements
  - normal posts
- Only normal posts expose comments
- Social action bar added with:
  - like
  - comments
- Comment modal includes:
  - original post at top
  - central scroll area for comments
  - sticky composer at bottom
  - inline like buttons for comments and replies
  - inline reply form
  - expandable replies per comment
  - new comment creation mock in client-side JS
- Announcements do not expose comments

## What Is Still Mocked
- Comment threads and replies are mock data in `home.controller.js`
- Comment likes are client-side only
- New comments are client-side only
- Password and email changes are client-side only
- Player age is derived mock data, not persisted domain data

## Ready For Backend Phase
The frontend is now stable enough to begin backend work on:
- real persistence for comments and replies
- real likes and interaction counts
- real profile update endpoints
- real password and email update flows
- real event/championship/player detail enrichment

## Suggested Backend Starting Order
1. Comment threads and replies for posts
2. Like counts for posts/comments
3. Password and email update endpoints
4. Persisted player profile attributes like age or birth date
5. Richer event and championship detail sources if needed

## Important Project Files
- `public/css/output.css`
- `public/js/modals.js`
- `src/views/home.handlebars`
- `src/views/profile.handlebars`
- `src/views/players.handlebars`
- `src/views/events.handlebars`
- `src/views/championships.handlebars`
- `src/controllers/home.controller.js`
- `src/controllers/players.controller.js`
- `src/controllers/events.controller.js`
- `src/controllers/championships.controller.js`
- `src/controllers/profile.controller.js`

## Skill
A reusable frontend skill was added at:

```text
.opencode/skills/frontend-patterns/SKILL.md
```

Restart OpenCode to load it.
