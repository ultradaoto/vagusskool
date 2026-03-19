# Vagus Skool Design System Guide

This document explains the exact design decisions used across the Vagus Skool site so the same visual language can be reproduced on other Skool-based sites.

It is not just a list of colors. It is a practical implementation guide:

- what the design is trying to feel like
- what Tailwind tokens power it
- what reusable classes were created
- what page structure patterns were chosen
- where to reuse them
- exact code examples you can lift into other projects

## 1. Design Goal

The main design decision was to move the site away from a plain marketing-page feel and toward a softer, more premium "editorial wellness" feel.

The desired emotional effect is:

- calm
- elevated
- spacious
- trustworthy
- premium, but still accessible

The site should feel like:

- wellness knowledge with modern product polish
- soft luxury rather than hard-tech futurism
- guided, intentional, and human rather than busy or salesy

This is why the design uses:

- serif display type for emotional and editorial presence
- soft glass panels instead of harsh card edges
- muted lavender and gold accents instead of aggressive saturation
- heavy use of rounded surfaces
- generous spacing
- layered gradients and blur for atmosphere

## 2. Core Visual Direction

The site uses a three-layer visual hierarchy:

1. Background atmosphere
2. Surface system
3. Typography and action accents

### 2.1 Background atmosphere

The body background is not flat white. It uses a soft gradient so every page already has ambient tone before any component is added.

From `public/css/input.css`:

```css
body {
  @apply font-montserrat bg-hero-gradient text-dark-text min-h-screen leading-relaxed;
}
```

From `tailwind.config.js`:

```js
backgroundImage: {
  'hero-gradient': 'linear-gradient(135deg, #FAF9F6 0%, #F0E6FF 100%)',
  'golden-gradient': 'linear-gradient(45deg, #D4AF37, #F4E4BC)',
  'footer-gradient': 'linear-gradient(45deg, #8A6F9D, #7A5F8D)',
}
```

Why this matters:

- the page never feels dead or flat
- the lavender tint quietly reinforces the brand
- white glass cards feel natural on top of it

### 2.2 Surface system

Instead of ordinary cards, the site uses translucent rounded shells and panels with blur, borders, and soft shadows.

This is the biggest stylistic upgrade made to the site.

Primary classes:

```css
.style-shell {
  @apply relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 backdrop-blur-xl shadow-2xl;
}

.style-panel {
  @apply rounded-[1.75rem] border border-accent-purple/10 bg-white/65 p-6 md:p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl;
}

.section-shell {
  @apply relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/45 p-6 shadow-xl backdrop-blur-xl md:p-8;
}

.style-metric {
  @apply rounded-[1.5rem] border border-white/70 bg-white/70 p-5 shadow-lg backdrop-blur-sm;
}
```

Design reasoning:

- `style-shell` is for major hero wrappers
- `section-shell` is for major lower sections
- `style-panel` is for internal cards that need hover elevation
- `style-metric` is for smaller factual or supporting blocks

This keeps the whole site cohesive while still giving different levels of emphasis.

### 2.3 Typography

Typography was split by role:

- `Cormorant Garamond` for emotional, editorial, premium headings
- `Montserrat` for readable body/UI copy

From `tailwind.config.js`:

```js
fontFamily: {
  montserrat: ['Montserrat', 'sans-serif'],
  cormorant: ['Cormorant Garamond', 'serif'],
}
```

From `views/partials/head.ejs`:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Montserrat:wght@300;400&display=swap" rel="stylesheet">
```

Usage rule:

- page titles: `font-cormorant text-5xl md:text-7xl`
- section headings: `font-cormorant text-3xl md:text-5xl`
- body copy: `text-lg md:text-xl leading-relaxed`
- labels: uppercase tracking with reduced opacity

Example:

```html
<h1 class="font-cormorant text-5xl md:text-7xl text-accent-purple font-medium leading-[0.94]">
  Explore the vagus nerve in a rotatable 3D anatomy viewer.
</h1>

<p class="mt-6 max-w-2xl text-lg leading-relaxed text-dark-text/85 md:text-xl">
  Use this 3D render to better understand one of the body's most important communication pathways.
</p>
```

Why this works:

- serif headlines create meaning and importance
- sans-serif body copy keeps the experience usable
- the contrast feels premium without becoming ornate

## 3. Color System

These are the main design tokens:

```js
colors: {
  gold: '#D4AF37',
  'light-gold': '#F4E4BC',
  'soft-white': '#FAF9F6',
  'dark-text': '#2C2C2C',
  'accent-purple': '#8A6F9D',
}
```

### 3.1 How each color is used

`accent-purple`

- main brand color
- primary heading color
- nav links
- educational labels
- footer base

`gold`

- call-to-action emphasis
- important accents
- subtitles
- hover state warmth
- highlight chips

`soft-white`

- warm text on dark/purple backgrounds
- keeps white from feeling sterile

`dark-text`

- core body content
- used instead of pure black so the site stays soft

### 3.2 Important principle

Gold is not used as a primary text color everywhere.

Gold is reserved to:

- subtitles
- CTA gradients
- key accents
- select highlights

That restraint is what keeps it feeling premium.

## 4. Reusable Class Library

These classes are the actual portable system.

If you want to replicate this design on another site, these are the first things to bring over.

### 4.1 Layout and shell classes

```css
.container-custom {
  @apply max-w-[1200px] mx-auto px-4 md:px-8;
}

.style-shell {
  @apply relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 backdrop-blur-xl shadow-2xl;
}

.section-shell {
  @apply relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/45 p-6 shadow-xl backdrop-blur-xl md:p-8;
}
```

How to use:

```html
<section class="container-custom py-10 md:py-16">
  <div class="style-shell px-6 py-8 md:px-10 md:py-12">
    <!-- page hero content -->
  </div>
</section>
```

### 4.2 Supporting cards

```css
.style-panel {
  @apply rounded-[1.75rem] border border-accent-purple/10 bg-white/65 p-6 md:p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl;
}

.style-metric {
  @apply rounded-[1.5rem] border border-white/70 bg-white/70 p-5 shadow-lg backdrop-blur-sm;
}
```

How to use:

```html
<div class="grid gap-4 md:grid-cols-2">
  <div class="style-panel">
    <h2 class="font-cormorant text-3xl text-accent-purple">Guided regulation</h2>
    <p class="mt-3 text-dark-text/80">Learn a simple, direct method for calming the body.</p>
  </div>
  <div class="style-panel">
    <h2 class="font-cormorant text-3xl text-accent-purple">Embodied practice</h2>
    <p class="mt-3 text-dark-text/80">Turn theory into ritual and repeatable action.</p>
  </div>
</div>
```

### 4.3 Labels and chips

```css
.style-kicker {
  @apply inline-flex items-center gap-2 rounded-full border border-accent-purple/15 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.32em] text-accent-purple shadow-sm;
}

.style-chip {
  @apply inline-flex items-center rounded-full border border-accent-purple/10 bg-accent-purple/5 px-3 py-1 text-sm text-accent-purple;
}

.section-label {
  @apply text-sm uppercase tracking-[0.28em] text-accent-purple/70;
}
```

These are crucial because they provide rhythm and information hierarchy without adding visual noise.

Example:

```html
<span class="style-kicker mb-6">Interactive anatomy explorer</span>

<div class="mt-8 flex flex-wrap gap-3">
  <span class="style-chip">Interactive 3D anatomy</span>
  <span class="style-chip">Rotatable model</span>
  <span class="style-chip">Vagus pathway study</span>
</div>
```

### 4.4 CTA button

The CTA button is intentionally theatrical. It is the main high-energy object on the page.

```css
.golden-button {
  @apply relative overflow-hidden bg-golden-gradient px-8 py-4 rounded-full text-dark-text text-lg font-medium transition-all duration-300 shadow-golden hover:-translate-y-0.5 hover:shadow-golden-hover;
}

.golden-button::after {
  content: '';
  @apply absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 animate-shimmer;
}
```

Why:

- gradient gives it premium depth
- pill shape feels modern and friendly
- shimmer introduces motion without needing JS
- hover lift gives tactile feedback

Example:

```html
<button id="cta-button" class="golden-button w-full md:w-auto">
  Join Our Community Now
</button>
```

### 4.5 Video/media wrapper

```css
.video-shell {
  @apply overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/60 shadow-xl backdrop-blur-sm;
}
```

Used for YouTube embeds so video feels part of the system rather than an alien rectangular block.

Example:

```html
<div class="video-shell p-3">
  <div class="relative pb-[56.25%] h-0 overflow-hidden rounded-[1.25rem] shadow-2xl">
    <iframe class="absolute top-0 left-0 h-full w-full" src="..."></iframe>
  </div>
</div>
```

## 5. Navigation Design

The nav was converted from a plain top row into a floating glass pill.

From `public/css/input.css`:

```css
.site-header {
  @apply sticky top-0 z-50 px-4 py-4 md:px-8;
}

.site-nav {
  @apply mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 rounded-full border border-white/60 bg-white/55 px-5 py-4 shadow-lg backdrop-blur-xl md:flex-row md:px-8;
}

.nav-link {
  @apply text-accent-purple no-underline transition-colors duration-300 hover:text-gold;
}
```

From `views/partials/header.ejs`:

```html
<header class="site-header">
  <nav class="site-nav">
    <a href="/" class="logo text-accent-purple no-underline text-2xl font-bold font-cormorant md:text-3xl">Vagus Skool</a>
    <div class="nav-links flex flex-wrap justify-center gap-4 md:gap-8">
      <a href="/about" class="nav-link">About</a>
      <a href="/anatomy" class="nav-link">Anatomy</a>
      <a href="/courses" class="nav-link">Courses</a>
      <a href="/testimonials" class="nav-link">Testimonials</a>
      <a href="/blog" class="nav-link">Blog</a>
      <a href="/join" class="nav-link">Join</a>
    </div>
  </nav>
</header>
```

Design reasoning:

- sticky keeps the site feeling product-like
- rounded nav reduces harsh UI feel
- transparency keeps it integrated into the page instead of a hard band
- serif wordmark gives identity without a graphic logo

## 6. Footer Design

The footer was upgraded from a simple copyright strip into a branded closing block.

Code:

```html
<footer class="site-footer py-10">
  <div class="container-custom">
    <div class="flex flex-col gap-6 rounded-[2rem] border border-white/15 bg-white/10 px-6 py-8 text-center shadow-lg backdrop-blur-sm md:flex-row md:items-center md:justify-between md:text-left">
      <div class="max-w-2xl">
        <p class="font-cormorant text-3xl text-soft-white md:text-4xl">Regulate, restore, and reconnect.</p>
        <p class="mt-3 text-sm text-soft-white/80 md:text-base">
          Vagus Skool brings practical vagus nerve education, guided learning, and community support into a calmer digital experience.
        </p>
      </div>
      <div class="text-sm text-soft-white/85">
        <p>&copy; <%= new Date().getFullYear() %> Vagus School. All rights reserved.</p>
        <p class="mt-2">Designed to feel softer, clearer, and more intentional.</p>
      </div>
    </div>
  </div>
</footer>
```

Design reasoning:

- footer should feel like a final resting point, not a technical leftover
- gradient base ties it back to brand
- large serif line gives emotional closure

## 7. Page Composition Rules

The system is not only about components. It is about page rhythm.

Most pages follow this sequence:

1. Large hero shell
2. Supporting metrics/chips
3. One or two lower sections
4. CTA or educational anchor

### 7.1 Hero formula

Use this for major pages:

```html
<section class="style-shell px-6 py-8 md:px-10 md:py-12">
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute left-[-2rem] top-12 h-48 w-48 rounded-full bg-accent-purple/12 blur-3xl"></div>
    <div class="absolute bottom-[-3rem] right-[-2rem] h-56 w-56 rounded-full bg-gold/20 blur-3xl"></div>
  </div>

  <div class="relative z-10">
    <span class="style-kicker mb-6">Section kicker</span>
    <h1 class="font-cormorant text-5xl md:text-7xl text-accent-purple font-medium leading-[0.94]">
      Hero headline here.
    </h1>
    <p class="mt-6 max-w-2xl text-lg leading-relaxed text-dark-text/85 md:text-xl">
      Supporting copy here.
    </p>
  </div>
</section>
```

The blurred circles are important. They create depth and motion without requiring images.

### 7.2 Two-column information split

Used repeatedly on `home.ejs`, `about.ejs`, `join.ejs`, and `anatomy.ejs`.

Example:

```html
<div class="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
  <div>
    <!-- lead copy -->
  </div>
  <div class="grid gap-4">
    <div class="style-panel">...</div>
    <div class="style-panel">...</div>
  </div>
</div>
```

Why:

- left side tells the story
- right side clarifies or reinforces
- avoids giant text walls

### 7.3 Lower section grid

Example:

```html
<section class="mt-8 grid gap-6 md:grid-cols-3">
  <article class="section-shell">...</article>
  <article class="section-shell">...</article>
  <article class="section-shell">...</article>
</section>
```

This is the site’s go-to educational layout for:

- anatomy landmark boxes
- benefit boxes
- topic explanation boxes
- category summaries

## 8. Content Strategy Decisions

A major part of the redesign was not visual only. It was structural.

### 8.1 Break long copy into roles

Instead of putting all explanation into one paragraph, split content into:

- hero intro
- metric/support blocks
- lower orientation/education blocks
- final CTA block

This was done because the old site often felt like one long vertical stack of content.

### 8.2 Use labels to create hierarchy

Small uppercase labels like:

- `How to use it`
- `Why it matters`
- `Orientation guide`
- `Study note`

help people scan the site quickly.

These should stay short, factual, and calm.

### 8.3 Make supporting cards specific

Bad:

- vague inspirational copy

Better:

- functional language
- named benefits
- named educational landmarks
- named tracks/categories

This is why the anatomy page now calls out:

- superior ganglion
- inferior ganglion
- jugular foramen

instead of generic filler.

## 9. Page-by-Page Patterns

### 9.1 Home page

Main decisions:

- split hero between copy and embedded video
- use chips for benefits instead of plain bullet points
- use a purple CTA timer card for urgency

Key pattern:

```html
<div class="relative z-10 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
  <div><!-- story and metrics --></div>
  <div class="video-shell p-3"><!-- video --></div>
</div>
```

### 9.2 About page

Main decisions:

- make mission copy feel more editorial
- support it with side panels
- end with a calm centered CTA

Why:

- "about" pages should feel credible and thoughtful, not like filler

### 9.3 Courses page

Main decisions:

- wrap page intro in hero shell
- standardize course cards with shared rounded surface treatment
- add category chips like `Foundations`, `Research`, `Mindset`

Course card pattern:

```html
<div class="flex flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/65 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
  <img src="/images/course01.png" alt="..." class="w-full h-64 object-cover">
  <div class="p-6 md:p-8 flex flex-col flex-grow">
    <span class="style-chip w-fit mb-4">Foundations</span>
    <h2 class="font-cormorant text-2xl md:text-3xl text-accent-purple mb-4 font-medium">Course Title</h2>
    <p class="text-dark-text leading-relaxed mb-6 flex-grow">Description</p>
    <a href="..." class="golden-button text-center !py-3 !px-6 !text-base mt-auto">CTA</a>
  </div>
</div>
```

### 9.4 Testimonials page

Main decisions:

- use `video-shell` for embedded videos
- use `style-panel` for written testimonials
- end with a clear community CTA

This page should feel social and trustworthy, not cluttered.

### 9.5 Join page

Main decisions:

- position live-workshop copy as an invitation
- use supporting metric cards to explain attendance
- keep final CTA centered and simple

### 9.6 Anatomy page

Main decisions:

- use the same hero shell as other pages so it feels like part of the site
- embed the 3D viewer inside a dark framed container
- add educational lower panels so the page is not just "an embed and nothing else"

This is important:

- tools/media should never float without context
- the surrounding page should help the user understand why the media matters

## 10. Exact Anatomy Embed Pattern

This is the exact pattern used on `views/anatomy.ejs`:

```html
<div class="section-shell">
  <div class="relative h-0 w-full overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#02030a] pb-[56.25%] shadow-2xl ring-1 ring-white/10">
    <iframe
      title="Vagus Nerve (Cranial Nerve X)"
      src="https://sketchfab.com/models/706768a0c3bb413aac935c1ee1111cfb/embed?autospin=0.4&autostart=1&preload=1&transparent=1&ui_theme=dark&ui_infos=0&ui_watermark_link=0"
      class="absolute left-0 top-0 h-full w-full border-0"
      allowfullscreen
      mozallowfullscreen="true"
      webkitallowfullscreen="true"
      allow="autoplay; fullscreen; xr-spatial-tracking"
      frameborder="0"
    ></iframe>
  </div>
</div>
```

Why this wrapper matters:

- `pb-[56.25%]` creates the 16:9 ratio
- `bg-[#02030a]` creates the black void frame
- rounded corners and border make the embed feel native to the design system
- shadow/ring make it feel elevated and intentional

## 11. How to Replicate This On Another Skool Site

If you want to clone this design system fast, do it in this order:

### Step 1

Copy these files/patterns first:

- `tailwind.config.js` token definitions
- `public/css/input.css` component classes
- `views/partials/head.ejs`
- `views/partials/header.ejs`
- `views/partials/footer.ejs`

### Step 2

Make sure your project loads:

- `Cormorant Garamond`
- `Montserrat`
- compiled Tailwind stylesheet

### Step 3

Use this hero wrapper on all top-level pages:

```html
<div class="container-custom py-10 md:py-16">
  <section class="style-shell px-6 py-8 md:px-10 md:py-12">
    <!-- hero -->
  </section>
</div>
```

### Step 4

Use these content block types repeatedly:

- `style-panel`
- `style-metric`
- `section-shell`
- `style-chip`
- `style-kicker`
- `golden-button`

### Step 5

Use page-specific chips to create visual taxonomy:

- `Foundations`
- `Research`
- `Mindset`
- `Lifestyle`
- `Interactive 3D anatomy`

This makes pages feel organized without needing complex UI.

## 12. Rules I Would Keep Across All Future Skool Sites

### Keep

- serif headlines + sans-serif body pairing
- lavender/gold palette
- soft translucent surfaces
- pill navigation
- rounded large shells
- small uppercase labels for information hierarchy
- gold CTA as the main action object

### Avoid

- flat white cards everywhere
- too many hard borders
- dark black body text on pure white backgrounds
- too many unrelated accent colors
- generic stock-ui feel
- overpacked sections with no breathing room

## 13. Quick Copy-Paste Starter Template

Use this as a starting page on another project:

```html
<!DOCTYPE html>
<html lang="en">
<%- include('partials/head') %>
<body>
  <%- include('partials/header') %>
  <main>
    <section class="container-custom py-10 md:py-16">
      <div class="style-shell px-6 py-8 md:px-10 md:py-12">
        <div class="pointer-events-none absolute inset-0">
          <div class="absolute left-[-2rem] top-12 h-48 w-48 rounded-full bg-accent-purple/12 blur-3xl"></div>
          <div class="absolute bottom-[-3rem] right-[-2rem] h-56 w-56 rounded-full bg-gold/20 blur-3xl"></div>
        </div>

        <div class="relative z-10">
          <span class="style-kicker mb-6">Section kicker</span>
          <h1 class="font-cormorant text-5xl md:text-7xl text-accent-purple font-medium leading-[0.94]">
            Your headline here.
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-dark-text/85 md:text-xl">
            Your supporting paragraph here.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <span class="style-chip">Chip one</span>
            <span class="style-chip">Chip two</span>
            <span class="style-chip">Chip three</span>
          </div>
        </div>
      </div>

      <section class="mt-8 grid gap-6 md:grid-cols-3">
        <article class="section-shell">
          <p class="section-label">Label</p>
          <h2 class="mt-4 font-cormorant text-3xl text-accent-purple">Title</h2>
          <p class="mt-4 text-lg leading-relaxed text-dark-text/82">Body copy.</p>
        </article>
        <article class="section-shell">
          <p class="section-label">Label</p>
          <h2 class="mt-4 font-cormorant text-3xl text-accent-purple">Title</h2>
          <p class="mt-4 text-lg leading-relaxed text-dark-text/82">Body copy.</p>
        </article>
        <article class="section-shell">
          <p class="section-label">Label</p>
          <h2 class="mt-4 font-cormorant text-3xl text-accent-purple">Title</h2>
          <p class="mt-4 text-lg leading-relaxed text-dark-text/82">Body copy.</p>
        </article>
      </section>
    </section>
  </main>
  <%- include('partials/footer') %>
</body>
</html>
```

## 14. Final Summary

The Vagus Skool design system is built on one main idea:

Take a wellness-education site and make it feel like a calm premium product by combining:

- soft gradients
- lavender/gold branding
- serif editorial headings
- glass-like rounded surfaces
- clear content hierarchy
- intentional CTA emphasis

If you reproduce the tokens, class library, page rhythm, and typography choices above, you will be able to recreate this exact design language across your other Skool sites without needing to reinvent the styling every time.
