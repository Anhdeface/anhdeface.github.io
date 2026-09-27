/**
 * anhdeface Portfolio - Corporate Memphis & Semi-Flat 2.0
 * Language: English (US)
 * Typography: Fredoka + Nunito
 * Icons: Pure SVG Vector System (No Default OS Emojis)
 */

const GITHUB_USERNAME = 'Anhdeface';
const CACHE_KEY_USER = 'anhdeface_github_user_v3';
const CACHE_KEY_REPOS = 'anhdeface_github_repos_v3';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Fallback Repositories with natural English descriptions
const FALLBACK_REPOS = [
    {
        name: 'fdebug',
        description: 'Advanced anti-debug detection and evasion library engineered in Rust.',
        html_url: 'https://github.com/Anhdeface/fdebug',
        language: 'Rust',
        stargazers_count: 2,
        forks_count: 0
    },
    {
        name: 'rvs',
        description: 'Reverse engineering analysis, inspection, and low-level binary triage toolkit.',
        html_url: 'https://github.com/Anhdeface/rvs',
        language: 'Rust',
        stargazers_count: 1,
        forks_count: 0
    },
    {
        name: 'byfu',
        description: 'LMS system research module with automated client-side interaction utilities.',
        html_url: 'https://github.com/Anhdeface/byfu',
        language: 'JavaScript',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'arlogkn',
        description: 'Read-only Linux diagnostic utility for parsing system logs and auditing hardware.',
        html_url: 'https://github.com/Anhdeface/arlogkn',
        language: 'Shell',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'xokj',
        description: 'Modular TypeScript developer toolchain and developer automation scripts.',
        html_url: 'https://github.com/Anhdeface/xokj',
        language: 'TypeScript',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'rifas',
        description: 'Low-latency systems communication and high-performance network primitives in Go.',
        html_url: 'https://github.com/Anhdeface/rifas',
        language: 'Go',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'jimsu',
        description: 'Lightweight web audio streamer built with Express, EJS templating, and Vue.',
        html_url: 'https://github.com/Anhdeface/jimsu',
        language: 'Vue',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'Cnotifi',
        description: 'Custom Android system notification service and lightweight background daemon.',
        html_url: 'https://github.com/Anhdeface/Cnotifi',
        language: 'Kotlin',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'nixos',
        description: 'Declarative personal NixOS system flake configuration with custom profiles.',
        html_url: 'https://github.com/Anhdeface/nixos',
        language: 'Nix',
        stargazers_count: 0,
        forks_count: 0
    }
];

let allLoadedRepos = [];
let currentFilter = 'all';

// --- LocalStorage Cache Helpers ---
function getCache(key) {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        const item = JSON.parse(itemStr);
        if (Date.now() - item.timestamp > CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return item.data;
    } catch (e) {
        return null;
    }
}

function setCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('LocalStorage save failed:', e);
    }
}

// --- Fetch GitHub Data ---
async function initGitHubData() {
    // 1. Instant UI rendering via cached data or fallbacks
    const cachedUser = getCache(CACHE_KEY_USER);
    const cachedRepos = getCache(CACHE_KEY_REPOS);

    if (cachedUser) {
        renderUserData(cachedUser);
    }
    if (cachedRepos && Array.isArray(cachedRepos) && cachedRepos.length > 0) {
        allLoadedRepos = cachedRepos;
        renderRepos(cachedRepos);
        calculateStars(cachedRepos);
    } else {
        allLoadedRepos = FALLBACK_REPOS;
        renderRepos(FALLBACK_REPOS);
        calculateStars(FALLBACK_REPOS);
    }

    // 2. Fetch fresh real-time data in the background
    try {
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`)
        ]);

        if (userRes.ok) {
            const userData = await userRes.json();
            setCache(CACHE_KEY_USER, userData);
            renderUserData(userData);
        }

        if (reposRes.ok) {
            const reposData = await reposRes.json();
            if (Array.isArray(reposData) && reposData.length > 0) {
                setCache(CACHE_KEY_REPOS, reposData);
                allLoadedRepos = reposData;
                renderRepos(filterReposList(allLoadedRepos, currentFilter));
                calculateStars(allLoadedRepos);
            }
        }
    } catch (err) {
        console.info('GitHub API fetch failed or rate-limited; cached/fallback state retained.', err);
    }
}

// Render User Info & Stats
function renderUserData(user) {
    if (!user) return;
    
    const statRepos = document.getElementById('stat-repos');
    const statFollowers = document.getElementById('stat-followers');
    const statFollowing = document.getElementById('stat-following');
    const heroAvatar = document.getElementById('hero-avatar');
    const navAvatar = document.getElementById('nav-avatar');
    const profileName = document.getElementById('profile-name');

    if (statRepos && user.public_repos !== undefined) statRepos.textContent = user.public_repos;
    if (statFollowers && user.followers !== undefined) statFollowers.textContent = user.followers;
    if (statFollowing && user.following !== undefined) statFollowing.textContent = user.following;

    if (user.avatar_url) {
        if (heroAvatar) heroAvatar.src = user.avatar_url;
        if (navAvatar) navAvatar.src = user.avatar_url;
    }

    if (profileName && user.name) {
        profileName.textContent = user.name;
    }
}

// Compute total stars
function calculateStars(repos) {
    const statStars = document.getElementById('stat-stars');
    if (!statStars || !repos) return;

    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    statStars.textContent = totalStars;
}

// Filter repo list
function filterReposList(repos, filter) {
    if (filter === 'all') return repos;
    if (filter === 'rust') {
        return repos.filter(r => (r.language || '').toLowerCase() === 'rust');
    }
    if (filter === 'go') {
        return repos.filter(r => (r.language || '').toLowerCase() === 'go');
    }
    if (filter === 'typescript') {
        return repos.filter(r => {
            const lang = (r.language || '').toLowerCase();
            return lang === 'typescript' || lang === 'javascript';
        });
    }
    if (filter === 'other') {
        return repos.filter(r => {
            const lang = (r.language || '').toLowerCase();
            return !['rust', 'go', 'typescript', 'javascript'].includes(lang);
        });
    }
    return repos;
}

// SVG Vector Language Badge (Consistent across all devices)
function getLanguageBadge(language) {
    if (!language) return '';
    const lang = language.toLowerCase();

    // Standard vector icons for languages
    const icons = {
        rust: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        go: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        typescript: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
        javascript: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M16 8v8"/><path d="M8 12a4 4 0 0 0 4 4"/></svg>`,
        vue: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="2 3 12 21 22 3"/><polyline points="7 3 12 12 17 3"/></svg>`,
        kotlin: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
        shell: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
        nix: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>`,
        c: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
        'c++': `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`
    };

    const styles = {
        rust: { bg: 'var(--accent-coral-soft)', color: 'var(--accent-coral)' },
        go: { bg: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)' },
        typescript: { bg: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' },
        javascript: { bg: 'var(--accent-yellow-soft)', color: '#996800' },
        vue: { bg: 'var(--accent-green-soft)', color: 'var(--accent-green)' },
        kotlin: { bg: 'var(--accent-purple-soft)', color: 'var(--accent-purple)' },
        shell: { bg: 'var(--accent-yellow-soft)', color: '#8c6000' },
        nix: { bg: 'var(--accent-cyan-soft)', color: '#007799' },
        c: { bg: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' },
        'c++': { bg: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' }
    };

    const conf = styles[lang] || { bg: 'var(--bg-surface-soft)', color: 'var(--text-secondary)' };
    const iconSvg = icons[lang] || `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>`;

    return `
        <span class="repo-lang-badge" style="background: ${conf.bg}; color: ${conf.color};">
            ${iconSvg}
            <span>${escapeHtml(language)}</span>
        </span>
    `;
}

// Render Repositories in Grid
function renderRepos(repos) {
    const container = document.getElementById('repos-container');
    if (!container) return;

    if (!repos || repos.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 2.5px dashed var(--border-subtle);">
                <p style="font-family: var(--font-display); font-size: 1.3rem; color: var(--text-secondary);">
                    No repositories found in this category.
                </p>
            </div>
        `;
        return;
    }

    const items = repos.slice(0, 9);
    const html = items.map(repo => {
        const langBadge = getLanguageBadge(repo.language);
        const description = repo.description || 'Open-source systems project exploring modern software architecture.';
        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;

        return `
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-card" aria-label="View repository ${escapeHtml(repo.name)}">
                <div>
                    <div class="repo-card-top">
                        ${langBadge}
                        <svg class="repo-external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M7 17L17 7"></path>
                            <path d="M7 7h10v10"></path>
                        </svg>
                    </div>
                    <h3 class="repo-title">${escapeHtml(repo.name)}</h3>
                    <p class="repo-description">${escapeHtml(description)}</p>
                </div>
                <div class="repo-footer">
                    <div class="repo-stats-group">
                        <span class="repo-stat-item" title="Stars count">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            ${stars}
                        </span>
                        <span class="repo-stat-item" title="Forks count">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9v6"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                            ${forks}
                        </span>
                    </div>
                    <span class="repo-cta-text">
                        <span>Inspect Code</span>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                </div>
            </a>
        `;
    }).join('');

    container.innerHTML = html;
}

// Escape HTML utility
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup Repository Filter Buttons
function setupRepoFilters() {
    const filterButtons = document.querySelectorAll('.filter-pill');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.dataset.filter || 'all';
            currentFilter = filterValue;
            const filtered = filterReposList(allLoadedRepos, filterValue);
            renderRepos(filtered);
        });
    });
}


// --- Copy Discord/Username button ---
function setupCopyHandle() {
    const copyBtn = document.getElementById('copy-handle-btn');
    const copyText = document.getElementById('copy-btn-text');

    if (copyBtn && copyText) {
        copyBtn.addEventListener('click', async () => {
            const handle = 'anhdeface';
            try {
                await navigator.clipboard.writeText(handle);
                copyText.textContent = 'Copied: anhdeface!';
                copyBtn.style.borderColor = 'var(--accent-green)';
                copyBtn.style.background = 'var(--accent-green-soft)';

                setTimeout(() => {
                    copyText.textContent = 'Copy Handle';
                    copyBtn.style.borderColor = '';
                    copyBtn.style.background = '';
                }, 2200);
            } catch (err) {
                copyText.textContent = 'Handle: anhdeface';
            }
        });
    }
}

// --- Memphis Confetti Particle Canvas ---
let confettiParticles = [];
let confettiAnimationId = null;

function setupConfettiCanvas() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const avatarTarget = document.getElementById('avatar-click-target');

    if (avatarTarget) {
        avatarTarget.addEventListener('click', () => {
            const rect = avatarTarget.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            burstConfetti(x, y, 36);
        });
    }
}

function burstConfetti(originX, originY, count = 30) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const colors = ['#FF6B6B', '#FFD166', '#06D6A0', '#4D96FF', '#9D4EDD', '#FF8E3C'];
    const shapes = ['circle', 'pill', 'square', 'star'];

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 8;
        confettiParticles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            size: 6 + Math.random() * 8,
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 12,
            gravity: 0.22,
            life: 1,
            decay: 0.015 + Math.random() * 0.015
        });
    }

    if (!confettiAnimationId) {
        animateConfetti();
    }
}

function animateConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.life -= p.decay;

        if (p.life <= 0) {
            confettiParticles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.shape === 'pill') {
            ctx.beginPath();
            ctx.roundRect(-p.size, -p.size / 2.5, p.size * 2, p.size * 0.8, 6);
            ctx.fill();
        } else if (p.shape === 'square') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === 'star') {
            ctx.beginPath();
            const s = p.size;
            ctx.moveTo(0, -s);
            ctx.quadraticCurveTo(0, 0, s, 0);
            ctx.quadraticCurveTo(0, 0, 0, s);
            ctx.quadraticCurveTo(0, 0, -s, 0);
            ctx.quadraticCurveTo(0, 0, 0, -s);
            ctx.fill();
        }

        ctx.restore();
    }

    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimationId = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// --- DOM Ready Lifecycle ---
document.addEventListener('DOMContentLoaded', () => {
    setupRepoFilters();
    setupCopyHandle();
    setupConfettiCanvas();
    initGitHubData();
});
