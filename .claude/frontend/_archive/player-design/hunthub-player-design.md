# 🎮 HuntHub Player App - Premium Design System

## 🎯 Design Philosophy

**Core Principles:**
- **Playful but Premium** - Fun without looking childish
- **Mobile-First** - Thumb-friendly, gesture-based
- **Gamified Progress** - Visual feedback, celebrations, momentum
- **Clean & Focused** - One thing at a time, no clutter
- **Delightful Details** - Micro-animations, haptic feedback, smooth transitions

---

## 🎨 Visual Style Guide

### Color Palette

```css
/* Primary - Adventure Gradient */
--primary-gradient: linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%);
--primary-dark: #E85555;
--primary-light: #FFC77A;

/* Success - Achievement Green */
--success-gradient: linear-gradient(135deg, #6BCF7F 0%, #4ECDC4 100%);
--success-glow: rgba(107, 207, 127, 0.3);

/* Background - Warm Layers */
--bg-primary: #FFFBF5;      /* Cream white */
--bg-secondary: #FFF8EF;    /* Warmer cream */
--bg-card: #FFFFFF;         /* Pure white cards */
--bg-overlay: rgba(0, 0, 0, 0.6);

/* Text */
--text-primary: #2C3E50;
--text-secondary: #7F8C8D;
--text-muted: #BDC3C7;
--text-inverse: #FFFFFF;

/* Accents by Step Type */
--location-color: #6BCF7F;
--quiz-color: #5DADE2;
--photo-color: #FF6B6B;
--task-color: #9B59B6;

/* Effects */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
--shadow-glow: 0 0 24px rgba(255, 107, 107, 0.4);
```

### Typography

```css
/* Font Stack */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Cabinet Grotesk', 'Inter', sans-serif; /* For headers */

/* Type Scale */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 24px;
--text-2xl: 32px;
--text-3xl: 48px;

/* Weights */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Spacing & Sizing

```css
--space-xs: 8px;
--space-sm: 12px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;

--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-full: 9999px;

--safe-area-top: env(safe-area-inset-top);
--safe-area-bottom: env(safe-area-inset-bottom);
```

---

## 📱 Screen Layouts

### 1. Hunt Start Screen

```html
<!DOCTYPE html>
<html>
<head>
<style>
.hunt-start {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFBF5 0%, #FFF8EF 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Animated background decoration */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.4;
  z-index: 0;
}

.bg-circle-1 {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB347 0%, #FF6B6B 100%);
  filter: blur(80px);
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.bg-circle-2 {
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6BCF7F 0%, #4ECDC4 100%);
  filter: blur(80px);
  bottom: -80px;
  left: -80px;
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 20px) scale(1.1); }
}

.start-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  padding-top: calc(24px + var(--safe-area-top));
}

/* Hunt Hero Image */
.hunt-hero {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 24px;
  position: relative;
  background: linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%);
}

.hunt-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hunt-hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
}

/* Hunt Info Card */
.hunt-info-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.hunt-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: #2C3E50;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.hunt-subtitle {
  font-size: 16px;
  color: #7F8C8D;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.hunt-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #FFF8EF;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #2C3E50;
}

.meta-badge-icon {
  font-size: 18px;
}

/* Description Section */
.hunt-description {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: auto;
}

.description-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 12px 0;
}

.description-text {
  font-size: 16px;
  line-height: 1.6;
  color: #7F8C8D;
  margin: 0;
}

/* Start Button */
.start-button-container {
  padding: 24px;
  padding-bottom: calc(24px + var(--safe-area-bottom));
  background: linear-gradient(0deg, 
    rgba(255, 251, 245, 1) 0%, 
    rgba(255, 251, 245, 0) 100%
  );
  position: sticky;
  bottom: 0;
  z-index: 2;
}

.start-button {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%);
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 107, 107, 0.4);
}

.start-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
</head>
<body>

<div class="hunt-start">
  <!-- Background Decoration -->
  <div class="bg-decoration">
    <div class="bg-circle-1"></div>
    <div class="bg-circle-2"></div>
  </div>

  <!-- Main Content -->
  <div class="start-content">
    <!-- Hero Image -->
    <div class="hunt-hero">
      <div class="hunt-hero-placeholder">🗺️</div>
      <!-- <img src="hunt-cover.jpg" alt="Hunt cover"> -->
    </div>

    <!-- Hunt Info -->
    <div class="hunt-info-card">
      <h1 class="hunt-title">City Explorer Hunt</h1>
      <p class="hunt-subtitle">Discover hidden gems around downtown</p>
      
      <div class="hunt-meta">
        <div class="meta-badge">
          <span class="meta-badge-icon">📍</span>
          <span>6 Stops</span>
        </div>
        <div class="meta-badge">
          <span class="meta-badge-icon">⏱️</span>
          <span>~45 min</span>
        </div>
        <div class="meta-badge">
          <span class="meta-badge-icon">🏃</span>
          <span>2.5 km</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="hunt-description">
      <h2 class="description-title">About this Hunt</h2>
      <p class="description-text">
        Embark on an exciting journey through the heart of the city. 
        You'll solve puzzles, discover landmarks, and uncover stories 
        that most people walk past every day. Perfect for friends, 
        families, or solo adventurers!
      </p>
    </div>
  </div>

  <!-- Start Button (Sticky Bottom) -->
  <div class="start-button-container">
    <button class="start-button">
      <span>Start Adventure</span>
      <span class="button-icon">🚀</span>
    </button>
  </div>
</div>

</body>
</html>
```

---

### 2. Step View - Location Challenge

```html
<!DOCTYPE html>
<html>
<head>
<style>
.step-screen {
  min-height: 100vh;
  background: #FFFBF5;
  display: flex;
  flex-direction: column;
}

/* Progress Header */
.progress-header {
  background: white;
  padding: 16px 24px;
  padding-top: calc(16px + var(--safe-area-top));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.progress-bar-track {
  flex: 1;
  height: 8px;
  background: #F0F0F0;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6BCF7F 0%, #4ECDC4 100%);
  border-radius: 100px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  width: 33%; /* Example: 2/6 steps */
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #2C3E50;
  white-space: nowrap;
}

.step-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-number-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #6BCF7F 0%, #4ECDC4 100%);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.step-type-badge {
  padding: 4px 12px;
  background: #FFF8EF;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  color: #7F8C8D;
}

/* Main Content */
.step-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Step Title Card */
.step-title-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.step-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.step-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: #2C3E50;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.step-subtitle {
  font-size: 16px;
  color: #7F8C8D;
  margin: 0;
}

/* Clue Card */
.clue-card {
  background: linear-gradient(135deg, #FFF8EF 0%, #FFFBF5 100%);
  border: 2px solid #FFE5CC;
  border-radius: 20px;
  padding: 20px;
  position: relative;
}

.clue-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #FF6B6B;
  margin-bottom: 12px;
}

.clue-text {
  font-size: 18px;
  line-height: 1.6;
  color: #2C3E50;
  margin: 0;
  font-style: italic;
}

/* Location Status Card */
.location-status-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6BCF7F 0%, #4ECDC4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(107, 207, 127, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(107, 207, 127, 0); }
  100% { box-shadow: 0 0 0 0 rgba(107, 207, 127, 0); }
}

.status-text {
  flex: 1;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 4px 0;
}

.status-distance {
  font-size: 24px;
  font-weight: 700;
  color: #6BCF7F;
  margin: 0;
}

/* Mini Map Preview */
.mini-map {
  width: 100%;
  height: 120px;
  background: #F0F0F0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 12px;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, #E8F5E9 0%, #B9F6CA 100%);
}

/* Action Button */
.action-button {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #6BCF7F 0%, #4ECDC4 100%);
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(107, 207, 127, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(107, 207, 127, 0.4);
}

.action-button:active {
  transform: translateY(0);
}

/* Hint Button */
.hint-button {
  width: 100%;
  padding: 14px;
  background: white;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #7F8C8D;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hint-button:hover {
  border-color: #FFB347;
  color: #FF6B6B;
  background: #FFFBF5;
}
</style>
</head>
<body>

<div class="step-screen">
  <!-- Progress Header -->
  <header class="progress-header">
    <div class="progress-bar-container">
      <div class="progress-bar-track">
        <div class="progress-bar-fill"></div>
      </div>
      <span class="progress-text">2 of 6</span>
    </div>
    
    <div class="step-info-row">
      <span class="step-number-badge">
        <span>📍</span>
        <span>Step 2</span>
      </span>
      <span class="step-type-badge">Location Challenge</span>
    </div>
  </header>

  <!-- Main Content -->
  <main class="step-content">
    <!-- Step Title -->
    <div class="step-title-card">
      <div class="step-icon">⛲</div>
      <h1 class="step-title">Find the Fountain</h1>
      <p class="step-subtitle">Follow the clue to discover your next location</p>
    </div>

    <!-- Clue -->
    <div class="clue-card">
      <div class="clue-label">
        <span>💡</span>
        <span>Your Clue</span>
      </div>
      <p class="clue-text">
        "Where water dances in the square, and pigeons gather without care. 
        Four bronze lions guard this place, in the heart of the downtown space."
      </p>
    </div>

    <!-- Location Status -->
    <div class="location-status-card">
      <div class="status-row">
        <div class="status-icon">📍</div>
        <div class="status-text">
          <p class="status-title">Distance to location</p>
          <p class="status-distance">127 m</p>
        </div>
      </div>

      <!-- Mini Map -->
      <div class="mini-map">
        <div class="map-placeholder">🗺️</div>
      </div>

      <!-- Check Location Button -->
      <button class="action-button">
        <span>Check My Location</span>
        <span>🎯</span>
      </button>
    </div>

    <!-- Hint Button -->
    <button class="hint-button">
      <span>💡</span>
      <span>Need a hint?</span>
    </button>
  </main>
</div>

</body>
</html>
```

---

### 3. Step View - Quiz Challenge

```html
<!DOCTYPE html>
<html>
<head>
<style>
/* Use same base styles from location challenge */

/* Quiz Card */
.quiz-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.quiz-question {
  font-size: 20px;
  font-weight: 600;
  color: #2C3E50;
  line-height: 1.4;
  margin: 0 0 24px 0;
}

/* Answer Options */
.answer-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-option {
  padding: 16px 20px;
  background: #FFFBF5;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #2C3E50;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.answer-option:hover {
  border-color: #5DADE2;
  background: #F0F8FF;
  transform: translateX(4px);
}

.answer-option.selected {
  border-color: #5DADE2;
  background: linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%);
  border-width: 3px;
}

.answer-option.correct {
  border-color: #6BCF7F;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  animation: success-pulse 0.5s ease;
}

.answer-option.incorrect {
  border-color: #FF6B6B;
  background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
  animation: shake 0.5s ease;
}

@keyframes success-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.option-prefix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  margin-right: 12px;
  font-weight: 600;
  font-size: 14px;
  color: #7F8C8D;
}

.answer-option.correct .option-prefix {
  background: #6BCF7F;
  color: white;
}

.answer-option.incorrect .option-prefix {
  background: #FF6B6B;
  color: white;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #5DADE2 0%, #4ECDC4 100%);
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(93, 173, 226, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-button:disabled {
  background: #E0E0E0;
  color: #BDC3C7;
  box-shadow: none;
  cursor: not-allowed;
}

.submit-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(93, 173, 226, 0.4);
}

/* Feedback Panel */
.feedback-panel {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border: 2px solid #6BCF7F;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: start;
  gap: 16px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.feedback-content {
  flex: 1;
}

.feedback-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 8px 0;
}

.feedback-text {
  font-size: 14px;
  color: #7F8C8D;
  margin: 0;
  line-height: 1.5;
}

.feedback-panel.incorrect {
  background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
  border-color: #FF6B6B;
}
</style>
</head>
<body>

<div class="step-screen">
  <!-- Progress Header (same as before) -->
  <header class="progress-header">
    <div class="progress-bar-container">
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width: 50%;"></div>
      </div>
      <span class="progress-text">3 of 6</span>
    </div>
    
    <div class="step-info-row">
      <span class="step-number-badge" style="background: linear-gradient(135deg, #5DADE2 0%, #4ECDC4 100%);">
        <span>❓</span>
        <span>Step 3</span>
      </span>
      <span class="step-type-badge">Quiz Challenge</span>
    </div>
  </header>

  <!-- Main Content -->
  <main class="step-content">
    <!-- Step Title -->
    <div class="step-title-card">
      <div class="step-icon">🤔</div>
      <h1 class="step-title">History Question</h1>
      <p class="step-subtitle">Test your knowledge about this landmark</p>
    </div>

    <!-- Quiz -->
    <div class="quiz-card">
      <h2 class="quiz-question">
        When was this fountain built and dedicated to the public?
      </h2>

      <div class="answer-options">
        <button class="answer-option">
          <span class="option-prefix">A</span>
          <span>1847</span>
        </button>
        
        <button class="answer-option selected">
          <span class="option-prefix">B</span>
          <span>1892</span>
        </button>
        
        <button class="answer-option">
          <span class="option-prefix">C</span>
          <span>1923</span>
        </button>
        
        <button class="answer-option">
          <span class="option-prefix">D</span>
          <span>1956</span>
        </button>
      </div>
    </div>

    <!-- Submit Button -->
    <button class="submit-button">
      Submit Answer
    </button>

    <!-- Feedback (shown after answer) -->
    <!-- <div class="feedback-panel">
      <div class="feedback-icon">🎉</div>
      <div class="feedback-content">
        <h3 class="feedback-title">Correct!</h3>
        <p class="feedback-text">
          The fountain was indeed built in 1892 as a gift to the city. 
          It's been a meeting point for locals for over 130 years!
        </p>
      </div>
    </div> -->
  </main>
</div>

</body>
</html>
```

---

### 4. Step View - Photo Challenge

```html
<!DOCTYPE html>
<html>
<head>
<style>
/* Photo Upload Card */
.photo-upload-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.upload-instructions {
  font-size: 16px;
  color: #7F8C8D;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

/* Photo Upload Area */
.photo-upload-area {
  width: 100%;
  aspect-ratio: 4/3;
  border: 3px dashed #E0E0E0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #FFFBF5;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.photo-upload-area:hover {
  border-color: #FF6B6B;
  background: #FFF8EF;
}

.photo-upload-area.has-photo {
  border-style: solid;
  border-color: #6BCF7F;
  padding: 0;
}

.upload-icon {
  font-size: 64px;
  opacity: 0.5;
}

.upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #7F8C8D;
}

.upload-hint {
  font-size: 14px;
  color: #BDC3C7;
}

/* Photo Preview */
.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 13px;
}

.photo-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.photo-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.photo-action-btn:hover {
  transform: scale(1.1);
}

/* Camera Buttons */
.camera-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.camera-button {
  padding: 16px;
  background: white;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #2C3E50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.camera-button:hover {
  border-color: #FF6B6B;
  background: #FFFBF5;
}

.camera-button-icon {
  font-size: 32px;
}

/* Submit Photo Button */
.submit-photo-button {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%);
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 16px;
}

.submit-photo-button:disabled {
  background: #E0E0E0;
  color: #BDC3C7;
  box-shadow: none;
  cursor: not-allowed;
}

.submit-photo-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 107, 107, 0.4);
}
</style>
</head>
<body>

<div class="step-screen">
  <!-- Progress Header -->
  <header class="progress-header">
    <div class="progress-bar-container">
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width: 66%;"></div>
      </div>
      <span class="progress-text">4 of 6</span>
    </div>
    
    <div class="step-info-row">
      <span class="step-number-badge" style="background: linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%);">
        <span>📷</span>
        <span>Step 4</span>
      </span>
      <span class="step-type-badge">Photo Challenge</span>
    </div>
  </header>

  <!-- Main Content -->
  <main class="step-content">
    <!-- Step Title -->
    <div class="step-title-card">
      <div class="step-icon">📸</div>
      <h1 class="step-title">Capture the Moment</h1>
      <p class="step-subtitle">Take a creative photo at this location</p>
    </div>

    <!-- Photo Challenge -->
    <div class="photo-upload-card">
      <p class="upload-instructions">
        Take a selfie with the fountain in the background. 
        Get creative and have fun with it!
      </p>

      <!-- Upload Area (empty state) -->
      <div class="photo-upload-area">
        <div class="upload-icon">📷</div>
        <div class="upload-text">Tap to add photo</div>
        <div class="upload-hint">or choose from options below</div>
      </div>

      <!-- Upload Area (with photo) - Alternative state -->
      <!-- <div class="photo-upload-area has-photo">
        <img src="photo.jpg" alt="Uploaded photo" class="photo-preview">
        <div class="photo-actions">
          <button class="photo-action-btn">🔄</button>
          <button class="photo-action-btn">🗑️</button>
        </div>
      </div> -->

      <!-- Camera Options -->
      <div class="camera-options">
        <button class="camera-button">
          <span class="camera-button-icon">📸</span>
          <span>Take Photo</span>
        </button>
        <button class="camera-button">
          <span class="camera-button-icon">🖼️</span>
          <span>Choose from Gallery</span>
        </button>
      </div>

      <!-- Submit Button -->
      <button class="submit-photo-button" disabled>
        Continue
      </button>
    </div>
  </main>
</div>

</body>
</html>
```

---

### 5. Completion Screen

```html
<!DOCTYPE html>
<html>
<head>
<style>
.completion-screen {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFBF5 0%, #FFF8EF 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* Confetti Animation */
.confetti {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #FF6B6B;
  top: -10px;
  opacity: 0;
  animation: confetti-fall 3s ease-in infinite;
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

/* Completion Card */
.completion-card {
  background: white;
  border-radius: 32px;
  padding: 48px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.completion-icon {
  font-size: 96px;
  margin-bottom: 24px;
  animation: trophy-bounce 1s ease-in-out;
}

@keyframes trophy-bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(-5deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(5deg); }
}

.completion-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px 0;
}

.completion-subtitle {
  font-size: 18px;
  color: #7F8C8D;
  margin: 0 0 32px 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-item {
  background: #FFFBF5;
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2C3E50;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 12px;
  color: #7F8C8D;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Achievement Badge */
.achievement-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6BCF7F 0%, #4ECDC4 100%);
  border-radius: 100px;
  margin-bottom: 32px;
}

.badge-icon {
  font-size: 24px;
}

.badge-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.primary-action-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%);
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.primary-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 107, 107, 0.4);
}

.secondary-action-btn {
  width: 100%;
  padding: 18px;
  background: white;
  border: 2px solid #E0E0E0;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #2C3E50;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-action-btn:hover {
  border-color: #FF6B6B;
  background: #FFFBF5;
}

/* Social Share */
.share-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E0E0E0;
}

.share-title {
  font-size: 14px;
  font-weight: 600;
  color: #7F8C8D;
  margin: 0 0 16px 0;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.share-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #E0E0E0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-btn:hover {
  transform: scale(1.1);
  border-color: #FF6B6B;
}
</style>
</head>
<body>

<div class="completion-screen">
  <!-- Confetti Animation -->
  <div class="confetti">
    <!-- Multiple confetti pieces with different delays -->
    <div class="confetti-piece" style="left: 10%; animation-delay: 0s; background: #FF6B6B;"></div>
    <div class="confetti-piece" style="left: 20%; animation-delay: 0.5s; background: #FFB347;"></div>
    <div class="confetti-piece" style="left: 30%; animation-delay: 1s; background: #6BCF7F;"></div>
    <div class="confetti-piece" style="left: 40%; animation-delay: 0.3s; background: #5DADE2;"></div>
    <div class="confetti-piece" style="left: 50%; animation-delay: 0.7s; background: #9B59B6;"></div>
    <div class="confetti-piece" style="left: 60%; animation-delay: 0.2s; background: #FF6B6B;"></div>
    <div class="confetti-piece" style="left: 70%; animation-delay: 0.9s; background: #FFB347;"></div>
    <div class="confetti-piece" style="left: 80%; animation-delay: 0.4s; background: #6BCF7F;"></div>
    <div class="confetti-piece" style="left: 90%; animation-delay: 0.6s; background: #5DADE2;"></div>
  </div>

  <!-- Completion Card -->
  <div class="completion-card">
    <div class="completion-icon">🏆</div>
    
    <h1 class="completion-title">Hunt Completed!</h1>
    <p class="completion-subtitle">
      Congratulations! You've successfully completed the City Explorer Hunt.
    </p>

    <!-- Achievement Badge -->
    <div class="achievement-badge">
      <span class="badge-icon">⭐</span>
      <span class="badge-text">Urban Explorer</span>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-icon">📍</div>
        <p class="stat-value">6</p>
        <p class="stat-label">Steps</p>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon">⏱️</div>
        <p class="stat-value">42</p>
        <p class="stat-label">Minutes</p>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon">🏃</div>
        <p class="stat-value">2.8</p>
        <p class="stat-label">km</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="action-buttons">
      <button class="primary-action-btn">
        View My Photos
      </button>
      <button class="secondary-action-btn">
        Try Another Hunt
      </button>
    </div>

    <!-- Social Share -->
    <div class="share-section">
      <p class="share-title">Share your achievement</p>
      <div class="share-buttons">
        <button class="share-btn">📱</button>
        <button class="share-btn">🐦</button>
        <button class="share-btn">📘</button>
      </div>
    </div>
  </div>
</div>

</body>
</html>
```

---

## 🎨 Component Patterns for React + MUI

### Theme Override Configuration

```javascript
// theme.js - Material-UI Theme Overrides
import { createTheme } from '@mui/material/styles';

const hunthubTheme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B',
      light: '#FFB347',
      dark: '#E85555',
    },
    secondary: {
      main: '#6BCF7F',
      light: '#4ECDC4',
    },
    background: {
      default: '#FFFBF5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
      fontWeight: 700,
      fontSize: '2rem',
    },
    h2: {
      fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0, 0, 0, 0.08)',
    '0 4px 16px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
    // ... customize all shadow levels
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '14px 24px',
          fontSize: '1rem',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #E85555 0%, #FFB347 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 100,
          backgroundColor: '#F0F0F0',
        },
        bar: {
          borderRadius: 100,
          background: 'linear-gradient(90deg, #6BCF7F 0%, #4ECDC4 100%)',
        },
      },
    },
  },
});

export default hunthubTheme;
```

### Styled Components Examples

```javascript
// StyledComponents.js
import styled from 'styled-components';
import { Box, Button, Card } from '@mui/material';

export const GradientButton = styled(Button)`
  background: linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%);
  border-radius: 16px;
  padding: 18px 24px;
  font-weight: 600;
  color: white;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: linear-gradient(135deg, #E85555 0%, #FFB347 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(255, 107, 107, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #E0E0E0;
    color: #BDC3C7;
    box-shadow: none;
  }
`;

export const StepCard = styled(Card)`
  border-radius: 20px;
  padding: 24px;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

export const ProgressContainer = styled(Box)`
  background: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const StepIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  animation: bounce 2s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

export const ClueCard = styled(Box)`
  background: linear-gradient(135deg, #FFF8EF 0%, #FFFBF5 100%);
  border: 2px solid #FFE5CC;
  border-radius: 20px;
  padding: 20px;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.background || '#FFF8EF'};
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.color || '#2C3E50'};
`;
```

---

## 🎭 Animation Library

### Key Animations to Implement

```javascript
// animations.js
export const animations = {
  // Entrance animations
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Success animations
  successPulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, ease: 'easeInOut' }
  },

  // Error animations
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5, ease: 'easeInOut' }
  },

  // Progress animations
  progressFill: {
    initial: { width: '0%' },
    animate: { width: '100%' },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },

  // Floating elements
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },

  // Button press
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};
```

---

## 📱 Mobile Interactions

### Gestures & Haptics

```javascript
// interactions.js

// Haptic feedback (for supported devices)
export const triggerHaptic = (type = 'medium') => {
  if (navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [20, 100, 20]
    };
    navigator.vibrate(patterns[type] || patterns.medium);
  }
};

// Swipe detection
export const useSwipeDetection = (onSwipe) => {
  let touchStartX = 0;
  let touchStartY = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      onSwipe(deltaX > 0 ? 'right' : 'left');
    }
    // Vertical swipe
    else if (Math.abs(deltaY) > 50) {
      onSwipe(deltaY > 0 ? 'down' : 'up');
    }
  };

  return { handleTouchStart, handleTouchEnd };
};

// Pull to refresh
export const usePullToRefresh = (onRefresh) => {
  // Implementation for pull-to-refresh gesture
};
```

---

## 🎯 Component Usage Examples

### Example 1: Step Component

```jsx
// StepView.jsx
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { GradientButton, StepCard, ClueCard, Badge } from './StyledComponents';
import { animations, triggerHaptic } from './interactions';

const StepView = ({ step, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    triggerHaptic('success');
    setIsCompleted(true);
    setTimeout(() => onComplete(), 1000);
  };

  return (
    <motion.div {...animations.fadeInUp}>
      <Box sx={{ p: 3 }}>
        {/* Step Title */}
        <StepCard>
          <motion.div {...animations.float}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h1" sx={{ fontSize: '48px', mb: 1 }}>
                {step.icon}
              </Typography>
              <Typography variant="h1">{step.title}</Typography>
              <Typography variant="body1" color="text.secondary">
                {step.subtitle}
              </Typography>
            </Box>
          </motion.div>
        </StepCard>

        {/* Clue */}
        <ClueCard sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <span>💡</span>
            <Typography variant="subtitle2" color="primary" fontWeight={600}>
              Your Clue
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            {step.clue}
          </Typography>
        </ClueCard>

        {/* Action Button */}
        <GradientButton
          fullWidth
          onClick={handleComplete}
          disabled={isCompleted}
          sx={{ mt: 3 }}
        >
          {isCompleted ? '✓ Completed!' : 'Check Location'}
        </GradientButton>
      </Box>
    </motion.div>
  );
};

export default StepView;
```

---

## 🎨 Final Polish Checklist

- [ ] **Smooth 60fps animations** on all interactions
- [ ] **Haptic feedback** on button presses (mobile)
- [ ] **Loading states** with skeleton screens
- [ ] **Error states** with helpful messages and retry options
- [ ] **Empty states** with encouraging CTAs
- [ ] **Success celebrations** with confetti and animations
- [ ] **Dark mode support** (optional, but nice)
- [ ] **Offline indicators** and graceful degradation
- [ ] **Pull-to-refresh** on list views
- [ ] **Swipe gestures** where appropriate
- [ ] **Safe area handling** for notched devices
- [ ] **Accessibility** (ARIA labels, focus management)

---

## 🚀 Implementation Priority

### Phase 1: Core Experience
1. Hunt Start Screen
2. Basic Step View (Location)
3. Progress Header
4. Simple Completion Screen

### Phase 2: Challenge Types
5. Quiz Challenge
6. Photo Challenge
7. Task Challenge

### Phase 3: Polish
8. Animations & Transitions
9. Haptic Feedback
10. Error & Loading States
11. Celebration Effects

---

This design system gives you a **premium, playful, mobile-first** player experience that feels nothing like a school project. The key is in the details: smooth animations, thoughtful micro-interactions, and a warm, inviting color palette that makes the treasure hunt feel like an adventure, not a chore.

Ready to implement? 🚀
