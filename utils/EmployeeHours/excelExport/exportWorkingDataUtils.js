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
          6,
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
          6,
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

  billable.sort((a, b) => a["Job Name/Number"] - b["Job Name/Number"]);

  const formattedBillable = [];

  for (let i = 0; i < billable.length; i++) {
    //check if Job Name/Number of next entry matches current
    //if not, add empty rows in between
    let currentRows = [];
    if (
      billable[i + 1] &&
      billable[i + 1]["Job Name/Number"] !== billable[i]["Job Name/Number"]
    ) {
      currentRows = [billable[i], {}, {}];
    } else {
      currentRows = [billable[i]];
    }

    formattedBillable.push(...currentRows);
  }

  return [
    ...nonBillable.sort((a, b) => a["Job Title"] - b["Job Title"]),
    {},
    {},
    ...formattedBillable,
  ];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);

  return date;
};

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
    // const backgroundColor = rowIndex % 2 === 0 ? "#f2f2f2" : "#ffffff"; // Alternate gray and white
    addedRow.eachCell((cell, colNumber) => {
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
