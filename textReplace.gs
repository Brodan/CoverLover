function findAndReplace(companyName, companyPosition) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  body.replaceText("{Company}", companyName);
  body.replaceText("{Position}", companyPosition);
}
