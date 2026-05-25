/**
 * Guitar and Bass Tab Editor State and Interactivity
 */
import { renderChordSVG, chordLibrary } from './chordDiagram.js';

export const TUNING_PRESETS = {
  standard: {
    names: ['e', 'B', 'G', 'D', 'A', 'E'],
    freqs: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]
  },
  drop_d: {
    names: ['e', 'B', 'G', 'D', 'A', 'D'],
    freqs: [329.63, 246.94, 196.00, 146.83, 110.00, 73.42]
  },
  dadgad: {
    names: ['d', 'A', 'G', 'D', 'A', 'D'],
    freqs: [293.66, 220.00, 196.00, 146.83, 110.00, 73.42]
  },
  open_g: {
    names: ['d', 'B', 'G', 'D', 'G', 'D'],
    freqs: [293.66, 246.94, 196.00, 146.83, 98.00, 73.42]
  },
  open_d: {
    names: ['d', 'A', 'F#', 'D', 'A', 'D'],
    freqs: [293.66, 220.00, 185.00, 146.83, 110.00, 73.42]
  },
  half_down: {
    names: ['eb', 'Bb', 'Gb', 'Db', 'Ab', 'Eb'],
    freqs: [311.13, 233.08, 185.00, 138.59, 103.83, 77.78]
  }
};

export const BASS_TUNING_PRESETS = {
  standard: {
    names: ['G', 'D', 'A', 'E'],
    freqs: [98.00, 73.42, 55.00, 41.20]
  },
  drop_d: {
    names: ['G', 'D', 'A', 'D'],
    freqs: [98.00, 73.42, 55.00, 36.71]
  },
  half_down: {
    names: ['Gb', 'Db', 'Ab', 'Eb'],
    freqs: [92.50, 69.30, 51.91, 38.89]
  }
};

export class TabEditor {
  constructor(options = {}) {
    this.containerId = options.containerId || 'tab-grid-editor';
    this.container = document.getElementById(this.containerId);
    
    // Song Document State (Updated for Multitrack support)
    this.song = {
      title: 'Untitled Song',
      artist: 'Unknown Artist',
      key: 'C',
      bpm: 120,
      loop: false,
      youtubeUrl: '',
      tracks: [
        {
          id: 'track_0',
          name: 'Guitar 1',
          type: 'guitar', // 'guitar' or 'bass'
          tuningPreset: 'standard',
          tuning: [...TUNING_PRESETS.standard.freqs],
          tuningNames: [...TUNING_PRESETS.standard.names],
          beats: []
        }
      ],
      activeTrackIndex: 0
    };
    
    // Editor State
    this.cursor = { col: 0, row: 2 };
    this.lastKeyTime = 0;
    this.lastNumberInput = '';
    
    // Clipboard for copy/paste
    this.copiedColumn = null;
    
    // Callbacks
    this.onSongChange = options.onSongChange || null;
    this.onUsedChordsChange = options.onUsedChordsChange || null;
  }

  /**
   * Set the active song data and upgrade legacy songs on-the-fly
   */
  loadSong(songData) {
    this.song = songData;
    
    // 1. Transparently upgrade legacy single track songs to multitrack format
    if (!this.song.tracks || this.song.tracks.length === 0) {
      this.song.tracks = [
        {
          id: 'track_' + Date.now() + '_0',
          name: 'Guitar 1',
          type: 'guitar',
          tuningPreset: this.song.tuningPreset || 'standard',
          tuning: this.song.tuning || [...TUNING_PRESETS.standard.freqs],
          tuningNames: this.song.tuningNames || [...TUNING_PRESETS.standard.names],
          beats: this.song.beats || []
        }
      ];
      this.song.activeTrackIndex = 0;
      
      // Clean up old single track root properties
      delete this.song.tuningPreset;
      delete this.song.tuning;
      delete this.song.tuningNames;
      delete this.song.beats;
    }
    
    // Ensure active track index is in bounds
    if (this.song.activeTrackIndex === undefined || this.song.activeTrackIndex < 0 || this.song.activeTrackIndex >= this.song.tracks.length) {
      this.song.activeTrackIndex = 0;
    }
    
    // 2. Validate all tracks beats structure
    this.song.tracks.forEach(track => {
      const numStrings = track.type === 'bass' ? 4 : 6;
      if (!track.beats) track.beats = [];
      
      track.beats.forEach(beat => {
        if (!beat.notes) {
          beat.notes = Array(numStrings).fill(null);
        } else if (beat.notes.length !== numStrings) {
          // Adjust notes length
          if (beat.notes.length > numStrings) {
            beat.notes = beat.notes.slice(0, numStrings);
          } else {
            while (beat.notes.length < numStrings) {
              beat.notes.push(null);
            }
          }
        }
      });
    });
    
    this.cursor = { col: 0, row: 2 };
    this.lastNumberInput = '';
    
    this.render();
    this.refreshUsedChords();
    if (this.onSongChange) this.onSongChange(this.song);
  }

  getSongData() {
    return this.song;
  }

  getActiveTrack() {
    return this.song.tracks[this.song.activeTrackIndex];
  }

  getTuningPresets() {
    const activeTrack = this.getActiveTrack();
    return activeTrack.type === 'bass' ? BASS_TUNING_PRESETS : TUNING_PRESETS;
  }

  getTuningNames() {
    const activeTrack = this.getActiveTrack();
    const presets = this.getTuningPresets();
    return activeTrack.tuningNames || (activeTrack.type === 'bass' ? presets.standard.names : presets.standard.names);
  }

  getTuningPresetName() {
    const activeTrack = this.getActiveTrack();
    return activeTrack.tuningPreset || 'standard';
  }

  /**
   * Update active tuning preset for current track
   */
  setTuningPreset(presetName) {
    const presets = this.getTuningPresets();
    const preset = presets[presetName];
    if (preset) {
      const activeTrack = this.getActiveTrack();
      activeTrack.tuningPreset = presetName;
      activeTrack.tuning = [...preset.freqs];
      activeTrack.tuningNames = [...preset.names];
      
      this.render();
      this.triggerSave();
    }
  }

  /**
   * Populate a default empty tab track
   */
  loadDefaultSong() {
    const defaultBeats = [];
    const initialColumnsCount = 32;
    
    for (let i = 0; i < initialColumnsCount; i++) {
      defaultBeats.push({
        chords: '',
        lyrics: '',
        notes: [null, null, null, null, null, null],
        duration: 0.25
      });
    }
    
    this.loadSong({
      title: 'Acoustic Riff',
      artist: 'Guitarist',
      key: 'C',
      bpm: 100,
      loop: false,
      youtubeUrl: '',
      tracks: [
        {
          id: 'track_default_guitar_1',
          name: 'Guitar 1',
          type: 'guitar',
          tuningPreset: 'standard',
          tuning: [...TUNING_PRESETS.standard.freqs],
          tuningNames: [...TUNING_PRESETS.standard.names],
          beats: defaultBeats
        }
      ],
      activeTrackIndex: 0
    });
  }

  /**
   * Track Operations API
   */
  addNewTrack(name, type, tuningPreset = 'standard') {
    const presets = type === 'bass' ? BASS_TUNING_PRESETS : TUNING_PRESETS;
    const preset = presets[tuningPreset] || presets.standard;
    const numStrings = type === 'bass' ? 4 : 6;
    
    // Keep track sizes identical to make playing along in sync simple
    const activeTrack = this.getActiveTrack();
    const targetLength = activeTrack ? activeTrack.beats.length : 32;
    
    const newBeats = [];
    for (let i = 0; i < targetLength; i++) {
      newBeats.push({
        chords: '',
        lyrics: '',
        notes: Array(numStrings).fill(null),
        duration: activeTrack ? (activeTrack.beats[i].duration || 0.25) : 0.25
      });
    }
    
    const newTrack = {
      id: 'track_' + Date.now(),
      name: name || (type === 'bass' ? 'Bass' : `Guitar ${this.song.tracks.length + 1}`),
      type: type,
      tuningPreset: tuningPreset,
      tuning: [...preset.freqs],
      tuningNames: [...preset.names],
      beats: newBeats
    };
    
    this.song.tracks.push(newTrack);
    this.song.activeTrackIndex = this.song.tracks.length - 1;
    
    this.cursor = { col: 0, row: 2 };
    this.render();
    this.refreshUsedChords();
    this.triggerSave();
  }

  deleteTrack(index) {
    if (this.song.tracks.length <= 1) {
      alert('A song must have at least one track!');
      return;
    }
    this.song.tracks.splice(index, 1);
    
    // Clamp active index
    if (this.song.activeTrackIndex >= this.song.tracks.length) {
      this.song.activeTrackIndex = this.song.tracks.length - 1;
    }
    
    this.cursor = { col: 0, row: 2 };
    this.render();
    this.refreshUsedChords();
    this.triggerSave();
  }

  renameTrack(index, newName) {
    const track = this.song.tracks[index];
    if (track && newName && newName.trim()) {
      track.name = newName.trim();
      this.render();
      this.triggerSave();
    }
  }

  switchTrack(index) {
    if (index >= 0 && index < this.song.tracks.length) {
      this.song.activeTrackIndex = index;
      this.cursor = { col: 0, row: 2 };
      this.render();
      this.refreshUsedChords();
      this.triggerSave();
    }
  }

  /**
   * Insert a blank column at position on ALL tracks to preserve alignment
   */
  insertColumn(index) {
    this.song.tracks.forEach(track => {
      const numStrings = track.type === 'bass' ? 4 : 6;
      const newCol = {
        chords: '',
        lyrics: '',
        notes: Array(numStrings).fill(null),
        duration: 0.25
      };
      track.beats.splice(index, 0, newCol);
    });
    
    this.render();
    this.triggerSave();
  }

  /**
   * Delete a column at position on ALL tracks to preserve alignment
   */
  deleteColumn(index) {
    const activeTrack = this.getActiveTrack();
    if (activeTrack.beats.length <= 4) return;
    
    this.song.tracks.forEach(track => {
      track.beats.splice(index, 1);
    });
    
    if (this.cursor.col >= activeTrack.beats.length) {
      this.cursor.col = activeTrack.beats.length - 1;
    }
    
    this.render();
    this.refreshUsedChords();
    this.triggerSave();
  }

  /**
   * Append a new measure/columns to end on ALL tracks
   */
  appendColumns(count = 8) {
    this.song.tracks.forEach(track => {
      const numStrings = track.type === 'bass' ? 4 : 6;
      for (let i = 0; i < count; i++) {
        track.beats.push({
          chords: '',
          lyrics: '',
          notes: Array(numStrings).fill(null),
          duration: 0.25
        });
      }
    });
    
    this.render();
    this.triggerSave();
  }

  /**
   * Save hook trigger
   */
  triggerSave() {
    if (this.onSongChange) {
      this.onSongChange(this.song);
    }
  }

  /**
   * Parse unique chords of active track and invoke callback
   */
  refreshUsedChords() {
    const used = new Set();
    const activeTrack = this.getActiveTrack();
    if (activeTrack && activeTrack.beats) {
      activeTrack.beats.forEach(beat => {
        if (beat.chords && beat.chords.trim()) {
          used.add(beat.chords.trim());
        }
      });
    }
    const chordList = Array.from(used);
    
    if (this.onUsedChordsChange) {
      this.onUsedChordsChange(chordList);
    }
  }

  /**
   * Insert chord symbol from library, auto-filling notes if column empty
   */
  insertChordIntoTab(chordName, chordLibraryRef = null) {
    const colIndex = this.cursor.col;
    this.insertChordAtColumn(chordName, colIndex, chordLibraryRef);
  }

  /**
   * Helper to write chord symbol at specific beat index (supports drag/drop drop index)
   */
  insertChordAtColumn(chordName, colIndex, chordLibraryRef = null) {
    const activeTrack = this.getActiveTrack();
    const beat = activeTrack.beats[colIndex];
    if (!beat) return;
    
    beat.chords = chordName;
    
    const isEmpty = beat.notes.every(n => n === null);
    if (isEmpty && chordLibraryRef) {
      const chord = chordLibraryRef.get(chordName);
      if (chord) {
        const numStrings = activeTrack.type === 'bass' ? 4 : 6;
        // Map chord frets (max 6 strings standard) to track size
        const chordFrets = [...chord.frets];
        if (numStrings === 4) {
          // If inserting a guitar chord into a 4-string bass, take the lowest strings or standard frets
          beat.notes = chordFrets.slice(0, 4);
        } else {
          beat.notes = [...chordFrets];
        }
      }
    }
    
    this.render();
    this.refreshUsedChords();
    this.triggerSave();
  }

  /**
   * Remove a chord name from all beats in the ACTIVE track
   */
  removeChordFromSong(chordName) {
    const activeTrack = this.getActiveTrack();
    activeTrack.beats.forEach(beat => {
      if (beat.chords === chordName) {
        beat.chords = '';
      }
    });
    this.render();
    this.refreshUsedChords();
    this.triggerSave();
  }

  /**
   * Show an inline input box to edit text cells (chords/lyrics)
   */
  showTextInputOverlay(cellEl, col, row, type) {
    if (cellEl.querySelector('input')) return;
    
    const activeTrack = this.getActiveTrack();
    const beat = activeTrack.beats[col];
    const initialValue = type === 'chord' ? beat.chords : beat.lyrics;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = initialValue;
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.border = 'none';
    input.style.outline = 'none';
    input.style.background = 'var(--bg-card-hover)';
    input.style.color = type === 'chord' ? 'var(--accent-cyan)' : 'var(--color-text-main)';
    input.style.textAlign = 'center';
    input.style.fontFamily = 'inherit';
    input.style.fontSize = 'inherit';
    input.style.borderRadius = '4px';
    
    cellEl.innerHTML = '';
    cellEl.appendChild(input);
    input.focus();
    input.select();
    
    const commitValue = () => {
      const newVal = input.value.trim();
      if (type === 'chord') {
        beat.chords = newVal;
        this.refreshUsedChords();
      } else {
        beat.lyrics = newVal;
      }
      this.render();
      this.triggerSave();
    };
    
    input.addEventListener('blur', commitValue);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        commitValue();
      } else if (e.key === 'Escape') {
        this.render();
      }
    });
  }

  /**
   * Render wrapped measures grid blocks based on active track
   */
  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    
    const activeTrack = this.getActiveTrack();
    if (!activeTrack) return;
    
    const isBass = activeTrack.type === 'bass';
    const numStrings = isBass ? 4 : 6;
    const numRows = numStrings + 2; // Chords + Lyrics + Strings
    
    const totalCols = activeTrack.beats.length;
    const beatsPerMeasure = 8;
    const measureCount = Math.ceil(totalCols / beatsPerMeasure);
    const tuningNames = this.getTuningNames();
    
    for (let m = 0; m < measureCount; m++) {
      const measureDiv = document.createElement('div');
      measureDiv.className = isBass ? 'measure-block bass-track' : 'measure-block';
      measureDiv.dataset.measure = m;
      
      // Render measure headers (column 1 in measure grid)
      for (let r = 0; r < numRows; r++) {
        const headerCell = document.createElement('div');
        headerCell.style.gridColumn = '1';
        headerCell.style.gridRow = `${r + 1}`;
        headerCell.className = 'measure-header-cell';
        
        if (r >= 2) {
          headerCell.innerText = tuningNames[r - 2];
          headerCell.className += ' string-header';
        }
        measureDiv.appendChild(headerCell);
      }
      
      // Render columns (columns 2 to 9)
      for (let i = 0; i < beatsPerMeasure; i++) {
        const c = m * beatsPerMeasure + i;
        if (c >= totalCols) break;
        
        const beat = activeTrack.beats[c];
        
        // Add vertical column highlight
        const highlight = document.createElement('div');
        highlight.className = 'tab-column-highlight';
        highlight.id = `col-highlight-${c}`;
        highlight.style.gridColumn = `${i + 2}`;
        highlight.style.gridRow = '1 / -1';
        measureDiv.appendChild(highlight);
        
        // Render rows for this beat
        for (let r = 0; r < numRows; r++) {
          const cell = document.createElement('div');
          cell.dataset.col = c;
          cell.dataset.row = r;
          
          cell.style.gridColumn = `${i + 2}`;
          cell.style.gridRow = `${r + 1}`;
          
          // Wire Drag and Drop triggers on each column cell
          cell.addEventListener('dragover', (e) => {
            e.preventDefault();
            cell.classList.add('drag-over');
          });
          
          cell.addEventListener('dragenter', (e) => {
            e.preventDefault();
            cell.classList.add('drag-over');
          });
          
          cell.addEventListener('dragleave', () => {
            cell.classList.remove('drag-over');
          });
          
          cell.addEventListener('drop', (e) => {
            e.preventDefault();
            cell.classList.remove('drag-over');
            const chordName = e.dataTransfer.getData('text/plain');
            if (chordName) {
              this.insertChordAtColumn(chordName, c, chordLibrary);
            }
          });
          
          if (r === 0) {
            cell.className = 'tab-cell chord-cell';
            cell.innerText = beat.chords || '';
            cell.addEventListener('dblclick', () => this.showTextInputOverlay(cell, c, r, 'chord'));
          } else if (r === 1) {
            cell.className = 'tab-cell lyric-cell';
            cell.innerText = beat.lyrics || '';
            cell.addEventListener('dblclick', () => this.showTextInputOverlay(cell, c, r, 'lyric'));
          } else {
            const stringIndex = r - 2;
            const fretVal = beat.notes[stringIndex];
            cell.className = 'tab-cell note-cell';
            
            if (fretVal !== null && fretVal !== -1) {
              cell.classList.add('has-note');
              cell.innerText = fretVal;
            } else {
              cell.innerText = '—';
            }
          }
          
          if (this.cursor.col === c && this.cursor.row === r) {
            cell.classList.add('focused');
          }
          
          cell.addEventListener('click', () => {
            this.setCursor(c, r);
          });
          
          measureDiv.appendChild(cell);
        }
      }
      
      // Render measure barline (column 10)
      const barline = document.createElement('div');
      barline.className = 'measure-barline';
      barline.style.gridColumn = '10';
      barline.style.gridRow = `3 / ${numRows + 1}`; // Spans string lines dynamically
      measureDiv.appendChild(barline);
      
      this.container.appendChild(measureDiv);
    }
  }

  setCursor(col, row) {
    const activeTrack = this.getActiveTrack();
    if (!activeTrack) return;
    
    const numRows = (activeTrack.type === 'bass' ? 4 : 6) + 2;
    this.cursor.col = Math.max(0, Math.min(activeTrack.beats.length - 1, col));
    this.cursor.row = Math.max(0, Math.min(numRows - 1, row));
    this.render();
  }

  /**
   * Handle physical keyboard navigation inside tab grid editor
   */
  handleKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    const activeTrack = this.getActiveTrack();
    if (!activeTrack) return;
    
    const numRows = (activeTrack.type === 'bass' ? 4 : 6) + 2;
    const col = this.cursor.col;
    const row = this.cursor.row;
    const beat = activeTrack.beats[col];
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.setCursor(col, row - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.setCursor(col, row + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.setCursor(col - 1, row);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.setCursor(col + 1, row);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        this.setCursor(col - 1, row);
      } else {
        this.setCursor(col + 1, row);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (row >= 2) {
        beat.notes[row - 2] = null;
      } else if (row === 0) {
        beat.chords = '';
        this.refreshUsedChords();
      } else {
        beat.lyrics = '';
      }
      this.render();
      this.triggerSave();
    } else if (e.key === 'x' || e.key === 'X') {
      if (row >= 2) {
        e.preventDefault();
        beat.notes[row - 2] = beat.notes[row - 2] === 'x' ? null : 'x';
        this.render();
        this.triggerSave();
      }
    } else if (e.key === 'Insert' || (e.ctrlKey && e.key === 'i')) {
      e.preventDefault();
      this.insertColumn(col);
    } else if (e.key === 'd' && e.ctrlKey) {
      e.preventDefault();
      this.deleteColumn(col);
    }
    else if (row >= 2 && /^[0-9]$/.test(e.key)) {
      e.preventDefault();
      
      const now = Date.now();
      const stringIndex = row - 2;
      
      if (now - this.lastKeyTime < 1000 && this.lastNumberInput !== '') {
        const combined = parseInt(this.lastNumberInput + e.key, 10);
        if (combined >= 0 && combined <= 24) {
          beat.notes[stringIndex] = combined;
          this.lastNumberInput = String(combined);
        } else {
          beat.notes[stringIndex] = parseInt(e.key, 10);
          this.lastNumberInput = e.key;
        }
      } else {
        beat.notes[stringIndex] = parseInt(e.key, 10);
        this.lastNumberInput = e.key;
      }
      
      this.lastKeyTime = now;
      this.render();
      this.triggerSave();
    }
    else if (row === 0 && /^[a-zA-Z#7]$/.test(e.key)) {
      e.preventDefault();
      const cellEl = this.container.querySelector(`.tab-cell.focused`);
      if (cellEl) {
        this.showTextInputOverlay(cellEl, col, row, 'chord');
        const input = cellEl.querySelector('input');
        if (input) {
          input.value = e.key;
        }
      }
    }
    else if (row === 1 && /^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
      const cellEl = this.container.querySelector(`.tab-cell.focused`);
      if (cellEl) {
        this.showTextInputOverlay(cellEl, col, row, 'lyric');
        const input = cellEl.querySelector('input');
        if (input) {
          input.value = e.key;
        }
      }
    }
    else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      const curDur = beat.duration || 0.25;
      if (curDur < 1.0) {
        beat.duration = curDur * 2;
        this.render();
        this.triggerSave();
      }
    } else if (e.key === '-') {
      e.preventDefault();
      const curDur = beat.duration || 0.25;
      if (curDur > 0.0625) {
        beat.duration = curDur / 2;
        this.render();
        this.triggerSave();
      }
    }
    else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.copiedColumn = JSON.parse(JSON.stringify(beat));
    }
    else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (this.copiedColumn) {
        const pastedBeat = JSON.parse(JSON.stringify(this.copiedColumn));
        const numStrings = activeTrack.type === 'bass' ? 4 : 6;
        
        // Pad or crop note arrays if pasted across instrument types
        if (pastedBeat.notes.length !== numStrings) {
          if (pastedBeat.notes.length > numStrings) {
            pastedBeat.notes = pastedBeat.notes.slice(0, numStrings);
          } else {
            while (pastedBeat.notes.length < numStrings) {
              pastedBeat.notes.push(null);
            }
          }
        }
        activeTrack.beats[col] = pastedBeat;
        
        this.render();
        this.refreshUsedChords();
        this.triggerSave();
      }
    }
  }

  /**
   * Highlights the active playing column during audio playbacks
   */
  highlightPlayingColumn(index) {
    const highlights = this.container.querySelectorAll('.tab-column-highlight');
    highlights.forEach(h => h.classList.remove('playing'));
    
    if (index !== null && index !== undefined && index >= 0) {
      const activeHighlight = document.getElementById(`col-highlight-${index}`);
      if (activeHighlight) {
        activeHighlight.classList.add('playing');
        
        // Scroll active playing beat column into viewport
        const measure = activeHighlight.parentElement;
        if (measure) {
          measure.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }
}
