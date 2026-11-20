/**
 * Fuente con cobertura Unicode para los PDF (jsPDF y sus fuentes estandar son
 * Latin-1 y descartan la enye, las tildes y el guion largo).
 *
 * La fuente se descarga una vez y se cachea en base64; si falla, el PDF se
 * genera con la fuente por defecto (sin acentos) en vez de romperse.
 */
const URL_FUENTE = '/v1/fonts/Roboto-Regular.ttf';
let cacheBase64 = null;

async function cargarFuenteBase64() {
    if (cacheBase64) return cacheBase64;
    const res = await fetch(URL_FUENTE);
    if (!res.ok) {
        throw new Error('no se pudo descargar la fuente: ' + res.status);
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    cacheBase64 = btoa(bin);
    return cacheBase64;
}

export async function aplicarFuenteUnicode(doc) {
    try {
        const base64 = await cargarFuenteBase64();
        doc.addFileToVFS('Roboto-Regular.ttf', base64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto', 'normal');
        return true;
    } catch (e) {
        console.warn('No se pudo cargar la fuente Unicode, el PDF usara la fuente estandar', e);
        return false;
    }
}
