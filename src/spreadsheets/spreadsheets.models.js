const SpreadsheetsAuth = require('./spreadsheets.auth');
require('dotenv').config();

async function insertSpreadsheet(spreadsheetId, range, valuesInput) {
    let result = await SpreadsheetsAuth.spreadsheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        includeValuesInResponse: true,
        resource: {
            values: valuesInput
        }
    })
    return result;
}

async function getSpreadsheet(spreadsheetId, range) {
    let result = await SpreadsheetsAuth.spreadsheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
    })

    return result.data.values;
}

exports.insertSpreadsheet = insertSpreadsheet;
exports.getSpreadsheet = getSpreadsheet;