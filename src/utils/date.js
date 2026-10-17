// <input type="datetime-local"> menghasilkan "2026-10-20T23:59" (waktu lokal).
// Kita simpan sebagai ISO string (UTC) supaya perbandingan waktu konsisten.

export function localInputToISO(value) {
  return new Date(value).toISOString()
}

// Kebalikannya: ISO string -> format yang diterima input datetime-local.
export function isoToLocalInput(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime())
}

export function formatDeadline(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Selisih milidetik -> teks, mis. "2 hari 5 jam lagi" atau "terlambat 3 jam 10 menit".
export function formatRemaining(ms) {
  const late = ms < 0
  const totalMinutes = Math.floor(Math.abs(ms) / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  let text
  if (days > 0) text = `${days} hari ${hours} jam`
  else if (hours > 0) text = `${hours} jam ${minutes} menit`
  else text = `${minutes} menit`

  return late ? `terlambat ${text}` : `${text} lagi`
}