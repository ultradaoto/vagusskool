const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
    getPosts,
    savePosts,
    generateSlug,
    generateUUID,
    generateExcerpt,
    generateReadTimeMinutes,
} = require('../lib/posts');

// Multer config for image upload
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'blog');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `blog-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /image\/(jpeg|jpg|png|gif|webp)/;
        if (allowed.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files (jpeg, png, gif, webp) are allowed'));
    },
});

// POST /admin/blog/upload-image - Image upload for featured images
router.post('/admin/blog/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image file provided' });
    }
    const url = `/uploads/blog/${req.file.filename}`;
    res.json({ success: true, url });
});

// GET /admin/blog - List all posts (published + drafts)
router.get('/admin/blog', (req, res) => {
    const posts = getPosts();
    const sortedPosts = posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.render('blog/admin', {
        title: 'Blog Admin - Vagus Skool',
        description: 'Manage blog posts and content.',
        imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
        currentUrl: 'https://vagusskool.com/admin/blog',
        posts: sortedPosts
    });
});

// GET /admin/blog/new - Form to create new post
router.get('/admin/blog/new', (req, res) => {
    res.render('blog/editor', {
        title: 'New Post - Blog Admin',
        description: 'Create a new blog post.',
        imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
        currentUrl: 'https://vagusskool.com/admin/blog/new',
        post: null,
        isNew: true
    });
});

// POST /admin/blog/new - Create post
router.post('/admin/blog/new', (req, res) => {
    const { title, slug, excerpt, content, author, tags, published, subtitle, featured_image, meta_title, meta_description } = req.body;

    const posts = getPosts();
    const now = new Date().toISOString();

    const finalSlug = slug?.trim() || generateSlug(title);

    if (posts.some(p => p.slug === finalSlug)) {
        return res.status(400).render('blog/editor', {
            title: 'New Post - Blog Admin',
            description: 'Create a new blog post.',
            imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
            currentUrl: 'https://vagusskool.com/admin/blog/new',
            post: req.body,
            isNew: true,
            error: 'A post with this slug already exists.'
        });
    }

    const newPost = {
        id: generateUUID(),
        slug: finalSlug,
        title: title?.trim() || 'Untitled Post',
        subtitle: subtitle?.trim() || null,
        excerpt: excerpt?.trim() || generateExcerpt(content || ''),
        content: content || '',
        author: author?.trim() || 'Sterling Cooley',
        tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [],
        published: published === 'on',
        featured_image: featured_image?.trim() || null,
        meta_title: meta_title?.trim() || null,
        meta_description: meta_description?.trim() || null,
        read_time_minutes: generateReadTimeMinutes(content || ''),
        createdAt: now,
        updatedAt: now,
        socialLinks: {}
    };

    posts.push(newPost);

    if (savePosts(posts)) {
        res.redirect('/admin/blog');
    } else {
        res.status(500).render('blog/editor', {
            title: 'New Post - Blog Admin',
            description: 'Create a new blog post.',
            imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
            currentUrl: 'https://vagusskool.com/admin/blog/new',
            post: req.body,
            isNew: true,
            error: 'Failed to save post. Please try again.'
        });
    }
});

// GET /admin/blog/edit/:id - Edit form pre-filled
router.get('/admin/blog/edit/:id', (req, res) => {
    const posts = getPosts();
    const post = posts.find(p => p.id === req.params.id);

    if (!post) {
        return res.status(404).redirect('/admin/blog');
    }

    res.render('blog/editor', {
        title: 'Edit Post - Blog Admin',
        description: 'Edit blog post.',
        imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
        currentUrl: `https://vagusskool.com/admin/blog/edit/${post.id}`,
        post: post,
        isNew: false
    });
});

// POST /admin/blog/edit/:id - Update post
router.post('/admin/blog/edit/:id', (req, res) => {
    const { title, slug, excerpt, content, author, tags, published, subtitle, featured_image, meta_title, meta_description } = req.body;

    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === req.params.id);

    if (postIndex === -1) {
        return res.status(404).redirect('/admin/blog');
    }

    const existingPost = posts[postIndex];
    const now = new Date().toISOString();

    const finalSlug = slug?.trim() || generateSlug(title);

    if (posts.some(p => p.slug === finalSlug && p.id !== req.params.id)) {
        return res.status(400).render('blog/editor', {
            title: 'Edit Post - Blog Admin',
            description: 'Edit blog post.',
            imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
            currentUrl: `https://vagusskool.com/admin/blog/edit/${req.params.id}`,
            post: { ...req.body, id: req.params.id },
            isNew: false,
            error: 'A post with this slug already exists.'
        });
    }

    posts[postIndex] = {
        ...existingPost,
        slug: finalSlug,
        title: title?.trim() || 'Untitled Post',
        subtitle: subtitle?.trim() || null,
        excerpt: excerpt?.trim() || '',
        content: content || '',
        author: author?.trim() || 'Sterling Cooley',
        tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [],
        published: published === 'on',
        featured_image: featured_image?.trim() || null,
        meta_title: meta_title?.trim() || null,
        meta_description: meta_description?.trim() || null,
        read_time_minutes: generateReadTimeMinutes(content || ''),
        updatedAt: now,
        socialLinks: {}
    };

    if (savePosts(posts)) {
        res.redirect('/admin/blog');
    } else {
        res.status(500).render('blog/editor', {
            title: 'Edit Post - Blog Admin',
            description: 'Edit blog post.',
            imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
            currentUrl: `https://vagusskool.com/admin/blog/edit/${req.params.id}`,
            post: { ...req.body, id: req.params.id },
            isNew: false,
            error: 'Failed to save post. Please try again.'
        });
    }
});

// POST /admin/blog/delete/:id - Delete post
router.post('/admin/blog/delete/:id', (req, res) => {
    const posts = getPosts();
    const filteredPosts = posts.filter(p => p.id !== req.params.id);

    if (filteredPosts.length === posts.length) {
        return res.status(404).redirect('/admin/blog');
    }

    if (savePosts(filteredPosts)) {
        res.redirect('/admin/blog');
    } else {
        res.status(500).send('Failed to delete post');
    }
});

module.exports = router;
