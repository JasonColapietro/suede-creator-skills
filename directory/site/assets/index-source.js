// The homepage browser, task search and workflow builder use the same records.
(() => {
  let pending;
  window.loadSuedeSkillIndex = () => {
    if (!pending) pending = fetch('/search-index.json', { signal: AbortSignal.timeout(12000) }).then(response => {
      if (!response.ok) throw new Error('Skill index unavailable');
      return response.json();
    }).catch(error => { pending = undefined; throw error; });
    return pending;
  };
})();
