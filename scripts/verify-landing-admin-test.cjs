#!/usr/bin/env node
var adminTest = require("../api/_lib/admin-test-lead");

var failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else console.log("OK  ", msg);
}

var patched = adminTest.applyAdminTestDefaults({}, {});
assert(patched.email && patched.phone && patched.city, "applyAdminTestDefaults remplit email/tel/ville");
assert(patched.adminTest === true, "flag adminTest");

Promise.resolve()
  .then(function () {
    if (failed) {
      console.log("\n" + failed + " échec(s)");
      process.exit(1);
    }
    console.log("\nAdmin test lib OK");
  })
  .catch(function (e) {
    console.error(e);
    process.exit(1);
  });
