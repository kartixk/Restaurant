const fs = require('fs');

const file = 'src/pages/Admin.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Convert S object to getStyles function
const sStart = content.indexOf('const S = {');
if (sStart === -1) {
    console.log("Could not find const S = {");
    process.exit(1);
}

let beforeS = content.substring(0, sStart);
let sContent = content.substring(sStart);

// Basic color replacements for dark mode
sContent = sContent.replace('const S = {', 'const getStyles = (isDark) => ({\n')
    .replace(/#f8fafc/g, '${isDark ? "#0f172a" : "#f8fafc"}')
    .replace(/#fff/g, '${isDark ? "#1e293b" : "#fff"}')
    .replace(/#f1f5f9/g, '${isDark ? "#334155" : "#f1f5f9"}')
    .replace(/#0f172a/g, '${isDark ? "#f8fafc" : "#0f172a"}')
    .replace(/#1e293b/g, '${isDark ? "#e2e8f0" : "#1e293b"}')
    .replace(/#64748b/g, '${isDark ? "#94a3b8" : "#64748b"}')
    .replace(/#475569/g, '${isDark ? "#cbd5e1" : "#475569"}')
    .replace(/#94a3b8/g, '${isDark ? "#64748b" : "#94a3b8"}')
    .replace(/#e2e8f0/g, '${isDark ? "#334155" : "#e2e8f0"}')
    .replace(/#cbd5e1/g, '${isDark ? "#475569" : "#cbd5e1"}');

// Fix the quotes due to template literals
sContent = sContent.replace(/(\w+): "([^"]+\$\{[^}]+\}[^"]*)"/g, '$1: `$2`')
    .replace(/(\w+): '([^']+\$\{[^}]+\}[^']*)'/g, '$1: `$2`');

// Replace the closing brace of S
sContent = sContent.replace(/};\s*$/, '});\n');

content = beforeS + sContent;

// 2. Add state
const stateInsertIdx = content.indexOf('const [pendingManagers, setPendingManagers] = useState([]);');
if (stateInsertIdx !== -1) {
    content = content.replace(
        'const [pendingManagers, setPendingManagers] = useState([]);',
        'const [pendingManagers, setPendingManagers] = useState([]);\n  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("adminDarkMode") === "true");\n  const S = useMemo(() => getStyles(isDarkMode), [isDarkMode]);'
    );
}

// 3. Update Email setting -> empty, and make Dark Mode toggle work
const prefSectionStart = content.indexOf('{/* Preferences Section */}');
if (prefSectionStart !== -1) {
    content = content.replace(
        /<div style=\{\{\s*display: 'flex', justifyContent: 'space-between', alignItems: 'center'\s*\}\}>\s*<div>\s*<div style=\{\{\s*fontWeight: 500, color: '#0f172a', fontSize: '0.9rem'\s*\}\}>Email Notifications<\/div>\s*<div style=\{\{\s*color: '#64748b', fontSize: '0.8rem'\s*\}\}>Receive daily summary reports and urgent alerts.<\/div>\s*<\/div>\s*<label[^>]*>\s*<input[^>]*>\s*<span[^>]*>\s*<span[^>]*><\/span>\s*<\/span>\s*<\/label>\s*<\/div>/g,
        ''
    );

    content = content.replace(
        /<div style=\{\{\s*fontWeight: 500, color: '#0f172a', fontSize: '0.9rem'\s*\}\}>Dark Mode<\/div>/g,
        '<div style={{ fontWeight: 500, color: S.pageTitle.color, fontSize: "0.9rem" }}>Dark Mode</div>'
    );
    content = content.replace(
        /<div style=\{\{\s*color: '#64748b', fontSize: '0.8rem'\s*\}\}>Enable dark theme across the application. \(Coming soon\)<\/div>/g,
        '<div style={{ color: S.pageSubtitle.color, fontSize: "0.8rem" }}>Enable dark theme across the admin console.</div>'
    );

    // Replace the Dark Mode input specifically:
    content = content.replace(
        /<label style=\{\{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', opacity: 0.5 \}\}>\s*<input type="checkbox" disabled style=\{\{ opacity: 0, width: 0, height: 0 \}\} \/>\s*<span style=\{\{ position: 'absolute', cursor: 'not-allowed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#cbd5e1', borderRadius: '34px', transition: '.4s' \}\}>\s*<span style=\{\{ position: 'absolute', content: '""', height: '18px', width: '18px', left: '4px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' \}\}><\/span>\s*<\/span>\s*<\/label>/,
        `<label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" checked={isDarkMode} onChange={(e) => { setIsDarkMode(e.target.checked); localStorage.setItem("adminDarkMode", e.target.checked); }} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDarkMode ? '#10b981' : '#cbd5e1', borderRadius: '34px', transition: '.4s' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: isDarkMode ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                </span>
              </label>`
    );
}

// Ensure the profile and preference titles also use S text colors
content = content.replace(/color: '#0f172a', borderBottom: '1px solid #e2e8f0'/g, 'color: S.pageTitle.color, borderBottom: S.cardHeader.borderBottom');

// Fix any leftover color strings directly used in the JSX like #0f172a that aren't inside S
content = content.replace(/color: '#0f172a'/g, 'color: S.pageTitle.color');
content = content.replace(/color: '#64748b'/g, 'color: S.pageSubtitle.color');

fs.writeFileSync(file, content);
console.log("Successfully transformed Admin.jsx for Dark Mode");
