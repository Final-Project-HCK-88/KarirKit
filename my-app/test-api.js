const BASE_URL = "http://localhost:3000";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

let authToken = "";

// Helper function untuk print hasil
function printResult(endpoint, method, status, success, message, data = null) {
  const statusColor = success ? colors.green : colors.red;
  const methodColor = colors.cyan;

  console.log(
    `\n${methodColor}${method}${colors.reset} ${colors.blue}${endpoint}${colors.reset}`
  );
  console.log(`Status: ${statusColor}${status}${colors.reset}`);
  console.log(`Result: ${success ? "✅ SUCCESS" : "❌ FAILED"}`);
  console.log(`Message: ${message}`);
  if (data) {
    console.log(`Data:`, JSON.stringify(data, null, 2));
  }
  console.log("─".repeat(80));
}

// Test functions
async function testRegister() {
  const randomEmail = `testuser${Date.now()}@example.com`;
  try {
    const response = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullname: "Test User",
        email: randomEmail,
        password: "test123456",
      }),
    });

    const data = await response.json();
    const success = response.ok;

    printResult(
      "/api/register",
      "POST",
      response.status,
      success,
      data.message,
      data
    );
    return success;
  } catch (error) {
    printResult("/api/register", "POST", 500, false, error.message);
    return false;
  }
}

async function testLogin() {
  // Gunakan user yang baru dibuat atau user existing
  const loginEmail = "testuser@example.com"; // Ganti dengan email yang valid
  const loginPassword = "test123456";

  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

    const data = await response.json();
    const success = response.ok;

    if (success && data.token) {
      authToken = data.token;
      console.log(
        `\n${colors.green}🔑 Token saved for subsequent requests${colors.reset}`
      );
    }

    printResult("/api/login", "POST", response.status, success, data.message, {
      token: data.token ? "***" : null,
    });
    return success;
  } catch (error) {
    printResult("/api/login", "POST", 500, false, error.message);
    return false;
  }
}

async function testProfile() {
  if (!authToken) {
    console.log(
      `\n${colors.red}❌ No auth token available. Skipping profile test.${colors.reset}`
    );
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    const success = response.ok;

    printResult(
      "/api/profile",
      "GET",
      response.status,
      success,
      data.message || "Profile retrieved",
      data.data
    );
    return success;
  } catch (error) {
    printResult("/api/profile", "GET", 500, false, error.message);
    return false;
  }
}

async function testUpdateProfile() {
  if (!authToken) {
    console.log(
      `\n${colors.red}❌ No auth token available. Skipping update profile test.${colors.reset}`
    );
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fullname: "Updated Test User",
        phone: "+62812345678",
      }),
    });

    const data = await response.json();
    const success = response.ok;

    printResult(
      "/api/profile",
      "PUT",
      response.status,
      success,
      data.message,
      data.data
    );
    return success;
  } catch (error) {
    printResult("/api/profile", "PUT", 500, false, error.message);
    return false;
  }
}

async function testMatchMaking() {
  if (!authToken) {
    console.log(
      `\n${colors.red}❌ No auth token available. Skipping match-making test.${colors.reset}`
    );
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/match-making`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        jobTitle: "Software Engineer",
        location: "Jakarta",
        skills: ["JavaScript", "React", "Node.js"],
      }),
    });

    const data = await response.json();
    const success = response.ok;

    printResult(
      "/api/match-making",
      "POST",
      response.status,
      success,
      data.message || "Match-making completed",
      data
    );
    return success;
  } catch (error) {
    printResult("/api/match-making", "POST", 500, false, error.message);
    return false;
  }
}

async function testSalaryBenchmark() {
  if (!authToken) {
    console.log(
      `\n${colors.red}❌ No auth token available. Skipping salary benchmark test.${colors.reset}`
    );
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/sallary-benchmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        jobTitle: "Software Engineer",
        location: "Jakarta",
        experience: 3,
      }),
    });

    const data = await response.json();
    const success = response.ok;

    printResult(
      "/api/sallary-benchmark",
      "POST",
      response.status,
      success,
      data.message || "Salary benchmark completed",
      data
    );
    return success;
  } catch (error) {
    printResult("/api/sallary-benchmark", "POST", 500, false, error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log(
    `\n${colors.yellow}Testing unauthorized access (without token)...${colors.reset}`
  );

  try {
    const response = await fetch(`${BASE_URL}/api/profile`, {
      method: "GET",
      // No Authorization header
    });

    const data = await response.json();
    const success = !response.ok && response.status === 401;

    printResult(
      "/api/profile (no auth)",
      "GET",
      response.status,
      success,
      success ? "Correctly blocked by middleware" : "Should have been blocked",
      data
    );
    return success;
  } catch (error) {
    printResult("/api/profile (no auth)", "GET", 500, false, error.message);
    return false;
  }
}

async function testLogout() {
  if (!authToken) {
    console.log(
      `\n${colors.red}❌ No auth token available. Skipping logout test.${colors.reset}`
    );
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    const success = response.ok;

    printResult("/api/logout", "POST", response.status, success, data.message);

    if (success) {
      authToken = ""; // Clear token after logout
    }

    return success;
  } catch (error) {
    printResult("/api/logout", "POST", 500, false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`${colors.cyan}🧪 Starting KarirKit API Tests${colors.reset}`);
  console.log(`${colors.cyan}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${"=".repeat(80)}\n`);

  const results = {
    passed: 0,
    failed: 0,
  };

  // Test 1: Unauthorized access (should fail with 401)
  console.log(
    `\n${colors.yellow}📋 Test 1: Middleware Protection${colors.reset}`
  );
  if (await testUnauthorizedAccess()) results.passed++;
  else results.failed++;

  // Test 2: Register
  console.log(`\n${colors.yellow}📋 Test 2: User Registration${colors.reset}`);
  if (await testRegister()) results.passed++;
  else results.failed++;

  // Test 3: Login
  console.log(`\n${colors.yellow}📋 Test 3: User Login${colors.reset}`);
  if (await testLogin()) results.passed++;
  else results.failed++;

  // Test 4: Get Profile (protected)
  console.log(
    `\n${colors.yellow}📋 Test 4: Get Profile (Protected)${colors.reset}`
  );
  if (await testProfile()) results.passed++;
  else results.failed++;

  // Test 5: Update Profile (protected)
  console.log(
    `\n${colors.yellow}📋 Test 5: Update Profile (Protected)${colors.reset}`
  );
  if (await testUpdateProfile()) results.passed++;
  else results.failed++;

  // Test 6: Match Making (protected)
  console.log(
    `\n${colors.yellow}📋 Test 6: Job Match Making (Protected)${colors.reset}`
  );
  if (await testMatchMaking()) results.passed++;
  else results.failed++;

  // Test 7: Salary Benchmark (protected)
  console.log(
    `\n${colors.yellow}📋 Test 7: Salary Benchmark (Protected)${colors.reset}`
  );
  if (await testSalaryBenchmark()) results.passed++;
  else results.failed++;

  // Test 8: Logout
  console.log(`\n${colors.yellow}📋 Test 8: User Logout${colors.reset}`);
  if (await testLogout()) results.passed++;
  else results.failed++;

  // Summary
  console.log(`\n${"=".repeat(80)}`);
  console.log(`${colors.cyan}📊 Test Summary${colors.reset}`);
  console.log(`${"=".repeat(80)}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`Total: ${results.passed + results.failed}`);
  console.log(`${"=".repeat(80)}\n`);
}

// Run tests
runAllTests().catch(console.error);
