/**
 * Colors per school level, taken from the national school uniforms:
 * MI red (merah-putih), MTs navy (biru-putih), MA grey (abu-abu-putih).
 */
export const jenjangStyles = {
    mi: {
        solid: 'bg-mi text-white',
        soft: 'bg-mi/10 text-mi ring-mi/25',
        text: 'text-mi',
        border: 'border-mi',
        bar: 'bg-mi',
        tagline: 'Untuk anak usia 6–7 tahun',
    },
    mts: {
        solid: 'bg-mts text-white',
        soft: 'bg-mts/10 text-mts ring-mts/25',
        text: 'text-mts',
        border: 'border-mts',
        bar: 'bg-mts',
        tagline: 'Untuk lulusan SD/MI',
    },
    ma: {
        solid: 'bg-ma text-white',
        soft: 'bg-ma/10 text-ma ring-ma/25',
        text: 'text-ma',
        border: 'border-ma',
        bar: 'bg-ma',
        tagline: 'Untuk lulusan SMP/MTs',
    },
}

/** Accepts a value ("mts") or a short label ("MTs"). */
export function jenjangStyle(jenjang) {
    return jenjangStyles[String(jenjang ?? '').toLowerCase()] ?? jenjangStyles.ma
}
