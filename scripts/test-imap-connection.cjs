#!/usr/bin/env node
/** Délègue au test IMAP serveur (variables Vercel requises). */
var mail = require("../api/_lib/mail-imap");

mail
  .testImapSources()
  .then(function (r) {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  })
  .catch(function (e) {
    console.error(e);
    process.exit(1);
  });
