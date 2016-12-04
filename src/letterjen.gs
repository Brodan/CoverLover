function findAndReplace(documentID, companyName, companyPosition) {
  var doc = DocumentApp.openById(documentID);
  doc.setName('Cover Letter: ' + companyName + '-' + companyPosition)
  var body = doc.getBody();
  body.replaceText("{Company}", companyName);
  body.replaceText("{Position}", companyPosition);
}