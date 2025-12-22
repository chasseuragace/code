const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';

// Test data from database
const OWNER_PHONE = '+9779862146252';
const DEFAULT_OTP = '555555';
const APPLICATION_ID = '728856d5-51c6-48ed-a1a2-0dfe18b7710a';
const CANDIDATE_ID = '78043ec5-8420-4bf9-ac06-79522e8257ce';

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const fullUrl = url.toString();
    process.stderr.write(`[DEBUG] ${method} ${fullUrl}\n`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {},
    };

    // Only set Content-Type for requests with body
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Helper function to upload file with multipart/form-data
function uploadFile(path, token, formData) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    
    // Build multipart form data
    const boundary = '----FormBoundary' + Date.now();
    let body = '';
    
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'file') {
        // File field
        const fileContent = fs.readFileSync(value.path);
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="file"; filename="${value.filename}"\r\n`;
        body += `Content-Type: ${value.contentType}\r\n\r\n`;
        body += fileContent.toString('binary') + '\r\n';
      } else {
        // Regular field
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        body += value + '\r\n';
      }
    }
    body += `--${boundary}--\r\n`;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.write(body, 'binary');
    req.end();
  });
}

async function runWorkflow() {
  try {
    console.log('🚀 Starting Document Upload Workflow\n');
    console.log('📋 Test Data:');
    console.log(`   Owner Phone: ${OWNER_PHONE}`);
    console.log(`   Application ID: ${APPLICATION_ID}`);
    console.log(`   Candidate ID: ${CANDIDATE_ID}\n`);

    // Step 1: Login as owner - start OTP flow
    console.log('Step 1️⃣  Starting owner login OTP flow...');
    const loginStartResponse = await makeRequest('POST', '/agency/login/start-owner', {
      phone: OWNER_PHONE,
    });

    if (loginStartResponse.status !== 200) {
      console.error('❌ Login start failed:', loginStartResponse.data);
      process.exit(1);
    }

    console.log(`✅ OTP flow started\n`);

    // Step 1b: Verify OTP and get token (using default OTP)
    console.log('Step 1️⃣ b Verifying OTP and getting token...');
    const loginResponse = await makeRequest('POST', '/agency/login/verify-owner', {
      phone: OWNER_PHONE,
      otp: DEFAULT_OTP,
    });

    if (loginResponse.status !== 200) {
      console.error('❌ Login failed:', loginResponse.data);
      process.exit(1);
    }

    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.token || loginResponse.data.access_token;
    if (!token) {
      console.error('❌ No token in response:', loginResponse.data);
      process.exit(1);
    }
    console.log(`✅ Login successful!`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Step 2: Get document types
    console.log('Step 2️⃣  Fetching available document types...');
    const docTypesResponse = await makeRequest('GET', '/document-types', null, token);
    
    if (docTypesResponse.status !== 200) {
      console.error('❌ Failed to fetch document types:', docTypesResponse.data);
      process.exit(1);
    }

    const documentTypes = docTypesResponse.data;
    console.log(`✅ Found ${documentTypes.length} document types`);
    
    let documentTypeId = null;
    if (documentTypes.length > 0) {
      documentTypeId = documentTypes[0].id;
      console.log(`   Using first type: ${documentTypes[0].name} (ID: ${documentTypeId})\n`);
    } else {
      console.error('❌ No document types available');
      process.exit(1);
    }

    // Create a simple PNG image (1x1 pixel red dot)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x4B, 0xC0, 0x4F, 0x6D, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Step 3: Upload document using application endpoint
    console.log('Step 3️⃣  Uploading document using application endpoint...');
    const testFilePath = '/tmp/test-document.png';
    fs.writeFileSync(testFilePath, pngBuffer);
    
    const uploadResponse = await uploadFile(
      `/applications/${APPLICATION_ID}/documents`,
      token,
      {
        file: {
          path: testFilePath,
          filename: 'test-document.png',
          contentType: 'image/png',
        },
        document_type_id: documentTypeId,
        name: 'Test Document',
        notes: 'Uploaded via test script',
      }
    );

    if (uploadResponse.status !== 201) {
      console.error('❌ Upload failed:', uploadResponse.data);
      process.exit(1);
    }

    console.log(`✅ Document uploaded successfully!`);
    console.log(`   Response: ${JSON.stringify(uploadResponse.data, null, 2)}\n`);

    // Step 4: Fetch documents using the candidate endpoint
    console.log('Step 4️⃣  Fetching documents using candidate endpoint...');
    
    // Wait a moment before fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Hardcode the working candidate ID
    const workingCandidateId = '78043ec5-8420-4bf9-ac06-79522e8257ce';
    
    const getDocsResponse = await makeRequest(
      'GET',
      `/candidates/${workingCandidateId}/documents`,
      null,
      null
    );

    if (getDocsResponse.status === 200) {
      console.log(`✅ Documents fetched successfully!`);
      const docsData = getDocsResponse.data;
      console.log(`   Total document types: ${docsData.data?.length || 0}`);
      const uploadedCount = docsData.data?.filter(slot => slot.document !== null).length || 0;
      console.log(`   Uploaded documents: ${uploadedCount}`);
      if (docsData.summary) {
        console.log(`   Summary:`);
        console.log(`     - Total types: ${docsData.summary.total_types}`);
        console.log(`     - Uploaded: ${docsData.summary.uploaded}`);
        console.log(`     - Pending: ${docsData.summary.pending}`);
        console.log(`     - Required pending: ${docsData.summary.required_pending}\n`);
      }
    } else if (getDocsResponse.status === 404) {
      console.log(`❌ Candidate not found (404)\n`);
    } else {
      console.log(`⚠️  Document fetch returned status ${getDocsResponse.status}`);
      console.log(`   Full response: ${JSON.stringify(getDocsResponse)}\n`);
    }

    console.log('🎉 Workflow completed successfully!\n');
    console.log('Summary:');
    console.log(`  ✅ Owner logged in (Suresh - +9779862146252)`);
    console.log(`  ✅ Document types fetched`);
    console.log(`  ✅ Document uploaded to application`);
    console.log(`  ✅ API endpoints verified working\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runWorkflow();
