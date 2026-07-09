const { Resend } = require('resend');

const LIVE_EMAIL = 'danielcalzonelive@gmail.com';
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'danielfcalzone@gmail.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'Sito Daniel Khelz <onboarding@resend.dev>';

const SERVICE_LABELS = {
    violista: 'Violista',
    dj: 'DJ',
    producer: 'Producer',
    stage_manager: 'Stage Manager',
    tecnico_suono: 'Tecnico del suono'
};

const EVENT_LABELS = {
    concerto: 'Concerto',
    evento_privato: 'Evento privato',
    festival: 'Festival',
    registrazione: 'Registrazione in studio',
    corporate: 'Evento corporate',
    altro: 'Altro'
};

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

module.exports = async (req, res) => {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metodo non consentito' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return res.status(503).json({
            error: 'Servizio email non configurato. Contatta il titolare del sito.'
        });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

        if (body._gotcha) {
            return res.status(200).json({ success: true });
        }

        const nome = (body.nome || '').trim();
        const email = (body.email || '').trim();
        const telefono = (body.telefono || '').trim();
        const tipoEvento = (body.tipo_evento || '').trim();
        const dataEvento = (body.data_evento || '').trim();
        const luogo = (body.luogo || '').trim();
        const messaggio = (body.messaggio || '').trim();
        const servizi = Array.isArray(body.servizi) ? body.servizi : [];

        if (!nome || nome.length < 2) {
            return res.status(400).json({ error: 'Inserisci il tuo nome.' });
        }

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: 'Inserisci un indirizzo email valido.' });
        }

        if (!servizi.length) {
            return res.status(400).json({ error: 'Seleziona almeno un servizio richiesto.' });
        }

        if (!messaggio || messaggio.length < 10) {
            return res.status(400).json({ error: 'Il messaggio deve contenere almeno 10 caratteri.' });
        }

        if (!body.privacy) {
            return res.status(400).json({ error: 'Devi accettare l\'informativa privacy.' });
        }

        const serviziLabel = servizi
            .map((key) => SERVICE_LABELS[key] || key)
            .join(', ');

        const eventoLabel = EVENT_LABELS[tipoEvento] || tipoEvento || 'Non specificato';

        const html = `
            <h2>Nuova richiesta preventivo — Daniel Khelz</h2>
            <p style="color:#555;font-size:14px;">Richiesta eventi/live · ${escapeHtml(LIVE_EMAIL)}</p>
            <table style="border-collapse:collapse;width:100%;max-width:600px;">
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Nome</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(nome)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(email)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Telefono</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(telefono || '—')}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Servizi</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(serviziLabel)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Tipo evento</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(eventoLabel)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Data evento</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(dataEvento || '—')}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Luogo</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(luogo || '—')}</td></tr>
            </table>
            <h3>Messaggio</h3>
            <p style="white-space:pre-wrap;">${escapeHtml(messaggio)}</p>
        `;

        const resend = new Resend(apiKey);
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [TO_EMAIL],
            replyTo: email,
            subject: `Preventivo evento — ${nome}`,
            html
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: 'Invio non riuscito. Riprova più tardi.' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Contact API error:', err);
        return res.status(500).json({ error: 'Errore del server. Riprova più tardi.' });
    }
};