const { connectDB, Guest } = require('../_lib/database');
const ExcelJS = require('exceljs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectDB();

  try {
    const guests = await Guest.find().sort({ registered_at: 1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Wedding Attendance');

    sheet.columns = [
      { header: 'S/N', key: 'sn', width: 8 },
      { header: 'Full Name', key: 'full_name', width: 30 },
      { header: 'Phone Number', key: 'phone', width: 22 },
      { header: 'Email Address', key: 'email', width: 26 },
      { header: 'Entrance Code', key: 'unique_code', width: 18 },
      { header: 'Checked In', key: 'checked_in', width: 15 },
      { header: 'Registered On', key: 'registered_at', width: 24 },
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF722F37' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    guests.forEach((g, idx) => {
      const row = sheet.addRow({
        sn: idx + 1,
        full_name: g.full_name,
        phone: g.phone,
        email: g.email || 'N/A',
        unique_code: g.unique_code,
        checked_in: g.checked_in ? 'YES' : 'NO',
        registered_at: new Date(g.registered_at).toLocaleString(),
      });
      if (g.checked_in) {
        row.getCell('checked_in').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=wedding_attendance_list.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
};