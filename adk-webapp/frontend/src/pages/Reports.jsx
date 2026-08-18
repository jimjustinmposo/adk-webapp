import React, { useState, useEffect } from 'react';
import { FileText, Download, Check, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { apiRequest } from '../api/client';
import { formatDate as dateText } from '../utils/date';

const money = (value) =>
  `${new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))} AED`;

const displayMonth = (value) =>
  new Date(`${value}-01T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const inMonth = (dog, month) => String(dog.disposition_date || '').substring(0, 7) === month;
const createdInMonth = (dog, month) => String(dog.created_at || '').substring(0, 7) === month;

export default function Reports() {
  const [dogs, setDogs] = useState([]);
  const [reportMonth, setReportMonth] = useState('');
  const [allTime, setAllTime] = useState(false);
  const [selectedSections, setSelectedSections] = useState([
    'sales-summary',
    'sold-dogs',
    'adoption-summary',
    'adopted-dogs',
    'registered-dogs'
  ]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest('/dogs');
        setDogs(data.dogs || []);
      } catch (err) {
        console.error('Failed to load dogs for reports:', err);
      }
    })();
  }, []);

  const periodLabel = allTime ? 'All Time (Full Archive)' : reportMonth ? displayMonth(reportMonth) : '';
  const matchesDispositionPeriod = (dog) => allTime || inMonth(dog, reportMonth);
  const matchesRegistrationPeriod = (dog) => allTime || createdInMonth(dog, reportMonth);

  const hasPeriod = Boolean(reportMonth || allTime);

  const sold = dogs.filter(dog => dog.status === 'sold' && matchesDispositionPeriod(dog));
  const adopted = dogs.filter(dog => dog.status === 'adopted' && matchesDispositionPeriod(dog));
  const registered = dogs.filter(matchesRegistrationPeriod);
  const totalSales = sold.reduce((total, dog) => total + Number(dog.sale_amount || 0), 0);

  const handleToggleSection = (id) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    const allIds = ['sales-summary', 'sold-dogs', 'adoption-summary', 'adopted-dogs', 'registered-dogs'];
    if (selectedSections.length === allIds.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(allIds);
    }
  };

  const isExportDisabled = !hasPeriod || selectedSections.length === 0;

  const exportHint = selectedSections.length
    ? `${selectedSections.length} selected section${selectedSections.length === 1 ? '' : 's'} included in export file.`
    : 'Select at least one report section above to generate export.';

  // Excel Styling & Export
  const styleExcelSheet = (sheet, isOverview = false) => {
    if (!sheet || !sheet['!ref']) return;
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        if (!sheet[address]) continue;
        sheet[address].s = {
          font: { name: 'Arial', sz: 11, color: { rgb: '1F2937' } },
          alignment: { vertical: 'center', wrapText: true }
        };
      }
    }
    if (isOverview) {
      if (sheet.A1) {
        sheet.A1.s = {
          font: { name: 'Arial', sz: 18, bold: true, color: { rgb: '17347A' } },
          alignment: { vertical: 'center' }
        };
      }
      sheet['!merges'] = [XLSX.utils.decode_range('A1:D1')];
      sheet['!rows'] = [{ hpt: 28 }];
      ['A3', 'A4', 'A6'].forEach(address => {
        if (sheet[address]) {
          sheet[address].s = { font: { name: 'Arial', sz: 11, bold: true, color: { rgb: '17347A' } } };
        }
      });
      sheet['!cols'] = [{ wch: 24 }, { wch: 32 }, { wch: 18 }, { wch: 18 }];
    } else {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const address = XLSX.utils.encode_cell({ r: 0, c: col });
        if (sheet[address]) {
          sheet[address].s = {
            font: { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '1E40AF' } },
            alignment: { vertical: 'center', wrapText: true }
          };
        }
      }
      sheet['!rows'] = [{ hpt: 24 }];
      sheet['!cols'] = Array.from({ length: range.e.c + 1 }, () => ({ wch: 20 }));
    }
  };

  const getSheetsForSelection = () => {
    const sheets = [];
    if (selectedSections.includes('sales-summary')) {
      sheets.push([
        'Sales Summary',
        [
          ['Report period', periodLabel],
          ['Animals sold', sold.length],
          ['Total sales', money(totalSales)]
        ]
      ]);
    }
    if (selectedSections.includes('sold-dogs')) {
      sheets.push([
        'Sold Animals',
        [
          ['Animal ID', 'Animal Name', 'Breed', 'Date Sold', 'Buyer', "Buyer's Address", 'Contact', 'Sale Amount (AED)'],
          ...sold.map(dog => [
            dog.dogid,
            dog.dogname,
            dog.breed,
            dateText(dog.disposition_date),
            dog.disposition_contact_name,
            dog.disposition_contact_address,
            dog.disposition_contact_details,
            Number(dog.sale_amount || 0)
          ])
        ]
      ]);
    }
    if (selectedSections.includes('adoption-summary')) {
      sheets.push([
        'Adoption Summary',
        [
          ['Report period', periodLabel],
          ['Animals adopted', adopted.length]
        ]
      ]);
    }
    if (selectedSections.includes('adopted-dogs')) {
      sheets.push([
        'Adopted Animals',
        [
          ['Animal ID', 'Animal Name', 'Breed', 'Date Adopted', 'Adopter', "Adopter's Address", 'Contact'],
          ...adopted.map(dog => [
            dog.dogid,
            dog.dogname,
            dog.breed,
            dateText(dog.disposition_date),
            dog.disposition_contact_name,
            dog.disposition_contact_address,
            dog.disposition_contact_details
          ])
        ]
      ]);
    }
    if (selectedSections.includes('registered-dogs')) {
      sheets.push([
        'New Registrations',
        [
          ['Animal ID', 'Animal Name', 'Breed', 'Gender', 'Date Added'],
          ...registered.map(dog => [
            dog.dogid,
            dog.dogname,
            dog.breed,
            dog.gender,
            dateText(dog.created_at)
          ])
        ]
      ]);
    }
    return sheets;
  };

  const exportExcel = () => {
    if (isExportDisabled) return;
    const workbook = XLSX.utils.book_new();
    const sectionNames = {
      'sales-summary': 'Sales summary',
      'sold-dogs': 'Sold animal details',
      'adoption-summary': 'Adoption summary',
      'adopted-dogs': 'Adopted animal details',
      'registered-dogs': 'New animal registrations'
    };

    const overview = XLSX.utils.aoa_to_sheet([
      ['Alpha Delta Kennel Report'],
      [],
      ['Report period', periodLabel],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Included sections'],
      ...selectedSections.map(section => [sectionNames[section]])
    ]);

    styleExcelSheet(overview, true);
    XLSX.utils.book_append_sheet(workbook, overview, 'Report Overview');

    getSheetsForSelection().forEach(([name, rows]) => {
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      styleExcelSheet(sheet);
      XLSX.utils.book_append_sheet(workbook, sheet, name);
    });

    XLSX.writeFile(workbook, `alpha-delta-kennel-report-${allTime ? 'all-time' : reportMonth}.xlsx`);
  };

  const exportPdf = () => {
    if (isExportDisabled) return;
    const pdf = new jsPDF();

    const addSection = (title, head, body) => {
      const isFirstSection = !pdf.lastAutoTable;
      if (!isFirstSection) pdf.addPage();
      pdf.setFontSize(15);
      pdf.text(title, 14, isFirstSection ? 36 : 18);
      pdf.autoTable({
        startY: isFirstSection ? 42 : 24,
        head: [head],
        body,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 8 }
      });
    };

    pdf.setFontSize(18);
    pdf.text('Alpha Delta Kennel Report', 14, 18);
    pdf.setFontSize(10);
    pdf.text(`Report period: ${periodLabel}`, 14, 25);

    if (selectedSections.includes('sales-summary')) {
      addSection(
        'Sales Summary',
        ['Metric', 'Value'],
        [
          ['Animals sold', sold.length],
          ['Total sales', money(totalSales)]
        ]
      );
    }
    if (selectedSections.includes('sold-dogs')) {
      addSection(
        'Sold Animals',
        ['Animal', 'Breed', 'Date Sold', 'Buyer', 'Sale Amount'],
        sold.map(dog => [
          dog.dogname || '',
          dog.breed || '',
          dateText(dog.disposition_date),
          dog.disposition_contact_name || '',
          money(dog.sale_amount)
        ])
      );
    }
    if (selectedSections.includes('adoption-summary')) {
      addSection(
        'Adoption Summary',
        ['Metric', 'Value'],
        [['Animals adopted', adopted.length]]
      );
    }
    if (selectedSections.includes('adopted-dogs')) {
      addSection(
        'Adopted Animals',
        ['Animal', 'Breed', 'Date Adopted', 'Adopter', 'Contact'],
        adopted.map(dog => [
          dog.dogname || '',
          dog.breed || '',
          dateText(dog.disposition_date),
          dog.disposition_contact_name || '',
          dog.disposition_contact_details || ''
        ])
      );
    }
    if (selectedSections.includes('registered-dogs')) {
      addSection(
        'New Registrations',
        ['Animal', 'Breed', 'Gender', 'Date Added'],
        registered.map(dog => [
          dog.dogname || '',
          dog.breed || '',
          dog.gender || '',
          dateText(dog.created_at)
        ])
      );
    }

    pdf.save(`alpha-delta-kennel-report-${allTime ? 'all-time' : reportMonth}.pdf`);
  };

  return (
    <main className="main fade-in-up report-main">
      <div className="page-header">
        <h2 className="page-title">
          <div className="page-title-icon">
            <FileText />
          </div>
          <div>
            <div>Kennel Financial & Activity Reports</div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
              Generate spreadsheet and printable PDF reports with breakdown summaries
            </div>
          </div>
        </h2>
      </div>

      <section className="report-panel">
        <div>
          <h3>Choose Report Period</h3>
          <p>Filter data by a specific calendar month or generate a complete lifetime archive.</p>
        </div>

        <label className="report-month-label" htmlFor="reportMonth">
          Select Month
          <input
            type="month"
            id="reportMonth"
            value={reportMonth}
            disabled={allTime}
            onChange={(e) => setReportMonth(e.target.value)}
          />
        </label>

        <label className="all-time-toggle">
          <input
            type="checkbox"
            checked={allTime}
            onChange={(e) => setAllTime(e.target.checked)}
          />
          <span>All-time report</span>
        </label>

        <div className="report-date">
          {hasPeriod ? `Selected Range: ${periodLabel}` : 'Please choose a month or select "All-time report".'}
        </div>
      </section>

      {hasPeriod && (
        <section className="available-data">
          <div className="available-data-heading">
            <div>
              <h3>Available Data Sections for {periodLabel}</h3>
              <p>Check the datasets you would like to bundle into the exported report.</p>
            </div>
            <button type="button" className="text-button" onClick={handleToggleAll}>
              {selectedSections.length === 5 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="report-options">
            <label className="report-option">
              <input
                type="checkbox"
                checked={selectedSections.includes('sales-summary')}
                onChange={() => handleToggleSection('sales-summary')}
              />
              <span className="report-option-check">
                <Check />
              </span>
              <span>
                <strong>Sales Revenue Summary</strong>
                <small>Total animals sold and total revenue in AED.</small>
              </span>
              <b>{sold.length} sold · {money(totalSales)}</b>
            </label>

            <label className="report-option">
              <input
                type="checkbox"
                checked={selectedSections.includes('sold-dogs')}
                onChange={() => handleToggleSection('sold-dogs')}
              />
              <span className="report-option-check">
                <Check />
              </span>
              <span>
                <strong>Sold Animals Detailed Table</strong>
                <small>Buyer contacts, address, sale price, and date.</small>
              </span>
              <b>{sold.length} records</b>
            </label>

            <label className="report-option">
              <input
                type="checkbox"
                checked={selectedSections.includes('adoption-summary')}
                onChange={() => handleToggleSection('adoption-summary')}
              />
              <span className="report-option-check">
                <Check />
              </span>
              <span>
                <strong>Adoptions Summary</strong>
                <small>Total re-homed and adopted animals.</small>
              </span>
              <b>{adopted.length} adopted</b>
            </label>

            <label className="report-option">
              <input
                type="checkbox"
                checked={selectedSections.includes('adopted-dogs')}
                onChange={() => handleToggleSection('adopted-dogs')}
              />
              <span className="report-option-check">
                <Check />
              </span>
              <span>
                <strong>Adopted Animals Detailed Table</strong>
                <small>Adopter contacts, location, and dates.</small>
              </span>
              <b>{adopted.length} records</b>
            </label>

            <label className="report-option">
              <input
                type="checkbox"
                checked={selectedSections.includes('registered-dogs')}
                onChange={() => handleToggleSection('registered-dogs')}
              />
              <span className="report-option-check">
                <Check />
              </span>
              <span>
                <strong>New Registry Additions</strong>
                <small>Animals registered into the database in this period.</small>
              </span>
              <b>{registered.length} records</b>
            </label>
          </div>
        </section>
      )}

      <div className="report-export-grid">
        <section className="excel-export-panel">
          <div className="excel-export-copy">
            <FileText />
            <div>
              <h3>Excel Spreadsheet (.xlsx)</h3>
              <p>{exportHint}</p>
            </div>
          </div>
          <button
            className="btn btn-excel"
            disabled={isExportDisabled}
            onClick={exportExcel}
            type="button"
          >
            <Download />
            <span>Export Excel</span>
          </button>
        </section>

        <section className="pdf-export-panel">
          <div className="pdf-export-copy">
            <FileText />
            <div>
              <h3>Printable PDF Document (.pdf)</h3>
              <p>{exportHint}</p>
            </div>
          </div>
          <button
            className="btn btn-pdf"
            disabled={isExportDisabled}
            onClick={exportPdf}
            type="button"
          >
            <Download />
            <span>Export PDF</span>
          </button>
        </section>
      </div>
    </main>
  );
}
