/**
const { generateFeaturedImage } = require("../lib/generateImage");
 * Vagus Skool Blog API
 * Publish, update, delete posts via API for external tools (e.g. ClickUp, CMS).
 * Base path: /api/blog
 */

const express = require('express');
const router = express.Router();
const {
    getPosts,
    savePosts,
    generateSlug,
    generateUUID,
    generateExcerpt,
    generateReadTimeMinutes,
    findPostById,
    findPostBySlug,
} = require('../../lib/posts');

const BASE_URL = process.env.BASE_URL || 'https://vagusskool.com';

/**
 * Normalize request body - supports both { blogData: { ... } } and flat { ... }
 */
function getBlogData(req) {
    const body = req.body || {};
    return body.blogData || body;
}

/**
 * POST /api/blog/publish
 * Create or update a blog post.
 */
router.post('/publish', async (req, res) => {
    const data = getBlogData(req);

    const title = data.title?.trim();
    const content = data.content;

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: title and content',
        });
    }

    const posts = getPosts();
    const now = new Date().toISOString();
    const isUpdate = !!data.blog_post_id;

    let post;
    let slug;

    if (isUpdate) {
        post = findPostById(posts, data.blog_post_id);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found',
            });
        }
        slug = data.existing_slug?.trim() || post.slug;
    } else {
        slug = generateSlug(title);
        if (posts.some(p => p.slug === slug)) {
            return res.status(409).json({
                success: false,
                error: 'A post with this slug already exists',
            });
        }
    }

    const status = data.status || 'published';
    const excerpt = data.excerpt?.trim() || generateExcerpt(content);
    const metaTitle = data.meta_title?.trim() || title.substring(0, 70);
    const metaDescription = data.meta_description?.trim() || excerpt.substring(0, 160);

    const tags = Array.isArray(data.tags)
        ? data.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean)
        : [];

    const author = data.author_email || data.author || 'Sterling Cooley';

    const postData = {
        slug,
        title,
        subtitle: data.subtitle?.trim() || null,
        excerpt,
        content,
        author,
        tags,
        published: status === 'published',
        featured_image: data.featured_image?.trim() || null,
        meta_title: metaTitle,
        meta_description: metaDescription,
        read_time_minutes: generateReadTimeMinutes(content),
        socialLinks: {},
        doc_id: data.doc_id || null,
        updatedAt: now,
    };

    if (isUpdate) {
        postData.id = post.id;
        postData.createdAt = data.preserve_date ? post.createdAt : now;

        const idx = posts.findIndex(p => p.id === post.id);
        posts[idx] = { ...post, ...postData };
    } else {
        postData.id = generateUUID();
        postData.createdAt = now;
        posts.push(postData);
    }

    if (!savePosts(posts)) {
        return res.status(500).json({
            success: false,
            error: 'Failed to save post',
        });
    }

    const savedPost = isUpdate ? posts.find(p => p.id === post.id) : postData;
    const postUrl = `${BASE_URL}/blog/${savedPost.slug}`;

    // Auto-generate featured image (fire-and-forget)
    if (!savedPost.featured_image) {
        generateFeaturedImage(savedPost).then(imagePath => {
            if (imagePath) {
                const allPosts = getPosts();
                const idx = allPosts.findIndex(p => p.id === savedPost.id);
                if (idx !== -1 && !allPosts[idx].featured_image) {
                    allPosts[idx].featured_image = imagePath;
                    savePosts(allPosts);
                    console.log(`[ImageGen] Updated post ${savedPost.slug} with image: ${imagePath}`);
                }
            }
        }).catch(err => console.error('[ImageGen] Error:', err.message));
    }

    return res.status(201).json({
        success: true,
        message: 'Blog post published successfully',
        post: {
            id: savedPost.id,
            title: savedPost.title,
            slug: savedPost.slug,
            url: postUrl,
            featured_image: savedPost.featured_image,
        },
    });
});

/**
 * DELETE /api/blog/posts/:postId
 * Delete a blog post.
 */
router.delete('/posts/:postId', (req, res) => {
    const { postId } = req.params;
    const posts = getPosts();
    const filtered = posts.filter(p => p.id !== postId);

    if (filtered.length === posts.length) {
        return res.status(404).json({
            success: false,
            error: 'Post not found',
        });
    }

    if (!savePosts(filtered)) {
        return res.status(500).json({
            success: false,
            error: 'Failed to delete post',
        });
    }

    return res.json({
        success: true,
        message: 'Post deleted successfully',
    });
});

/**
 * GET /api/blog/destinations
 * Returns available blog destinations and categories for external tools.
 */
router.get('/destinations', (req, res) => {
    res.json({
        destinations: [
            {
                id: 'vagusskool-blog',
                name: 'Vagus Skool Blog',
                url: `${BASE_URL}/blog`,
                categories: [
                    { name: 'Vagus Nerve Science', slug: 'vagus-nerve-science' },
                    { name: 'Health Tips', slug: 'health-tips' },
                    { name: 'Breathing', slug: 'breathing' },
                    { name: 'Wellness', slug: 'wellness' },
                ],
            },
        ],
    });
});

module.exports = router;
