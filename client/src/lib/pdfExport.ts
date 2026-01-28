import { jsPDF } from "jspdf";

interface SessionSummaryData {
  userName: string;
  sessionDate: string;
  keyThemes: string[];
  patrickObservation: string;
  nextSessionPrompt: string;
  commitments: Array<{
    action: string;
    context?: string;
    deadline?: string;
  }>;
}

export function exportSummaryToPDF(summary: SessionSummaryData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colors
  const navyDeep = "#0A1628";
  const sageGreen = "#4A6741";
  const warmCream = "#FDFCF8";
  const textGray = "#2D3748";

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  // Header background
  doc.setFillColor(10, 22, 40); // Navy deep
  doc.rect(0, 0, pageWidth, 50, "F");

  // Title
  doc.setTextColor(253, 252, 248); // Warm cream
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("The Deep Brief", margin, 20);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Coaching Session Summary", margin, 30);

  // Date
  doc.setFontSize(10);
  doc.text(summary.sessionDate, margin, 40);

  yPosition = 60;

  // Reset text color for body
  doc.setTextColor(45, 55, 72); // Text gray

  // Key Themes Section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(74, 103, 65); // Sage green
  doc.text("Key Themes", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(45, 55, 72);

  summary.keyThemes.forEach((theme, index) => {
    const themeText = `${index + 1}. ${theme}`;
    const lines = doc.splitTextToSize(themeText, contentWidth - 5);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += 6;
    });
  });

  yPosition += 5;

  // Patrick's Observation Section
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(74, 103, 65);
  doc.text("Patrick's Observation", margin, yPosition);
  yPosition += 8;

  // Box for observation
  doc.setDrawColor(74, 103, 65);
  doc.setLineWidth(0.5);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(45, 55, 72);
  
  const observationLines = doc.splitTextToSize(summary.patrickObservation, contentWidth - 10);
  const boxHeight = observationLines.length * 6 + 10;
  
  doc.rect(margin, yPosition - 3, contentWidth, boxHeight);
  
  observationLines.forEach((line: string, index: number) => {
    doc.text(line, margin + 5, yPosition + (index * 6) + 3);
  });
  
  yPosition += boxHeight + 5;

  // Next Session Section
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(74, 103, 65);
  doc.text("Before Next Session", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(45, 55, 72);
  
  const promptLines = doc.splitTextToSize(summary.nextSessionPrompt, contentWidth - 5);
  promptLines.forEach((line: string) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin + 5, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Commitments Section
  if (summary.commitments.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(74, 103, 65);
    doc.text("Your Commitments", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(45, 55, 72);

    summary.commitments.forEach((commitment, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Commitment number and action
      doc.setFont("helvetica", "bold");
      const actionText = `${index + 1}. ${commitment.action}`;
      const actionLines = doc.splitTextToSize(actionText, contentWidth - 5);
      
      actionLines.forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 6;
      });

      // Context
      if (commitment.context) {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(113, 128, 150);
        const contextLines = doc.splitTextToSize(commitment.context, contentWidth - 10);
        contextLines.forEach((line: string) => {
          doc.text(line, margin + 10, yPosition);
          yPosition += 5;
        });
        doc.setTextColor(45, 55, 72);
      }

      // Deadline
      if (commitment.deadline) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(74, 103, 65);
        doc.text(`Due: ${commitment.deadline}`, margin + 10, yPosition);
        yPosition += 5;
        doc.setTextColor(45, 55, 72);
      }

      doc.setFont("helvetica", "normal");
      yPosition += 3;
    });
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(9);
  doc.setTextColor(113, 128, 150);
  doc.setFont("helvetica", "italic");
  doc.text("The Deep Brief - Leadership Clarity Under Pressure", pageWidth / 2, footerY, { align: "center" });
  doc.text("thedeepbrief.co.uk", pageWidth / 2, footerY + 5, { align: "center" });

  // Save the PDF
  const fileName = `coaching-session-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
