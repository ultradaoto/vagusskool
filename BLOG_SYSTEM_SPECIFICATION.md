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

## 2. Data Storage (JSON)

Vagus Skool uses **JSON file storage** – no database required.

**File**: `data/posts.json` – array of post objects.

**Post object structure**:

| Field | Type | Notes |
|-------|------|-------|
| id | string | UUID, auto-generated |
| slug | string | Unique, URL-friendly (e.g. `understanding-vagus-nerve`) |
| title | string | Required |
| content | string | HTML content |
| excerpt | string | Short summary (~200 chars) |
| featured_image | string | URL path, e.g. `/uploads/blog/image.jpg` |
| meta_title | string | SEO title (max 70 chars) |
| meta_description | string | SEO description (max 160 chars) |
| author | string | Display name |
| tags | string[] | e.g. `["vagus-nerve", "breathing"]` |
| published | boolean | `true` = published, `false` = draft |
| read_time_minutes | number | Optional, ~200 words/min |
| subtitle | string | Optional |
| createdAt | string | ISO timestamp |
| updatedAt | string | ISO timestamp |
| socialLinks | object | Reserved for future use |

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
5. Optionally generates featured image via Gemini (`generate_image: true`) – not yet implemented.
6. Uses `author_email` or `author` as display name.
7. Reads `data/posts.json`, appends new post or updates existing by `blog_post_id`, writes back to file.
8. Tags are stored as array on each post.

### Featured Image Generation (Optional)

- Service: `services/gemini-image.js`
- Uses `GEMINI_API_KEY` or `GOOGLE_API_KEY`
- Model: `gemini-2.0-flash-exp-image-generation`
- Saves to `public/uploads/blog-images/blog-featured-{timestamp}.png`
- Returns path like `/uploads/blog-images/blog-featured-123.png`

---

## 6. How Content Is Displayed

### Public Routes (`routes/blogRoutes.js`)

**`GET /blog`** – Index

- Reads from `data/posts.json`, filters `published: true`, sorts by date.
- Renders `views/blog/index.ejs` with `posts`, `tags`.

**`GET /blog/:slug`** – Single post

- Fetches from `data/posts.json` by slug where `published: true`.
- Loads related posts (same tags).
- Renders `views/blog/post.ejs` with `post`, `relatedPosts`, `title`, `description`.

### View Data

**Blog index** (`views/blog/index.ejs`)

- `posts` – Array of published posts
- `tags` – All unique tags for filter pills
- Each post: `id`, `title`, `subtitle`, `slug`, `excerpt`, `featured_image`, `author`, `createdAt`, `tags`

**Blog post** (`views/blog/post.ejs`)

- `post` – Full post object
- `relatedPosts` – Up to 3 related posts (same tags)
- `title`, `description` – Meta for SEO

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
| `BASE_URL` | Site base URL (default: https://vagusskool.com) |
| `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Optional, for AI image generation (not yet implemented) |
| `SESSION_SECRET` | Admin session (if added) |

---

## 10. Vagus Skool Implementation

Vagus Skool uses JSON file storage only – no database, no Supabase, no PostgreSQL.

1. **Storage**: `data/posts.json` – JSON file, no database required.
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
