import { GlucoseEntry, AppSettings } from '../types';
import {
    formatGlucose,
    getGlucoseCategory,
    getCategoryDetails,
    TAG_LABELS,
    calculateStatistics,
} from './diabetesCalc';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports glucose entries to a clean, RFC-4180 CSV file with UTF-8 BOM
 * for perfect display in Excel, Numbers, and Google Sheets without encoding glitches.
 */
export function exportGlucoseToCSV(entries: GlucoseEntry[], settings: AppSettings) {
    const unitLabel = settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл';

    const headers = [
        'Дата',
        'Время',
        `Сахар (${unitLabel})`,
        'Оценка диапазона',
        'Контекст замера',
        'Короткий инсулин (ед.)',
        'Продленный инсулин (ед.)',
        `Углеводы (${settings.carbUnitName})`,
        'Заметки пользователя',
    ];

    const sortedEntries = [...entries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const rows = sortedEntries.map((entry) => {
        const d = new Date(entry.timestamp);
        const dateStr = d.toLocaleDateString('ru-RU');
        const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const glucoseVal = formatGlucose(entry.glucose, settings.glucoseUnit);
        const category = getGlucoseCategory(entry.glucose, settings);
        const catDetails = getCategoryDetails(category);
        const tagInfo = TAG_LABELS[entry.tag]?.label || 'Замер';

        const shortInsulin = entry.insulinShort !== undefined ? String(entry.insulinShort) : '';
        const longInsulin = entry.insulinLong !== undefined ? String(entry.insulinLong) : '';
        const carbs = entry.carbs !== undefined ? String(entry.carbs) : '';
        const notes = entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : '';

        return [
            dateStr,
            timeStr,
            glucoseVal,
            catDetails.label,
            `"${tagInfo}"`,
            shortInsulin,
            longInsulin,
            carbs,
            notes,
        ].join(';');
    });

    // UTF-8 BOM prefix (\uFEFF) ensures Excel opens Russian letters correctly
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nowStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `WF-S_Дневник_сахара_${nowStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Exports glucose log to a medical-grade PDF report with clinical statistics,
 * Time-in-Range breakdown, and complete measurement table with notes and insulin doses.
 */
export async function exportGlucoseToPDF(entries: GlucoseEntry[], settings: AppSettings) {
    const stats = calculateStatistics(entries, settings);
    const unitLabel = settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл';
    const nowStr = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const sortedEntries = [...entries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Create an off-screen HTML document container with tailored styling
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'fixed';
    reportContainer.style.left = '-9999px';
    reportContainer.style.top = '0';
    reportContainer.style.width = '800px';
    reportContainer.style.backgroundColor = '#ffffff';
    reportContainer.style.color = '#0f172a';
    reportContainer.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    reportContainer.style.padding = '32px';
    reportContainer.style.boxSizing = 'border-box';

    const rowsHtml = sortedEntries
        .map((e, idx) => {
            const d = new Date(e.timestamp);
            const dateStr = d.toLocaleDateString('ru-RU');
            const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            const cat = getGlucoseCategory(e.glucose, settings);
            const catDetails = getCategoryDetails(cat);
            const tagInfo = TAG_LABELS[e.tag]?.short || 'Замер';

            const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            let dotColor = '#059669';
            if (cat === 'hypo') dotColor = '#e11d48';
            else if (cat === 'high') dotColor = '#d97706';
            else if (cat === 'very_high') dotColor = '#b91c1c';

            return `
        <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 8px; font-size: 11px; white-space: nowrap;">${dateStr} ${timeStr}</td>
          <td style="padding: 6px 8px; font-size: 12px; font-weight: bold; color: ${dotColor};">
            ${formatGlucose(e.glucose, settings.glucoseUnit)} ${unitLabel}
          </td>
          <td style="padding: 6px 8px; font-size: 11px;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 600;">
              ${tagInfo}
            </span>
          </td>
          <td style="padding: 6px 8px; font-size: 11px; font-weight: 600; color: #0284c7;">
            ${e.insulinShort !== undefined ? `${e.insulinShort} ед.` : '—'}
          </td>
          <td style="padding: 6px 8px; font-size: 11px; font-weight: 600; color: #7c3aed;">
            ${e.insulinLong !== undefined ? `${e.insulinLong} ед.` : '—'}
          </td>
          <td style="padding: 6px 8px; font-size: 11px; font-weight: 600; color: #b45309;">
            ${e.carbs !== undefined ? `${e.carbs} ${settings.carbUnitName}` : '—'}
          </td>
          <td style="padding: 6px 8px; font-size: 10px; color: #475569; max-width: 200px; word-break: break-word;">
            ${e.notes ? e.notes : '—'}
          </td>
        </tr>
      `;
        })
        .join('');

    reportContainer.innerHTML = `
    <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="display: inline-block; background: #0284c7; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-bottom: 4px;">
            WF-S
          </div>
          <h1 style="font-size: 18px; font-weight: bold; color: #0369a1; margin: 0 0 4px 0;">
            ДНЕВНИК САМОКОНТРОЛЯ САХАРНОГО ДИАБЕТА 1 ТИПА
          </h1>
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            Выписка замеров гликемии, инсулинотерапии и углеводов для врача-эндокринолога
          </p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; color: #94a3b8;">Дата формирования:</span><br/>
          <strong style="font-size: 12px; color: #1e293b;">${nowStr}</strong>
        </div>
      </div>
    </div>

    <!-- Summary clinical stats cards -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
      <div style="padding: 10px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center;">
        <div style="font-size: 10px; color: #166534; font-weight: 600;">В ЦЕЛЕВОМ (TIR)</div>
        <div style="font-size: 18px; font-weight: bold; color: #15803d; margin-top: 2px;">${stats.tirPercent}%</div>
        <div style="font-size: 9px; color: #4ade80;">Цель: > 70%</div>
      </div>
      <div style="padding: 10px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; text-align: center;">
        <div style="font-size: 10px; color: #0369a1; font-weight: 600;">СРЕДНИЙ САХАР</div>
        <div style="font-size: 18px; font-weight: bold; color: #0284c7; margin-top: 2px;">${stats.averageMmol} ${unitLabel}</div>
        <div style="font-size: 9px; color: #38bdf8;">SD: ±${stats.standardDeviation}</div>
      </div>
      <div style="padding: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
        <div style="font-size: 10px; color: #334155; font-weight: 600;">РАСЧЕТНЫЙ HbA1c</div>
        <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 2px;">${stats.estimatedHbA1c}%</div>
        <div style="font-size: 9px; color: #64748b;">Формула ADAG</div>
      </div>
      <div style="padding: 10px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; text-align: center;">
        <div style="font-size: 10px; color: #9f1239; font-weight: 600;">ГИПОГЛИКЕМИЙ (&lt;3.9)</div>
        <div style="font-size: 18px; font-weight: bold; color: #e11d48; margin-top: 2px;">${stats.hypoPercent}%</div>
        <div style="font-size: 9px; color: #fb7185;">Цель: &lt; 4%</div>
      </div>
    </div>

    <!-- Target Range Legend -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; font-size: 10px; color: #475569; display: flex; justify-content: space-between;">
      <span>Целевой диапазон: <strong>${settings.targetMin} – ${settings.targetMax} ${unitLabel}</strong></span>
      <span>Всего измерений в отчете: <strong>${entries.length}</strong></span>
    </div>

    <!-- Data Table -->
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="background-color: #0284c7; color: #ffffff;">
          <th style="padding: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Дата и время</th>
          <th style="padding: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Сахар</th>
          <th style="padding: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Контекст</th>
          <th style="padding: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Болюс</th>
          <th style="padding: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Базал</th>
          <th style="padding: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Углеводы</th>
          <th style="padding: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Заметки</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- Footer Signatures -->
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
      <div>Пациент: __________________________</div>
      <div>Врач-эндокринолог: __________________________</div>
    </div>
  `;

    document.body.appendChild(reportContainer);

    try {
        const canvas = await html2canvas(reportContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Support multipage if height exceeds A4 height
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        const downloadDate = new Date().toISOString().split('T')[0];
        pdf.save(`Дневник_сахара_СД1_${downloadDate}.pdf`);
    } finally {
        document.body.removeChild(reportContainer);
    }
}
