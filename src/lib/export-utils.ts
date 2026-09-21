/**
 * Client-side Export Utility for CSV and Microsoft Excel (.xls SpreadsheetML) Workbooks
 * 100% Offline, lightweight, zero external binary dependencies.
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitize = (val: string | number) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(","),
    ...rows.map((row) => row.map(sanitize).join(",")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  sheetName = "Report Data"
) {
  const escapeXml = (val: any) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const headerCells = headers
    .map(
      (h) =>
        `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`
    )
    .join("");

  const rowXml = rows
    .map((row) => {
      const cells = row
        .map((val) => {
          const isNum = typeof val === "number" && !isNaN(val);
          const type = isNum ? "Number" : "String";
          return `<Cell ss:StyleID="${isNum ? "NumberStyle" : "DataStyle"}"><Data ss:Type="${type}">${escapeXml(
            val
          )}</Data></Cell>`;
        })
        .join("");
      return `<Row ss:Height="20">${cells}</Row>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${escapeXml(filename)}</Title>
  <Author>PharmaDist ERP</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Calibri, sans-serif" ss:Size="10" ss:Color="#111827"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Segoe UI, Calibri, sans-serif" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0071E3" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#005bb5"/>
   </Borders>
  </Style>
  <Style ss:ID="DataStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table ss:DefaultRowHeight="18">
   <Row ss:Height="24">${headerCells}</Row>
   ${rowXml}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitPane>
    <TopRowBottomPane>1</TopRowBottomPane>
   </SplitPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.xls`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

