/* =====================================================================
   MAIN APPLICATION BOOTSTRAPPER & DEEP LINK HANDLER
   ===================================================================== */
(function initApp() {
  const initial = new URLSearchParams(location.search).get('query');
  if (initial && typeof ask === 'function') {
    ask(initial);
  }
})();
