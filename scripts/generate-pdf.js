const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 900,
    webPreferences: {
      offscreen: false,
    },
  });

  const files = [
    {
      html: path.join(__dirname, '..', 'docs', 'PharmaDist_Asan_Urdu_Guide.html'),
      pdfName: 'PharmaDist_Asan_Urdu_Guide.pdf',
    },
    {
      html: path.join(__dirname, '..', 'docs', 'PharmaDist_Easy_English_Guide.html'),
      pdfName: 'PharmaDist_Easy_English_Guide.pdf',
    },
  ];

  for (const item of files) {
    console.log(`Generating PDF for ${path.basename(item.html)}...`);
    await win.loadFile(item.html);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pdfBuffer = await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margins: {
        top: 0.3,
        bottom: 0.3,
        left: 0.3,
        right: 0.3,
      },
    });

    const docsPdf = path.join(__dirname, '..', 'docs', item.pdfName);
    const publicPdf = path.join(__dirname, '..', 'public', item.pdfName);
    const guidePdf = path.join(__dirname, '..', 'public', 'guide', item.pdfName);

    fs.writeFileSync(docsPdf, pdfBuffer);
    fs.writeFileSync(publicPdf, pdfBuffer);
    fs.writeFileSync(guidePdf, pdfBuffer);
    console.log(`Successfully generated ${item.pdfName}: ${pdfBuffer.length} bytes`);
  }

  console.log('All PDFs generated successfully!');
  app.quit();
});
