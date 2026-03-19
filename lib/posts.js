/**
 * Shared post storage and helpers for Vagus Skool blog.
 * Uses JSON file storage (data/posts.json).
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const postsFilePath = path.join(__dirname, '..', 'data', 'posts.json');

function getPosts() {
    try {
        const data = fs.readFileSync(postsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading posts:', error);
        return [];
    }
}

function savePosts(posts) {
    try {
        fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving posts:', error);
        return false;
    }
}

function generateSlug(title, maxLength = 70) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, maxLength);
}

function generateUUID() {
    return crypto.randomUUID();
}

function generateExcerpt(content, maxLength = 200) {
    const plain = content.replace(/<[^>]+>/g, '').trim();
    if (plain.length <= maxLength) return plain;
    return plain.substring(0, maxLength) + '...';
}

function generateReadTimeMinutes(content) {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
}

function normalizePostContent(content = '') {
    return content
        // Strip author-pasted classes/styles that can force dark mode blocks.
        .replace(/\sclass="[^"]*"/gi, '')
        .replace(/\sstyle="[^"]*"/gi, '')
        .replace(/\sbgcolor="[^"]*"/gi, '')
        .replace(/\scolor="[^"]*"/gi, '');
}

function findPostById(posts, id) {
    return posts.find(p => p.id === id);
}

function findPostBySlug(posts, slug) {
    return posts.find(p => p.slug === slug);
}

module.exports = {
    getPosts,
    savePosts,
    generateSlug,
    generateUUID,
    generateExcerpt,
    generateReadTimeMinutes,
    normalizePostContent,
    findPostById,
    findPostBySlug,
};
