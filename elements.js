const elements = [
  { id: 'wood', name: 'Wood', han: '木', pinyin: 'Mù', color: 'Blue-green', swatch: '#587e61', season: 'Spring', zang: 'Liver', fu: 'Gallbladder', direction: 'East', taste: 'Sour', climate: 'Wind', emotion: 'Anger' },
  { id: 'fire', name: 'Fire', han: '火', pinyin: 'Huǒ', color: 'Red', swatch: '#ad4936', season: 'Summer', zang: 'Heart', fu: 'Small intestine', direction: 'South', taste: 'Bitter', climate: 'Heat', emotion: 'Joy' },
  { id: 'earth', name: 'Earth', han: '土', pinyin: 'Tǔ', color: 'Yellow', swatch: '#c4933c', season: 'Late summer', zang: 'Spleen', fu: 'Stomach', direction: 'Center', taste: 'Sweet', climate: 'Dampness', emotion: 'Pensiveness' },
  { id: 'metal', name: 'Metal', han: '金', pinyin: 'Jīn', color: 'White', swatch: '#fffdf4', season: 'Autumn', zang: 'Lung', fu: 'Large intestine', direction: 'West', taste: 'Pungent', climate: 'Dryness', emotion: 'Grief' },
  { id: 'water', name: 'Water', han: '水', pinyin: 'Shuǐ', color: 'Black', swatch: '#253039', season: 'Winter', zang: 'Kidney', fu: 'Bladder', direction: 'North', taste: 'Salty', climate: 'Cold', emotion: 'Fear' },
];

const practices = {
  tcm: { note: 'Explore how each phase is associated with a season, a color, and a pair of organs.' },
  frolics: {
    title: 'Five Animal Frolics', label: 'Animal',
    note: 'Wǔ Qín Xì is a qigong practice built around the movements of five animals. This mapping follows the Wang Zhi Ping Tai Ji & Qi Gong Health Centre.',
    forms: ['Tiger', 'Monkey', 'Bear', 'Bird', 'Deer'],
  },
  'hung-gar': {
    title: 'Hung Gar', label: 'Animal',
    note: 'This Hung Gar mapping pairs each phase with one of the five animals.',
    forms: ['Leopard', 'Tiger', 'Snake', 'Crane', 'Dragon'],
  },
  sengmen: {
    title: 'Sēngmén Five Animal Fists', label: 'Animal',
    note: 'This mapping follows the Five Elements boxing curriculum of the Sēngmén school in Sichuan.',
    forms: ['Tiger', 'Snake', 'Leopard', 'Dragon', 'Crane'],
  },
  xingyi: {
    title: 'Xíngyìquán Five Fists', label: 'Fist',
    note: 'Xíngyìquán pairs the five phases with five foundational fists. The animal forms are a separate part of the curriculum.',
    forms: ['Crushing', 'Pounding', 'Crossing', 'Splitting', 'Drilling'],
  },
};

const diagram = document.querySelector('#diagram');
const svg = document.querySelector('#cycle-lines');
const picker = document.querySelector('#practice');
const dialog = document.querySelector('#element-details');
const content = document.querySelector('#detail-content');
const size = 600;
const center = { x: 300, y: 284 };
const radius = 207;
const step = Math.PI * 2 / elements.length;
const startAngle = -Math.PI / 2;
const pointAt = (angle) => ({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
const svgPoint = ({ x, y }) => `${x.toFixed(2)} ${y.toFixed(2)}`;
const elementAt = (index) => elements[(index + elements.length) % elements.length];
const imagePath = ({ id }) => `images/${id}.webp`;

function addArrow(cycle, path) {
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrow.setAttribute('class', `arrow arrow-${cycle}`);
  arrow.setAttribute('d', path);
  arrow.setAttribute('marker-end', `url(#${cycle}-tip)`);
  svg.append(arrow);
}

function showDetails(index) {
  const phase = elements[index];
  const practice = practices[picker.value];
  const attributes = [
    ['Color', `<span class="swatch" style="--swatch:${phase.swatch}"></span>${phase.color}`],
    ['Season', phase.season], ['Zàng organ', phase.zang], ['Fǔ organ', phase.fu],
    ['Direction', phase.direction], ['Taste', phase.taste], ['Climate', phase.climate], ['Emotion', phase.emotion],
  ];
  content.innerHTML = `
    <div class="detail-top">
      <img src="${imagePath(phase)}" alt="" width="112" height="112">
      <div><p class="eyebrow"><span lang="zh">${phase.han}</span> · ${phase.pinyin}</p><h2 id="element-title">${phase.name}</h2></div>
    </div>
    <dl class="attributes">${attributes.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>
    ${phase.id === 'fire' ? '<p class="detail-note">Fire also includes the Pericardium and Triple Burner pair in the twelve-channel system.</p>' : ''}
    ${practice.forms ? `<div class="detail-practice"><p class="eyebrow">${practice.title}</p><p>${practice.label} <strong>${practice.forms[index]}</strong></p></div>` : ''}
    <div class="detail-cycles">
      <p><span>Creation</span> ${elementAt(index - 1).name} → <strong>${phase.name}</strong> → ${elementAt(index + 1).name}</p>
      <p><span>Destruction</span> ${elementAt(index - 2).name} → <strong>${phase.name}</strong> → ${elementAt(index + 2).name}</p>
    </div>`;
  dialog.showModal();
}

const nodes = elements.map((phase, index) => {
  const angle = startAngle + index * step;
  const position = pointAt(angle);
  const target = pointAt(angle + step * 2);
  const length = Math.hypot(target.x - position.x, target.y - position.y);
  const unit = { x: (target.x - position.x) / length, y: (target.y - position.y) / length };
  // The text below Wood sits between its portrait and both controlling edges.
  const controlStartGap = phase.id === 'wood' ? 106 : 62;
  const controlEndGap = elementAt(index + 2).id === 'wood' ? 109 : 66;
  const controlStart = { x: position.x + unit.x * controlStartGap, y: position.y + unit.y * controlStartGap };
  const controlEnd = { x: target.x - unit.x * controlEndGap, y: target.y - unit.y * controlEndGap };
  addArrow('control', `M${svgPoint(controlStart)} L${svgPoint(controlEnd)}`);
  const arcStart = pointAt(angle + 0.40);
  const arcEndGap = elementAt(index + 1).id === 'water' ? 0.62 : 0.39;
  const arcEnd = pointAt(angle + step - arcEndGap);
  addArrow('generate', `M${svgPoint(arcStart)} A${radius} ${radius} 0 0 1 ${svgPoint(arcEnd)}`);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `phase phase-${phase.id}`;
  button.style.setProperty('--x', `${position.x / size * 100}%`);
  button.style.setProperty('--y', `${position.y / size * 100}%`);
  button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = `<img src="${imagePath(phase)}" alt="" width="108" height="108"><span class="phase-title">${phase.name} <span lang="zh">${phase.han}</span></span><span class="phase-subtitle"></span>`;
  button.addEventListener('click', () => showDetails(index));
  diagram.append(button);
  return button;
});

function changePractice() {
  const practice = practices[picker.value];
  document.querySelector('#practice-note').textContent = practice.note;
  nodes.forEach((node, index) => {
    node.querySelector('.phase-subtitle').textContent = practice.forms?.[index] ?? elements[index].pinyin;
  });
}

picker.addEventListener('change', changePractice);
changePractice();

document.querySelector('nav a[href="#sources"]').addEventListener('click', () => {
  document.querySelector('#sources details').open = true;
});

const cycleButtons = [...document.querySelectorAll('.cycle-filter button')];
cycleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    diagram.dataset.cycle = button.dataset.cycle;
    cycleButtons.forEach((filter) => filter.setAttribute('aria-pressed', filter === button));
  });
});

function sequence(increment) {
  return Array.from({ length: elements.length + 1 }, (_, index) => elementAt(index * increment).name).join(' → ');
}

document.querySelector('#generate-sequence').textContent = sequence(1);
document.querySelector('#control-sequence').textContent = sequence(2);

dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
