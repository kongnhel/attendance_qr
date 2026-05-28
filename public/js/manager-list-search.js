(function() {
    var recordsEl = document.getElementById('recordsData');
    var records = [];
    if (recordsEl) {
        try {
            records = JSON.parse(recordsEl.getAttribute('data-records'));
        } catch (e) {
            records = [];
        }
    }

    var searchInput = document.getElementById('searchInput');
    var btnExport = document.getElementById('btnExportExcel');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var query = this.value.toLowerCase().trim();
            var rows = document.querySelectorAll('tbody tr');
            var cards = document.querySelectorAll('.grid > div');

            rows.forEach(function(row) {
                var text = row.textContent.toLowerCase();
                row.style.display = text.indexOf(query) !== -1 ? '' : 'none';
            });

            cards.forEach(function(card) {
                var text = card.textContent.toLowerCase();
                card.style.display = text.indexOf(query) !== -1 ? '' : 'none';
            });
        });
    }

    if (btnExport) {
        btnExport.addEventListener('click', function() {
            if (!records || records.length === 0) {
                Swal.fire({ icon: 'info', title: 'No Data', text: 'No records to export.' });
                return;
            }

            var exportData = records.map(function(r, i) {
                return {
                    'No.': i + 1,
                    'Name': r.name,
                    'Gender': r.gender,
                    'Age': r.age,
                    'Phone': r.phone,
                    'Place': r.place,
                    'Date': r.date,
                    'Time': r.time
                };
            });

            var ws = XLSX.utils.json_to_sheet(exportData);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

            var colWidths = Object.keys(exportData[0]).map(function(key) {
                return { wch: Math.max(key.length, Math.max.apply(null, exportData.map(function(r) { return String(r[key]).length; }))) + 2 };
            });
            ws['!cols'] = colWidths;

            var today = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, 'attendance_' + today + '.xlsx');
        });
    }
})();
