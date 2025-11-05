const generateUserPdf = (doc, userData) => {
  doc.fontSize(20).text("User Data Export", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(12).text(`Document generated: ${((new Date).toLocaleString("sv-SE"))}`)
  doc.moveDown(2);

  doc.fontSize(16).text("User information")
  for (const [key, value] of Object.entries(userData.profile)) {
    doc.fontSize(12).text(`${key}: ${value}`)
  };
};

module.exports = { generateUserPdf };