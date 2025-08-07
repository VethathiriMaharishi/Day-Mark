// ✅ Highlight attendance
function updateStatusClass(cell, value) {
  cell.classList.remove("present", "absent");
  if (value === "Present") cell.classList.add("present");
  else if (value === "Absent") cell.classList.add("absent");
  updateSummaryCount();
}

// ✅ Add row
function addRow() {
  const tableBody = document.getElementById("tableBody");
  const row = document.createElement("tr");
  const cols = document.getElementById("tableHeader").children.length - 1;

  for (let i = 0; i < cols; i++) {
    const td = document.createElement("td");
    if (i === 4) {
      const input = document.createElement("input");
      input.type = "tel";
      input.placeholder = "Enter number";
      input.onblur = () => {
        const number = input.value.trim();
        if (number) {
          td.innerHTML = `<a href="tel:${number}">${number}</a>`;
          td.onclick = () => makeEditable(td, number);
        }
      };
      td.appendChild(input);
    } else {
      td.contentEditable = true;
    }
    row.appendChild(td);
  }

  const attendanceTd = document.createElement("td");
  const select = document.createElement("select");
  select.innerHTML = `<option value="Present">Present</option><option value="Absent">Absent</option>`;
  select.onchange = () => updateStatusClass(attendanceTd, select.value);
  updateStatusClass(attendanceTd, select.value);
  attendanceTd.appendChild(select);
  row.appendChild(attendanceTd);
  tableBody.appendChild(row);
  updateSummaryCount();
}

// ✅ Make number editable again
function makeEditable(td, number) {
  td.innerHTML = "";
  const input = document.createElement("input");
  input.type = "tel";
  input.value = number;
  input.onblur = () => {
    if (input.value.trim()) {
      td.innerHTML = `<a href="tel:${input.value.trim()}">${input.value.trim()}</a>`;
      td.onclick = () => makeEditable(td, input.value.trim());
      saveData();
    }
  };
  td.appendChild(input);
  input.focus();
}

// ✅ Remove row
function removeRow() {
  const tableBody = document.getElementById("tableBody");
  if (tableBody.rows.length > 0) tableBody.deleteRow(-1);
  updateSummaryCount();
}

// ✅ Add column
function addColumn() {
  const header = document.getElementById("tableHeader");
  const th = document.createElement("th");
  th.textContent = "New Column";
  th.contentEditable = true;
  header.insertBefore(th, header.lastElementChild);

  document.querySelectorAll("#tableBody tr").forEach(row => {
    const td = document.createElement("td");
    td.contentEditable = true;
    row.insertBefore(td, row.lastElementChild);
  });
}

// ✅ Remove only user-added columns
const defaultColumnCount = 5;
function removeColumn() {
  const header = document.getElementById("tableHeader");
  const total = header.children.length;
  if (total <= defaultColumnCount + 1) {
    alert("Cannot remove default columns.");
    return;
  }
  const index = total - 2;
  header.removeChild(header.children[index]);
  document.querySelectorAll("#tableBody tr").forEach(row => {
    row.removeChild(row.children[index]);
  });
}

// ✅ Save data including attendance
function saveData() {
  const headers = [...document.querySelectorAll("#tableHeader th")].slice(0, -1).map(th => th.innerText);
  const rows = [...document.querySelectorAll("#tableBody tr")].map(row => {
    const data = [...row.children].slice(0, -1).map(cell => {
      const a = cell.querySelector("a");
      return a ? a.textContent.trim() : cell.textContent.trim();
    });
    const select = row.querySelector("select");
    data.push(select?.value || "");
    return data;
  });
  localStorage.setItem("attendanceHeaders", JSON.stringify(headers));
  localStorage.setItem("attendanceRows", JSON.stringify(rows));
  updateSummaryCount();
}

// ✅ Load data
function loadData() {
  const headers = JSON.parse(localStorage.getItem("attendanceHeaders"));
  const rows = JSON.parse(localStorage.getItem("attendanceRows"));
  if (!headers || !rows) {
    addRow();
    return;
  }

  const header = document.getElementById("tableHeader");
  const body = document.getElementById("tableBody");
  header.innerHTML = "";
  body.innerHTML = "";

  headers.forEach(h => {
    const th = document.createElement("th");
    th.contentEditable = true;
    th.textContent = h;
    header.appendChild(th);
  });

  const th = document.createElement("th");
  th.textContent = "Attendance";
  header.appendChild(th);

  rows.forEach(data => {
    const row = document.createElement("tr");
    data.forEach((text, i) => {
      const td = document.createElement("td");
      if (i === 4) {
        const input = document.createElement("input");
        input.type = "tel";
        input.value = text;
        input.onblur = () => {
          if (input.value.trim()) {
            td.innerHTML = `<a href="tel:${input.value.trim()}">${input.value.trim()}</a>`;
            td.onclick = () => makeEditable(td, input.value.trim());
            saveData();
          }
        };
        td.appendChild(input);
      } else {
        td.contentEditable = true;
        td.textContent = text;
      }
      row.appendChild(td);
    });

    const attendanceTd = document.createElement("td");
    const select = document.createElement("select");
    select.innerHTML = `<option value="Present">Present</option><option value="Absent">Absent</option>`;
    select.value = data[data.length - 1];
    select.onchange = () => updateStatusClass(attendanceTd, select.value);
    updateStatusClass(attendanceTd, select.value);
    attendanceTd.appendChild(select);
    row.appendChild(attendanceTd);
    body.appendChild(row);
  });

  updateSummaryCount();
}

// ✅ Export all to Excel
function exportToExcel() {
  const table = document.getElementById("attendanceTable");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, "attendance.xlsx");
}

// ✅ Export all to PDF
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const table = document.getElementById("attendanceTable").cloneNode(true);

  table.querySelectorAll("select").forEach(select => {
    const td = select.parentElement;
    td.textContent = select.value;
  });

  const date = document.getElementById("dateInput").value;
  doc.setFontSize(16);
  doc.text("Daymark Attendance", 14, 16);
  doc.setFontSize(12);
  doc.text(`Date: ${date}`, 14, 24);

  doc.autoTable({ html: table, startY: 30 });
  doc.save("attendance.pdf");
}

// ✅ Filtered Export
function exportFilteredPDF(status) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const headers = [...document.querySelectorAll("#tableHeader th")].map(th => th.innerText);
  const rows = [];

  document.querySelectorAll("#tableBody tr").forEach(row => {
    const values = [...row.children].map(cell => {
      if (cell.querySelector("select")) {
        return cell.querySelector("select").value;
      } else {
        return cell.textContent.trim();
      }
    });
    if (values[5] === status) rows.push(values);
  });

  if (rows.length === 0) {
    alert(`No ${status} records found.`);
    return;
  }

  doc.setFontSize(16);
  doc.text(`${status} Students`, 14, 16);
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 25,
  });

  doc.save(`${status}_Attendance.pdf`);
}

function exportPresentPDF() {
  exportFilteredPDF("Present");
}

function exportAbsentPDF() {
  exportFilteredPDF("Absent");
}

// ✅ Show selected weekday
function updateDay() {
  const date = new Date(document.getElementById("dateInput").value);
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  document.getElementById("dayDisplay").textContent = `(${day})`;
}

// ✅ Search
function searchTable() {
  const filter = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll("#tableBody tr").forEach(row => {
    const name = row.children[0]?.textContent.toLowerCase() || "";
    const roll = row.children[1]?.textContent.toLowerCase() || "";
    row.style.display = (name.includes(filter) || roll.includes(filter)) ? "" : "none";
  });
}

// ✅ Update attendance counts
function updateSummaryCount() {
  let present = 0, absent = 0;
  document.querySelectorAll("#tableBody tr").forEach(row => {
    const select = row.querySelector("select");
    if (select) {
      if (select.value === "Present") present++;
      else if (select.value === "Absent") absent++;
    }
  });
  document.getElementById("presentCount").textContent = `Present: ${present}`;
  document.getElementById("absentCount").textContent = `Absent: ${absent}`;
}

// ✅ Clear all data
function clearData() {
  const confirmClear = confirm("Are you sure you want to clear all saved data?");
  if (!confirmClear) return;

  localStorage.removeItem("attendanceHeaders");
  localStorage.removeItem("attendanceRows");

  const header = document.getElementById("tableHeader");
  const body = document.getElementById("tableBody");

  header.innerHTML = "";
  body.innerHTML = "";

  const defaultHeaders = ["Name", "Roll No", "Class", "Section", "Mobile Number"];
  defaultHeaders.forEach(text => {
    const th = document.createElement("th");
    th.contentEditable = true;
    th.textContent = text;
    header.appendChild(th);
  });

  const attendanceTh = document.createElement("th");
  attendanceTh.textContent = "Attendance";
  header.appendChild(attendanceTh);

  addRow();
  updateSummaryCount();
}

// ✅ Auto save
document.addEventListener("input", saveData);
document.addEventListener("change", saveData);
