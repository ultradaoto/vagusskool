# Vagus Skool Blog API

Publish and manage blog posts via API for external tools (ClickUp, CMS, automation).

## Endpoints

### POST /api/blog/publish

Create or update a blog post.

**Request body** (JSON) – supports both `{ blogData: { ... } }` and flat `{ ... }`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Post title |
| content | string | Yes | HTML content |
| author_email | string | No | Author (or use `author`) |
| subtitle | string | No | Subtitle |
| featured_image | string | No | URL path, e.g. `/uploads/blog/image.jpg` |
| category_slugs | string[] | No | Category slugs |
| tags | string[] | No | e.g. `["vagus nerve", "health"]` |
| meta_title | string | No | SEO title (max 70 chars) |
| meta_description | string | No | SEO description (max 160 chars) |
| status | string | No | `draft`, `published` (default) |
| blog_post_id | string | No | Update existing post (UUID) |
| existing_slug | string | No | Slug to keep when updating |
| preserve_date | boolean | No | Keep original createdAt when updating |

**Example – create new post:**

```bash
curl -X POST http://localhost:3100/api/blog/publish \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Post",
    "content": "<p>Hello world!</p>",
    "tags": ["wellness", "vagus-nerve"],
    "status": "published"
  }'
```

**Example – update existing post:**

```bash
curl -X POST http://localhost:3100/api/blog/publish \
  -H "Content-Type: application/json" \
  -d '{
    "blog_post_id": "uuid-of-post",
    "existing_slug": "my-new-post",
    "title": "My Updated Post",
    "content": "<p>Updated content...</p>",
    "preserve_date": true
  }'
```

### DELETE /api/blog/posts/:postId

Delete a blog post by ID.

```bash
curl -X DELETE http://localhost:3100/api/blog/posts/uuid-of-post
```

### GET /api/blog/destinations

Returns available blog destinations and categories.

```bash
curl http://localhost:3100/api/blog/destinations
```

## Admin Image Upload

**POST /admin/blog/upload-image**

Upload a featured image (multipart form, field: `image`). Returns `{ success: true, url: "/uploads/blog/filename.jpg" }`.
