require("dotenv").config();
const express = require('express');
const path = require('path');
const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
const homeRoutes = require('./routes/homeRoutes');
const blogRoutes = require('./routes/blogRoutes');
const blogAdminRoutes = require('./routes/blogAdminRoutes');
const blogApi = require('./routes/api/blogApi');

app.use('/', homeRoutes);
app.use('/', blogRoutes);
app.use('/', blogAdminRoutes);
app.use('/api/blog', blogApi);

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
