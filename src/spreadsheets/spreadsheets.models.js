const SpreadsheetsAuth = require('./spreadsheets.auth');
require('dotenv').config();

async function insertSpreadsheet(values) {
    let result = await SpreadsheetsAuth.spreadsheets.values.append({
        spreadsheetId: process.env.spreadsheetId,
        range: 'Log!A:C',
        valueInputOption: 'USER_ENTERED',
        includeValuesInResponse: true,
        resource: {
            values: values
        }
    })
    return result;
}

exports.insertSpreadsheet = insertSpreadsheet;