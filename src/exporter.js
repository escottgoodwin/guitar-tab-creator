import { renderChordSVG } from './chordDiagram.js';

/**
 * Convert structured tab editor state to standard, human-readable ASCII text block format
 * @param {Object} song - Active song state object
 * @returns {string} - Formatted ASCII string
 */
export function exportToASCII(song) {
  const activeTrack = song.tracks ? song.tracks[song.activeTrackIndex] : song;
  if (!activeTrack) return '';
  
  const isBass = activeTrack.type === 'bass';
  const numStrings = isBass ? 4 : 6;
  const beats = activeTrack.beats;
  const colCount = beats.length;
  
  // Set block size for text wrapping (e.g., 16 beats per text line block)
  const colsPerBlock = 16;
  const colWidth = 5; // e.g. "----" or "--12-"
  
  let ascii = `${song.title}\nArtist: ${song.artist}\nTrack: ${activeTrack.name} (${isBass ? 'Bass' : 'Guitar'})\nKey: ${song.key} | BPM: ${song.bpm}\n\n`;
  
  const tuningNames = activeTrack.tuningNames || (isBass ? ['G', 'D', 'A', 'E'] : ['e', 'B', 'G', 'D', 'A', 'E']);
  const stringHeaders = tuningNames.map(name => `${name.padEnd(2)}|`);
  
  for (let blockStart = 0; blockStart < colCount; blockStart += colsPerBlock) {
    const blockEnd = Math.min(blockStart + colsPerBlock, colCount);
    
    // 1. Construct Chord Symbol line
    let chordLine = '   '; // Align with string headers
    let hasChords = false;
    for (let c = blockStart; c < blockEnd; c++) {
      const ch = beats[c].chords || '';
      if (ch) hasChords = true;
      chordLine += ch.padEnd(colWidth);
    }
    if (hasChords) {
      ascii += chordLine.trimEnd() + '\n';
    }
    
    // 2. Construct Lyrics annotation line
    let lyricLine = '   ';
    let hasLyrics = false;
    for (let c = blockStart; c < blockEnd; c++) {
      const lyr = beats[c].lyrics || '';
      if (lyr) hasLyrics = true;
      
      let truncated = lyr;
      if (lyr.length > colWidth - 1) {
        truncated = lyr.substring(0, colWidth - 2) + '.';
      }
      lyricLine += truncated.padEnd(colWidth);
    }
    if (hasLyrics) {
      ascii += lyricLine.trimEnd() + '\n';
    }
    
    // 3. Construct String Note lines
    for (let s = 0; s < numStrings; s++) {
      let stringLine = stringHeaders[s];
      
      for (let c = blockStart; c < blockEnd; c++) {
        const beat = beats[c];
        const fret = beat.notes[s];
        
        let cellText = '----';
        if (fret !== null && fret !== undefined) {
          const valStr = String(fret);
          if (valStr.length === 1) {
            cellText = `-${valStr}--`;
          } else if (valStr.length === 2) {
            cellText = `${valStr}--`;
          } else {
            cellText = `${valStr.substring(0,2)}--`;
          }
        }
        
        stringLine += cellText + '-';
      }
      
      stringLine += '|';
      ascii += stringLine + '\n';
    }
    
    ascii += '\n'; // Double spacing between blocks
  }
  
  return ascii;
}

/**
 * Triggers native browser download for the song project state
 * @param {Object} song 
 */
export function downloadJSONProject(song) {
  const cleanSong = {
    title: song.title || 'Untitled Tab',
    artist: song.artist || 'Unknown Artist',
    key: song.key || 'C',
    bpm: song.bpm || 120,
    loop: song.loop || false,
    youtubeUrl: song.youtubeUrl || '',
    activeTrackIndex: song.activeTrackIndex || 0,
    tracks: song.tracks.map(track => ({
      id: track.id || 'track_' + Date.now(),
      name: track.name || 'Guitar 1',
      type: track.type || 'guitar',
      tuningPreset: track.tuningPreset || 'standard',
      tuning: track.tuning || (track.type === 'bass' ? [98.00, 73.42, 55.00, 41.20] : [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]),
      tuningNames: track.tuningNames || (track.type === 'bass' ? ['G', 'D', 'A', 'E'] : ['e', 'B', 'G', 'D', 'A', 'E']),
      beats: track.beats.map(beat => ({
        chords: beat.chords || '',
        lyrics: beat.lyrics || '',
        notes: [...beat.notes],
        duration: beat.duration || 0.25
      }))
    }))
  };
  
  const blob = new Blob([JSON.stringify(cleanSong, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanSong.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_tab.json`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Read and validate JSON upload file
 * @param {File} file 
 * @param {Function} onSuccessCallback 
 */
export function importJSONProject(file, onSuccessCallback) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // Simple validation checks
      if (!data.title) {
        throw new Error('Invalid guitar tab project file schema.');
      }
      
      // Upgrade logic on import
      const song = {
        id: 'song_' + Date.now(),
        title: data.title,
        artist: data.artist || 'Unknown Artist',
        key: data.key || 'C',
        bpm: data.bpm || 120,
        loop: data.loop || false,
        youtubeUrl: data.youtubeUrl || '',
        activeTrackIndex: data.activeTrackIndex !== undefined ? data.activeTrackIndex : 0
      };
      
      if (data.tracks && Array.isArray(data.tracks)) {
        song.tracks = data.tracks.map(track => {
          const type = track.type || 'guitar';
          const numStrings = type === 'bass' ? 4 : 6;
          return {
            id: track.id || 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: track.name || (type === 'bass' ? 'Bass' : 'Guitar'),
            type: type,
            tuningPreset: track.tuningPreset || 'standard',
            tuning: track.tuning || (type === 'bass' ? [98.00, 73.42, 55.00, 41.20] : [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]),
            tuningNames: track.tuningNames || (type === 'bass' ? ['G', 'D', 'A', 'E'] : ['e', 'B', 'G', 'D', 'A', 'E']),
            beats: track.beats.map(beat => ({
              chords: beat.chords || '',
              lyrics: beat.lyrics || '',
              notes: Array.isArray(beat.notes) && beat.notes.length === numStrings ? beat.notes.map(n => n === null ? null : (isNaN(n) ? n : parseInt(n, 10))) : Array(numStrings).fill(null),
              duration: beat.duration || 0.25
            }))
          };
        });
      } else if (data.beats && Array.isArray(data.beats)) {
        // Upgrade legacy single track
        const beats = data.beats.map(beat => ({
          chords: beat.chords || '',
          lyrics: beat.lyrics || '',
          notes: Array.isArray(beat.notes) && beat.notes.length === 6 ? beat.notes.map(n => n === null ? null : (isNaN(n) ? n : parseInt(n, 10))) : Array(6).fill(null),
          duration: beat.duration || 0.25
        }));
        
        song.tracks = [
          {
            id: 'track_' + Date.now(),
            name: 'Guitar 1',
            type: 'guitar',
            tuningPreset: data.tuningPreset || 'standard',
            tuning: data.tuning || [329.63, 246.94, 196.00, 146.83, 110.00, 82.41],
            tuningNames: data.tuningNames || ['e', 'B', 'G', 'D', 'A', 'E'],
            beats: beats
          }
        ];
        song.activeTrackIndex = 0;
      } else {
        throw new Error('Uploaded file does not contain valid tab data tracks or beats.');
      }
      
      onSuccessCallback(song);
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  
  reader.readAsText(file);
}

/**
 * Triggers the browser printer dialogue
 * Before printing, we compile the chord diagram prints for layout top placement.
 * @param {Object} song 
 * @param {Object} chordLibraryRef 
 */
export function printTabSheet(song, chordLibraryRef) {
  const printContainer = document.getElementById('print-chords-container');
  if (printContainer) {
    printContainer.innerHTML = '';
    
    const activeTrack = song.tracks ? song.tracks[song.activeTrackIndex] : song;
    if (!activeTrack) return;
    
    // Find all unique chord shapes in song active track beats
    const used = new Set();
    activeTrack.beats.forEach(beat => {
      if (beat.chords && beat.chords.trim()) {
        used.add(beat.chords.trim());
      }
    });
    
    const tuningNames = activeTrack.tuningNames || (activeTrack.type === 'bass' ? ['G', 'D', 'A', 'E'] : ['e', 'B', 'G', 'D', 'A', 'E']);
    
    // Draw SVG diagrams
    used.forEach(chordName => {
      const chord = chordLibraryRef.get(chordName);
      if (chord) {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.alignItems = 'center';
        
        const label = document.createElement('span');
        label.innerText = chord.name;
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '4px';
        
        const diag = document.createElement('div');
        // Render with isPrinting: true to trigger smaller dots
        diag.innerHTML = renderChordSVG(chord, { width: 80, height: 100, drawName: true, isPrinting: true, tuningNames: tuningNames });
        
        wrap.appendChild(diag);
        printContainer.appendChild(wrap);
      }
    });
  }
  
  // Trigger system print window
  window.print();
}
