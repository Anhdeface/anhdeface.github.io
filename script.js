var FALLBACK_REPOS = [
    { name: 'fdebug', description: 'Anti-debug detection library in Rust.', html_url: 'https://github.com/Anhdeface/fdebug', language: 'Rust', stargazers_count: 2, forks_count: 0 },
    { name: 'rvs', description: 'Binary triage toolkit.', html_url: 'https://github.com/Anhdeface/rvs', language: 'Rust', stargazers_count: 1, forks_count: 0 },
    { name: 'byfu', description: 'LMS automation module.', html_url: 'https://github.com/Anhdeface/byfu', language: 'JavaScript', stargazers_count: 0, forks_count: 0 },
    { name: 'arlogkn', description: 'Linux log parser.', html_url: 'https://github.com/Anhdeface/arlogkn', language: 'Shell', stargazers_count: 0, forks_count: 0 },
    { name: 'xokj', description: 'TypeScript toolchain.', html_url: 'https://github.com/Anhdeface/xokj', language: 'TypeScript', stargazers_count: 0, forks_count: 0 },
    { name: 'rifas', description: 'Network primitives in Go.', html_url: 'https://github.com/Anhdeface/rifas', language: 'Go', stargazers_count: 0, forks_count: 0 },
    { name: 'jimsu', description: 'Web audio streamer.', html_url: 'https://github.com/Anhdeface/jimsu', language: 'Vue', stargazers_count: 0, forks_count: 0 },
    { name: 'Cnotifi', description: 'Android notification daemon.', html_url: 'https://github.com/Anhdeface/Cnotifi', language: 'Kotlin', stargazers_count: 0, forks_count: 0 },
    { name: 'nixos', description: 'NixOS flake config.', html_url: 'https://github.com/Anhdeface/nixos', language: 'Nix', stargazers_count: 0, forks_count: 0 }
];

var allRepos = FALLBACK_REPOS;
var curFilter = 'all';

function esc(s) { return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

function render(repos) {
    var c = document.getElementById('repos-container');
    if (!c) return;
    if (!repos || !repos.length) { c.innerHTML = '<p><i>Nothing here.</i></p>'; return; }
    var h = '<ul>', i, r;
    for (i = 0; i < repos.length && i < 9; i++) {
        r = repos[i];
        h += '<li><a href="' + r.html_url + '" target="_blank"><b>' + esc(r.name) + '</b></a>';
        if (r.language) h += ' [' + esc(r.language) + ']';
        h += ' - ' + esc(r.description || '') + ' (' + (r.stargazers_count||0) + ' stars)</li>';
    }
    c.innerHTML = h + '</ul>';
}

function doFilter(f) {
    curFilter = f;
    var out = [], i, l;
    for (i = 0; i < allRepos.length; i++) {
        l = (allRepos[i].language || '').toLowerCase();
        if (f === 'all' || (f === 'rust' && l === 'rust') || (f === 'go' && l === 'go') || (f === 'typescript' && (l === 'typescript' || l === 'javascript')) || (f === 'other' && l !== 'rust' && l !== 'go' && l !== 'typescript' && l !== 'javascript')) out.push(allRepos[i]);
    }
    render(out);
}

function el(id, v) { var e = document.getElementById(id); if (e && v !== undefined) e.innerHTML = v; }

function init() {
    render(allRepos);
    var s = 0, i; for (i = 0; i < allRepos.length; i++) s += (allRepos[i].stargazers_count || 0);
    el('stat-stars', s);

    if (typeof fetch === 'undefined') return;

    fetch('https://api.github.com/users/Anhdeface').then(function(r){return r.json()}).then(function(u){
        if (u.public_repos !== undefined) el('stat-repos', u.public_repos);
        if (u.followers !== undefined) el('stat-followers', u.followers);
        if (u.following !== undefined) el('stat-following', u.following);
        if (u.avatar_url) { var img = document.getElementById('hero-avatar'); if (img) img.src = u.avatar_url; }
        if (u.name) el('profile-name', u.name);
    }).catch(function(){});

    fetch('https://api.github.com/users/Anhdeface/repos?sort=updated&per_page=30').then(function(r){return r.json()}).then(function(repos){
        if (repos && repos.length) {
            allRepos = repos;
            doFilter(curFilter);
            var s=0,j; for(j=0;j<repos.length;j++) s+=(repos[j].stargazers_count||0);
            el('stat-stars',s);
        }
    }).catch(function(){});
}

if (document.addEventListener) document.addEventListener('DOMContentLoaded', init);
else window.onload = init;
