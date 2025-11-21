// Game audio only: expose start/stop/toggle music for the inline game page.
(function(){
    let audioCtx = null;
    let masterGain = null;
    let melodyInterval = null;
    let bassInterval = null;
    let isMusicPlaying = false;

    function initAudio(){
        if(audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.06; // low, respectful volume
        masterGain.connect(audioCtx.destination);
    }

    function playNote(freq, dur=0.28, type='sine', gainLevel=0.06){
        try{
            if(!audioCtx) initAudio();
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = type;
            o.frequency.value = freq;
            g.gain.value = 0.0001;
            o.connect(g); g.connect(masterGain);
            const now = audioCtx.currentTime;
            g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainLevel), now + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
            o.start(now);
            o.stop(now + dur + 0.02);
        }catch(e){ /* ignore */ }
    }

    const melody = [440, 523.25, 659.25, 880, 784, 659.25];

    function startMusic(){
        if(isMusicPlaying) return;
        try{ initAudio(); if(audioCtx.state === 'suspended') audioCtx.resume(); }catch(e){}
        let mi = 0;
        melodyInterval = setInterval(()=>{
            const f = melody[mi % melody.length];
            const type = (mi % 2) ? 'triangle' : 'sine';
            playNote(f, 0.35, type, 0.06);
            if(mi % 2 === 0) playNote(f * 1.5, 0.28, 'sine', 0.03);
            mi++;
        }, 380);

        let bi = 0;
        const bassSeq = [110,130.81,98,146.83];
        bassInterval = setInterval(()=>{ playNote(bassSeq[bi % bassSeq.length], 0.18, 'sine', 0.045); bi++; }, 760);

        isMusicPlaying = true;
        const btn = document.getElementById('musicToggle');
        if(btn){ btn.textContent = 'Pause Music'; btn.setAttribute('aria-pressed','true'); }
    }

    function stopMusic(){
        if(melodyInterval){ clearInterval(melodyInterval); melodyInterval = null; }
        if(bassInterval){ clearInterval(bassInterval); bassInterval = null; }
        isMusicPlaying = false;
        const btn = document.getElementById('musicToggle');
        if(btn){ btn.textContent = 'Music'; btn.setAttribute('aria-pressed','false'); }
    }

    function toggleMusic(){ if(isMusicPlaying) stopMusic(); else startMusic(); }

    // expose to page code
    window.startGameMusic = startMusic;
    window.stopGameMusic = stopMusic;
    window.toggleGameMusic = toggleMusic;

    // wire the button if present
    document.addEventListener('DOMContentLoaded', ()=>{
        const btn = document.getElementById('musicToggle');
        if(btn) btn.addEventListener('click', (e)=>{ e.preventDefault(); toggleMusic(); });
    });

})();
