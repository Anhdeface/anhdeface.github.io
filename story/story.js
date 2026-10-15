var isDark = false;

function applyTheme(dark) {
    var b = document.body;
    if (dark) {
        b.bgColor = '#000000';
        b.text = '#cccccc';
        b.link = '#6699cc';
        b.vLink = '#996699';
    } else {
        b.bgColor = '#ffffff';
        b.text = '#000000';
        b.link = '#0000ee';
        b.vLink = '#551a8b';
    }
    isDark = dark;
    try { localStorage.setItem('dark', dark ? '1' : '0'); } catch(e) {}
}

function toggleDark() {
    applyTheme(!isDark);
}

try {
    if (localStorage.getItem('dark') === '1') isDark = true;
} catch(e) {}

var REPO_OWNER = 'Anhdeface';
var REPO_NAME = 'anhdeface.github.io';
var PER_PAGE = 10;
var currentPage = 1;
var allIssues = [];
var viewingDetail = false;

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
    // code blocks
    s = s.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
    // inline code
    s = s.replace(/`([^`]+)`/g, '<tt>$1</tt>');
    // images ![alt](url)
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[image: $1 - $2]');
    // links [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // bold
    s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    // italic
    s = s.replace(/\*(.+?)\*/g, '<i>$1</i>');
    // headings
    s = s.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    s = s.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    s = s.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    // horizontal rule
    s = s.replace(/^---$/gm, '<hr>');
    // line breaks
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
    var end = start + PER_PAGE;
    var page = issues.slice(start, end);

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
    viewingDetail = false;
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

function showDetail(number) {
    var issue = null, i;
    for (i = 0; i < allIssues.length; i++) {
        if (allIssues[i].number === number) { issue = allIssues[i]; break; }
    }
    if (!issue) return;

    var c = document.getElementById('stories-container');
    var pg = document.getElementById('stories-pagination');

    var h = '<p><a href="#stories" onclick="closeDetail();return false;">&larr; Back to list</a></p>';
    h += '<hr>';
    h += '<h3>' + esc(issue.title) + '</h3>';
    h += '<p><small>' + formatDate(issue.created_at) + renderLabels(issue.labels) + '</small></p>';
    h += '<hr>';
    h += renderBody(issue.body);
    h += '<hr>';
    h += '<p><small><a href="' + issue.html_url + '">View on GitHub</a></small></p>';

    c.innerHTML = h;
    pg.innerHTML = '';
    viewingDetail = true;
    window.scrollTo(0, 0);
}

function closeDetail() {
    renderList(allIssues);
}

function loadIssues() {
    if (isDark) applyTheme(true);
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
                    allIssues.push(issues[i]);
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
