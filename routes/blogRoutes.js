const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

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

// GET /blog - List all published posts
router.get('/blog', (req, res) => {
    const posts = getPosts();
    const publishedPosts = posts
        .filter(post => post.published)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Get all unique tags
    const allTags = [...new Set(posts.flatMap(post => post.tags))];
    
    res.render('blog/index', {
        title: 'Blog - Vagus Skool',
        description: 'Explore articles on vagus nerve stimulation, breathing techniques, and wellness practices.',
        imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
        currentUrl: 'https://vagusskool.com/blog',
        posts: publishedPosts,
        tags: allTags
    });
});

// GET /blog/:slug - Single post page
router.get('/blog/:slug', (req, res) => {
    const posts = getPosts();
    const post = posts.find(p => p.slug === req.params.slug && p.published);
    
    if (!post) {
        return res.status(404).render('home', {
            title: 'Post Not Found - Vagus Skool',
            description: 'The requested blog post could not be found.',
            imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
            currentUrl: 'https://vagusskool.com/blog'
        });
    }
    
    // Get related posts (same tags, excluding current)
    const relatedPosts = posts
        .filter(p => p.published && p.id !== post.id && p.tags.some(tag => post.tags.includes(tag)))
        .slice(0, 3);
    
    res.render('blog/post', {
        title: `${post.title} - Vagus Skool Blog`,
        description: post.excerpt,
        imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
        currentUrl: `https://vagusskool.com/blog/${post.slug}`,
        post: post,
        relatedPosts: relatedPosts
    });
});

// GET /blog/tag/:tag - Filter posts by tag
router.get('/blog/tag/:tag', (req, res) => {
    const posts = getPosts();
    const tag = req.params.tag;
    
    const filteredPosts = posts
        .filter(post => post.published && post.tags.includes(tag))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Get all unique tags
    const allTags = [...new Set(posts.flatMap(post => post.tags))];
    
    res.render('blog/index', {
        title: `Posts tagged "${tag}" - Vagus Skool Blog`,
        description: `Browse all articles tagged with "${tag}" on vagus nerve stimulation and wellness.`,
        imageUrl: 'https://vagusskool.com/images/preview-image.jpg',
        currentUrl: `https://vagusskool.com/blog/tag/${tag}`,
        posts: filteredPosts,
        tags: allTags,
        currentTag: tag
    });
});

module.exports = router;
