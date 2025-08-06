// ✅ Attendance Cell Color Styling
function updateStatusClass(cell, value) {
  cell.classList.remove("present", "absent");
  if (value === "Present") {
    cell.classList.add("present");
  } else if (value === "Absent") {
    cell.classList.add("absent");
  }
}

// ✅ Add Row
function addRow() {
  const tableBody = document.getElementById("tableBody");
  const row = document.createElement("tr");

  // Default columns: Name, Roll No, Class, Section
  for (let i = 0; i < document.getElementById("tableHeader").children.length - 1; i++) {
    const td = document.createElement("td");
    if (i === 4) {
      const input = document.createElement("input");
      input.type = "tel";
      input.placeholder = "Enter number";
      input.onblur = function () {
        const number = input.value.trim();
        if (number) {
          td.innerHTML = `<a href="tel:${number}">${number}</a>`;
        }
      };
      td.appendChild(input);
    } else {
      td.contentEditable = true;
    }
    row.appendChild(td);
  }

  // Attendance Dropdown
  const attendanceTd = document.createElement("td");
  const select = document.createElement("select");
  select.innerHTML = `
    <option value="Present">Present</option>
    <option value="Absent">Absent</option>
  `;
  select.onchange = () => updateStatusClass(attendanceTd, select.value);
  updateStatusClass(attendanceTd, select.value);
  attendanceTd.appendChild(select);
  row.appendChild(attendanceTd);

  tableBody.appendChild(row);
}

// ✅ Remove Last Row
function deleteRow() {
  const tableBody = document.getElementById("tableBody");
  if (tableBody.rows.length === 0) {
    alert("No rows to delete.");
    return;
  }
  tableBody.deleteRow(tableBody.rows.length - 1);
}

// ✅ Add Column Before Attendance
function addColumn() {
  const header = document.getElementById("tableHeader");
  const newTh = document.createElement("th");
  newTh.contentEditable = true;
  newTh.textContent = "New Column";
  header.insertBefore(newTh, header.lastElementChild);

  document.querySelectorAll("#tableBody tr").forEach(row => {
    const newTd = document.createElement("td");
    newTd.contentEditable = true;
    row.insertBefore(newTd, row.lastElementChild);
  });
}

// ✅ Remove Only User-Added Columns (not default)
const defaultColumnCount = 5; // Adjust based on default headers (before Attendance)

function removeColumn() {
  const header = document.getElementById("tableHeader");
  const totalColumns = header.children.length;

  if (totalColumns <= defaultColumnCount + 1) {
    alert("Cannot remove default columns.");
    return;
  }

  const index = totalColumns - 2;
  header.removeChild(header.children[index]);

  document.querySelectorAll("#tableBody tr").forEach(row => {
    row.removeChild(row.children[index]);
  });
}

// ✅ Save Data
function saveData() {
  const headers = [];
  const headerCells = document.querySelectorAll("#tableHeader th");
  for (let i = 0; i < headerCells.length - 1; i++) {
    headers.push(headerCells[i].innerText.trim());
  }

  const rows = [];
  document.querySelectorAll("#tableBody tr").forEach(row => {
    const rowData = [];
    for (let i = 0; i < row.children.length - 1; i++) {
      const cell = row.children[i];
      if (cell.querySelector("a")) {
        rowData.push(cell.querySelector("a").textContent.trim());
      } else {
        rowData.push(cell.textContent.trim());
      }
    }
    rows.push(rowData);
  });

  localStorage.setItem("attendanceHeaders", JSON.stringify(headers));
  localStorage.setItem("attendanceRows", JSON.stringify(rows));
}

// ✅ Load Data
function loadData() {
  const headers = JSON.parse(localStorage.getItem("attendanceHeaders"));
  const rows = JSON.parse(localStorage.getItem("attendanceRows"));

  if (!headers || !rows) {
    alert("No saved data found.");
    return;
  }

  const header = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");
  header.innerHTML = "";
  tableBody.innerHTML = "";

  headers.forEach(text => {
    const th = document.createElement("th");
    th.contentEditable = true;
    th.textContent = text;
    header.appendChild(th);
  });

  const attendanceTh = document.createElement("th");
  attendanceTh.textContent = "Attendance";
  header.appendChild(attendanceTh);

  rows.forEach(data => {
    const row = document.createElement("tr");

    data.forEach((cellText, i) => {
      const td = document.createElement("td");

      if (i === 4 && /^\d{6,15}$/.test(cellText)) {
        td.innerHTML = `<a href="tel:${cellText}">${cellText}</a>`;
      } else {
        td.contentEditable = true;
        td.textContent = cellText;
      }

      row.appendChild(td);
    });

    const attendanceTd = document.createElement("td");
    const select = document.createElement("select");
    select.innerHTML = `
      <option value="Present">Present</option>
      <option value="Absent">Absent</option>
    `;
    select.onchange = () => updateStatusClass(attendanceTd, select.value);
    updateStatusClass(attendanceTd, select.value);
    attendanceTd.appendChild(select);
    row.appendChild(attendanceTd);

    tableBody.appendChild(row);
  });
}

// ✅ Export to Excel
function exportToExcel() {
  const table = document.getElementById("attendanceTable");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, "attendance.xlsx");
}
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const originalTable = document.getElementById("attendanceTable");
  const clonedTable = originalTable.cloneNode(true);

  // Replace dropdowns with text
  clonedTable.querySelectorAll("select").forEach(select => {
    const td = select.parentElement;
    td.textContent = select.value;
  });

  // Get selected date
  const selectedDate = document.getElementById("dateInput").value;
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString()
    : "No date selected";

  // Add title and date to PDF
  doc.setFontSize(16);
  doc.text("Daymark Attendance", 14, 16);
  doc.setFontSize(12);
  doc.text(`Date: ${formattedDate}`, 14, 24);

  // Add table below the date
  doc.autoTable({
    html: clonedTable,
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save("attendance.pdf");
}


// ✅ Auto-save on input or dropdown change
document.addEventListener("input", saveData);
document.addEventListener("change", saveData);
function removeRow() {
  const tableBody = document.getElementById('tableBody');
  if (tableBody.rows.length > 0) {
    tableBody.deleteRow(tableBody.rows.length - 1);
  }
}