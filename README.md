# CoverLover
A cover letter generator built using the Google Docs/Google Drive/Google Apps Script APIs.

![CoverLover Logo](https://raw.githubusercontent.com/Brodan/CoverLover/master/logo.png)

# Instructions:

1. Clone this repository: `$ git clone https://github.com/Brodan/CoverLover.git`
2. `$ npm install googleapis --save` and `$ npm install google-auth-library --save`
3. Modify `Basic Cover Letter.doc` to your liking. Anywhere you'd like to insert the company's name use the `{Company}` placeholder text and anywhere you'd like to insert the position you are applying for insert the `{Position}` placeholder text.
4. Upload `Basic Cover Letter.doc` and `coverlover.gs` to your Google Drive.
5. Inside the [Google API Manager](https://console.developers.google.com/) create a new project and enable the `Google Drive API` and the `Google Apps Script Execution API`.
6. In the API Manage, Credentials -> Create Credentials -> Oauth client ID -> Other -> Enter a name
7. Download Oauth Client ID and save as `client_secret.json` in project directory.
8. `$ node coverlover.js "CompanyName" "CompanyPosition"`

# To Do:
- [x] Finish, clean up, document source.
- [x] Insert generic cover letter for demo purposes.
- [ ] Dynamically obtain Apps Script ID.
- [ ] Finish above instructions.
- [ ] Parse job listing to retrieve company and position dynamically.
- [ ] Convert into command line application?
