# Blog Posts Directory

This directory is for storing blog post drafts and content source files.

## Workflow

The Vagus Skool blog uses a JSON-based storage system for simplicity. Here's how to create and manage content:

### Creating a New Post

1. **Draft your content** in this directory as Markdown files (for your reference)
2. **Use the admin interface** at `/admin/blog` to create the actual post
3. **Or** manually edit `data/posts.json` to add new posts

### Post Data Structure

Each post in `data/posts.json` follows this structure:

```json
{
  "id": "uuid-string",
  "slug": "url-friendly-slug",
  "title": "Post Title",
  "excerpt": "Short summary for listings",
  "content": "Full HTML content",
  "author": "Sterling Cooley",
  "tags": ["vagus-nerve", "breathing"],
  "published": true,
  "createdAt": "2026-03-17T00:00:00.000Z",
  "updatedAt": "2026-03-17T00:00:00.000Z",
  "socialLinks": {
    "twitter": "https://twitter.com/...",
    "youtube": "https://youtube.com/..."
  }
}
```

### Writing Content

The `content` field accepts HTML:

```html
<h2>Section Heading</h2>
<p>Your paragraph text here with <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
```

### Converting Markdown to HTML

If you write in Markdown, convert it to HTML before adding to posts.json:

```bash
# Using a Markdown converter
npx marked -i my-post.md -o my-post.html
```

Or use online converters like:
- https://markdowntohtml.com/
- https://www.browserling.com/tools/markdown-to-html

### Best Practices

1. **Write a compelling excerpt** - This appears in blog listings and social shares
2. **Use descriptive slugs** - Keep them short and keyword-rich
3. **Tag appropriately** - Use lowercase, hyphenated tags like `vagus-nerve`, `breathing-techniques`
4. **Preview before publishing** - Use the draft status to preview posts
5. **Update timestamps** - Always update `updatedAt` when editing posts

### Admin Interface

The easiest way to manage posts is through the admin panel:

- **List all posts**: `/admin/blog`
- **Create new post**: `/admin/blog/new`
- **Edit post**: `/admin/blog/edit/:id`

### Backup

Remember to backup `data/posts.json` regularly as this is your blog's content store.

```bash
# Create a backup
cp data/posts.json data/posts.json.backup.$(date +%Y%m%d)
```

---

Happy writing! ✍️
