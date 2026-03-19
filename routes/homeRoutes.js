const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', {
        title: "Vagus Skool - Ultra Breath Experience",
        description: "Discover the ancient wisdom of Ultra Breath and unlock the healing power of your vagus nerve through revolutionary techniques combining ultrasound-enhanced stimulation with ancient Tummo breathing practices.",
        imageUrl: "https://vagusskool.com/images/preview-image.jpg",
        currentUrl: "https://vagusskool.com"
    });
});

router.get('/about', (req, res) => {
    res.render('about', {
        title: "About Vagus Skool - Our Mission & Vision",
        description: "Learn how Vagus Skool is revolutionizing vagus nerve stimulation through accessible, clear, and effective methods. Join our community of practitioners and discover the healing power of VNS.",
        imageUrl: "https://vagusskool.com/images/preview-image.jpg",
        currentUrl: "https://vagusskool.com/about"
    });
});

router.get('/courses', (req, res) => {
    res.render('courses', {
        title: "Vagus Skool Courses - Comprehensive VNS Learning Paths",
        description: "Explore our comprehensive course catalog covering everything from basic vagus nerve stimulation to advanced techniques in breathing, ultrasound therapy, and electrical stimulation.",
        imageUrl: "https://vagusskool.com/images/preview-image.jpg",
        currentUrl: "https://vagusskool.com/courses"
    });
});

router.get('/join', (req, res) => {
    res.render('join', {
        title: "Vagus Nerve Live Workshop - Join Us Live!",
        description: "Join the Vagus Skool for our First Ever Live Vagus Nerve Stimulation Workshop. Experience live guidance and community practice in our interactive Zoom session.",
        imageUrl: "https://vagusskool.com/images/preview-image.jpg",
        currentUrl: "https://vagusskool.com/join"
    });
});

router.get('/style', (req, res) => {
    res.render('style', {
        title: "Vagus Skool Style Direction - Modern Web Design Concept",
        description: "Explore a modernized visual direction for Vagus Skool that builds on the existing purple-and-gold identity with refined layouts, glass surfaces, and elevated typography.",
        imageUrl: "https://vagusskool.com/images/preview-image.jpg",
        currentUrl: "https://vagusskool.com/style"
    });
});

router.get('/anatomy', (req, res) => {
    res.render('anatomy', {
        title: "Vagus Skool Anatomy Concept - Interactive Vagus Model",
        description: "Explore a hidden interactive anatomy page with an embedded Sketchfab vagus nerve model rendered directly inside the site.",
        imageUrl: "https://vagusskool.com/images/preview-image.jpg",
        currentUrl: "https://vagusskool.com/anatomy"
    });
});

module.exports = router; 