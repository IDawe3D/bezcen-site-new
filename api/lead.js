export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ ok: false, error: "Telegram is not configured" });
    }

    const body = req.body || {};
    const name = String(body.name || "не указано").trim();
    const phone = String(body.phone || "").trim();
    const comment = String(body.comment || "").trim();
    const service = String(body.service || "").trim();
    const page = String(body.page || "").trim();

    if (!phone) {
      return res.status(400).json({ ok: false, error: "Введите номер телефона" });
    }

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[m]));
    }

    const text =
      `<b>Заявка с сайта — Бесценная стоматология</b>\n` +
      `<b>Имя:</b> ${escapeHTML(name)}\n` +
      `<b>Телефон:</b> ${escapeHTML(phone)}\n` +
      (service ? `<b>Услуга:</b> ${escapeHTML(service)}\n` : "") +
      `<b>Комментарий:</b> ${escapeHTML(comment || "—")}\n` +
      `<b>Страница:</b> ${escapeHTML(page || "—")}\n` +
      `<b>Время:</b> ${escapeHTML(new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }))}`;

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const data = await tg.json().catch(() => null);

    if (!tg.ok || !data || data.ok !== true) {
      return res.status(500).json({
        ok: false,
        error: data && data.description ? data.description : "Telegram error"
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}

