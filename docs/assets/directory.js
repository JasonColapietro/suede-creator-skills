// directory.js - progressive enhancement for /directory/ pages (scripts/build-directory.mjs).
// Every snippet is selectable text and every table row renders without script;
// this adds copy buttons and the category filter on top.
document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var src = document.getElementById(btn.getAttribute('data-copy-target'));
    if (!src || !navigator.clipboard) return;
    navigator.clipboard.writeText(src.textContent.trim()).then(function () {
      var idle = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = idle; }, 1800);
    });
  });
});
document.querySelectorAll('[data-filter-for]').forEach(function (input) {
  var table = document.getElementById(input.getAttribute('data-filter-for'));
  var status = document.getElementById(input.getAttribute('data-filter-status'));
  if (!table) return;
  var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (row) {
      var hit = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
      row.hidden = !hit;
      if (hit) shown++;
    });
    if (status) status.textContent = q ? shown + ' of ' + rows.length + ' shown' : '';
  });
});
