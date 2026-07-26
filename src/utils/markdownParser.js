// ─── MARKDOWN PARSER ─────────────────────────────────────────────────────────
// Parser Markdown maison, sans dépendance externe.
// Supporte : titres, gras, italique, inline code, blocs de code avec lang,
//            blockquotes, listes ordonnées/non-ordonnées, tableaux,
//            checkboxes, séparateurs, paragraphes et liens.

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#00E5CC;text-decoration:none;border-bottom:1px solid #00E5CC40;">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:#0F172A;border:1px solid #1E293B;border-radius:4px;padding:1px 6px;font-family:monospace;font-size:0.88em;color:#00E5CC;">$1</code>');
}

function makeId(text) {
  return text
    .toLowerCase()
    .replace(/`[^`]*`/g, "")
    .replace(/[^a-z0-9\s\u00C0-\u024F\-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split("\n");
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (m) {
      const text = m[2].trim();
      headings.push({ level: m[1].length, text, id: makeId(text) });
    }
  }
  return headings;
}

export function parseMarkdown(markdown) {
  const lines = markdown.split("\n");
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Bloc de code ──────────────────────────────────────────────────────────
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "text";
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing ```
      html.push(
        `<div style="position:relative;margin:20px 0;">` +
        `<div style="position:absolute;top:10px;right:12px;font-size:10px;font-family:monospace;color:#475569;text-transform:uppercase;letter-spacing:0.1em;">${escapeHtml(lang)}</div>` +
        `<pre style="background:#0A0B14;border:1px solid #1E293B;border-radius:8px;padding:18px 16px 18px 16px;overflow-x:auto;margin:0;"><code style="font-family:'Fira Code',monospace;font-size:12.5px;line-height:1.7;color:#CBD5E1;">${colorize(codeLines.join("\n"), lang)}</code></pre>` +
        `</div>`
      );
      continue;
    }

    // ── Blockquote ────────────────────────────────────────────────────────────
    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      html.push(
        `<blockquote style="border-left:3px solid #7B5CF0;margin:16px 0;padding:12px 16px;background:#7B5CF010;border-radius:0 6px 6px 0;color:#94A3B8;font-style:italic;">` +
        quoteLines.map(l => `<p style="margin:4px 0;">${parseInline(l)}</p>`).join("") +
        `</blockquote>`
      );
      continue;
    }

    // ── Séparateur ────────────────────────────────────────────────────────────
    if (/^---+$/.test(line.trim())) {
      html.push(`<hr style="border:none;border-top:1px solid #1E293B;margin:28px 0;">`);
      i++;
      continue;
    }

    // ── Titre ─────────────────────────────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = makeId(text);
      const sizes  = [28, 22, 17, 15, 14, 13];
      const colors = ["#E2E8F0", "#CBD5E1", "#00E5CC", "#94A3B8", "#94A3B8", "#94A3B8"];
      const margins = ["36px 0 16px", "28px 0 12px", "24px 0 10px", "18px 0 8px", "14px 0 6px", "12px 0 4px"];
      const fonts = level <= 2 ? "Orbitron, monospace" : "Inter, sans-serif";
      html.push(
        `<h${level} id="${id}" style="font-size:${sizes[level-1]}px;color:${colors[level-1]};` +
        `margin:${margins[level-1]};font-family:${fonts};font-weight:700;` +
        `letter-spacing:${level <= 2 ? "0.04em" : "0"};line-height:1.2;scroll-margin-top:20px;">` +
        parseInline(text) + `</h${level}>`
      );
      i++;
      continue;
    }

    // ── Tableau ───────────────────────────────────────────────────────────────
    if (line.includes("|") && i + 1 < lines.length && /^\|?[\s\-:]+\|?$/.test(lines[i + 1])) {
      const rows = [];
      // 🔴 CORRECTION ICI : lines[i] au lieu de line
      while (i < lines.length && lines[i].includes("|")) {
        if (!/^\|?[\s\-:]+\|?$/.test(lines[i])) {
          const cells = lines[i].split("|").map(c => c.trim());
          // retire premier et dernier si vides (pipes de bordure)
          const filtered = cells[0] === "" ? cells.slice(1) : cells;
          const cleaned = filtered[filtered.length - 1] === "" ? filtered.slice(0, -1) : filtered;
          rows.push(cleaned);
        }
        i++;
      }
      if (rows.length > 0) {
        const [head, ...body] = rows;
        html.push(
          `<div style="overflow-x:auto;margin:16px 0;">` +
          `<table style="width:100%;border-collapse:collapse;font-family:Inter,sans-serif;font-size:13px;">` +
          `<thead><tr>${head.map(h => `<th style="text-align:left;padding:10px 14px;background:#111827;border:1px solid #1E293B;color:#00E5CC;font-weight:700;">${parseInline(h)}</th>`).join("")}</tr></thead>` +
          `<tbody>${body.map((row, ri) =>
            `<tr style="background:${ri % 2 === 0 ? "#0D0F1A" : "#111827"};">` +
            row.map(cell => `<td style="padding:9px 14px;border:1px solid #1E293B;color:#94A3B8;">${parseInline(cell)}</td>`).join("") +
            `</tr>`
          ).join("")}</tbody>` +
          `</table></div>`
        );
      }
      continue;
    }

    // ── Liste non ordonnée / checkboxes ───────────────────────────────────────
    if (/^\s*[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) {
        const indent = lines[i].match(/^(\s*)/)[1].length;
        const text = lines[i].replace(/^\s*[-*+]\s/, "");
        const cbMatch = text.match(/^\[(x| )\]\s(.+)/i);
        if (cbMatch) {
          items.push({ indent, text: cbMatch[2], checked: cbMatch[1].toLowerCase() === "x", isCheckbox: true });
        } else {
          items.push({ indent, text, checked: false, isCheckbox: false });
        }
        i++;
      }
      html.push(`<ul style="list-style:none;padding:0;margin:10px 0;">`);
      for (const item of items) {
        const pad = item.indent * 12 + 4;
        if (item.isCheckbox) {
          html.push(
            `<li style="display:flex;align-items:flex-start;gap:8px;padding:3px 0 3px ${pad}px;color:${item.checked ? "#00E5CC" : "#64748B"};">` +
            `<span style="flex-shrink:0;margin-top:1px;">${item.checked ? "✅" : "⬜"}</span>` +
            `<span style="${item.checked ? "text-decoration:line-through;opacity:0.6;" : ""}">${parseInline(item.text)}</span>` +
            `</li>`
          );
        } else {
          html.push(
            `<li style="display:flex;align-items:flex-start;gap:8px;padding:3px 0 3px ${pad}px;color:#94A3B8;">` +
            `<span style="color:#7B5CF0;flex-shrink:0;margin-top:4px;font-size:8px;">◆</span>` +
            `<span>${parseInline(item.text)}</span>` +
            `</li>`
          );
        }
      }
      html.push(`</ul>`);
      continue;
    }

    // ── Liste ordonnée ────────────────────────────────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      html.push(`<ol style="padding-left:24px;margin:10px 0;color:#94A3B8;font-family:Inter,sans-serif;font-size:14px;line-height:1.8;">`);
      for (const item of items) {
        html.push(`<li style="padding:2px 0;">${parseInline(item)}</li>`);
      }
      html.push(`</ol>`);
      continue;
    }

    // ── Ligne vide ────────────────────────────────────────────────────────────
    if (line.trim() === "") {
      i++;
      continue;
    }

    // ── Paragraphe ────────────────────────────────────────────────────────────
    // Consomme les lignes jusqu'à un élément bloc ou ligne vide.
    const paraLines = [];
    while (i < lines.length) {
      const l = lines[i];
      if (
        l.trim() === "" ||
        l.startsWith("#") ||
        l.startsWith("```") ||
        l.startsWith("> ") ||
        /^---+$/.test(l.trim()) ||
        /^\s*[-*+]\s/.test(l) ||
        /^\d+\.\s/.test(l) ||
        (l.includes("|") && i + 1 < lines.length && /^\|?[\s\-:]+\|?$/.test(lines[i + 1]))
      ) break;
      paraLines.push(l);
      i++;
    }
    if (paraLines.length > 0) {
      html.push(
        `<p style="color:#94A3B8;font-family:Inter,sans-serif;font-size:14px;line-height:1.8;margin:10px 0;">` +
        parseInline(paraLines.join(" ")) +
        `</p>`
      );
    } else {
      // Sécurité absolue : si rien n'a matché et i n'a pas avancé, on force l'avancement
      i++;
    }
  }

  return html.join("\n");
}

// ─── COLORISATION SYNTAXIQUE ──────────────────────────────────────────────────

function colorize(code, lang) {
  if (lang === "sql") return colorizeSql(code);
  if (lang === "lua") return colorizeLua(code);
  if (["js", "javascript", "ts", "typescript"].includes(lang)) return colorizeJs(code);
  return code;
}

function colorizeSql(code) {
  return code
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|ON|CREATE|TABLE|IF|NOT|EXISTS|PRIMARY|KEY|UNIQUE|INDEX|CONSTRAINT|FOREIGN|REFERENCES|CASCADE|ENGINE|DEFAULT|CHARSET|AUTO_INCREMENT|NULL|INT|VARCHAR|TEXT|LONGTEXT|BIGINT|DECIMAL|FLOAT|DATE|TINYINT|ENUM|UNSIGNED)\b/gi,
      '<span style="color:#C084FC;font-weight:600;">$1</span>')
    .replace(/(`[^`]+`)/g, '<span style="color:#F59E0B;">$1</span>')
    .replace(/(--[^\n]*)/g, '<span style="color:#475569;font-style:italic;">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#86EFAC;">$1</span>');
}

function colorizeLua(code) {
    const strings = [];
    const comments = [];

    // ── Protection des chaînes ───────────────────────────────────────────────
    code = code.replace(
        /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
        match => {
            const id = strings.length;
            strings.push(match);
            return `§STRING${id}§`;
        }
    );

    // ── Protection des commentaires ──────────────────────────────────────────
    code = code.replace(
        /--[^\n]*/g,
        match => {
            const id = comments.length;
            comments.push(match);
            return `§COMMENT${id}§`;
        }
    );

    // ── Nombres (CORRIGÉ: AVANT les mots clés) ───────────────────────────────
    code = code.replace(
        /\b(\d+(\.\d+)?)\b/g,
        '<span style="color:#FCA5A5;">$1</span>'
    );

    // ── Mots-clés Lua ────────────────────────────────────────────────────────
    code = code.replace(
        /\b(local|function|end|if|then|else|elseif|return|and|or|not|while|do|for|in|repeat|until|break|goto|nil|true|false)\b/g,
        '<span style="color:#C084FC;font-weight:600;">$1</span>'
    );

    // ── Fonctions natives (optionnel) ────────────────────────────────────────
    code = code.replace(
        /\b(print|pairs|ipairs|next|type|tostring|tonumber|pcall|xpcall|error|assert|require|setmetatable|getmetatable|string|table|math|coroutine|utf8|io|os|debug)\b/g,
        '<span style="color:#60A5FA;">$1</span>'
    );

    // ── Réinjection des chaînes ──────────────────────────────────────────────
    code = code.replace(/§STRING(\d+)§/g, (_, id) => {
        return `<span style="color:#86EFAC;">${strings[id]}</span>`;
    });

    // ── Réinjection des commentaires ─────────────────────────────────────────
    code = code.replace(/§COMMENT(\d+)§/g, (_, id) => {
        return `<span style="color:#475569;font-style:italic;">${comments[id]}</span>`;
    });

    return code;
}

function colorizeJs(code) {
  // CORRIGÉ: Protection des chaînes d'abord, ensuite les nombres, puis les mots-clés
  const strings = [];
  const comments = [];
  
  code = code.replace(/("(?:[^"\\]|\\.)*")/g, match => { const id = strings.length; strings.push(match); return `§S${id}§`; });
  code = code.replace(/('(?:[^'\\]|\\.)*')/g, match => { const id = strings.length; strings.push(match); return `§S${id}§`; });
  code = code.replace(/(`(?:[^`\\]|\\.)*`)/g, match => { const id = strings.length; strings.push(match); return `§S${id}§`; });
  code = code.replace(/(\/\/[^\n]*)/g, match => { const id = comments.length; comments.push(match); return `§C${id}§`; });

  code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#FCA5A5;">$1</span>');
  
  code = code.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|class|new|this|async|await|try|catch|throw|typeof|instanceof|true|false|null|undefined)\b/g,
      '<span style="color:#C084FC;font-weight:600;">$1</span>');
      
  code = code.replace(/§S(\d+)§/g, (_, id) => `<span style="color:#86EFAC;">${strings[id]}</span>`);
  code = code.replace(/§C(\d+)§/g, (_, id) => `<span style="color:#475569;font-style:italic;">${comments[id]}</span>`);
  
  return code;
}