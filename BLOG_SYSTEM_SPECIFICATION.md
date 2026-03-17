# Vagus Skool Blog System – Technical Specification

This document describes how the blog system is built in vagusskool.com, including the API for sending blog posts, how content is received, stored, and displayed.

---

## 1. Architecture Overview

The blog system consists of:

- **Storage**: JSON file (`data/posts.json`) – no database required
- **Public routes**: `routes/blogRoutes.js` – listing, single post, tag filter
- **Admin routes**: `routes/blogAdminRoutes.js` – create, edit, list, image upload
- **API routes**: `routes/api/blogApi.js` – publish, delete, destinations
- **Views**: EJS templates in `views/blog/`
- **Optional**: Gemini API for AI-generated featured images (not yet implemented)

---

## 2. Database Schema

### Tables

**`blog_posts`** (main content table)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, auto-generated |
| title | VARCHAR(500) | Required |
| slug | VARCHAR(500) | Unique, URL-friendly (e.g. `understanding-vagus-nerve`) |
| content | TEXT | HTML content |
| excerpt | TEXT | Short summary (~200 chars) |
| featured_image | VARCHAR(500) | URL path, e.g. `/uploads/blog-images/xxx.png` |
| meta_title | VARCHAR(70) | SEO title |
| meta_description | VARCHAR(160) | SEO description |
| meta_keywords | TEXT | Optional |
| author_id | UUID | FK to `users.id` |
| status | VARCHAR(50) | `draft`, `published`, `archived` |
| published_at | TIMESTAMP | Null for drafts |
| read_time_minutes | INTEGER | Optional, ~200 words/min |
| subtitle | VARCHAR(500) | Optional |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

**`categories`**

| Column | Type |
|--------|------|
| id | UUID |
| name | VARCHAR(100) |
| slug | VARCHAR(100) UNIQUE |
| description | TEXT |

**`blog_post_categories`** (many-to-many)

| Column | Type |
|--------|------|
| post_id | UUID → blog_posts.id |
| category_id | UUID → categories.id |

**`tags`**

| Column | Type |
|--------|------|
| id | UUID |
| name | VARCHAR(100) |
| slug | VARCHAR(100) UNIQUE |

**`blog_post_tags`** (many-to-many)

| Column | Type |
|--------|------|
| post_id | UUID → blog_posts.id |
| tag_id | UUID → tags.id |

### View: `blog_posts_published`

Used for public display; only published posts with author info:

```sql
CREATE OR REPLACE VIEW blog_posts_published AS
SELECT 
  bp.id, bp.title, bp.subtitle, bp.slug, bp.content, bp.excerpt,
  bp.featured_image, bp.meta_title, bp.meta_description, bp.meta_keywords,
  bp.status, bp.published_at, bp.created_at, bp.updated_at, bp.read_time_minutes,
  COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Anonymous') as author
FROM blog_posts bp
LEFT JOIN users u ON bp.author_id = u.id
WHERE bp.status = 'published' AND bp.published_at IS NOT NULL;
```

---

## 3. API for Sending Blog Posts

### Endpoint: `POST /api/blog/publish`

Used to publish blog posts from external tools (e.g. ClickUp docs, other CMS).

**Base URL**: `https://vagusskool.com` (or your domain, set via `BASE_URL` env var)  
**Path**: `/api/blog/publish`  
**Method**: POST  
**Content-Type**: `application/json`  
**Auth**: None. Add API key or auth if needed for production.

### Request Body

Can be sent as either:

- `{ blogData: { ... } }` (nested)
- `{ ... }` (flat)

**Required fields**

| Field | Type | Description |
|-------|------|-------------|
| title | string | Post title |
| content | string | HTML content |

**Optional fields**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| author_email | string | — | Lookup user by email for author_id |
| subtitle | string | null | Subtitle |
| featured_image | string | null | URL path for image |
| generate_image | boolean | false | If true, use Gemini to generate featured image |
| category_slugs | string[] | [] | e.g. `["vagus-nerve-science", "health-tips"]` |
| tags | string[] | [] | e.g. `["vagus nerve", "health"]` |
| meta_title | string | title | SEO title (max 70 chars) |
| meta_description | string | excerpt | SEO description (max 160 chars) |
| status | string | `"published"` | `draft`, `published`, `archived` |
| doc_id | string | — | External reference (e.g. ClickUp doc ID) |
| blog_post_id | string | — | If set, update existing post |
| existing_slug | string | — | Slug to keep when updating |
| preserve_date | boolean | false | Keep original published_at when updating |

### Example: Create New Post

```json
{
  "title": "Understanding the Vagus Nerve",
  "content": "<p>The vagus nerve is the longest cranial nerve...</p><h2>What Does It Do?</h2><p>...</p>",
  "author_email": "admin@vagusskool.com",
  "subtitle": "Your body's superhighway",
  "generate_image": true,
  "category_slugs": ["vagus-nerve-science", "health-tips"],
  "tags": ["vagus nerve", "health", "wellness"],
  "meta_title": "Understanding the Vagus Nerve | Vagus Skool",
  "meta_description": "Discover how the vagus nerve affects your health.",
  "status": "published"
}
```

### Example: Update Existing Post

```json
{
  "blog_post_id": "uuid-of-existing-post",
  "existing_slug": "understanding-vagus-nerve",
  "title": "Understanding the Vagus Nerve (Updated)",
  "content": "<p>Updated content...</p>",
  "preserve_date": true,
  "category_slugs": ["vagus-nerve-science"],
  "tags": ["vagus nerve"]
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Blog post published successfully",
  "post": {
    "id": "uuid",
    "title": "Understanding the Vagus Nerve",
    "slug": "understanding-the-vagus-nerve",
    "url": "https://vagusskool.com/blog/understanding-the-vagus-nerve",
    "featured_image": "/uploads/blog-images/blog-featured-123.png"
  }
}
```

### Error Responses

- **400** – Missing title or content
- **404** – Post not found (when updating)
- **409** – Slug already exists (new post)
- **500** – Server error

### Slug Generation

```javascript
slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .substring(0, 70);
```

### Excerpt Generation

```javascript
excerpt = content.replace(/<[^>]+>/g, '').substring(0, 200) + '...';
```

### Read Time

```javascript
read_time_minutes = Math.ceil(content.split(/\s+/).length / 200);
```

---

## 4. Other API Endpoints

### `DELETE /api/blog/posts/:postId`

Deletes a post and its category/tag links.

### `GET /api/blog/destinations`

Returns available blog destinations and categories:

```json
{
  "destinations": [
    {
      "id": "vagusskool-blog",
      "name": "Vagus Skool Blog",
      "url": "https://vagusskool.com/blog",
      "categories": [
        { "name": "Vagus Nerve Science", "slug": "vagus-nerve-science" },
        { "name": "Health Tips", "slug": "health-tips" }
      ]
    }
  ]
}
```

---

## 5. How Content Is Received and Stored

### Flow

1. Client sends `POST /api/blog/publish` with JSON body.
2. Server reads `req.body.blogData || req.body`.
3. Validates `title` and `content`.
4. Generates `slug` from title (or uses `existing_slug` for updates).
5. Optionally generates featured image via Gemini (`generate_image: true`).
6. Looks up `author_id` from `author_email` in `users`.
7. Inserts into `blog_posts` (or updates if `blog_post_id` provided).
8. Links categories via `blog_post_categories` (by `category_slugs`).
9. Creates/links tags via `tags` and `blog_post_tags`.

### Featured Image Generation (Optional)

- Service: `services/gemini-image.js`
- Uses `GEMINI_API_KEY` or `GOOGLE_API_KEY`
- Model: `gemini-2.0-flash-exp-image-generation`
- Saves to `public/uploads/blog-images/blog-featured-{timestamp}.png`
- Returns path like `/uploads/blog-images/blog-featured-123.png`

---

## 6. How Content Is Displayed

### Public Routes (`routes/public/blog.js`)

**`GET /blog`** – Index

- Reads from `blog_posts_published`.
- Pagination: 30 posts per page (`?page=1`).
- Renders `views/public/blog.ejs` with `posts`, `currentPage`, `totalPages`, `totalPosts`.

**`GET /blog/:slug`** – Single post

- Fetches from `blog_posts_published` by slug.
- Loads related posts (same categories, or recent).
- Renders `views/public/blog-post-page.ejs` with `post`, `relatedPosts`, `title`, `description`.

### View Data

**Blog index** (`blog.ejs`)

- `posts` – Array of published posts
- `currentPage`, `totalPages`, `totalPosts` – Pagination
- Each post: `id`, `title`, `subtitle`, `slug`, `excerpt`, `featured_image`, `published_at`, `author`, `read_time_minutes`

**Blog post** (`blog-post-page.ejs`)

- `post` – Full post object
- `relatedPosts` – Up to 3 related posts
- `title`, `description` – Meta

### SEO

- Meta tags: `meta_title`, `meta_description`
- OpenGraph: `og:title`, `og:description`, `og:image`, `og:url`
- Twitter cards
- Clean URLs: `/blog/:slug`

---

## 7. Admin Interface

### Routes (session-protected)

| Route | Method | Purpose |
|-------|--------|---------|
| `/admin/blog` | GET | List all posts |
| `/admin/blog/create` | GET | Create form |
| `/admin/blog/create` | POST | Create post |
| `/admin/blog-manager` | GET | List posts (alternate UI) |
| `/admin/blog-manager/new` | GET | New post form |
| `/admin/blog-manager/edit/:id` | GET | Edit form |
| `/admin/blog-manager/save` | POST | Save (create/update) |
| `/admin/blog-manager/upload-image` | POST | Image upload |
| `/admin/blog-manager/:id` | DELETE | Delete post |

### Image Upload

- Endpoint: `POST /admin/blog-manager/upload-image`
- Field: `image` (multipart)
- Saves to `public/uploads/blog/`
- Returns `{ success: true, url: "/uploads/blog/filename.jpg" }`

---

## 8. Server Setup

### Route Mounting

**Public server** (`server-public.js`):

```javascript
const blogRouter = require('./routes/public/blog');
app.use('/blog', blogRouter);
```

**Vagus Skool** (`server.js`):

```javascript
const blogApi = require('./routes/api/blogApi');
app.use('/api/blog', blogApi);
```

### Image Upload

- `POST /admin/blog/upload-image` – no auth required (add protection for production).

---

## 9. Environment Variables

| Variable | Purpose |
|----------|---------|
| `VAGUSSKOOL_DATABASE_URL` | PostgreSQL connection string (not used – Vagus Skool uses JSON file storage) |
| `BASE_URL` | Site base URL (default: https://vagusskool.com) |
| `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Optional, for AI image generation (not yet implemented) |
| `SESSION_SECRET` | Admin session |

---

## 10. Vagus Skool Implementation

Vagus Skool uses JSON file storage (`data/posts.json`) instead of PostgreSQL.

1. **Storage**: `data/posts.json` – no database required.
2. **API**: `POST /api/blog/publish`, `DELETE /api/blog/posts/:postId`, `GET /api/blog/destinations`.
3. **Public routes**: `GET /blog`, `GET /blog/:slug`, `GET /blog/tag/:tag`.
4. **Admin**: `/admin/blog` (list), `/admin/blog/new`, `/admin/blog/edit/:id`, `POST /admin/blog/upload-image`.
5. **Image upload**: `POST /admin/blog/upload-image` – saves to `public/uploads/blog/`.
6. **URLs**: `/blog` and `/blog/:slug` for public pages.

---

## 11. File Reference (Vagus Skool)

| File | Purpose |
|------|---------|
| `lib/posts.js` | Shared post storage and helpers (JSON file) |
| `data/posts.json` | Blog posts storage |
| `routes/blogRoutes.js` | Public blog routes |
| `routes/blogAdminRoutes.js` | Admin blog UI and image upload |
| `routes/api/blogApi.js` | Publish/delete/destinations API |
| `views/blog/index.ejs` | Blog index |
| `views/blog/post.ejs` | Single post |
| `views/blog/admin.ejs` | Admin list |
| `views/blog/editor.ejs` | Create/edit form |
