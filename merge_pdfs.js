const fs = require("fs");
const { PDFDocument, rgb } = require("pdf-lib");

async function getPageCount(pdfPath) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(pdfBytes);
  return pdf.getPageCount();
}

async function mergePDFs(pdfPaths, outputPath) {
  // Create a new PDFDocument
  const mergedPdf = await PDFDocument.create();

  // Log page counts of individual PDFs
  const pageCountPromises = pdfPaths.map(async (pdfPath, index) => {
    const pageCount = await getPageCount(pdfPath);
    console.log(
      `PDF ${String.fromCharCode(65 + index)} page count: ${pageCount}`
    );
    return pageCount;
  });

  const pageCounts = await Promise.all(pageCountPromises);

  for (const pdfPath of pdfPaths) {
    // Load the current PDF
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);

    // Copy pages from the current PDF to the merged PDF
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  // Add page numbers
  const pages = mergedPdf.getPages();
  const totalPages = pages.length;

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    page.drawText(`${idx + 1} / ${totalPages}`, {
      x: width - 50,
      y: 20,
      size: 10,
      color: rgb(0, 0, 0),
    });
  });

  // Serialize the merged PDF to bytes
  const mergedPdfBytes = await mergedPdf.save();

  // Save the merged PDF to a file
  fs.writeFileSync(outputPath, mergedPdfBytes);

  // Log total page count of merged PDF
  console.log(`Merged PDF page count: ${totalPages}`);
}

(async () => {
  const pdfPaths = ["./sample10p.pdf", "./sample3p.pdf"]; // Replace with your PDF file paths
  const outputPath = "merged.pdf";

  await mergePDFs(pdfPaths, outputPath);

  console.log(`Merged PDF saved as: ${outputPath}`);
})();
