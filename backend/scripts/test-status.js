#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🧪 BudgetWise Backend Test Status Check\n");

try {
  // Run tests and capture output
  console.log("Running tests...");
  const testOutput = execSync("npm test 2>&1", { encoding: "utf-8" });

  // Parse test results
  const testPassed =
    testOutput.includes("Tests:") && !testOutput.includes("failed");
  const testSuites = testOutput.match(/Test Suites: (\d+) passed/)?.[1] || "0";
  const testsCount = testOutput.match(/Tests:\s+(\d+) passed/)?.[1] || "0";

  console.log(`✅ Tests Status: ${testPassed ? "PASSING" : "FAILING"}`);
  console.log(`📊 Test Suites: ${testSuites} passed`);
  console.log(`🎯 Total Tests: ${testsCount} passed`);

  // Run coverage and parse results
  console.log("\nRunning coverage analysis...");
  const coverageOutput = execSync("npm run test:coverage 2>&1", {
    encoding: "utf-8",
  });

  // Extract coverage percentages
  const coverageMatch = coverageOutput.match(
    /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/
  );

  if (coverageMatch) {
    const [, statements, branches, functions, lines] = coverageMatch;
    console.log(`📈 Coverage Summary:`);
    console.log(`   Statements: ${statements}%`);
    console.log(`   Branches: ${branches}%`);
    console.log(`   Functions: ${functions}%`);
    console.log(`   Lines: ${lines}%`);
  }

  // Generate status badge data
  const badgeData = {
    schemaVersion: 1,
    label: "tests",
    message: testPassed ? `${testsCount} passing` : "failing",
    color: testPassed ? "brightgreen" : "red",
    timestamp: new Date().toISOString(),
  };

  // Save badge data
  const badgePath = path.join(__dirname, "../coverage/badge.json");
  fs.mkdirSync(path.dirname(badgePath), { recursive: true });
  fs.writeFileSync(badgePath, JSON.stringify(badgeData, null, 2));

  console.log(`\n💾 Badge data saved to: ${badgePath}`);

  // Exit with proper code
  process.exit(testPassed ? 0 : 1);
} catch (error) {
  console.error("❌ Test execution failed:");
  console.error(error.message);

  // Generate failure badge
  const failureBadge = {
    schemaVersion: 1,
    label: "tests",
    message: "failing",
    color: "red",
    timestamp: new Date().toISOString(),
  };

  const badgePath = path.join(__dirname, "../coverage/badge.json");
  fs.mkdirSync(path.dirname(badgePath), { recursive: true });
  fs.writeFileSync(badgePath, JSON.stringify(failureBadge, null, 2));

  process.exit(1);
}
