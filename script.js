const scriptURL = 'https://script.google.com/macros/s/AKfycby4FP8xMqfzXEj2-feuMV1mU0efNc8rasNtzzJl3Cw3ItGzh90bhjsslwPAH7HJqqQe/exec'; // ganti dengan milik Anda

// ---------- VALIDASI NOMOR TELEPON INDONESIA ----------
const notelp = document.getElementById('notelp');
const errorBox = document.getElementById('notelpError');

function validTel(val) {
  // pola umum: 081x, 082x, ..., 089x, 08x minimal 10 digit, maks 13
  return /^08\d{8,11}$/.test(val);
}

notelp.addEventListener('input', () => {
  const val = notelp.value.trim();
  if (val && !validTel(val)) {
    errorBox.style.display = 'block';
  } else {
    errorBox.style.display = 'none';
  }
});

// ---------- CEK NO TELP ----------
document.getElementById('cekNotelpBtn').addEventListener('click', () => {
  const val = notelp.value.trim();
  if (!val) { alert('Masukkan nomor telepon dulu.'); return; }
  if (!validTel(val)) { errorBox.style.display = 'block'; return; }

  fetch(`${scriptURL}?notelp=${val}`)
    .then(r => r.json())
    .then(data => {
      const dataBox = document.getElementById('dataBox');
      const already = document.getElementById('alreadyDone');
      const submitBtn = document.getElementById('submitBtn');

      if (data.found) {
        // isi data
        document.getElementById('nama').value = data.nama || '';
        document.getElementById('instansi').value = data.instansi || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('nik').value = data.nik || '';
        document.getElementById('profesi').value = data.profesi || '';
        document.getElementById('keterangan').value = data.keterangan || '';

        if (data.keterangan && data.keterangan.toLowerCase().includes('telah terima symposium kit')) {
          // sudah pernah registrasi ulang
          already.classList.remove('hidden');
          dataBox.classList.add('hidden');
          submitBtn.classList.add('hidden');
        } else {
          // boleh lanjut
          already.classList.add('hidden');
          dataBox.classList.remove('hidden');
          submitBtn.classList.remove('hidden');
        }
      } else {
        alert('Data tidak ditemukan, silakan isi lengkap.');
        already.classList.add('hidden');
        dataBox.classList.remove('hidden');
        submitBtn.classList.remove('hidden');
        // kosongkan field
        ['nama','instansi','email','nik','profesi','keterangan']
          .forEach(id => document.getElementById(id).value = '');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Gagal cek nomor telepon.');
    });
});

// ---------- SUBMIT ----------
document.getElementById('formRegistrasi').addEventListener('submit', function (e) {
  e.preventDefault();

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

  const payload = new FormData(this);
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
});

// ---------- REFRESH ----------
document.getElementById('btnInputKembali').addEventListener('click', () => location.reload());