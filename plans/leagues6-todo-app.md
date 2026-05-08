# Leagues 6 TODO App — Plan

## Overview
A Vue 3 web app for tracking Old School RuneScape Leagues 6 (Demonic Pacts) task progress. Supports multiple characters, an ordered TODO list, task import from RuneLite, and point tracking.

## Tech Stack
- **Runtime:** Bun
- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Router:** Vue Router 4
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Testing:** Vitest + Vue Test Utils
- **Build:** Vite (via Bun)

## Data
All task data is bundled as static JSON in `src/assets/tasks/`:

| File | Description |
|------|-------------|
| `LEAGUE_6.full.json` | 1592 tasks with taskId, name, description, area, tier, tierName, points, pactTask, skills, wikiNotes |
| `LEAGUE_6.structid-map.json` | structId→taskId mapping (1592 entries) for import matching |

### Task Schema
```typescript
interface Task {
  taskId: number;      // wiki ID
  sortId: number;      // ordering index (0-based)
  name: string;
  description: string;
  area: string;        // "General" | "Asgarnia" | "Desert" | ... (11 areas)
  tier: number;        // 1-5
  tierName: string;    // "Easy" | "Medium" | "Hard" | "Elite" | "Master"
  points: number;      // 10 | 30 | 80 | 200 | 500
  pactTask: boolean;
  skills?: { skill: string; level: number }[];
  wikiNotes?: string;
}
```

### Points distribution
| Tier   | Tasks | Points each | Total  |
|--------|-------|-------------|--------|
| Easy   | 213   | 10          | 2,130  |
| Medium | 513   | 30          | 15,390 |
| Hard   | 449   | 80          | 35,920 |
| Elite  | 371   | 200         | 74,200 |
| Master | 46    | 500         | 23,000 |
| **Total** | **1592** | — | **150,640** |

## LocalStorage Schema
Key: `leagues6-characters`

```typescript
interface Character {
  id: string;              // uuid
  name: string;
  completedTaskIds: number[];   // taskIds marked as done (from import or manual)
  todoTaskIds: number[];        // ordered TODO list (taskIds in user-defined order)
  createdAt: string;            // ISO timestamp
}
```

## Routes
| Route | View | Description |
|-------|------|-------------|
| `/` | `CharacterSelectView` | List characters, create new |
| `/character/:id` | `CharacterSummaryView` | Progress overview, points, import, nav |
| `/character/:id/tasks` | `TaskListView` | Full task list with filters and TODO toggle |
| `/character/:id/todo` | `TodoView` | Ordered TODO list, drag to reorder |

## Pages

### Character Selection (`/`)
- List of saved characters with name, points earned, tasks completed count
- "New Character" button → prompt for name → creates character → navigate to summary
- Click character → navigate to summary

### Character Summary (`/character/:id`)
- Character name
- Points: **Earned** (completed tasks) / **Planned** (todo tasks) / **Total** (both)
- Task breakdown: completed count per tier
- Progress bar per area
- "Import Progress" button → modal to paste RuneLite JSON
- Nav links: View Tasks, View TODO

### Task List (`/character/:id/tasks`)
- Filter bar: area select, tier select, status select (all / completed / incomplete / todo)
- Search box (name/description)
- Task table/list showing: name, area, tier badge, points, completed checkbox, TODO toggle
- Sorted by `sortId` by default
- Pagination or virtual scroll for performance (1592 rows)

### TODO List (`/character/:id/todo`)
- Ordered list of tasks from `character.todoTaskIds`
- Drag to reorder (or up/down buttons for simplicity)
- Mark as completed inline
- Remove from TODO
- Shows: total planned points at top

## Import Flow
1. User clicks "Import Progress"
2. Paste JSON from RuneLite leagues plugin into textarea
3. App parses JSON, extracts `tasks` object (keyed by structId)
4. Looks up each structId in `LEAGUE_6.structid-map.json` to get `taskId`
5. All structIds with a `completed` timestamp → added to `completedTaskIds`
6. Character state updated in localStorage
7. Note: ~7% of tasks (66) may not match due to cache vs wiki coverage gaps — these are silently skipped

## File Structure
```
leagues6-todo/
├── public/
├── src/
│   ├── assets/
│   │   └── tasks/
│   │       ├── LEAGUE_6.full.json
│   │       └── LEAGUE_6.structid-map.json
│   ├── components/
│   │   ├── TaskCard.vue          # Single task row/card
│   │   ├── TaskFilters.vue       # Area/tier/status filter bar
│   │   ├── PointsSummary.vue     # Points display widget
│   │   ├── ImportModal.vue       # JSON import dialog
│   │   └── TierBadge.vue        # Colour-coded tier pill
│   ├── composables/
│   │   ├── useCharacters.ts     # Character CRUD + localStorage sync
│   │   └── useTasks.ts          # Task data + filter logic
│   ├── router/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts             # Task, Character, StructIdMap interfaces
│   ├── views/
│   │   ├── CharacterSelectView.vue
│   │   ├── CharacterSummaryView.vue
│   │   ├── TaskListView.vue
│   │   └── TodoView.vue
│   ├── App.vue
│   └── main.ts
├── tests/
│   ├── composables/
│   │   ├── useCharacters.spec.ts
│   │   └── useTasks.spec.ts
│   └── utils/
│       └── import.spec.ts       # Import parsing logic tests
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Implementation Phases

### Phase 1 — Scaffold & Data ✅
- [x] Generate structId mapping (`LEAGUE_6.structid-map.json`)
- [x] Create Vue 3 + Bun + Tailwind v4 project
- [x] Copy task data files into `src/assets/tasks/`
- [x] Define TypeScript types

### Phase 2 — Core Composables & Tests ✅
- [x] `createCharacterStore` / `useCharacters` composable (localStorage CRUD, injectable storage for testing)
- [x] `useTasks` / `useFilteredTasks` / `useCharacterStats` composables
- [x] `parseRuneLiteImport` util (structId→taskId)
- [x] 33 tests passing (3 files: importParser, useCharacters, useTasks)

### Phase 3 — Views ✅
- [x] `CharacterSelectView` — list, create, delete characters
- [x] `CharacterSummaryView` — progress overview, import modal, nav
- [x] `TaskListView` — full task list with filters, pagination (50/page), TODO toggle
- [x] `TodoView` — ordered TODO list with up/down reorder, complete, remove

### Phase 4 — Polish (future)
- [ ] Drag-to-reorder in TodoView
- [ ] Pact task filter / badge
- [ ] Skill requirements display
- [ ] Export TODO list

## Open Questions / Notes
- Drag-to-reorder in TodoView: use simple up/down buttons first, add drag later if desired
- The structId mapping covers 1592/1658 cache tasks (96.6%) and 684/752 sample import tasks (90.9%). The ~7% gap is tasks not yet documented on the wiki; they'll be silently skipped during import.
- `pactTask` field marks tasks specific to the Demonic Pacts mechanic — could be used as a filter later.
