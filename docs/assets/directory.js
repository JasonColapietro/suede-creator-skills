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
  // A long table is split: the first rows render open, the rest sit in a
  // <details> with the same data-filter-group. Filtering searches both and
  // opens the overflow when it holds a match.
  var group = input.getAttribute('data-filter-for');
  var status = document.getElementById(input.getAttribute('data-filter-status'));
  var tables = Array.prototype.slice.call(document.querySelectorAll('table[data-filter-group="' + group + '"]'));
  var more = document.querySelector('details[data-filter-group="' + group + '"]');
  var rows = [];
  tables.forEach(function (t) { rows = rows.concat(Array.prototype.slice.call(t.querySelectorAll('tbody tr'))); });
  if (!rows.length) return;
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    var hiddenHit = false;
    rows.forEach(function (row) {
      var hit = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
      row.hidden = !hit;
      if (hit) {
        shown++;
        if (more && more.contains(row)) hiddenHit = true;
      }
    });
    if (more && q && hiddenHit) more.open = true;
    if (status) status.textContent = q ? shown + ' of ' + rows.length + ' shown' : '';
  });
});
