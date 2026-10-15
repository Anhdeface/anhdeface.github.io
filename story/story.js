function toggleDark() {
    var d = !document.body.classList.contains('dark');
    if (d) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    try { localStorage.setItem('dark', d ? '1' : '0'); } catch(e) {}
}

try {
    if (localStorage.getItem('dark') === '1' && document.body) {
        document.body.classList.add('dark');
    }
} catch(e) {}

var REPO_OWNER = 'Anhdeface';
var REPO_NAME = 'anhdeface.github.io';
var PER_PAGE = 10;
var currentPage = 1;
var allIssues = [];
var bodyCache = {};

function esc(s) {
    return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

function formatDate(dateStr) {
    var d = new Date(dateStr);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function timeSince(dateStr) {
    var now = new Date();
    var d = new Date(dateStr);
    var diff = Math.floor((now - d) / 1000);
    if (diff < 60) return diff + 's ago';
    diff = Math.floor(diff / 60);
    if (diff < 60) return diff + 'm ago';
    diff = Math.floor(diff / 60);
    if (diff < 24) return diff + 'h ago';
    diff = Math.floor(diff / 24);
    if (diff < 30) return diff + 'd ago';
    diff = Math.floor(diff / 30);
    if (diff < 12) return diff + 'mo ago';
    return Math.floor(diff / 12) + 'y ago';
}

function renderBody(text) {
    if (!text) return '<i>No content.</i>';
    var s = esc(text);
    s = s.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
    s = s.replace(/`([^`]+)`/g, '<tt>$1</tt>');
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[image: $1 - $2]');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    s = s.replace(/\*(.+?)\*/g, '<i>$1</i>');
    s = s.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    s = s.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    s = s.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    s = s.replace(/^---$/gm, '<hr>');
    s = s.replace(/\n/g, '<br>');
    return s;
}

function renderLabels(labels) {
    if (!labels || !labels.length) return '';
    var h = ' ';
    for (var i = 0; i < labels.length; i++) {
        h += '[' + esc(labels[i].name) + '] ';
    }
    return '<small>' + h + '</small>';
}

function renderList(issues) {
    var c = document.getElementById('stories-container');
    if (!c) return;
    if (!issues || !issues.length) {
        c.innerHTML = '<p><i>No stories yet. Create an <a href="https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/issues/new">issue</a> to start writing.</i></p>';
        return;
    }

    var start = (currentPage - 1) * PER_PAGE;
    var page = issues.slice(start, start + PER_PAGE);

    var h = '<ul>', i, issue;
    for (i = 0; i < page.length; i++) {
        issue = page[i];
        h += '<li>';
        h += '<a href="#issue-' + issue.number + '" onclick="showDetail(' + issue.number + ');return false;"><b>' + esc(issue.title) + '</b></a>';
        h += renderLabels(issue.labels);
        h += '<br><small>' + formatDate(issue.created_at) + ' (' + timeSince(issue.created_at) + ')</small>';
        h += '</li>';
    }
    h += '</ul>';
    c.innerHTML = h;
    renderPagination(issues.length);
}

function renderPagination(total) {
    var pg = document.getElementById('stories-pagination');
    if (!pg) return;
    var pages = Math.ceil(total / PER_PAGE);
    if (pages <= 1) { pg.innerHTML = ''; return; }

    var h = '<p>Page: ';
    for (var i = 1; i <= pages; i++) {
        if (i === currentPage) {
            h += '<b>[' + i + ']</b> ';
        } else {
            h += '<a href="#stories" onclick="goPage(' + i + ');return false;">' + i + '</a> ';
        }
    }
    h += '</p>';
    pg.innerHTML = h;
}

function goPage(p) {
    currentPage = p;
    renderList(allIssues);
    window.scrollTo(0, 0);
}

function renderDetail(issue, body) {
    var c = document.getElementById('stories-container');
    var pg = document.getElementById('stories-pagination');
    pg.innerHTML = '';

    var h = '<p><a href="#stories" onclick="closeDetail();return false;">&larr; Back to list</a></p>';
    h += '<hr>';
    h += '<h3>' + esc(issue.title) + '</h3>';
    h += '<p><small>' + formatDate(issue.created_at) + renderLabels(issue.labels) + '</small></p>';
    h += '<hr>';
    h += body !== null ? renderBody(body) : '<p><i>Loading...</i></p>';
    h += '<hr>';
    h += '<p><small><a href="' + issue.html_url + '">View on GitHub</a></small></p>';

    c.innerHTML = h;
    window.scrollTo(0, 0);
}

function showDetail(number) {
    var issue = null, i;
    for (i = 0; i < allIssues.length; i++) {
        if (allIssues[i].number === number) { issue = allIssues[i]; break; }
    }
    if (!issue) return;

    if (bodyCache[number] !== undefined) {
        renderDetail(issue, bodyCache[number]);
        return;
    }

    renderDetail(issue, null);

    fetch('https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues/' + number)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            bodyCache[number] = data.body || '';
            renderDetail(issue, bodyCache[number]);
        })
        .catch(function() {
            bodyCache[number] = '*Failed to load content.*';
            renderDetail(issue, bodyCache[number]);
        });
}

function closeDetail() {
    renderList(allIssues);
}

function loadIssues() {
    try {
        if (localStorage.getItem('dark') === '1') {
            document.body.classList.add('dark');
        }
    } catch(e) {}

    var c = document.getElementById('stories-container');
    if (!c) return;

    if (typeof fetch === 'undefined') {
        c.innerHTML = '<p><i>Your browser does not support fetch. <a href="https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/issues">Read on GitHub</a>.</i></p>';
        return;
    }

    c.innerHTML = '<p><i>Loading...</i></p>';

    var url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues?state=open&sort=created&direction=desc&per_page=100';
    fetch(url).then(function(r) { return r.json(); }).then(function(issues) {
        if (!issues || !issues.length || issues.message) {
            allIssues = [];
        } else {
            allIssues = [];
            for (var i = 0; i < issues.length; i++) {
                if (!issues[i].pull_request) {
                    allIssues.push({
                        number: issues[i].number,
                        title: issues[i].title,
                        created_at: issues[i].created_at,
                        labels: issues[i].labels,
                        html_url: issues[i].html_url
                    });
                }
            }
        }
        renderList(allIssues);

        var hash = window.location.hash;
        if (hash && hash.indexOf('#issue-') === 0) {
            var num = parseInt(hash.replace('#issue-', ''), 10);
            if (num) showDetail(num);
        }
    }).catch(function() {
        c.innerHTML = '<p><i>Failed to load stories. <a href="https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/issues">View on GitHub</a>.</i></p>';
    });
}

if (document.addEventListener) document.addEventListener('DOMContentLoaded', loadIssues);
else window.onload = loadIssues;
