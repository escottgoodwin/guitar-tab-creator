/**
 * LocalStorage management and song list sidebar coordinator
 */

const INDEX_KEY = 'guitar_tab_songs_index';
const SONG_PREFIX = 'guitar_tab_song_';

export class StorageManager {
  constructor(options = {}) {
    this.editor = options.editor;
    this.onLoadSong = options.onLoadSong;
    this.listContainer = document.getElementById('sidebar-song-list');
    this.btnNewSong = document.getElementById('btn-new-song');
    
    this.init();
  }

  init() {
    // 1. Initialise the song index if empty
    let index = this.getIndex();
    if (!index || index.length === 0) {
      // Create a default first song and store it
      const defaultId = 'sample-acoustic-riff';
      const sampleSong = {
        id: defaultId,
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
            tuning: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41],
            tuningNames: ['e', 'B', 'G', 'D', 'A', 'E'],
            beats: this.createSampleBeats()
          }
        ],
        activeTrackIndex: 0
      };
      
      localStorage.setItem(SONG_PREFIX + defaultId, JSON.stringify(sampleSong));
      this.saveIndex([{ id: defaultId, title: sampleSong.title, artist: sampleSong.artist }]);
    }
    
    // 2. Bind UI click event for creating new songs
    if (this.btnNewSong) {
      this.btnNewSong.addEventListener('click', () => {
        this.createNewSong();
      });
    }
  }

  /**
   * Helper to write a default beautiful chord progression for first load!
   * Let's write the first 16 bars of a nice acoustic fingerstyle.
   */
  createSampleBeats() {
    const beats = [];
    const chordsList = ['C', '', '', '', 'Am', '', '', '', 'F', '', 'G', '', 'C', '', '', ''];
    
    // C chord notes pattern (strings: e, B, G, D, A, E)
    // C chord: x 3 2 0 1 0
    const cChord = [0, 1, 0, 2, 3, -1];
    // Am chord: x 0 2 2 1 0
    const amChord = [0, 1, 2, 2, 0, -1];
    // F chord (simplified or full): x 3 3 2 1 1 or 1 3 3 2 1 1
    const fChord = [1, 1, 2, 3, 3, 1];
    // G chord: 3 2 0 0 0 3
    const gChord = [3, 0, 0, 0, 2, 3];
    
    for (let col = 0; col < 32; col++) {
      const beat = {
        chords: '',
        lyrics: '',
        notes: [null, null, null, null, null, null],
        duration: 0.25
      };
      
      // Let's place chords symbols on column boundaries
      if (col % 8 === 0) {
        beat.chords = chordsList[col / 2] || '';
      }
      
      // Let's create a beautiful fingerpicking arpeggio arpeggio!
      const step = col % 8;
      if (col < 8) {
        // C Major Arpeggio
        if (step === 0) beat.notes[4] = 3; // Bass C
        if (step === 1) beat.notes[2] = 0; // G string
        if (step === 2) beat.notes[1] = 1; // B string
        if (step === 3) beat.notes[0] = 0; // High e string
        if (step === 4) beat.notes[2] = 0;
        if (step === 5) beat.notes[1] = 1;
        if (step === 6) beat.notes[3] = 2; // D string (E note)
        if (step === 7) beat.notes[0] = 0;
      } else if (col < 16) {
        // Am Arpeggio
        if (step === 0) beat.notes[4] = 0; // Bass A
        if (step === 1) beat.notes[2] = 2; // G string
        if (step === 2) beat.notes[1] = 1; // B string
        if (step === 3) beat.notes[0] = 0; // High e string
        if (step === 4) beat.notes[2] = 2;
        if (step === 5) beat.notes[1] = 1;
        if (step === 6) beat.notes[3] = 2; // D string
        if (step === 7) beat.notes[0] = 0;
      } else if (col < 24) {
        // F and G half measures
        if (step < 4) {
          // F Major
          if (step === 0) beat.notes[5] = 1; // Bass F
          if (step === 1) beat.notes[3] = 3; // D string
          if (step === 2) beat.notes[2] = 2; // G string
          if (step === 3) beat.notes[1] = 1; // B string
        } else {
          // G Major
          if (step === 4) beat.notes[5] = 3; // Bass G
          if (step === 5) beat.notes[3] = 0; // D string
          if (step === 6) beat.notes[2] = 0; // G string
          if (step === 7) beat.notes[0] = 3; // High e
        }
      } else {
        // C Chord finish strum strum strum
        if (step === 0) {
          // bass note
          beat.notes[4] = 3;
        } else if (step === 2) {
          // Arpeggiate
          beat.notes[4] = 3;
          beat.notes[3] = 2;
          beat.notes[2] = 0;
          beat.notes[1] = 1;
          beat.notes[0] = 0;
        }
      }
      
      // Let's add some lyrics!
      if (col === 0) beat.lyrics = 'Here';
      if (col === 2) beat.lyrics = 'is';
      if (col === 4) beat.lyrics = 'a';
      if (col === 6) beat.lyrics = 'sweet';
      if (col === 8) beat.lyrics = 'guitar';
      if (col === 10) beat.lyrics = 'pluck';
      if (col === 12) beat.lyrics = 'you';
      if (col === 14) beat.lyrics = 'can';
      if (col === 16) beat.lyrics = 'play';
      if (col === 18) beat.lyrics = 'right';
      if (col === 20) beat.lyrics = 'in';
      if (col === 22) beat.lyrics = 'browser';
      if (col === 26) beat.lyrics = 'Enjoy!';
      
      beats.push(beat);
    }
    return beats;
  }

  getIndex() {
    try {
      const idx = localStorage.getItem(INDEX_KEY);
      return idx ? JSON.parse(idx) : [];
    } catch (e) {
      console.error('Error reading index', e);
      return [];
    }
  }

  saveIndex(index) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  }

  /**
   * Save a song to localStorage
   */
  saveSong(song) {
    if (!song.id) {
      // Generate standard ID
      song.id = 'song_' + Date.now();
    }
    
    // Write song details
    localStorage.setItem(SONG_PREFIX + song.id, JSON.stringify(song));
    
    // Update index metadata
    let index = this.getIndex();
    const existing = index.find(item => item.id === song.id);
    
    if (existing) {
      existing.title = song.title || 'Untitled Song';
      existing.artist = song.artist || 'Unknown Artist';
    } else {
      index.push({
        id: song.id,
        title: song.title || 'Untitled Song',
        artist: song.artist || 'Unknown Artist'
      });
    }
    
    this.saveIndex(index);
    this.renderSongList(song.id);
  }

  /**
   * Load a song by ID
   */
  loadSong(id) {
    const raw = localStorage.getItem(SONG_PREFIX + id);
    if (raw) {
      try {
        const song = JSON.parse(raw);
        if (this.onLoadSong) {
          this.onLoadSong(song);
        }
        this.renderSongList(id);
        return song;
      } catch (e) {
        console.error('Failed to parse song', id, e);
      }
    }
    return null;
  }

  /**
   * Delete a song by ID
   */
  deleteSong(id, activeSongId) {
    localStorage.removeItem(SONG_PREFIX + id);
    
    let index = this.getIndex();
    index = index.filter(item => item.id !== id);
    this.saveIndex(index);
    
    // If we deleted the active song, load the first remaining song, or create new
    if (id === activeSongId) {
      if (index.length > 0) {
        this.loadSong(index[0].id);
      } else {
        this.createNewSong();
      }
    } else {
      this.renderSongList(activeSongId);
    }
  }

  /**
   * Create and switch to a blank new song
   */
  createNewSong() {
    const defaultBeats = [];
    for (let i = 0; i < 32; i++) {
      defaultBeats.push({
        chords: '',
        lyrics: '',
        notes: [null, null, null, null, null, null],
        duration: 0.25
      });
    }
    
    const newSong = {
      id: 'song_' + Date.now(),
      title: 'New Guitar Tab',
      artist: 'My Artist',
      key: 'C',
      bpm: 120,
      loop: false,
      youtubeUrl: '',
      tracks: [
        {
          id: 'track_' + Date.now() + '_1',
          name: 'Guitar 1',
          type: 'guitar',
          tuningPreset: 'standard',
          tuning: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41],
          tuningNames: ['e', 'B', 'G', 'D', 'A', 'E'],
          beats: defaultBeats
        }
      ],
      activeTrackIndex: 0
    };
    
    this.saveSong(newSong);
    this.loadSong(newSong.id);
  }

  /**
   * Re-draw the left sidebar lists of saved songs
   */
  renderSongList(activeId) {
    if (!this.listContainer) return;
    this.listContainer.innerHTML = '';
    
    const index = this.getIndex();
    if (index.length === 0) {
      this.listContainer.innerHTML = '<span style="color: var(--color-text-muted); font-size: 0.85rem; padding: 12px;">No saved songs yet.</span>';
      return;
    }
    
    index.forEach(item => {
      const li = document.createElement('div');
      li.className = 'song-list-item';
      if (item.id === activeId) {
        li.classList.add('active');
      }
      
      const info = document.createElement('div');
      info.className = 'song-item-info';
      
      const title = document.createElement('span');
      title.className = 'song-item-title';
      title.innerText = item.title;
      
      const artist = document.createElement('span');
      artist.className = 'song-item-artist';
      artist.innerText = item.artist;
      
      info.appendChild(title);
      info.appendChild(artist);
      li.appendChild(info);
      
      // Actions wrapper (delete trash button)
      const actions = document.createElement('div');
      actions.className = 'song-item-actions';
      
      const btnDel = document.createElement('button');
      btnDel.className = 'btn btn-icon btn-danger';
      btnDel.style.padding = '4px 8px';
      btnDel.style.fontSize = '11px';
      btnDel.title = 'Delete song';
      btnDel.innerHTML = '🗑';
      
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering loading parent song
        if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
          this.deleteSong(item.id, activeId);
        }
      });
      
      actions.appendChild(btnDel);
      li.appendChild(actions);
      
      // Click list item: Load song
      li.addEventListener('click', () => {
        this.loadSong(item.id);
      });
      
      this.listContainer.appendChild(li);
    });
  }
}
