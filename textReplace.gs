function findAndReplace(documentID, companyName, companyPosition) {
  var doc = DocumentApp.openById(documentID);
  doc.setName(companyName + ' - ' + companyPosition + ' Cover Letter')
  var body = doc.getBody();
  body.replaceText("{Company}", companyName);
  body.replaceText("{Position}", companyPosition);
}
