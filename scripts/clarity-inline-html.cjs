/** Snippet Clarity inline pour <head> — détecté par le dashboard Microsoft (view-source). */
module.exports = function clarityInlineHtml(projectId) {
  var id = projectId || "x7yqp46fj9";
  return (
    '<script type="text/javascript">\n' +
    "(function(){\n" +
    '  var K="lo_cookie_consent_v1";\n' +
    "  function ok(){try{return localStorage.getItem(K)!==\"essential\";}catch(e){return true;}}\n" +
    "  window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments);};\n" +
    "  var g=ok();\n" +
    '  window.clarity("consentv2",{ad_Storage:g?"granted":"denied",analytics_Storage:g?"granted":"denied"});\n' +
    '  if(document.getElementById("clarity-script"))return;\n' +
    "  (function(c,l,a,r,i,t,y){\n" +
    "    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments);};\n" +
    '    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;t.id="clarity-script";\n' +
    "    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n" +
    '  })(window,document,"clarity","script","' +
    id +
    '");\n' +
    "})();\n" +
    "</script>"
  );
};
