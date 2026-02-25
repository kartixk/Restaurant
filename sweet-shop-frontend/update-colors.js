const fs = require('fs');
const file = 'src/pages/Admin.jsx';
let content = fs.readFileSync(file, 'utf8');

const sStart = content.indexOf('const getStyles');
let beforeS = content.substring(0, sStart);
let afterS = content.substring(sStart);

// Apply replacements ONLY to the JSX part (beforeS), so we don't break the `S` object definition.
beforeS = beforeS.replace(/color: '#0f172a'/g, 'color: S.pageTitle.color')
    .replace(/color: "#0f172a"/g, 'color: S.pageTitle.color')
    .replace(/color: '#64748b'/g, 'color: S.pageSubtitle.color')
    .replace(/color: "#64748b"/g, 'color: S.pageSubtitle.color')
    .replace(/color: '#475569'/g, 'color: S.pageSubtitle.color')
    .replace(/color: "#475569"/g, 'color: S.pageSubtitle.color')
    .replace(/color: '#334155'/g, 'color: S.pageTitle.color')
    .replace(/color: "#334155"/g, 'color: S.pageTitle.color')
    .replace(/color: '#94a3b8'/g, 'color: S.pageSubtitle.color')
    .replace(/color: "#94a3b8"/g, 'color: S.pageSubtitle.color')
    .replace(/fill: '#64748b'/g, 'fill: S.pageSubtitle.color')
    .replace(/stroke="#0f172a"/g, 'stroke={S.pageTitle.color}')
    .replace(/fill: '#0f172a'/g, 'fill: S.pageTitle.color')
    .replace(/backgroundColor: '#f1f5f9'/g, 'backgroundColor: S.sidebarNavItemActive.backgroundColor')
    .replace(/backgroundColor: "#f1f5f9"/g, 'backgroundColor: S.sidebarNavItemActive.backgroundColor')
    .replace(/backgroundColor: '#f8fafc'/g, 'backgroundColor: S.layout.backgroundColor')
    .replace(/backgroundColor: "#f8fafc"/g, 'backgroundColor: S.layout.backgroundColor')
    .replace(/backgroundColor: '#e2e8f0'/g, 'backgroundColor: isDarkMode ? "#334155" : "#e2e8f0"')
    .replace(/backgroundColor: '#fff'/g, 'backgroundColor: S.sidebar.backgroundColor')
    .replace(/border: '1px solid #e2e8f0'/g, 'border: S.cardHeader.borderBottom')
    .replace(/border: "1px solid #e2e8f0"/g, 'border: S.cardHeader.borderBottom')
    .replace(/borderBottom: '1px solid #e2e8f0'/g, 'borderBottom: S.cardHeader.borderBottom')
    .replace(/borderBottom: '1px solid #f1f5f9'/g, 'borderBottom: S.cardHeader.borderBottom');

// Specific targeted replacements
beforeS = beforeS.replace(
    `{ name: 'Dine-in', value: 45, color: '#0f172a' }`,
    `{ name: 'Dine-in', value: 45, color: isDarkMode ? '#8b5cf6' : '#0f172a' }`
);

beforeS = beforeS.replace(
    `stroke: '#fff'`,
    `stroke: isDarkMode ? '#1e293b' : '#fff'`
);

beforeS = beforeS.replace(
    `stroke="#e2e8f0"`,
    `stroke={isDarkMode ? "#334155" : "#e2e8f0"}`
);

fs.writeFileSync(file, beforeS + afterS);
console.log("Colors successfully dynamically replaced.");
