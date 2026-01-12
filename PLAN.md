# Smart Kitchen Inventory & Recipe Planner

## Overview
A web app that tracks your kitchen inventory, finds recipes based on what you have, shows cooking videos, and suggests smart shopping lists.

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Next.js 14 (React) | Great for beginners, built-in routing, works on all devices |
| Styling | Tailwind CSS | Fast to style, no CSS files to manage |
| Backend | Next.js API Routes | Same project, no separate server needed |
| Database | PostgreSQL + Prisma | Reliable, Prisma makes it beginner-friendly |
| Auth | NextAuth.js | Simple email/password login |
| Recipe Data | Spoonacular API | Best "search by ingredients" feature, $29/mo |
| Videos | YouTube API | Free, easy access, great cooking content |

---

## Core Features

### 1. Kitchen Inventory
- Add/edit/delete food items with quantities and expiration dates
- Auto-categorize items (Produce, Dairy, Meat, Pantry, etc.)
- Visual alerts for expiring items (color-coded badges)
- CSV upload from bank statements (auto-detect food purchases)

### 2. Recipe Discovery
- Search recipes by ingredients you HAVE (Spoonacular API)
- Shows match percentage (e.g., "You have 8/10 ingredients")
- Green checkmarks for owned ingredients, red for missing
- Full instructions, nutritional info, cooking time

### 3. Cooking Videos
- YouTube tutorials auto-matched to recipes
- Manual submission of TikTok/Instagram URLs (iframe embed)
- Embedded video player on recipe pages

### 4. Smart Shopping
- "Almost possible" recipes (missing 1-3 ingredients)
- One-click "Add missing to shopping list"
- Transfer purchased items to inventory

---

## Database Schema

```
users
├── id, email, password_hash, name

inventory_items
├── id, user_id, category_id, name
├── quantity, unit, expiration_date
├── purchase_date, source (manual/csv)

categories
├── id, name, is_food, icon, keywords[]

saved_recipes
├── id, user_id, spoonacular_id
├── title, image_url, ready_in_minutes

shopping_items
├── id, user_id, recipe_id (optional)
├── ingredient_name, quantity, unit, checked

recipe_videos
├── id, saved_recipe_id, user_id
├── video_url, video_type (youtube/tiktok/instagram)
```

---

## Key API Integrations

### Spoonacular (Recipes)
- **Endpoint**: `findByIngredients` - search recipes by what you have
- **Returns**: `usedIngredients`, `missedIngredients`, `unusedIngredients`
- **Cost**: Free tier (50 requests/day) or $29/mo (1,500/day)

### YouTube (Videos)
- **Endpoint**: `search` - find cooking tutorials
- **Embed**: Simple iframe `<iframe src="youtube.com/embed/{id}">`
- **Cost**: Free (10,000 units/day = ~100 searches)

### TikTok/Instagram
- No API access needed - just iframe embed manually submitted URLs
- User pastes URL, we extract video ID and embed

---

## Page Structure

```
/                    → Dashboard (expiring items, quick recipes)
/inventory           → Inventory list with filters
/inventory/add       → Add item form
/inventory/upload    → CSV upload page
/recipes             → Recipe discovery (search by ingredients)
/recipes/[id]        → Recipe details + videos + instructions
/recipes/saved       → Saved/favorite recipes
/shopping            → Shopping list (checkboxes)
/settings            → User preferences
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Initialize Next.js 14 project with TypeScript + Tailwind
- [ ] Set up PostgreSQL database (local or Supabase)
- [ ] Configure Prisma ORM and create schema
- [ ] Implement NextAuth.js authentication
- [ ] Build basic layout with navigation

### Phase 2: Inventory Core
- [ ] Create inventory CRUD API endpoints
- [ ] Build inventory list page with category filters
- [ ] Add/Edit item forms with expiration date picker
- [ ] Expiration tracking with color-coded badges
- [ ] Dashboard widget showing expiring items

### Phase 3: Recipe Discovery
- [ ] Set up Spoonacular API client
- [ ] Implement `findByIngredients` search
- [ ] Build recipe cards showing ingredient match %
- [ ] Recipe details page with full instructions
- [ ] Save/favorite recipes functionality

### Phase 4: Shopping List
- [ ] Shopping list CRUD API
- [ ] Checklist UI with check/uncheck
- [ ] "Add missing ingredients" from recipe page
- [ ] "Move to inventory" after purchase

### Phase 5: CSV Import
- [ ] CSV file upload component
- [ ] Parse bank statement format
- [ ] Food classification logic (keyword matching)
- [ ] Preview/review interface before import

### Phase 6: Video Integration
- [ ] YouTube API search for recipe videos
- [ ] Video embed component
- [ ] Manual URL submission for TikTok/Instagram
- [ ] Video section on recipe details page

### Phase 7: Polish & Deploy
- [ ] Loading states and error handling
- [ ] Mobile responsiveness
- [ ] Deploy to Vercel
- [ ] Set up production database

---

## Files to Create

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/spoonacular.ts` | Recipe API client |
| `src/lib/youtube.ts` | Video API client |
| `src/lib/classifier.ts` | Food classification for CSV |
| `src/app/api/inventory/route.ts` | Inventory endpoints |
| `src/app/api/recipes/route.ts` | Recipe endpoints |
| `src/components/inventory/InventoryList.tsx` | Main inventory UI |
| `src/components/recipes/RecipeCard.tsx` | Recipe display card |

---

## Environment Variables Needed

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random-secret"
SPOONACULAR_API_KEY="get-from-spoonacular.com"
YOUTUBE_API_KEY="get-from-google-cloud-console"
```

---

## Verification Plan

### After Phase 1:
- [ ] Can register and log in
- [ ] Protected routes redirect to login
- [ ] Database tables exist

### After Phase 2:
- [ ] Can add, edit, delete inventory items
- [ ] Items show expiration warnings
- [ ] Category filter works

### After Phase 3:
- [ ] Clicking "Find Recipes" searches based on inventory
- [ ] Recipe cards show ingredient match status
- [ ] Can view full recipe details

### After Phase 4:
- [ ] Can add items to shopping list
- [ ] Checkboxes work
- [ ] Can move items to inventory

### After Phase 5:
- [ ] CSV upload parses correctly
- [ ] Food items are auto-detected
- [ ] Can review and import items

### After Phase 6:
- [ ] YouTube videos appear on recipe pages
- [ ] Can manually add video URLs
- [ ] Videos play embedded

### Final:
- [ ] Works on mobile browser
- [ ] No console errors
- [ ] All features functional end-to-end
