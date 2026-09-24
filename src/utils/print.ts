export const printElement = (
  elementId: string,
  pageTitle: string,
  format: 'a4' | 'thermal' = 'a4'
): boolean => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  const printWindow = window.open('', '_blank', 'width=1024,height=768');
  if (!printWindow) return false;

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');

  printWindow.document.open();
  printWindow.onload = () => {
    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 150);
  };

  printWindow.document.write(`<!doctype html>
<html dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>${pageTitle}</title>
    ${styles}
    <style>
      @page { size: ${format === 'thermal' ? '80mm auto' : 'auto'}; margin: ${format === 'thermal' ? '0' : '8mm'}; }
      html, body { background: #fff !important; color: #000 !important; margin: 0; }
      body { padding: 0 !important; }
      .print-source { display: block !important; width: ${format === 'thermal' ? '80mm' : '100%'} !important; max-width: none !important; }
      .print-source > #printable-thermal { width: 74mm !important; max-width: 74mm !important; margin: 0 auto !important; padding: 2mm 3mm !important; }
      button, input, select, textarea, .print-hidden { display: none !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    </style>
  </head>
  <body>
    <div class="print-source">${element.outerHTML}</div>
  </body>
</html>`);
  printWindow.document.close();
  printWindow.focus();

  return true;
};
