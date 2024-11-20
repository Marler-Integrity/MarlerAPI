const XLSX = require("xlsx");

exports.formatShopManagerData = (data, peopleCodesMap, SAPCategoryMap) => {
  const formattedData = data.flatMap((entry) => {
    const separatedEntries = [];

    if (!entry.SAPCategory) return separatedEntries;

    if (Number(entry.Regular) > 0) {
      separatedEntries.push({
        "Subjob ID": SAPCategoryMap[entry.SAPCategory].SubCategoryNumber,
        Staff: `${entry.FirstName} ${entry.LastName}`,
        Date: entry.EntryDate,
        "Time Type": "Standard",
        Quantity: Number(entry.Regular) || null,
        "Non-Chargable": null,
        "Item No.": String(peopleCodesMap[entry.PeopleID].RegSAPCode).padStart(
          5,
          0
        ),
      });
    }

    if (Number(entry.OT) > 0) {
      separatedEntries.push({
        "Subjob ID": SAPCategoryMap[entry.SAPCategory].SubCategoryNumber,
        Staff: `${entry.FirstName} ${entry.LastName}`,
        Date: entry.EntryDate,
        "Time Type": "Overtime",
        Quantity: Number(entry.OT) || null,
        "Non-Chargable": null,
        "Item No.": String(peopleCodesMap[entry.PeopleID].OTSAPCode).padStart(
          5,
          0
        ),
      });
    }

    return separatedEntries;
  });
  return formattedData;
};

exports.formatProjectManagerData = (data, SAPCategoryMap) => {
  //get all the non-billable entries those without a JobName

  const nonBillable = [];
  const billable = [];

  data.forEach((entry) => {
    const sapCategory = SAPCategoryMap[String(entry.SAPCategory)];

    if (!entry.JobName) {
      nonBillable.push({
        "Employee Name": `${entry.FirstName} ${entry.LastName}`,
        "Job Title": `${sapCategory.SubCategoryNumber} ${sapCategory.SubCategoryName}`,
        "Job Name/Number": null,
        "Billable/Non-billable": "Non-Billable",
        Hrs: Number(entry.Regular) || null,
        "O.T Hrs": Number(entry.OT) || null,
        Equipment: entry.Notes,
      });
    } else {
      billable.push({
        "Employee Name": `${entry.FirstName} ${entry.LastName}`,
        "Job Title": null,
        "Job Name/Number": entry.JobName,
        "Billable/Non-billable": "Billable",
        Hrs: Number(entry.Regular) || null,
        "O.T Hrs": Number(entry.OT) || null,
        Equipment: entry.Notes,
      });
    }
  });

  return [
    ...nonBillable.sort((a, b) => a["Job Title"] - b["Job Title"]),
    {},
    ...billable.sort((a, b) => a["Job Name/Number"] - b["Job Name/Number"]),
  ];
};

// exports.styleWorksheetColumns = (worksheet, type) => {
//   if (type === "ShopManager") {
//     const columnCount = Object.keys(worksheet).filter((key) =>
//       key.match(/^[A-Z]+1$/)
//     ).length; // Match header cells (e.g., A1, B1, etc.)

//     worksheet["!cols"] = Array(columnCount).fill({ wch: 20 });
//   }
//   if (type === "ProjectManager") {
//     worksheet["!cols"] = [
//       { wch: 30 },
//       { wch: 40 },
//       { wch: 50 },
//       { wch: 20 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 40 },
//     ];
//   }
// };

const formatDate = (dateString) => {
  const date = new Date(dateString);

  return date;
};

// exports.formatDateColumnInSheet = (worksheet, dateColumnIndex) => {
//   const range = XLSX.utils.decode_range(worksheet["!ref"]); // Get range of the worksheet

//   // Loop over the rows in the worksheet (excluding the header row)
//   for (let row = range.s.r + 1; row <= range.e.r; row++) {
//     const dateCell = XLSX.utils.encode_cell({ r: row, c: dateColumnIndex }); // Get cell reference
//     const dateString = worksheet[dateCell]?.v; // Get the cell value (date string)

//     if (dateString) {
//       const formattedDate = formatDate(dateString); // Convert to a Date object
//       worksheet[dateCell] = {
//         t: "d", // Type is 'd' for date
//         v: formattedDate,
//         z: "dd-mmm-yy", // Custom date format (Excel-friendly)
//       };
//     }
//   }
// };

// exports.styleAndFillShopManagerWorksheet = (
//   formattedShopManagerData,
//   shopManagerWorksheet
// ) => {
//   const headers = Object.keys(formattedShopManagerData[0]);

//   // Add header row and apply styles
//   const headerRow = shopManagerWorksheet.addRow(headers);

//   // Style headers
//   headerRow.eachCell((cell) => {
//     cell.font = { bold: true };
//     cell.alignment = { vertical: "middle", horizontal: "center" };
//     cell.fill = {
//       type: "pattern",
//       pattern: "solid",
//       //   fgColor: { argb: "FFB6D7A8" }, // Light green
//     };
//   });

//   // Set column widths dynamically
//   shopManagerWorksheet.columns = headers.map((header) => ({
//     header, // Header name
//     key: header, // Key used for row data
//     width: 30, // Default width; you can customize this
//   }));

//   // Add all rows in bulk
//   shopManagerWorksheet.addRows(formattedShopManagerData);

//   // Style specific rows or columns, e.g., date formatting
//   const dateColumn = shopManagerWorksheet.getColumn("Date"); // Adjust "Date" to match your column key
//   if (dateColumn) {
//     dateColumn.numFmt = "mm/dd/yyyy"; // Date format
//   }
// };

/////

exports.styleAndFillShopManagerWorksheet = (
  formattedShopManagerData,
  shopManagerWorksheet
) => {
  // Define header row and styles
  const headerRow = [
    "Subjob ID",
    "Staff",
    "Time Type",
    "Date",
    "Quantity",
    "Non-Chargable",
    "Item No.",
  ];

  // Map keys to header order
  // const dataKeys = ["SubjobID", "Staff", "TimeTypes", "Date", "Quantity", "NonChargable", "ItemNo"];

  // Define column styles
  const columnStyles = {
    A: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "ffd5cc" },
      },
    }, // Red for "Subjob ID"
    B: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "ffd5cc" },
      },
    }, // Red for "Staff"
    C: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "ffd5cc" },
      },
    }, // Red for "Time Types"
    D: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "d4f2d2" },
      },
    }, // Green for "Date"
    E: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "d4f2d2" },
      },
    }, // Green for "Quantity"
    F: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "d2e7f7" },
      },
    }, // Blue for "Non-chargable"
    G: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "d2e7f7" },
      },
    }, // Blue for "Item No."
  };

  // Add header row with bold text and specific width
  const header = shopManagerWorksheet.addRow(headerRow);
  header.eachCell((cell, colNumber) => {
    cell.font = { bold: true }; // Bold header
    shopManagerWorksheet.getColumn(colNumber).width = 20; // Set width to 20
  });

  // Add data rows with styles
  formattedShopManagerData.forEach((rowObject) => {
    // Map object properties to header order
    const rowValues = headerRow.map((key) => rowObject[key]);

    // Add the row
    const addedRow = shopManagerWorksheet.addRow(rowValues);

    // Apply styles to each cell in the row
    addedRow.eachCell((cell, colNumber) => {
      const columnKey = String.fromCharCode(64 + colNumber); // Convert column index to letter (A, B, C, etc.)
      if (columnStyles[columnKey]) {
        Object.assign(cell, columnStyles[columnKey]); // Apply the column's style
      }

      // If the current column is "Date" (4th column, index 3), format as date
      if (colNumber === 4) {
        const dateValue = cell.value;
        const formattedDate = formatDate(dateValue); // Format the date
        if (formattedDate) {
          cell.value = formattedDate;
          cell.numFmt = "dd-mmm-yy"; // Apply custom date format
        }
      }
    });
  });
};

exports.styleAndFillProjectManagerWorksheet = (
  formattedProjectManagerData,
  projectManagerWorksheet
) => {
  // Define header row
  const headerRow = [
    "Employee Name",
    "Job Title",
    "Job Name/Number",
    "Billable/Non-billable",
    "Hrs",
    "O.T Hrs",
    "Equipment",
  ];

  // Define column styles (except for row color)
  const columnStyles = {
    A: {
      // Employee Name
      width: 50,
    },
    B: {
      // Job Title
      width: 50,
    },
    C: {
      // Job Name/Number
      width: 50,
    },
    D: {
      // Billable/Non-billable
      width: 50,
    },
    E: {
      // Hrs
      width: 20,
    },
    F: {
      // O.T Hrs
      width: 20,
    },
    G: {
      // Equipment
      width: 50,
    },
  };

  // Add header row with bold text and specific width
  const header = projectManagerWorksheet.addRow(headerRow);
  header.eachCell((cell, colNumber) => {
    cell.font = { bold: true }; // Bold header
    const colKey = String.fromCharCode(64 + colNumber); // Convert index to column letter
    if (columnStyles[colKey]) {
      projectManagerWorksheet.getColumn(colNumber).width =
        columnStyles[colKey].width;
    }
  });

  // Add data rows with alternating row colors
  formattedProjectManagerData.forEach((rowObject, rowIndex) => {
    // Map object properties to header order
    const rowValues = headerRow.map((key) => rowObject[key]);

    // Add the row
    const addedRow = projectManagerWorksheet.addRow(rowValues);

    // Apply alternating row background colors
    const backgroundColor = rowIndex % 2 === 0 ? "#f2f2f2" : "#ffffff"; // Alternate gray and white
    addedRow.eachCell((cell, colNumber) => {
      // Apply alternating background color
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: backgroundColor.replace("#", "") }, // Set background color
      };

      // Specific background color for "Billable" and "Non-billable"
      if (cell.value === "Billable") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "ffb880" }, // Orange for "Billable"
        };
      } else if (cell.value === "Non-Billable") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "ffeebc" }, // Yellow for "Non-billable"
        };
      }
    });
  });
};
