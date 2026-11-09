const FONTS = {
  inherit: { label: 'Inherit (no override)', css: null },
  system:  { label: 'System UI', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  mono:    { label: 'Monospace', css: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace' },
  serif:   { label: 'Serif', css: 'Georgia, "Times New Roman", serif' },
  humanist:{ label: 'Humanist', css: '"SF Pro Rounded", "Avenir Next", "Segoe UI", "Trebuchet MS", sans-serif' }
};
const WEIGHTS = [{v:300,l:'Light'},{v:400,l:'Regular'},{v:500,l:'Medium'},{v:600,l:'Semibold'},{v:700,l:'Bold'},{v:800,l:'Heavy'}];
const SIZES = ['inherit','0.75rem','0.8rem','0.85rem','0.9rem','1rem','1.125rem','1.25rem','1.4rem'];

// Element definitions. kind: 'surface' = color only; 'text' = color+font+weight+size.
// color export targets: colorKey (YAML colors), cssVar (customCSS :root), colorSelector (customCSS rule).
const ELEMENTS = [
  {id:'bg',        label:'App background',              kind:'surface', color:'#E3EDF9', colorKey:'background'},
  {id:'accent',    label:'Accent — links & buttons',    kind:'text',    color:'#2563EB', colorKey:'ui_accent',  font:'inherit', weight:600, size:'inherit', selector:'a, button'},
  {id:'heading',   label:'Headings',                    kind:'text',    color:'#0F172A', colorKey:'ui_primary', font:'inherit', weight:700, size:'inherit', selector:'.aui-md h1, .aui-md h2, .aui-md h3'},
  {id:'body',      label:'Body / message text',         kind:'text',    color:'#111827', colorKey:'ui_text',    font:'inherit', weight:400, size:'inherit', selector:'.aui-md'},
  {id:'session',   label:'Sidebar session names',       kind:'text',    color:'#334155', cssVar:'--ui-text-secondary', font:'inherit', weight:500, size:'inherit', selector:'[data-slot*="session"]'},
  {id:'muted',     label:'Muted / captions & timestamps', kind:'text',  color:'#475569', cssVar:'--ui-text-tertiary',  font:'inherit', weight:400, size:'inherit', selector:'time, .caption'},
  {id:'thinking',  label:'Thinking text (🧠)',          kind:'text',    color:'#1E293B', colorKey:'ui_thinking', colorSelector:"[data-slot='aui_thinking-disclosure']", font:'inherit', weight:400, size:'inherit', selector:"[data-slot='aui_thinking-disclosure']"},
  {id:'tool',      label:'Tool-call lines (">_")',      kind:'text',    color:'#1E40AF', cssVar:'--conversation-scaffold-text', colorKey:'ui_tool', font:'mono', weight:500, size:'inherit', selector:"[data-slot='tool-block']"},
  {id:'error',     label:'Error messages ("!")',        kind:'text',    color:'#DC2626', colorKey:'ui_error',   font:'inherit', weight:700, size:'inherit', selector:'.text-destructive'},
  {id:'warning',   label:'Warning messages',            kind:'text',    color:'#B45309', colorKey:'ui_warn',    font:'inherit', weight:600, size:'inherit', selector:'.text-warning'},
  {id:'success',   label:'Success indicators',          kind:'text',    color:'#15803D', colorKey:'ui_ok',      font:'inherit', weight:600, size:'inherit', selector:'.text-success'},
  {id:'border',    label:'Borders / dividers',          kind:'surface', color:'#B8C7DD', colorKey:'ui_border'},
  {id:'sessionActive', label:'Selected session (highlight)', kind:'surface', color:'#2563EB', cssVar:'--ui-row-active-background'},
  {id:'statusbg',  label:'Status bar background',       kind:'surface', color:'#EEF1F5', colorKey:'status_bar_bg'},
  {id:'statustext',label:'Status bar text',             kind:'text',    color:'#111827', colorKey:'status_bar_text', font:'inherit', weight:400, size:'inherit', selector:'[data-slot="status-bar"]'}
];

const state = {};
ELEMENTS.forEach(e => {
  state[e.id] = { color: e.color, font: e.font, weight: e.weight, size: e.size };
});

let activeId = null;

const $ = id => document.getElementById(id);
const el = id => ELEMENTS.find(e => e.id === id);

function applyToMockup() {
  ELEMENTS.forEach(e => {
    const s = state[e.id];
    const nodes = document.querySelectorAll(`[data-el="${e.id}"]`);
    nodes.forEach(n => {
      if (e.id === 'bg' || e.id === 'statusbg' || e.id === 'sessionActive') { n.style.background = s.color; }
      else if (e.id === 'border') { n.style.borderColor = s.color; }
      else {
        n.style.color = s.color;
        if (e.kind === 'text') {
          n.style.fontFamily = (s.font !== 'inherit') ? FONTS[s.font].css : '';
          n.style.fontWeight = s.weight;
          n.style.fontSize = (s.size !== 'inherit') ? s.size : '';
        }
      }
    });
  });
  // border element also drives the shared --mk-border used by dividers/titlebar/sidebar
  const b = state['border'].color;
  document.documentElement.style.setProperty('--mk-border', b);
  document.documentElement.style.setProperty('--mk-accent', state['accent'].color);
}

function select(id) {
  activeId = id;
  document.querySelectorAll('[data-el]').forEach(n => n.classList.remove('sel'));
  document.querySelectorAll(`[data-el="${id}"]`).forEach(n => n.classList.add('sel'));
  const e = el(id), s = state[id];
  $('noSel').style.display = 'none';
  $('ctl').style.display = 'flex';
  $('elName').textContent = e.label + (e.kind === 'text' ? '' : ' (surface)');
  $('colorCtrl').style.display = 'flex';
  $('fontCtrl').style.display = e.kind === 'text' ? 'flex' : 'none';
  $('weightCtrl').style.display = e.kind === 'text' ? 'flex' : 'none';
  $('sizeCtrl').style.display = e.kind === 'text' ? 'flex' : 'none';
  $('inColor').value = s.color;
  $('inHex').value = s.color;
  if (e.kind === 'text') {
    $('inFont').value = s.font;
    $('inWeight').value = String(s.weight);
    $('inSize').value = s.size;
  }
}

function buildFontSelect() {
  $('inFont').innerHTML = Object.entries(FONTS).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('');
  $('inWeight').innerHTML = WEIGHTS.map(w => `<option value="${w.v}">${w.v} — ${w.l}</option>`).join('');
  $('inSize').innerHTML = SIZES.map(s => `<option value="${s}">${s === 'inherit' ? 'Inherit' : s}</option>`).join('');
}

function genCSS() {
  const lines = [];
  // :root variable block
  const varLines = [];
  ELEMENTS.forEach(e => { if (e.cssVar) varLines.push(`  ${e.cssVar}: ${state[e.id].color};`); });
  if (varLines.length) { lines.push(':root {'); varLines.forEach(l => lines.push(l)); lines.push('}'); lines.push(''); }
  // selected session: white text for contrast on the active-row highlight
  if (ELEMENTS.some(e => e.id === 'sessionActive')) {
    lines.push('[class*="ui-row-active"] {');
    lines.push('  color: #ffffff;');
    lines.push('}');
    lines.push('');
    lines.push('[class*="ui-row-active"] * {');
    lines.push('  color: #ffffff;');
    lines.push('}');
    lines.push('');
  }
  // per-selector blocks (color via colorSelector, plus font/weight/size)
  ELEMENTS.forEach(e => {
    const s = state[e.id];
    const props = [];
    if (e.colorSelector) props.push(`  color: ${s.color};`);
    if (e.kind === 'text') {
      if (s.font !== 'inherit') props.push(`  font-family: ${FONTS[s.font].css};`);
      props.push(`  font-weight: ${s.weight};`);
      if (s.size !== 'inherit') props.push(`  font-size: ${s.size};`);
    }
    if (props.length && e.selector) { lines.push(`${e.selector} {`); props.forEach(p => lines.push(p)); lines.push('}'); lines.push(''); }
  });
  return lines.join('\n').replace(/\n+$/, '');
}

function genYAML() {
  const name = $('skinName').value.trim() || 'my-theme';
  const colorLines = [];
  ELEMENTS.forEach(e => {
    if (e.colorKey) colorLines.push(`  ${e.colorKey}: "${state[e.id].color}"`);
  });
  const css = genCSS();
  let out = `name: ${name}\n`;
  out += `description: ${name} — generated in the Hermes theme editor\n\n`;
  out += `colors:\n${colorLines.join('\n')}\n`;
  if (css.trim()) {
    out += `\ncustomCSS: |\n`;
    out += css.split('\n').map(l => '  ' + l).join('\n') + '\n';
  }
  return out;
}

function refresh() {
  $('yamlOut').value = genYAML();
}

function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._h); t._h = setTimeout(() => t.style.opacity = '0', 2200);
}

// wire clicks on mockup elements
document.querySelectorAll('[data-el]').forEach(n => {
  n.addEventListener('click', ev => {
    // nested element (statustext inside statusbg): honor the inner target
    const t = ev.target.closest('[data-el]');
    select(t.getAttribute('data-el'));
    ev.stopPropagation();
  });
});

// controls
function onColor(hex) {
  if (!activeId) return;
  const s = state[activeId];
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) { s.color = hex; }
  $('inColor').value = s.color; $('inHex').value = s.color;
  applyToMockup(); refresh();
}
$('inColor').addEventListener('input', e => onColor(e.target.value));
$('inHex').addEventListener('input', e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onColor(e.target.value); });
$('inFont').addEventListener('change', e => { if (activeId) { state[activeId].font = e.target.value; applyToMockup(); refresh(); } });
$('inWeight').addEventListener('change', e => { if (activeId) { state[activeId].weight = +e.target.value; applyToMockup(); refresh(); } });
$('inSize').addEventListener('change', e => { if (activeId) { state[activeId].size = e.target.value; applyToMockup(); refresh(); } });
$('skinName').addEventListener('input', refresh);

$('copyBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(genYAML()); toast('YAML copied'); }
  catch { $('yamlOut').select(); document.execCommand('copy'); toast('YAML copied'); }
});
$('downloadBtn').addEventListener('click', () => {
  const name = $('skinName').value.trim() || 'my-theme';
  const blob = new Blob([genYAML()], { type: 'text/yaml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name + '.yaml';
  document.body.appendChild(a); a.click(); a.remove();
  toast('Downloaded ' + name + '.yaml');
});
$('applyBtn').addEventListener('click', () => {
  const name = $('skinName').value.trim() || 'my-theme';
  const yaml = genYAML();
  const prompt = `Save this Hermes skin to ~/.hermes/skins/${name}.yaml and activate it (hermes config set display.skin ${name}). Here is the full YAML:\n\n\`\`\`yaml\n${yaml}\n\`\`\``;
  if (window.hermes && typeof window.hermes.send === 'function') {
    window.hermes.send(prompt);
    toast('Sent to Hermes to save & activate');
  } else {
    navigator.clipboard.writeText(yaml).then(() => toast('Copied — paste to save')).catch(() => { $('yamlOut').select(); toast('Copied'); });
  }
});

buildFontSelect();
applyToMockup();
refresh();
