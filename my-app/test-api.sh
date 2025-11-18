#!/bin/bash

BASE_URL="http://localhost:3000"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================================================"
echo -e "${BLUE}🧪 KarirKit API Testing${NC}"
echo "========================================================================"

# Test 1: Register
echo -e "\n${YELLOW}📋 Test 1: Register${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Test User","email":"testuser'$(date +%s)'@example.com","password":"test123456"}')

STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$STATUS_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
else
  echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
fi
echo "Response: $BODY"

# Extract email from register response
REGISTER_EMAIL=$(echo "$BODY" | grep -o '"email":"[^"]*' | cut -d'"' -f4)

# Test 2: Login
echo -e "\n${YELLOW}📋 Test 2: Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$REGISTER_EMAIL"'","password":"test123456"}')

STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$STATUS_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
  TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  echo "Token extracted: ${TOKEN:0:50}..."
else
  echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
fi
echo "Response: $BODY"

# Test 3: Profile without token (should fail)
echo -e "\n${YELLOW}📋 Test 3: Profile without token (should be blocked)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/profile")

STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$STATUS_CODE" -eq 401 ]; then
  echo -e "${GREEN}✅ PASSED${NC} - Correctly blocked with 401"
else
  echo -e "${RED}❌ FAILED${NC} - Should return 401, got: $STATUS_CODE"
fi
echo "Response: $BODY"

# Test 4: Profile with token
if [ ! -z "$TOKEN" ]; then
  echo -e "\n${YELLOW}📋 Test 4: Profile with token${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/profile" \
    -H "Authorization: Bearer $TOKEN")

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: $BODY"
else
  echo -e "\n${RED}⚠️  Skipping Test 4: No token available${NC}"
fi

# Test 5: Update Profile
if [ ! -z "$TOKEN" ]; then
  echo -e "\n${YELLOW}📋 Test 5: Update Profile${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"fullname":"Updated Name","phone":"+628123456789"}')

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: $BODY"
else
  echo -e "\n${RED}⚠️  Skipping Test 5: No token available${NC}"
fi

# Test 6: Job Match Making
MATCH_MAKING_ID=""
if [ ! -z "$TOKEN" ]; then
  echo -e "\n${YELLOW}📋 Test 6: Job Match Making (POST)${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/match-making" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"location":"Jakarta","industry":"Technology","expectedSalary":15000000,"skill":["JavaScript","React","Node.js"],"position":"Software Engineer"}')

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ] || [ "$STATUS_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
    MATCH_MAKING_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "Match Making ID: $MATCH_MAKING_ID"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: ${BODY:0:200}..."
else
  echo -e "\n${RED}⚠️  Skipping Test 6: No token available${NC}"
fi

# Test 6b: Get Match Making by ID
if [ ! -z "$TOKEN" ] && [ ! -z "$MATCH_MAKING_ID" ]; then
  echo -e "\n${YELLOW}📋 Test 6b: Get Match Making by ID${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/match-making/$MATCH_MAKING_ID" \
    -H "Authorization: Bearer $TOKEN")

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: ${BODY:0:300}..."
else
  echo -e "\n${RED}⚠️  Skipping Test 6b: No token or Match Making ID${NC}"
fi

# Test 7: Salary Benchmark
SALARY_BENCHMARK_ID=""
if [ ! -z "$TOKEN" ]; then
  echo -e "\n${YELLOW}📋 Test 7: Salary Benchmark (POST)${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/sallary-benchmark" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"jobTitle":"Software Engineer","location":"Jakarta","experienceYear":3,"currentOrOfferedSallary":15000000}')

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ] || [ "$STATUS_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
    SALARY_BENCHMARK_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "Salary Benchmark ID: $SALARY_BENCHMARK_ID"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: ${BODY:0:200}..."
else
  echo -e "\n${RED}⚠️  Skipping Test 7: No token available${NC}"
fi

# Test 7b: Get Salary Benchmark by ID
if [ ! -z "$TOKEN" ] && [ ! -z "$SALARY_BENCHMARK_ID" ]; then
  echo -e "\n${YELLOW}📋 Test 7b: Get Salary Benchmark by ID${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/sallary-benchmark/$SALARY_BENCHMARK_ID" \
    -H "Authorization: Bearer $TOKEN")

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: ${BODY:0:300}..."
else
  echo -e "\n${RED}⚠️  Skipping Test 7b: No token or Salary Benchmark ID${NC}"
fi

# Test 8: Upload PDF
RESUME_ID=""
if [ ! -z "$TOKEN" ]; then
  echo -e "\n${YELLOW}📋 Test 8: Upload PDF${NC}"
  
  # Create a dummy PDF file for testing
  echo "%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test CV Content) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000315 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
408
%%EOF" > /tmp/test-cv.pdf

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/upload-pdf" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@/tmp/test-cv.pdf")

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
    RESUME_ID=$(echo "$BODY" | grep -o '"resumeId":"[^"]*' | cut -d'"' -f4)
    echo "Resume ID: $RESUME_ID"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: ${BODY:0:200}..."
  
  # Cleanup
  rm -f /tmp/test-cv.pdf
else
  echo -e "\n${RED}⚠️  Skipping Test 8: No token available${NC}"
fi

# Test 9: Analyze CV
if [ ! -z "$TOKEN" ] && [ ! -z "$RESUME_ID" ]; then
  echo -e "\n${YELLOW}📋 Test 9: Analyze CV with Gemini AI${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/analyze-cv" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"resumeId":"'"$RESUME_ID"'"}')

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: ${BODY:0:300}..."
else
  echo -e "\n${RED}⚠️  Skipping Test 9: No token or Resume ID${NC}"
fi

# Test 10: Summarize PDF
if [ ! -z "$TOKEN" ] && [ ! -z "$RESUME_ID" ]; then
  echo -e "\n${YELLOW}📋 Test 10: Summarize PDF${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/summarize-pdf" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"resumeId":"'"$RESUME_ID"'"}')

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: ${BODY:0:300}..."
else
  echo -e "\n${RED}⚠️  Skipping Test 10: No token or Resume ID${NC}"
fi

# Test 11: Logout
if [ ! -z "$TOKEN" ]; then
  echo -e "\n${YELLOW}📋 Test 11: Logout${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/logout" \
    -H "Authorization: Bearer $TOKEN")

  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $STATUS_CODE"
  else
    echo -e "${RED}❌ FAILED${NC} - Status: $STATUS_CODE"
  fi
  echo "Response: $BODY"
else
  echo -e "\n${RED}⚠️  Skipping Test 11: No token available${NC}"
fi

echo -e "\n========================================================================"
echo -e "${BLUE}✨ Testing Complete${NC}"
echo "========================================================================"
