window.CrmExport = {
  toCsv: function (rows, columns) {
    var esc = function (v) {
      var s = v == null ? "" : String(v);
      if (s.indexOf('"') !== -1 || s.indexOf(",") !== -1 || s.indexOf("\n") !== -1) {
        s = '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    var lines = [columns.map(function (c) { return esc(c.label); }).join(",")];
    rows.forEach(function (row) {
      lines.push(columns.map(function (c) { return esc(c.value(row)); }).join(","));
    });
    return lines.join("\n");
  },
  download: function (filename, content, mime) {
    mime = mime || "text/csv;charset=utf-8";
    var blob = new Blob(["\ufeff" + content], { type: mime });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
