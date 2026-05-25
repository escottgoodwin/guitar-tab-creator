/**
 * AeroTab Application Coordinator
 * Links the Tab Editor grid, Audio Synthesizer, Chord Library, and Storage.
 */
import { TabEditor } from './tabEditor.js';
import { audioEngine } from './audioEngine.js';
import { initChordUI, chordLibrary } from './chordDiagram.js';
import { StorageManager } from './storage.js';
import { exportToASCII, downloadJSONProject, importJSONProject, printTabSheet } from './exporter.js';

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Instantiate the Core Tab Editor
  const editor = new TabEditor({
    containerId: 'tab-grid-editor',
    
    // Auto-save song when editor changes notes, columns, or text
    onSongChange: (song) => {
      if (storage) {
        storage.saveSong(song);
      }
    },
    
    // Redraw used chords panel
    onUsedChordsChange: (usedChords) => {
      if (chordController) {
        chordController.renderSongChords(usedChords);
      }
    }
  });

  // 2. Instantiate Chord UI controller
  // Exposes chord insertion capabilities to the tab editor
  const chordController = initChordUI({
    insertChordIntoTab: (chordName) => {
      editor.insertChordIntoTab(chordName, chordLibrary);
    },
    removeChordFromSong: (chordName) => {
      editor.removeChordFromSong(chordName);
    },
    refreshUsedChords: () => {
      editor.refreshUsedChords();
    },
    getTuningNames: () => {
      return editor.getTuningNames();
    },
    getTuningPresetName: () => {
      return editor.getTuningPresetName();
    }
  });

  // 3. Instantiate LocalStorage Manager
  // Wires loading hooks to populate UI input elements
  const storage = new StorageManager({
    editor: editor,
    onLoadSong: (song) => {
      editor.loadSong(song);
      
      // Update UI Input Values
      document.getElementById('song-title').value = song.title || '';
      document.getElementById('song-artist').value = song.artist || '';
      document.getElementById('song-key').value = song.key || '';
      
      // Sync track-specific components
      syncTuningDropdown(editor);
      renderTrackTabs(editor, song);
      
      // Restore YouTube Url Backing
      const ytInput = document.getElementById('youtube-url-input');
      if (ytInput) ytInput.value = song.youtubeUrl || '';
      loadYouTubeIframe(song.youtubeUrl);
      
      const bpmSlider = document.getElementById('tempo-slider');
      bpmSlider.value = song.bpm || 100;
      document.getElementById('tempo-value').innerText = song.bpm || 100;
      audioEngine.setBpm(song.bpm || 100);
      
      // Stop any existing playback on song swap
      audioEngine.stop();
    }
  });

  // 4. Load the initially active song from storage index
  const savedIndex = storage.getIndex();
  if (savedIndex.length > 0) {
    storage.loadSong(savedIndex[0].id);
  } else {
    editor.loadDefaultSong();
  }

  // 5. Dynamic Track switcher tabs rendering
  function renderTrackTabs(editor, song) {
    const tabsContainer = document.getElementById('track-tabs-container');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';
    
    song.tracks.forEach((track, index) => {
      const tab = document.createElement('button');
      tab.className = 'track-tab-btn';
      if (index === song.activeTrackIndex) {
        tab.classList.add('active');
      }
      
      const nameSpan = document.createElement('span');
      nameSpan.innerText = track.name;
      tab.appendChild(nameSpan);
      
      // Double-click to rename track
      tab.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const newName = prompt(`Rename track "${track.name}" to:`, track.name);
        if (newName && newName.trim() !== '') {
          editor.renameTrack(index, newName);
          renderTrackTabs(editor, editor.getSongData());
        }
      });
      
      // Tab click to select track
      tab.addEventListener('click', () => {
        editor.switchTrack(index);
        syncTuningDropdown(editor);
        renderTrackTabs(editor, editor.getSongData());
      });
      
      // Delete track button (hide if only one remains)
      if (song.tracks.length > 1) {
        const delBtn = document.createElement('button');
        delBtn.className = 'track-tab-delete-btn';
        delBtn.innerHTML = '&times;';
        delBtn.title = 'Delete track';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete track "${track.name}"?`)) {
            editor.deleteTrack(index);
            syncTuningDropdown(editor);
            renderTrackTabs(editor, editor.getSongData());
          }
        });
        tab.appendChild(delBtn);
      }
      
      tabsContainer.appendChild(tab);
    });
  }

  // Sync tuning dropdown options when active track changes
  function syncTuningDropdown(editor) {
    const activeTrack = editor.getActiveTrack();
    const tuningSelect = document.getElementById('tuning-select');
    if (!tuningSelect || !activeTrack) return;
    
    tuningSelect.innerHTML = '';
    
    if (activeTrack.type === 'bass') {
      tuningSelect.innerHTML = `
        <option value="standard">Standard (GDAE)</option>
        <option value="drop_d">Drop D (GDAD)</option>
        <option value="half_down">Half Down</option>
      `;
    } else {
      tuningSelect.innerHTML = `
        <option value="standard">Standard (EADGBE)</option>
        <option value="drop_d">Drop D (DADGBE)</option>
        <option value="dadgad">DADGAD</option>
        <option value="open_g">Open G (DGDGBD)</option>
        <option value="open_d">Open D (DADF#AD)</option>
        <option value="half_down">Half Down</option>
      `;
    }
    
    tuningSelect.value = activeTrack.tuningPreset || 'standard';
  }

  // 6. YouTube Backing Track Loading
  function loadYouTubeIframe(url) {
    const container = document.getElementById('youtube-player-container');
    if (!container) return;
    
    if (!url || !url.trim()) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }
    
    const videoId = parseYouTubeId(url);
    if (videoId) {
      container.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
      container.style.display = 'block';
    } else {
      container.innerHTML = '<div style="color: var(--accent-ruby); font-size: 0.8rem; padding: 10px; text-align: center;">Invalid YouTube link</div>';
      container.style.display = 'block';
    }
  }

  function parseYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  const youtubeUrlInput = document.getElementById('youtube-url-input');
  const btnLoadYoutube = document.getElementById('btn-load-youtube');
  
  if (btnLoadYoutube && youtubeUrlInput) {
    btnLoadYoutube.addEventListener('click', () => {
      const url = youtubeUrlInput.value.trim();
      const song = editor.getSongData();
      song.youtubeUrl = url;
      loadYouTubeIframe(url);
      editor.triggerSave(); // Commit URL parameter
    });
  }

  // 7. Add Track Modal setup
  const addTrackModal = document.getElementById('add-track-modal');
  const newTrackNameInput = document.getElementById('new-track-name');
  const newTrackTypeSelect = document.getElementById('new-track-type');
  const newTrackTuningSelect = document.getElementById('new-track-tuning');
  const btnAddTrack = document.getElementById('btn-add-track');
  const btnCloseAddTrack = document.getElementById('btn-close-add-track');
  const btnCloseAddTrackCancel = document.getElementById('btn-close-add-track-cancel');
  const btnCreateTrackConfirm = document.getElementById('btn-create-track-confirm');

  function updateAddTrackTuningOptions(type) {
    if (!newTrackTuningSelect) return;
    newTrackTuningSelect.innerHTML = '';
    if (type === 'bass') {
      newTrackTuningSelect.innerHTML = `
        <option value="standard">Standard (GDAE)</option>
        <option value="drop_d">Drop D (GDAD)</option>
        <option value="half_down">Half Down</option>
      `;
    } else {
      newTrackTuningSelect.innerHTML = `
        <option value="standard">Standard (EADGBE)</option>
        <option value="drop_d">Drop D (DADGBE)</option>
        <option value="half_down">Half Down</option>
      `;
    }
  }

  if (btnAddTrack) {
    btnAddTrack.addEventListener('click', () => {
      newTrackNameInput.value = '';
      newTrackTypeSelect.value = 'guitar';
      updateAddTrackTuningOptions('guitar');
      addTrackModal.classList.add('active');
    });
  }

  const closeTrackModal = () => {
    addTrackModal.classList.remove('active');
  };

  if (btnCloseAddTrack) btnCloseAddTrack.addEventListener('click', closeTrackModal);
  if (btnCloseAddTrackCancel) btnCloseAddTrackCancel.addEventListener('click', closeTrackModal);

  if (newTrackTypeSelect) {
    newTrackTypeSelect.addEventListener('change', (e) => {
      updateAddTrackTuningOptions(e.target.value);
    });
  }

  if (btnCreateTrackConfirm) {
    btnCreateTrackConfirm.addEventListener('click', () => {
      const name = newTrackNameInput.value.trim();
      const type = newTrackTypeSelect.value;
      const tuning = newTrackTuningSelect.value;
      
      editor.addNewTrack(name, type, tuning);
      syncTuningDropdown(editor);
      renderTrackTabs(editor, editor.getSongData());
      closeTrackModal();
    });
  }

  // 8. Wire Song Metadata text input listeners
  const inputTitle = document.getElementById('song-title');
  const inputArtist = document.getElementById('song-artist');
  const inputKey = document.getElementById('song-key');

  const updateMetadata = () => {
    const song = editor.getSongData();
    song.title = inputTitle.value.trim() || 'Untitled Song';
    song.artist = inputArtist.value.trim() || 'Unknown Artist';
    song.key = inputKey.value.trim() || 'C';
    
    // Save project
    storage.saveSong(song);
    
    // Re-render sidebar listing to match title changes
    storage.renderSongList(song.id);
  };

  inputTitle.addEventListener('input', updateMetadata);
  inputArtist.addEventListener('input', updateMetadata);
  inputKey.addEventListener('input', updateMetadata);

  const tuningSelect = document.getElementById('tuning-select');
  tuningSelect.addEventListener('change', (e) => {
    const preset = e.target.value;
    editor.setTuningPreset(preset);
    // Refresh chord SVGs since tuning string labels change
    chordController.renderLibrary();
    editor.refreshUsedChords();
  });

  // 9. Playback controls listeners
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnStop = document.getElementById('btn-stop');
  const tempoSlider = document.getElementById('tempo-slider');
  const tempoValue = document.getElementById('tempo-value');
  const btnLoop = document.getElementById('btn-loop');
  const btnSynthToggle = document.getElementById('btn-synth-toggle');

  const togglePlayback = () => {
    if (audioEngine.isPlaying) {
      audioEngine.stop();
    } else {
      btnPlayPause.innerText = 'Pause';
      btnPlayPause.classList.add('btn-active');
      
      const song = editor.getSongData();
      // Start playback from current cursor column index
      const startCol = editor.cursor.col;
      
      audioEngine.start(
        song,
        startCol,
        (beatIndex) => {
          editor.highlightPlayingColumn(beatIndex);
        },
        () => {
          // Stopped callback
          btnPlayPause.innerText = 'Play';
          btnPlayPause.classList.remove('btn-active');
          editor.highlightPlayingColumn(null);
        }
      );
    }
  };

  btnPlayPause.addEventListener('click', togglePlayback);

  btnStop.addEventListener('click', () => {
    audioEngine.stop();
  });

  tempoSlider.addEventListener('input', (e) => {
    const bpm = parseInt(e.target.value, 10);
    tempoValue.innerText = bpm;
    audioEngine.setBpm(bpm);
    
    const song = editor.getSongData();
    song.bpm = bpm;
    storage.saveSong(song);
  });

  btnLoop.addEventListener('click', () => {
    const song = editor.getSongData();
    song.loop = !song.loop;
    btnLoop.innerText = song.loop ? 'Loop On' : 'Loop Off';
    if (song.loop) {
      btnLoop.classList.add('btn-active');
    } else {
      btnLoop.classList.remove('btn-active');
    }
    
    // Update active engine state
    audioEngine.songData.loop = song.loop;
    storage.saveSong(song);
  });

  btnSynthToggle.addEventListener('click', () => {
    const curStyle = audioEngine.synthStyle;
    const newStyle = curStyle === 'acoustic' ? 'electric' : 'acoustic';
    audioEngine.setSynthStyle(newStyle);
    
    btnSynthToggle.innerText = newStyle.charAt(0).toUpperCase() + newStyle.slice(1);
    if (newStyle === 'electric') {
      btnSynthToggle.style.borderColor = 'var(--accent-indigo)';
      btnSynthToggle.style.color = 'var(--accent-indigo)';
    } else {
      btnSynthToggle.style.borderColor = 'var(--accent-cyan)';
      btnSynthToggle.style.color = 'var(--accent-cyan)';
    }
  });

  // 10. Grid Manipulation buttons listeners
  document.getElementById('btn-insert-col').addEventListener('click', () => {
    editor.insertColumn(editor.cursor.col);
  });

  document.getElementById('btn-delete-col').addEventListener('click', () => {
    editor.deleteColumn(editor.cursor.col);
  });

  document.getElementById('btn-append-measure').addEventListener('click', () => {
    editor.appendColumns(8);
  });

  // 11. Exporters listeners & modals
  const modalAscii = document.getElementById('ascii-export-modal');
  const txtAscii = document.getElementById('ascii-export-text');
  const btnCloseAscii = document.getElementById('btn-close-ascii-modal');
  const btnCopyAscii = document.getElementById('btn-copy-ascii');

  document.getElementById('btn-export-ascii').addEventListener('click', () => {
    const song = editor.getSongData();
    const asciiText = exportToASCII(song);
    txtAscii.value = asciiText;
    modalAscii.classList.add('active');
  });

  btnCloseAscii.addEventListener('click', () => {
    modalAscii.classList.remove('active');
  });

  btnCopyAscii.addEventListener('click', () => {
    txtAscii.select();
    navigator.clipboard.writeText(txtAscii.value)
      .then(() => {
        btnCopyAscii.innerText = 'Copied!';
        btnCopyAscii.style.background = 'var(--accent-emerald)';
        setTimeout(() => {
          btnCopyAscii.innerText = 'Copy to Clipboard';
          btnCopyAscii.style.background = 'var(--gradient-accent)';
        }, 1500);
      })
      .catch(err => {
        console.error('Failed to copy', err);
      });
  });

  // File system project export/import
  document.getElementById('btn-save-json').addEventListener('click', () => {
    const song = editor.getSongData();
    downloadJSONProject(song);
  });

  const fileInput = document.getElementById('file-import-input');
  document.getElementById('btn-load-json').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importJSONProject(file, (importedSong) => {
        storage.saveSong(importedSong);
        storage.loadSong(importedSong.id);
        fileInput.value = ''; // Reset input
      });
    }
  });

  // PDF Printing dialogue
  document.getElementById('btn-print-pdf').addEventListener('click', () => {
    const song = editor.getSongData();
    printTabSheet(song, chordLibrary);
  });

  // 12. Keyboard Event Capture: Document global hooks
  window.addEventListener('keydown', (e) => {
    // Spacebar toggles play/pause when NOT inside text inputs
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      togglePlayback();
    } else {
      // Forward other keys directly to TabEditor layout
      editor.handleKeyDown(e);
    }
  });
});
