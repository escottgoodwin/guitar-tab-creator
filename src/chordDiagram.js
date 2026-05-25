/**
 * Guitar Chord Shapes and SVG Visualizer Module
 */

// Comprehensive 48 Chord Database (Major, Minor, Maj7, Min7 for all 12 note roots)
export const initialChords = [
  // C Chords
  { name: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null] },
  { name: 'Cm', frets: [-1, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: 3 },
  { name: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null] },
  { name: 'Cm7', frets: [-1, 3, 5, 3, 4, 3], fingers: [null, 1, 3, 1, 2, 1], barre: 3 },

  // C# Chords
  { name: 'C#', frets: [-1, 4, 6, 6, 6, 4], fingers: [null, 1, 3, 3, 3, 1], barre: 4 },
  { name: 'C#m', frets: [-1, 4, 6, 6, 5, 4], fingers: [null, 1, 3, 4, 2, 1], barre: 4 },
  { name: 'C#maj7', frets: [-1, 4, 6, 5, 6, 4], fingers: [null, 1, 3, 2, 4, 1], barre: 4 },
  { name: 'C#m7', frets: [-1, 4, 6, 4, 5, 4], fingers: [null, 1, 3, 1, 2, 1], barre: 4 },

  // D Chords
  { name: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
  { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] },
  { name: 'Dmaj7', frets: [-1, -1, 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1], barre: 2 },
  { name: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], barre: 1 },

  // D# Chords
  { name: 'D#', frets: [-1, 6, 8, 8, 8, 6], fingers: [null, 1, 3, 3, 3, 1], barre: 6 },
  { name: 'D#m', frets: [-1, 6, 8, 8, 7, 6], fingers: [null, 1, 3, 4, 2, 1], barre: 6 },
  { name: 'D#maj7', frets: [-1, 6, 8, 7, 8, 6], fingers: [null, 1, 3, 2, 4, 1], barre: 6 },
  { name: 'D#m7', frets: [-1, 6, 8, 6, 7, 6], fingers: [null, 1, 3, 1, 2, 1], barre: 6 },

  // E Chords
  { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null] },
  { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [null, 1, 2, null, null, null] },
  { name: 'Emaj7', frets: [0, 2, 1, 1, 0, 0], fingers: [null, 2, 1, 1, null, null] },
  { name: 'Em7', frets: [0, 2, 0, 0, 0, 0], fingers: [null, 1, null, null, null, null] },

  // F Chords
  { name: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: 1 },
  { name: 'Fm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: 1 },
  { name: 'Fmaj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null] },
  { name: 'Fm7', frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: 1 },

  // F# Chords
  { name: 'F#', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: 2 },
  { name: 'F#m', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: 2 },
  { name: 'F#maj7', frets: [2, 4, 3, 3, 2, 2], fingers: [1, 3, 2, 2, 1, 1], barre: 2 },
  { name: 'F#m7', frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], barre: 2 },

  // G Chords
  { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4] },
  { name: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: 3 },
  { name: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, null, null, null, 2] },
  { name: 'Gm7', frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barre: 3 },

  // G# Chords
  { name: 'G#', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barre: 4 },
  { name: 'G#m', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: 4 },
  { name: 'G#maj7', frets: [4, 6, 5, 5, 4, 4], fingers: [1, 3, 2, 2, 1, 1], barre: 4 },
  { name: 'G#m7', frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], barre: 4 },

  // A Chords
  { name: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null] },
  { name: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null] },
  { name: 'Amaj7', frets: [-1, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null] },
  { name: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null] },

  // A# Chords
  { name: 'A#', frets: [-1, 1, 3, 3, 3, 1], fingers: [null, 1, 3, 3, 3, 1], barre: 1 },
  { name: 'A#m', frets: [-1, 1, 3, 3, 2, 1], fingers: [null, 1, 3, 4, 2, 1], barre: 1 },
  { name: 'A#maj7', frets: [-1, 1, 3, 2, 3, 1], fingers: [null, 1, 3, 2, 4, 1], barre: 1 },
  { name: 'A#m7', frets: [-1, 1, 3, 1, 2, 1], fingers: [null, 1, 3, 1, 2, 1], barre: 1 },

  // B Chords
  { name: 'B', frets: [-1, 2, 4, 4, 4, 2], fingers: [null, 1, 3, 3, 3, 1], barre: 2 },
  { name: 'Bm', frets: [-1, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: 2 },
  { name: 'Bmaj7', frets: [-1, 2, 4, 3, 4, 2], fingers: [null, 1, 3, 2, 4, 1], barre: 2 },
  { name: 'Bm7', frets: [-1, 2, 4, 2, 3, 2], fingers: [null, 1, 3, 1, 2, 1], barre: 2 }
];

// In-memory active chords dictionary (extends standard chords with custom ones)
export let chordLibrary = new Map(initialChords.map(c => [c.name, c]));

// Alternate tuning name mappings for chord builder visual cues
export const TUNING_PRESETS = {
  standard: ['e', 'B', 'G', 'D', 'A', 'E'],
  drop_d: ['e', 'B', 'G', 'D', 'A', 'D'],
  dadgad: ['d', 'A', 'G', 'D', 'A', 'D'],
  open_g: ['d', 'B', 'G', 'D', 'G', 'D'],
  open_d: ['d', 'A', 'F#', 'D', 'A', 'D'],
  half_down: ['eb', 'Bb', 'Gb', 'Db', 'Ab', 'Eb']
};

/**
 * Reset library to initial state
 */
export function resetChordLibrary() {
  chordLibrary = new Map(initialChords.map(c => [c.name, c]));
}

/**
 * Add a custom chord to the library
 */
export function addCustomChord(name, frets, fingers, barre = null) {
  const newChord = { name, frets: [...frets], fingers: [...fingers], barre };
  chordLibrary.set(name, newChord);
  return newChord;
}

/**
 * Dynamic SVG Chord Diagram Generator
 * @param {Object} chord - Chord object { name, frets: [E6, A5, D4, G3, B2, E1], fingers }
 * @param {Object} options - Custom configurations (tuningNames, width, height, etc.)
 */
export function renderChordSVG(chord, options = {}) {
  const width = options.width || 100;
  const height = options.height || 120;
  const drawName = options.drawName !== undefined ? options.drawName : true;
  const tuningNames = options.tuningNames || ['e', 'B', 'G', 'D', 'A', 'E'];
  
  // Layout Grid Dimensions
  const paddingX = 18;
  const gridWidth = width - paddingX * 2;
  const stringSpacing = gridWidth / 5; // 6 strings = 5 intervals
  
  const topNavSpace = drawName ? 26 : 14;
  const bottomNavSpace = 14; // space for note labels at bottom
  const gridHeight = height - topNavSpace - bottomNavSpace;
  
  // Calculate display frets
  let minFret = Infinity;
  let maxFret = -Infinity;
  
  for (let i = 0; i < 6; i++) {
    const f = chord.frets[i];
    if (f > 0) {
      if (f < minFret) minFret = f;
      if (f > maxFret) maxFret = f;
    }
  }
  
  let startFret = 1;
  const fretSpan = 4; // Display 4 frets
  
  if (maxFret > 4) {
    // If the chords span higher frets, shift the window
    startFret = minFret;
    if (maxFret - minFret >= 4) {
      startFret = minFret;
    }
  }
  
  const displayFretCount = Math.max(fretSpan, maxFret - startFret + 1);
  const fretSpacing = (gridHeight - 8) / displayFretCount;
  
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">`;
  
  // 1. Draw Chord Title Name
  if (drawName) {
    svg += `<text x="${width / 2}" y="18" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="currentColor">${chord.name}</text>`;
  }
  
  // Grid Top Boundary (Y position of fret 0/startFret)
  const gridTop = topNavSpace + 4;
  const gridBottom = gridTop + displayFretCount * fretSpacing;
  
  // 2. Draw Fretboard strings (6 vertical lines)
  for (let s = 0; s < 6; s++) {
    const x = paddingX + s * stringSpacing;
    svg += `<line x1="${x}" y1="${gridTop}" x2="${x}" y2="${gridBottom}" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" />`;
  }
  
  // 3. Draw Fret lines (horizontal lines)
  for (let f = 0; f <= displayFretCount; f++) {
    const y = gridTop + f * fretSpacing;
    const isNut = (startFret === 1 && f === 0);
    const strokeWidth = isNut ? 3.5 : 1;
    const strokeColor = isNut ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.25)';
    svg += `<line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  }
  
  // 4. Draw Starting Fret indicator (e.g. "3 fr" or "5 fr")
  if (startFret > 1) {
    svg += `<text x="${paddingX - 4}" y="${gridTop + fretSpacing / 2 + 4}" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="var(--accent-cyan)">${startFret}fr</text>`;
  }
  
  // 5. Draw Open / Muted string markers at the top
  for (let s = 0; s < 6; s++) {
    const x = paddingX + s * stringSpacing;
    const fret = chord.frets[s];
    const markerY = gridTop - 6;
    
    if (fret === -1) {
      svg += `<text x="${x}" y="${markerY}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="var(--accent-ruby)">×</text>`;
    } else if (fret === 0) {
      svg += `<circle cx="${x}" cy="${markerY - 2}" r="3" fill="none" stroke="var(--accent-emerald)" stroke-width="1.5" />`;
    }
  }
  
  // 6. Draw Barre (if applicable)
  if (chord.barre !== undefined && chord.barre !== null) {
    const barreFret = chord.barre;
    if (barreFret >= startFret && barreFret < startFret + displayFretCount) {
      const y = gridTop + (barreFret - startFret) * fretSpacing + fretSpacing / 2;
      
      let firstString = -1;
      let lastString = -1;
      for (let s = 0; s < 6; s++) {
        if (chord.frets[s] === barreFret) {
          if (firstString === -1) firstString = s;
          lastString = s;
        }
      }
      
      if (firstString !== -1 && lastString !== -1) {
        const x1 = paddingX + firstString * stringSpacing;
        const x2 = paddingX + lastString * stringSpacing;
        svg += `<rect x="${x1 - 4}" y="${y - 4}" width="${x2 - x1 + 8}" height="8" rx="4" fill="var(--accent-blue)" opacity="0.8" />`;
      }
    }
  }
  
  // 7. Draw Fret dots (individual finger placements)
  for (let s = 0; s < 6; s++) {
    const fret = chord.frets[s];
    if (fret > 0) {
      const fretIndex = fret - startFret;
      if (fretIndex >= 0 && fretIndex < displayFretCount) {
        const x = paddingX + s * stringSpacing;
        const y = gridTop + fretIndex * fretSpacing + fretSpacing / 2;
        
        const dotRadius = options.isPrinting ? 4.8 : 6.5;
        const textYOffset = options.isPrinting ? 2.5 : 3;
        const fontSize = options.isPrinting ? 8 : 9;
        
        svg += `<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="var(--accent-blue)" class="pressed-dot" />`;
        
        const finger = chord.fingers ? chord.fingers[s] : null;
        if (finger) {
          svg += `<text x="${x}" y="${y + textYOffset}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="700" fill="hsl(230, 25%, 7%)">${finger}</text>`;
        }
      }
    }
  }
  
  // 8. Draw String Note Names at the bottom
  for (let s = 0; s < 6; s++) {
    const x = paddingX + s * stringSpacing;
    const noteName = tuningNames[s] || '•';
    svg += `<text x="${x}" y="${height - 2}" text-anchor="middle" font-family="monospace" font-size="8" font-weight="600" fill="var(--color-text-muted)">${noteName}</text>`;
  }
  
  svg += `</svg>`;
  return svg;
}

/**
 * Set up dynamic event listener hooks for Chord UI interaction
 */
export function initChordUI(editorContext) {
  const chordListEl = document.getElementById('chord-library-list');
  const songChordsPanelEl = document.getElementById('song-chords-list');
  
  // Custom builder elements
  const btnCreateCustom = document.getElementById('btn-create-custom-chord');
  const modalBuilder = document.getElementById('custom-chord-modal');
  const btnSaveCustom = document.getElementById('btn-save-custom-chord');
  const btnCloseBuilder = document.getElementById('btn-close-chord-builder');
  const inputCustomName = document.getElementById('custom-chord-name');
  const builderFretboard = document.getElementById('builder-fretboard');
  const builderStatusRow = document.getElementById('builder-status-row');
  const builderPreviewSvg = document.getElementById('builder-preview-svg');
  const builderTuningSelect = document.getElementById('builder-tuning-select');
  const builderCustomTuningContainer = document.getElementById('builder-custom-tuning-container');
  const builderCustomNoteSelects = document.querySelectorAll('.builder-custom-note');
  
  // Chord Inspector / Enlarge Elements
  const inspectorModal = document.getElementById('chord-inspector-modal');
  const inspectorChordName = document.getElementById('inspector-chord-name');
  const inspectorChordSvg = document.getElementById('inspector-chord-svg');
  const inspectorChordInfo = document.getElementById('inspector-chord-info');
  const btnCloseInspector = document.getElementById('btn-close-inspector');
  const btnInspectorInsert = document.getElementById('btn-inspector-insert');
  const btnInspectorDelete = document.getElementById('btn-inspector-delete');

  // String note presets list
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Temporary state for the chord builder
  let builderState = {
    name: '',
    frets: [-1, -1, -1, -1, -1, -1],
    fingers: [null, null, null, null, null, null],
    barre: null,
    tuningKey: 'standard',
    customNotes: [...TUNING_PRESETS.standard]
  };

  // 1. Initialise Builder Custom Tuning Dropdown lists
  builderCustomNoteSelects.forEach((select, idx) => {
    select.innerHTML = '';
    NOTES.forEach(note => {
      const opt = document.createElement('option');
      opt.value = note;
      opt.innerText = note;
      select.appendChild(opt);
    });
    
    // Set change event listener
    select.addEventListener('change', () => {
      if (builderState.tuningKey === 'custom') {
        builderState.customNotes[idx] = select.value.toLowerCase();
        drawBuilderGrid();
        updateBuilderPreview();
      }
    });
  });

  // Close inspector hook
  if (btnCloseInspector) {
    btnCloseInspector.addEventListener('click', () => {
      inspectorModal.classList.remove('active');
    });
  }

  /**
   * Enlarge and inspect chord details
   */
  function showInspector(chordName, isFromSong = false) {
    const chord = chordLibrary.get(chordName);
    if (!chord) return;
    
    const tuningNames = editorContext.getTuningNames();
    
    if (inspectorChordName) inspectorChordName.innerText = chord.name;
    if (inspectorChordSvg) {
      inspectorChordSvg.innerHTML = renderChordSVG(chord, { 
        width: 180, 
        height: 220, 
        drawName: false,
        tuningNames: tuningNames
      });
    }
    
    // Notes detail labels
    const fretStr = chord.frets.map(f => f === -1 ? 'X' : f).join(' ');
    if (inspectorChordInfo) {
      inspectorChordInfo.innerHTML = `
        <div style="margin-bottom: 6px;"><strong>Guitar Tuning:</strong> ${tuningNames.join(' ')}</div>
        <div><strong>Fret Fingerings:</strong> ${fretStr}</div>
      `;
    }
    
    // Bind insert button
    if (btnInspectorInsert) {
      btnInspectorInsert.onclick = () => {
        editorContext.insertChordIntoTab(chordName);
        inspectorModal.classList.remove('active');
      };
    }
    
    // Bind delete from song button
    if (btnInspectorDelete) {
      if (isFromSong) {
        btnInspectorDelete.style.display = 'block';
        btnInspectorDelete.onclick = () => {
          if (confirm(`Clear chord symbol "${chordName}" from all beats in this song?`)) {
            editorContext.removeChordFromSong(chordName);
            inspectorModal.classList.remove('active');
          }
        };
      } else {
        btnInspectorDelete.style.display = 'none';
      }
    }
    
    if (inspectorModal) inspectorModal.classList.add('active');
  }
  
  // 1. Render Chord Library
  function renderLibrary() {
    if (!chordListEl) return;
    chordListEl.innerHTML = '';
    
    const sortedChords = Array.from(chordLibrary.values()).sort((a, b) => a.name.localeCompare(b.name));
    
    sortedChords.forEach(chord => {
      const card = document.createElement('div');
      card.className = 'chord-card';
      card.title = `Drag to tab, or click to enlarge`;
      card.dataset.chordName = chord.name;
      
      // Make draggable
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', chord.name);
        card.style.opacity = '0.5';
      });
      
      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });
      
      const title = document.createElement('span');
      title.className = 'chord-card-name';
      title.innerText = chord.name;
      
      const diagram = document.createElement('div');
      diagram.className = 'chord-card-diagram';
      const tuningNames = editorContext.getTuningNames();
      diagram.innerHTML = renderChordSVG(chord, { width: 55, height: 65, drawName: false, tuningNames: tuningNames });
      
      card.appendChild(title);
      card.appendChild(diagram);
      
      card.addEventListener('click', () => {
        showInspector(chord.name, false);
      });
      
      chordListEl.appendChild(card);
    });
  }
  
  // 2. Render song's active chords
  function renderSongChords(usedChordsList) {
    if (!songChordsPanelEl) return;
    songChordsPanelEl.innerHTML = '';
    
    if (usedChordsList.length === 0) {
      songChordsPanelEl.innerHTML = '<span style="color: var(--color-text-muted); font-size: 0.9rem;">No chords added to tab yet. Drag or click library chords.</span>';
      return;
    }
    
    const tuningNames = editorContext.getTuningNames();
    
    usedChordsList.forEach(chordName => {
      const chord = chordLibrary.get(chordName);
      if (!chord) return;
      
      const card = document.createElement('div');
      card.className = 'chord-card active-tab-chord';
      card.title = `Drag to tab, click to enlarge, or click x to delete`;
      card.dataset.chordName = chordName;
      
      // Make draggable
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', chordName);
        card.style.opacity = '0.5';
      });
      
      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });
      
      const title = document.createElement('span');
      title.className = 'chord-card-name';
      title.innerText = chordName;
      
      const diagram = document.createElement('div');
      diagram.className = 'chord-card-diagram';
      diagram.innerHTML = renderChordSVG(chord, { width: 55, height: 65, drawName: false, tuningNames: tuningNames });
      
      card.appendChild(title);
      card.appendChild(diagram);
      
      // Delete trash button (×) overlay
      const delBtn = document.createElement('button');
      delBtn.className = 'chord-card-delete';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'Clear from song';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Clear chord symbol "${chordName}" from all beats in this song?`)) {
          editorContext.removeChordFromSong(chordName);
        }
      });
      card.appendChild(delBtn);
      
      card.addEventListener('click', () => {
        showInspector(chordName, true);
      });
      
      songChordsPanelEl.appendChild(card);
    });
  }
  
  // 3. Custom Chord Builder Handlers
  if (btnCreateCustom) {
    btnCreateCustom.addEventListener('click', () => {
      const activeTuningPreset = editorContext.getTuningPresetName ? editorContext.getTuningPresetName() : 'standard';
      const tuningNotesList = editorContext.getTuningNames ? editorContext.getTuningNames() : [...TUNING_PRESETS.standard];
      
      builderState = {
        name: '',
        frets: [-1, -1, -1, -1, -1, -1],
        fingers: [null, null, null, null, null, null],
        barre: null,
        tuningKey: activeTuningPreset,
        customNotes: [...tuningNotesList]
      };
      
      if (builderTuningSelect) {
        builderTuningSelect.value = activeTuningPreset;
      }
      if (inputCustomName) inputCustomName.value = '';
      
      // Sync builder selects values to match active tuning notes
      builderCustomNoteSelects.forEach((select, idx) => {
        const noteName = builderState.customNotes[idx].toUpperCase();
        let matchedVal = noteName;
        if (noteName === 'BB') matchedVal = 'A#';
        if (noteName === 'EB') matchedVal = 'D#';
        if (noteName === 'GB') matchedVal = 'F#';
        if (noteName === 'DB') matchedVal = 'C#';
        if (noteName === 'AB') matchedVal = 'G#';
        select.value = matchedVal;
      });
      
      // Toggle custom tuning panel visibility
      if (builderCustomTuningContainer) {
        builderCustomTuningContainer.style.display = activeTuningPreset === 'custom' ? 'flex' : 'none';
      }
      
      modalBuilder.classList.add('active');
      drawBuilderGrid();
      updateBuilderPreview();
    });
  }
  
  if (btnCloseBuilder) {
    btnCloseBuilder.addEventListener('click', () => {
      modalBuilder.classList.remove('active');
    });
  }

  if (builderTuningSelect) {
    builderTuningSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      builderState.tuningKey = val;
      
      if (val === 'custom') {
        if (builderCustomTuningContainer) {
          builderCustomTuningContainer.style.display = 'flex';
        }
        // Load notes from selector dropdowns
        builderCustomNoteSelects.forEach((select, idx) => {
          builderState.customNotes[idx] = select.value.toLowerCase();
        });
      } else {
        if (builderCustomTuningContainer) {
          builderCustomTuningContainer.style.display = 'none';
        }
        const presetNotes = TUNING_PRESETS[val] || TUNING_PRESETS.standard;
        builderState.customNotes = [...presetNotes];
      }
      
      drawBuilderGrid();
      updateBuilderPreview();
    });
  }
  
  function drawBuilderGrid() {
    if (!builderFretboard || !builderStatusRow) return;
    builderFretboard.innerHTML = '';
    builderStatusRow.innerHTML = '';
    
    const tuningStrNotes = builderState.customNotes;
    
    // Draw status indicators above builder grid
    for (let s = 0; s < 6; s++) {
      const indicator = document.createElement('div');
      indicator.className = 'builder-status-indicator';
      indicator.style.flexDirection = 'column';
      indicator.style.height = '34px';
      
      const fretVal = builderState.frets[s];
      let displayChar = 'X';
      if (fretVal === 0) displayChar = 'O';
      else if (fretVal > 0) displayChar = fretVal;
      
      if (fretVal === -1) {
        indicator.classList.add('muted');
      } else if (fretVal === 0) {
        indicator.classList.add('open');
      }
      
      indicator.innerHTML = `
        <span style="font-size: 8px; color: var(--color-text-muted); line-height: 1;">${tuningStrNotes[s]}</span>
        <span style="line-height: 1.2; font-weight: bold;">${displayChar}</span>
      `;
      
      indicator.addEventListener('click', () => {
        if (builderState.frets[s] > 0) {
          builderState.frets[s] = 0;
          builderState.fingers[s] = null;
        } else if (builderState.frets[s] === 0) {
          builderState.frets[s] = -1;
          builderState.fingers[s] = null;
        } else {
          builderState.frets[s] = 0;
          builderState.fingers[s] = null;
        }
        drawBuilderGrid();
        updateBuilderPreview();
      });
      
      builderStatusRow.appendChild(indicator);
    }
    
    // Fret cells: 6 strings vertical, 5 frets horizontal (1 to 5)
    for (let s = 0; s < 6; s++) {
      for (let f = 1; f <= 5; f++) {
        const cell = document.createElement('div');
        cell.className = 'builder-cell';
        if (builderState.frets[s] === f) {
          cell.classList.add('active');
        }
        
        const dot = document.createElement('div');
        dot.className = 'builder-dot';
        cell.appendChild(dot);
        
        cell.addEventListener('click', () => {
          if (builderState.frets[s] === f) {
            builderState.frets[s] = 0;
            builderState.fingers[s] = null;
          } else {
            builderState.frets[s] = f;
            builderState.fingers[s] = Math.min(4, Math.max(1, f));
          }
          drawBuilderGrid();
          updateBuilderPreview();
        });
        
        builderFretboard.appendChild(cell);
      }
    }
  }
  
  function updateBuilderPreview() {
    if (!builderPreviewSvg) return;
    const chordName = inputCustomName.value.trim() || 'Custom';
    const tempChord = {
      name: chordName,
      frets: builderState.frets,
      fingers: builderState.fingers,
      barre: builderState.barre
    };
    
    builderPreviewSvg.innerHTML = renderChordSVG(tempChord, { 
      width: 100, 
      height: 120, 
      drawName: true,
      tuningNames: builderState.customNotes
    });
  }
  
  if (inputCustomName) {
    inputCustomName.addEventListener('input', updateBuilderPreview);
  }
  
  if (btnSaveCustom) {
    btnSaveCustom.addEventListener('click', () => {
      const name = inputCustomName.value.trim();
      if (!name) {
        alert('Please enter a chord name!');
        return;
      }
      
      addCustomChord(name, builderState.frets, builderState.fingers, builderState.barre);
      modalBuilder.classList.remove('active');
      
      renderLibrary();
      editorContext.refreshUsedChords();
    });
  }
  
  // Render library immediately on load
  renderLibrary();
  
  // Return controller hooks
  return {
    renderLibrary,
    renderSongChords,
    getChord: (name) => chordLibrary.get(name),
    hasChord: (name) => chordLibrary.has(name)
  };
}
