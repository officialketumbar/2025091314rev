const scriptURL = 'https://script.google.com/macros/s/AKfycbxVFjOG6KQ3ya--uQ5FMRxfLUcVo9U5NB4ls6i3U3hM2HLHQDvEOuYN3FMwfOWVk00rzQ/exec'; // GANTI DENGAN URL ANDA

/* ---------- VALIDASI NOTELP ---------- */
const notelp = document.getElementById('notelp');
const notelpError = document.getElementById('notelpError');

function cekNoTelp() {
  const val = notelp.value.trim();
  if (val.length === 0) {
    notelpError.style.display = 'none';
    return;
  }
  // Validasi format nomor telepon Indonesia
  if (!/^[0-9]{10,15}$/.test(val)) {
    notelpError.style.display = 'block';
  } else {
    notelpError.style.display = 'none';
  }
}
notelp.addEventListener('input', cekNoTelp);

/* ---------- VALIDASI NIK ---------- */
const nik = document.getElementById('nik');
const nikError = document.getElementById('nikError');

function cekNik() {
  const val = nik.value.trim();
  if (val.length === 0) {
    nikError.style.display = 'none';
    return;
  }
  if (!/^\d{16}$/.test(val)) {
    nikError.style.display = 'block';
  } else {
    nikError.style.display = 'none';
  }
}
nik.addEventListener('input', cekNik);

document.querySelector('form')?.addEventListener('submit', e => {
  if (!/^\d{16}$/.test(nik.value.trim())) {
    e.preventDefault();
    nik.focus();
    cekNik();
  }
});

/* ---------- CEK NOTELP ---------- */
function cekNoTelp() {
  const notelpVal = notelp.value.trim();
  if (!notelpVal) { 
    alert('Masukkan No Telp dulu.'); 
    return; 
  }

  fetch(`${scriptURL}?notelp=${notelpVal}`)
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById('dataLama');
      const registrasiBox = document.getElementById('telahRegistrasi');
      const form = document.getElementById('formRegistrasi');
      const submitBtn = document.getElementById('submitBtn');
      
      if (data.found) {
        box.style.display = 'block';
        document.getElementById('nama').value = data.nama;
        document.getElementById('instansi').value = data.instansi;
        document.getElementById('email').value = data.email;
        document.getElementById('nik').value = data.nik;
        document.getElementById('notelp').value = data.notelp;
        document.getElementById('profesi').value = data.profesi;
        document.getElementById('keterangan').value = data.keterangan;
        
        // Cek jika sudah terima kit
        if (data.keterangan === 'Telah Terima Symposium Kit (E-Toll)') {
          registrasiBox.style.display = 'block';
          submitBtn.disabled = true;
          submitBtn.style.background = '#ccc';
          submitBtn.style.cursor = 'not-allowed';
        } else {
          registrasiBox.style.display = 'none';
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          submitBtn.style.cursor = '';
        }
      } else {
        box.style.display = 'none';
        registrasiBox.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.style.cursor = '';
        alert('Data tidak ditemukan, silakan isi lengkap.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Gagal cek No Telp.');
    });
}

/* ---------- SUBMIT ---------- */
document.getElementById('formRegistrasi').addEventListener('submit', function (e) {
  e.preventDefault();

  // Cek apakah sudah terima kit
  const keterangan = document.getElementById('keterangan').value;
  if (keterangan === 'Telah Terima Symposium Kit (E-Toll)') {
    const notelpVal = notelp.value.trim();
    fetch(`${scriptURL}?notelp=${notelpVal}`)
      .then(r => r.json())
      .then(data => {
        if (data.found && data.keterangan === 'Telah Terima Symposium Kit (E-Toll)') {
          alert('TIDAK DAPAT REGISTRASI ULANG - Sudah menerima Symposium Kit');
          return;
        }
        prosesSubmit();
      });
  } else {
    prosesSubmit();
  }
});

function prosesSubmit() {
  const wrap = document.getElementById('progressWrap');
  const bar = document.getElementById('progressBar');
  const msg = document.getElementById('msgSukses');
  wrap.style.display = 'block';
  bar.style.width = '0%';

  let w = 0;
  const t = setInterval(() => {
    w += 3; bar.style.width = w + '%';
    if (w >= 90) clearInterval(t);
  }, 30);

  const payload = new FormData(document.getElementById('formRegistrasi'));
  fetch(scriptURL, { method: 'POST', body: payload })
    .then(r => r.text())
    .then(() => {
      clearInterval(t);
      bar.style.width = '100%';
      setTimeout(() => {
        wrap.style.display = 'none';
        msg.style.display = 'block';
      }, 300);
    })
    .catch(() => {
      clearInterval(t);
      wrap.style.display = 'none';
      alert('Gagal menyimpan.');
    });
}

/* ---------- INPUT KEMBALI ---------- */
document.getElementById('btnInputKembali').addEventListener('click', () => {
  location.reload();
});

/* ---------- SCAN KTP ---------- */
document.getElementById('scanNikBtn').addEventListener('click', async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Browser tidak support kamera.\nGunakan Chrome/Safari dan pastikan HTTPS.');
    return;
  }
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    alert('Scan KTP hanya berjalan di HTTPS atau localhost.');
    return;
  }

  if (!window.Tesseract) {
    await import('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: 'environment' } }
    });
  } catch {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
  }

  const video = document.createElement('video');
  video.srcObject = stream;
  video.playsInline = true;
  video.play();

  const snapBtn = document.createElement('button');
  snapBtn.textContent = '📸 Ambil Foto';
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: '#000', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
  });
  wrap.append(video, snapBtn);
  document.body.append(wrap);

  snapBtn.onclick = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maxW = 640;
    const scale = maxW / video.videoWidth;
    canvas.width = maxW;
    canvas.height = video.videoHeight * scale;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach(t => t.stop());
    wrap.remove();

    Tesseract.recognize(canvas, 'ind', {
      tessedit_char_whitelist: '0123456789',
      logger: () => {}
    }).then(({ data: { text } }) => {
      const m = text.replace(/\D/g, '').match(/\d{15,17}/);
      if (m) {
        const nik = m[0].slice(-16);
        document.getElementById('nik').value = nik;
        document.getElementById('nama').focus();
      } else {
        alert('Scan ulang…');
        document.getElementById('scanNikBtn').click();
      }
    }).catch(err => alert('OCR gagal: ' + err));
  };
});
