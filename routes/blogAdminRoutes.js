const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const postsFilePath = path.join(__dirname, '..', 'data', 'posts.json');

// Helper function to read posts
function getPosts() {
    try {
        const data = fs.readFileSync(postsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading posts:', error);
        return [];
    }
}

// Helper function to save posts
function savePosts(posts) {
    try {
        fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving posts:', error);
        return false;
    }
}

// Helper function to generate slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Helper function to generate UUID
function generateUUID() {
    return crypto.randomUUID();
}

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
    const { title, slug, excerpt, content, author, tags, published, twitter, youtube } = req.body;
    
    const posts = getPosts();
    const now = new Date().toISOString();
    
    // Generate slug if not provided
    const finalSlug = slug?.trim() || generateSlug(title);
    
    // Check for duplicate slug
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
        excerpt: excerpt?.trim() || '',
        content: content || '',
        author: author?.trim() || 'Sterling Cooley',
        tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [],
        published: published === 'on',
        createdAt: now,
        updatedAt: now,
        socialLinks: {
            twitter: twitter?.trim() || '',
            youtube: youtube?.trim() || ''
        }
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
    const { title, slug, excerpt, content, author, tags, published, twitter, youtube } = req.body;
    
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
        return res.status(404).redirect('/admin/blog');
    }
    
    const existingPost = posts[postIndex];
    const now = new Date().toISOString();
    
    // Generate slug if not provided
    const finalSlug = slug?.trim() || generateSlug(title);
    
    // Check for duplicate slug (excluding current post)
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
        excerpt: excerpt?.trim() || '',
        content: content || '',
        author: author?.trim() || 'Sterling Cooley',
        tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [],
        published: published === 'on',
        updatedAt: now,
        socialLinks: {
            twitter: twitter?.trim() || '',
            youtube: youtube?.trim() || ''
        }
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
