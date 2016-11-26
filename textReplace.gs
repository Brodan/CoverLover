function findAndReplace() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  body.replaceText("{Company}", 'TestCompany');
  body.replaceText("{Position}", 'TestPosition');
}
