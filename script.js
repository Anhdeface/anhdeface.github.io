// GitHub API - Fetch Recent Repositories
const GITHUB_USERNAME = 'anhdeface';
const CORS_PROXY = 'https://corsproxy.io/?';
const CACHE_KEY_REPOS = 'github_repos_cache';
const CACHE_KEY_USER = 'github_user_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache utility functions
function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
    }
    
    return data;
}

function setCachedData(key, data) {
    const cacheData = {
        data: data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

// Fetch user data and repositories - with intentional delay
async function fetchGitHubData() {
    // Try to load from cache first
    const cachedRepos = getCachedData(CACHE_KEY_REPOS);
    const cachedUser = getCachedData(CACHE_KEY_USER);
    
    if (cachedRepos && cachedUser) {
        // Delay reveal for discovery effect (psychological pacing)
        setTimeout(() => {
            displayRepositories(cachedRepos);
            updateStats(cachedUser);
        }, 800 + Math.random() * 400);
        
        // Still fetch fresh data in background
        fetchGitHubDataAsync();
        return;
    }
    
    // If no cache, fetch with delay
    setTimeout(() => {
        fetchGitHubDataAsync();
    }, Math.random() * 600);
}

async function fetchGitHubDataAsync() {
    try {
        const apiUrl = `https://api.github.com/users/${GITHUB_USERNAME}`;
        const reposUrl = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&order=desc&per_page=6`;
        
        // Try direct fetch first, then fallback to CORS proxy
        let userResponse = await fetch(apiUrl);
        
        // If CORS error or rate limit, try with proxy
        if (!userResponse.ok) {
            userResponse = await fetch(CORS_PROXY + apiUrl);
        }
        
        if (!userResponse.ok) {
            throw new Error(`User API failed: ${userResponse.status}`);
        }
        
        const userData = await userResponse.json();
        setCachedData(CACHE_KEY_USER, userData);
        updateStats(userData);

        // Fetch repositories
        let reposResponse = await fetch(reposUrl);
        
        if (!reposResponse.ok) {
            reposResponse = await fetch(CORS_PROXY + reposUrl);
        }
        
        if (!reposResponse.ok) {
            throw new Error(`Repos API failed: ${reposResponse.status}`);
        }
        
        const repos = await reposResponse.json();

        if (Array.isArray(repos)) {
            setCachedData(CACHE_KEY_REPOS, repos);
            displayRepositories(repos);
        } else {
            throw new Error('Invalid repos data');
        }
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        // If API fails and no cache, show fallback
        const cachedRepos = getCachedData(CACHE_KEY_REPOS);
        if (!cachedRepos) {
            displayRepositories(getDefaultRepos());
        }
    }
}

// Update stats - with one broken stat and temporal glitches
function updateStats(userData) {
    if (!userData) return;
    
    document.getElementById('repo-count').textContent = userData.public_repos || 0;
    document.getElementById('public-repos').textContent = userData.public_repos || 0;
    
    // Anomaly: followers count stays broken/dim
    const followersEl = document.getElementById('followers-count');
    followersEl.textContent = '—';
    followersEl.classList.add('stat-broken');
}

// Fallback data in case API fails
function getDefaultRepos() {
    return [
        {
            name: 'portfolio',
            description: 'Personal portfolio website',
            html_url: `https://github.com/${GITHUB_USERNAME}`,
            language: 'HTML',
            stargazers_count: 0,
            forks_count: 0
        }
    ];
}

// Display repositories in the grid - with staggered reveal
function displayRepositories(repos) {
    const container = document.getElementById('repos-container');
    
    if (!repos || !repos.length) {
        container.innerHTML = '<div class="loading"><span class="loading-text">—</span></div>';
        return;
    }

    // Filter out forked repos
    const filteredRepos = repos.filter(repo => !repo.fork || repo.stargazers_count > 0);
    
    if (!filteredRepos.length) {
        container.innerHTML = '<div class="loading"><span class="loading-text">—</span></div>';
        return;
    }

    // Build repos with staggered timing and responsive grid
    const reposHtml = filteredRepos.slice(0, 6).map((repo, idx) => {
        // Anomaly: make one repo card not hover
        const isAnomaly = idx === 2;
        return `
        <a href="${repo.html_url}" target="_blank" class="repo-card ${isAnomaly ? 'delayed' : ''}" style="--delay: ${idx * 0.15}s;" ${isAnomaly ? 'data-anomaly="true"' : ''}>
            <div class="repo-content">
                <div class="repo-name">${escapeHtml(repo.name)}</div>
                <div class="repo-description">${escapeHtml(repo.description || '(no description)')}</div>
            </div>
            <div class="repo-meta">
                <div class="repo-stats">
                    ${repo.language ? `<span class="repo-language">${escapeHtml(repo.language)}</span>` : ''}
                    <span class="repo-stat">
                        ⭐ <span>${repo.stargazers_count || 0}</span>
                    </span>
                    <span class="repo-stat">
                        🔄 <span>${repo.forks_count || 0}</span>
                    </span>
                </div>
            </div>
        </a>
    `;
    }).join('');

    container.innerHTML = reposHtml;
    
    // Trigger reveal animation
    setTimeout(() => {
        document.querySelectorAll('.repo-card').forEach(card => {
            card.classList.add('visible');
        });
    }, 50);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add random flickering effect to random elements (subtle)
function addRandomFlicker() {
    setInterval(() => {
        // Occasionally make text subtly dim
        if (Math.random() > 0.95) {
            const elements = document.querySelectorAll('.repo-card, .stat-card');
            const randomElement = elements[Math.floor(Math.random() * elements.length)];
            
            if (randomElement) {
                randomElement.style.opacity = '0.7';
                setTimeout(() => {
                    randomElement.style.opacity = '1';
                }, 150 + Math.random() * 100);
            }
        }
    }, 1000 + Math.random() * 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubData();
    addRandomFlicker();
    revealHiddenSections();
    trackCursorMovement();
    setupTemporalEffects();
    setupSecretContent();
    setupAutonomousBehavior();
    setupTabTitleChange();
    setupTextGlitchEffect();
    setupOtherViewerPresence();
    setupScrollGlitch();
    setupAutonomousChanges();
    setupRhythmDisruption();
    setupControlLoss();
    setupFogEffects();
    
    // Refresh data every 10 minutes (if user is active)
    setInterval(fetchGitHubDataAsync, 10 * 60 * 1000);
});

// Reveal hidden sections on scroll (discovery mechanism)
function revealHiddenSections() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.hidden-section').forEach(section => {
        observer.observe(section);
    });
}

// Subtle cursor tracking - with delay (feels unresponsive)
function trackCursorMovement() {
    let mouseX = 0;
    let mouseY = 0;
    let avatarX = 0;
    let avatarY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });
    
    // Avatar moves with delay - not in sync
    setInterval(() => {
        const avatar = document.getElementById('avatar');
        if (avatar) {
            const rect = avatar.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Target position
            const targetX = (mouseX - centerX) * 0.015;
            const targetY = (mouseY - centerY) * 0.015;
            
            // Lerp with delay - creates lag feeling
            avatarX += (targetX - avatarX) * 0.08;
            avatarY += (targetY - avatarY) * 0.08;
            
            avatar.style.transform = `translate(${avatarX}px, ${avatarY}px)`;
        }
    }, 50);
}

// Temporal effects: content changes over time (simulates aging)
function setupTemporalEffects() {
    const bioLine1 = document.getElementById('bio-line-1');
    const bioLine2 = document.getElementById('bio-line-2');
    const bioLine3 = document.getElementById('bio-line-3');
    
    let timeSpent = 0;
    const interval = setInterval(() => {
        timeSpent += 1;
        
        // After 90 seconds, change text subtly
        if (timeSpent === 90 && bioLine2) {
            bioLine2.textContent = 'in code. in silence.';
            bioLine2.style.color = '#6b6158';
        }
        
        // After 180 seconds, change again
        if (timeSpent === 180 && bioLine3) {
            bioLine3.textContent = 'forgotten. archived. observing.';
        }
        
        // After 270 seconds, change bio hint
        if (timeSpent === 270 && bioLine1) {
            bioLine1.style.opacity = '0.7';
        }
    }, 1000);
}

// Secret content - only reveal on scroll past threshold
function setupSecretContent() {
    const secretSection = document.getElementById('secret');
    const pointOfNoReturn = document.getElementById('point-of-no-return');
    let hasBeenRevealed = false;
    
    // Track if user crossed point of no return
    let crossedNoReturn = localStorage.getItem('crossed-no-return') === 'true';
    
    // If already crossed, immediately corrupt page
    if (crossedNoReturn) {
        document.body.classList.add('corrupted');
        // Hide the button
        if (pointOfNoReturn) pointOfNoReturn.classList.add('activated');
    }
    
    document.addEventListener('scroll', () => {
        if (hasBeenRevealed) return;
        
        const rect = secretSection.getBoundingClientRect();
        // Only reveal if user scrolls VERY far down
        if (rect.top < window.innerHeight * 0.8) {
            hasBeenRevealed = true;
            secretSection.classList.add('visible');
        }
    }, { passive: true });
    
    // Point of no return button
    if (pointOfNoReturn) {
        pointOfNoReturn.addEventListener('click', () => {
            // Permanent change - corrupts page state
            crossedNoReturn = true;
            localStorage.setItem('crossed-no-return', 'true');
            
            // Immediate corruption
            document.body.classList.add('corrupted');
            
            // Change secret text
            const secretText = document.getElementById('secret-text');
            if (secretText) {
                secretText.textContent = 'you were always going to click it.';
            }
            
            // Hide button with fade
            pointOfNoReturn.classList.add('activated');
            
            // Add watching effect
            setupAutonomousBehavior();
        });
    }
}

// Tab title change effect - follows user after they leave
function setupTabTitleChange() {
    const originalTitle = document.title;
    let hasChanged = false;
    let tabVisible = true;
    
    // Track tab visibility
    document.addEventListener('visibilitychange', () => {
        tabVisible = !document.hidden;
        
        if (tabVisible && hasChanged) {
            // User came back - restore original title
            document.title = originalTitle;
            hasChanged = false;
        }
    });
    
    // Change title after 12 seconds if tab is not visible
    setTimeout(() => {
        if (!tabVisible && !hasChanged) {
            document.title = 'still here';
            hasChanged = true;
        }
    }, 12000);
}

// Text glitch effect - makes user doubt what they read
function setupTextGlitchEffect() {
    const bioLine1 = document.getElementById('bio-line-1');
    const bioLine2 = document.getElementById('bio-line-2');
    const bioLine3 = document.getElementById('bio-line-3');
    
    let lastScrollPosition = 0;
    let textChangeCount = 0;
    
    // Track scroll position changes
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const scrollDirection = currentScroll > lastScrollPosition ? 'down' : 'up';
        
        // Only change text when scrolling up (returning to sections)
        if (scrollDirection === 'up' && Math.random() > 0.7 && textChangeCount < 3) {
            if (bioLine2 && Math.random() > 0.5) {
                const originalText = bioLine2.textContent;
                const alternatives = ['& the spaces between', 'in code. in silence.', 'between the lines', ''];
                const newText = alternatives[Math.floor(Math.random() * alternatives.length)];
                
                if (newText !== originalText) {
                    bioLine2.textContent = newText;
                    textChangeCount++;
                    
                    // Subtle color change to indicate something changed
                    bioLine2.style.color = '#6b6158';
                    setTimeout(() => {
                        bioLine2.style.color = '#a89f94';
                    }, 2000);
                }
            }
        }
        
        lastScrollPosition = currentScroll;
    }, { passive: true });
    
    // Change text when user stays idle for too long
    let idleTime = 0;
    let lastActivity = Date.now();
    
    ['mousemove', 'click', 'scroll'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
            idleTime = 0;
        }, { passive: true });
    });
    
    setInterval(() => {
        idleTime = Date.now() - lastActivity;
        
        // After 15 seconds of inactivity, subtly change text
        if (idleTime > 15000 && bioLine3 && Math.random() > 0.8 && textChangeCount < 2) {
            const originalText = bioLine3.textContent;
            const alternatives = ['unfinished. intentional. observing.', 'forgotten. archived. observing.', 'watching. waiting.'];
            const newText = alternatives[Math.floor(Math.random() * alternatives.length)];
            
            if (newText !== originalText) {
                bioLine3.textContent = newText;
                textChangeCount++;
            }
        }
    }, 5000);
}

// Other viewer presence effect
function setupOtherViewerPresence() {
    const otherViewer = document.getElementById('other-viewer');
    if (!otherViewer) return;
    
    // Randomly show/hide the "someone else was here" text
    setInterval(() => {
        if (Math.random() > 0.6) {
            otherViewer.style.opacity = '0.4';
            otherViewer.style.transition = 'opacity 2s ease';
        } else {
            otherViewer.style.opacity = '0';
        }
    }, 8000 + Math.random() * 4000);
    
    // Occasionally change the text
    setInterval(() => {
        const alternatives = ['(someone else was here)', '(they watched too)', '(still watching)', ''];
        const newText = alternatives[Math.floor(Math.random() * alternatives.length)];
        
        if (newText) {
            otherViewer.textContent = newText;
            otherViewer.style.opacity = '0.3';
        }
    }, 20000 + Math.random() * 10000);
}

// Scroll glitch - moment where scroll suddenly slows down
function setupScrollGlitch() {
    let hasTriggered = false;
    let scrollCount = 0;
    
    window.addEventListener('scroll', () => {
        scrollCount++;
        
        // Trigger on 7th scroll, only once
        if (scrollCount === 7 && !hasTriggered) {
            hasTriggered = true;
            
            // Temporarily disable smooth scrolling
            document.documentElement.style.scrollBehavior = 'auto';
            document.body.style.scrollBehavior = 'auto';
            
            // Force slow scroll for 1.5 seconds
            const startY = window.pageYOffset;
            const startTime = Date.now();
            const duration = 1500;
            
            function slowScroll() {
                const elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    window.scrollTo(0, startY + (elapsed / duration) * 2);
                    requestAnimationFrame(slowScroll);
                } else {
                    // Restore normal scrolling
                    document.documentElement.style.scrollBehavior = '';
                    document.body.style.scrollBehavior = '';
                }
            }
            
            requestAnimationFrame(slowScroll);
        }
    }, { passive: true });
}

// Autonomous changes - content changes without user interaction
function setupAutonomousChanges() {
    const secretText2 = document.getElementById('secret-text-2');
    if (!secretText2) return;
    
    // Wait 25 seconds, then change text completely
    setTimeout(() => {
        secretText2.textContent = 'they are still here.';
        secretText2.style.opacity = '0.8';
        secretText2.style.color = '#4a3a2a';
    }, 25000);
    
    // Change bio line 1 after 40 seconds
    setTimeout(() => {
        const bioLine1 = document.getElementById('bio-line-1');
        if (bioLine1) {
            bioLine1.textContent = 'obsessed with youu';
            bioLine1.style.color = '#6a5a4a';
        }
    }, 40000);
}

// Rhythm disruption - break the consistent pace
function setupRhythmDisruption() {
    const repos = document.querySelectorAll('.repo-card');
    if (repos.length < 3) return;
    
    // Make 3rd repo card extremely slow
    repos[2].style.transition = 'all 3s ease-in-out';
    
    // Make 5th repo card extremely fast (if exists)
    if (repos[4]) {
        repos[4].style.transition = 'all 0.1s ease';
    }
    
    // Make one stat card completely static
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards[1]) {
        statCards[1].style.transition = 'none';
        statCards[1].style.transform = 'translateY(1px)';
    }
}

// Control loss - make user lose control temporarily
function setupControlLoss() {
    let hasTriggered = false;
    
    document.addEventListener('scroll', () => {
        if (!hasTriggered && window.pageYOffset > 800) {
            hasTriggered = true;
            
            // Make scroll jump up slightly
            setTimeout(() => {
                window.scrollTo(0, window.pageYOffset - 50);
            }, 100);
        }
    }, { passive: true });
    
    // Cursor offset glitch - happens once after 30 seconds
    setTimeout(() => {
        document.body.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'><circle cx=\'12\' cy=\'12\' r=\'2\' fill=\'%238b8680\' opacity=\'0.6\'/></svg>") 12 12, auto';
        
        // Reset after 3 seconds
        setTimeout(() => {
            document.body.style.cursor = '';
        }, 3000);
    }, 30000);
    
    // Make one text uncopyable
    const glitchItem = document.querySelector('.archive-item.glitch .archive-title');
    if (glitchItem) {
        glitchItem.style.userSelect = 'none';
        glitchItem.style.webkitUserSelect = 'none';
        glitchItem.addEventListener('selectstart', (e) => e.preventDefault());
    }
}

// Autonomous behavior - page acts independently
function setupAutonomousBehavior() {
    let hasReachedNoReturn = localStorage.getItem('crossed-no-return') === 'true';
    let idleTime = 0;
    let lastActivityTime = Date.now();
    
    // Track user activity
    document.addEventListener('mousemove', () => {
        lastActivityTime = Date.now();
        idleTime = 0;
    }, { passive: true });
    
    document.addEventListener('click', () => {
        lastActivityTime = Date.now();
        idleTime = 0;
    }, { passive: true });
    
    // Page observes user inactivity
    setInterval(() => {
        const now = Date.now();
        idleTime = now - lastActivityTime;
        
        // After 8 seconds of inactivity
        if (idleTime > 8000) {
            triggerAutonomousEvent();
        }
        
        // If crossed no return, page gets more active
        if (hasReachedNoReturn && idleTime > 15000) {
            triggerHostileEvent();
        }
    }, 1000);
}

function triggerAutonomousEvent() {
    const avatar = document.getElementById('avatar');
    if (!avatar) return;
    
    // Avatar subtly reorients itself even when not hovering
    const rect = avatar.getBoundingClientRect();
    const randomAngle = (Math.random() - 0.5) * 3;
    
    avatar.style.filter = `grayscale(100%) contrast(0.9) rotate(${randomAngle}deg)`;
    
    setTimeout(() => {
        avatar.style.filter = 'grayscale(100%) contrast(0.9) rotate(0deg)';
    }, 300);
}

function triggerHostileEvent() {
    // Page itself reacts - background flickers
    const grain = document.querySelector('.background-grain');
    if (!grain) return;
    
    const originalOpacity = grain.style.opacity;
    grain.style.opacity = '1';
    
    setTimeout(() => {
        grain.style.opacity = originalOpacity;
    }, 200);
    
    // Subtitle changes appear
    const bioLine = document.getElementById('bio-line-1');
    if (bioLine && Math.random() > 0.7) {
        bioLine.style.opacity = '0.5';
        setTimeout(() => {
            bioLine.style.opacity = '1';
        }, 500);
    }
}

// Fog effects - dynamic fog behavior
function setupFogEffects() {
    const fog1 = document.querySelector('.fog-layer-1');
    const fog2 = document.querySelector('.fog-layer-2');
    const fog3 = document.querySelector('.fog-layer-3');
    
    if (!fog1 || !fog2 || !fog3) return;
    
    let scrollIntensity = 0;
    
    // Fog responds to scroll
    window.addEventListener('scroll', () => {
        scrollIntensity = Math.min(window.pageYOffset / 1000, 1);
        
        // Increase fog density as user scrolls down
        fog1.style.opacity = 0.6 + (scrollIntensity * 0.3);
        fog2.style.opacity = 0.4 + (scrollIntensity * 0.2);
        fog3.style.opacity = 0.3 + (scrollIntensity * 0.4);
    }, { passive: true });
    
    // Fog thickens during inactivity
    let idleTime = 0;
    let lastActivity = Date.now();
    
    ['mousemove', 'click', 'scroll'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
            idleTime = 0;
        }, { passive: true });
    });
    
    setInterval(() => {
        idleTime = Date.now() - lastActivity;
        
        // After 20 seconds of inactivity, fog thickens
        if (idleTime > 20000) {
            const thickening = Math.min((idleTime - 20000) / 30000, 0.5);
            fog1.style.opacity = Math.min(0.9, 0.6 + thickening);
            fog2.style.opacity = Math.min(0.7, 0.4 + thickening);
            fog3.style.opacity = Math.min(0.8, 0.3 + thickening);
            
            // Add subtle red tint to fog when very inactive
            if (idleTime > 45000) {
                fog1.style.background = 'radial-gradient(ellipse at center, rgba(23, 13, 13, 0) 0%, rgba(33, 13, 13, 0.4) 50%, rgba(43, 13, 13, 0.8) 100%)';
            }
        } else {
            // Reset fog when user becomes active
            fog1.style.background = '';
        }
    }, 5000);
    
    // Random fog surges
    setInterval(() => {
        if (Math.random() > 0.7) {
            const surge = Math.random() * 0.3;
            fog2.style.opacity = parseFloat(fog2.style.opacity || 0.4) + surge;
            
            setTimeout(() => {
                fog2.style.opacity = parseFloat(fog2.style.opacity || 0.4) - surge;
            }, 3000 + Math.random() * 2000);
        }
    }, 15000 + Math.random() * 10000);
}
