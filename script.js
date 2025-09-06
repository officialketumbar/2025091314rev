const scriptURL = 'https://script.google.com/macros/s/AKfycbxVFjOG6KQ3ya--uQ5FMRxfLUcVo9U5NB4ls6i3U3hM2HLHQDvEOuYN3FMwfOWVk00rzQ/exec'; // GANTI DG URL ANDA

/* ---------- VALIDASI NOTELP ---------- */
const notelp = document.getElementById('notelp');
const notelpError = document.getElementById('notelpError');

function cekNoTelp() {
  const val = notelp.value.trim();
  if (val.length === 0) {
    notelpError.style.display = 'none';
    return;
  }
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

/* ---------- CEK NOTELP (UTAMA) ---------- */
function cekNoTelp() {            // eslint-disable-line no-func-assign
  const notelpVal = notelp.value.trim();
  if (!notelpVal) { 
    alert('Masukkan No Telp dulu.'); 
    return; 
  }

  fetch(`${scriptURL}?notelp=${notelpVal}`)
    .then(r => r.json())
    .then(data => {
      const box   = document.getElementById('dataLama');
      const regBox= document.getElementById('telahRegistrasi');
      const submit= document.getElementById('submitBtn');

      if (data.found) {
        box.style.display = 'block';
        document.getElementById('nama').value     = data.nama;
        document.getElementById('instansi').value = data.instansi;
        document.getElementById('email').value    = data.email;
        document.getElementById('nik').value      = data.nik;
        document.getElementById('profesi').value  = data.profesi;
        document.getElementById('keterangan').value= data.keterangan;

        if (data.keterangan === 'Telah Terima Symposium Kit (E-Toll)') {
          regBox.style.display = 'block';
          submit.disabled = true;
          submit.style.background = '#ccc';
          submit.style.cursor = 'not-allowed';
        } else {
          regBox.style.display = 'none';
          submit.disabled = false;
          submit.style.background = '';
          submit.style.cursor = '';
        }
      } else {
        box.style.display   = 'none';
        regBox.style.display= 'none';
        submit.disabled     = false;
        submit.style.background = '';
        submit.style.cursor = '';
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
  const bar  = document.getElementById('progressBar');
  const msg  = document.getElementById('msgSukses');
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

/* ---------- REFRESH ---------- */
document.getElementById('btnInputKembali').addEventListener('click', () => {
  location.reload();
});

/* >>> SCAN KTP & TESSERACT SAMA SEKALI DIHAPUS <<< */
