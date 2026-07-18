const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotsDir = path.join(__dirname, 'simulation-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 960 } });
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3000';

  // Helper for taking screenshots
  let screenshotIndex = 1;
  const takeScreenshot = async (name) => {
    const filename = `${String(screenshotIndex++).padStart(2, '0')}-${name}.png`;
    const filepath = path.join(screenshotsDir, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`Saved screenshot: ${filename}`);
  };

  try {
    // ----------------------------------------------------
    // STEP 0: Reset the database to clean seed state
    // ----------------------------------------------------
    console.log('--- STEP 0: Resetting database via /api/seed ---');
    await page.goto(`${baseUrl}/login`); // Warm up the connection
    await page.evaluate(async () => {
      const res = await fetch('/api/seed', { method: 'POST' });
      return res.json();
    });
    console.log('Database reset complete.');

    // ----------------------------------------------------
    // STEP 1: Register 2 new dummy participants with different teams
    // ----------------------------------------------------
    console.log('\n--- STEP 1: Registering Participant 1 (Team Alpha) ---');
    await page.goto(`${baseUrl}/register`);
    await page.fill('input[placeholder="Mohd Abdul Rahman"]', 'Alpha Captain');
    await page.fill('input[placeholder="you@example.com"]', 'alpha_captain@gwd.global');
    await page.fill('input[placeholder="Min. 8 characters"]', 'BizSim2026');
    await page.fill('input[placeholder="+91 98765..."]', '+91 99999 11111');
    await page.fill('input[placeholder="MJCET"]', 'Alpha College');
    await takeScreenshot('register-step1-participant1');

    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="linkedin.com/in/yourname"]', 'https://linkedin.com/in/alphacaptain');
    await takeScreenshot('register-step2-participant1');

    console.log('Sending direct API request to register participant 1 with Team Alpha...');
    const regRes1 = await page.evaluate(async () => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Alpha Captain',
          email: 'alpha_captain@gwd.global',
          password: 'BizSim2026',
          phone: '+91 99999 11111',
          college: 'Alpha College',
          linkedin: 'https://linkedin.com/in/alphacaptain',
          preferredRole: 'deal_architect',
          skills: ['pitching'],
          teamName: 'Team Alpha'
        })
      });
      return res.json();
    });
    console.log('Participant 1 Registration Response:', regRes1);

    console.log('\n--- Registering Participant 2 (Team Beta) ---');
    console.log('Sending direct API request to register participant 2 with Team Beta...');
    const regRes2 = await page.evaluate(async () => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Beta Captain',
          email: 'beta_captain@gwd.global',
          password: 'BizSim2026',
          phone: '+91 88888 22222',
          college: 'Beta College',
          linkedin: 'https://linkedin.com/in/betacaptain',
          preferredRole: 'deal_architect',
          skills: ['pitching'],
          teamName: 'Team Beta'
        })
      });
      return res.json();
    });
    console.log('Participant 2 Registration Response:', regRes2);

    // ----------------------------------------------------
    // STEP 2: Log in as Participant 1 & Submit Deal (50,000)
    // ----------------------------------------------------
    console.log('\n--- STEP 2: Logging in as Participant 1 ---');
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[placeholder="you@example.com"]', 'alpha_captain@gwd.global');
    await page.fill('input[placeholder="••••••••"]', 'BizSim2026');
    await takeScreenshot('login-participant1');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    console.log('Successfully logged in as Participant 1.');
    await page.waitForTimeout(1000);
    await takeScreenshot('dashboard-participant1-initial');

    console.log('Navigating to Niche Leads...');
    await page.goto(`${baseUrl}/niche`);
    await page.waitForTimeout(1000);
    await takeScreenshot('niche-leads-participant1');

    console.log('Claiming first available lead...');
    const claimButton = page.locator('button:has-text("Claim Lead")').first();
    if (await claimButton.count() > 0) {
      await claimButton.click();
      await page.waitForTimeout(1500);
      await takeScreenshot('lead-claimed-participant1');
    }

    console.log('Navigating to New Deal form...');
    await page.goto(`${baseUrl}/deals/new`);
    await page.waitForTimeout(1000);
    
    await page.fill('input[placeholder="e.g., Sunshine Dental Care"]', 'Smile Dental Clinic');
    await page.fill('input[placeholder="e.g., Dr. Rajesh Sharma"]', 'Dr. Rajesh Kumar');
    await page.fill('input[placeholder="+91 98765 43210"]', '+91 98765 43210');
    await page.fill('input[placeholder="doctor@sunshinedental.com"]', 'doctor@smiledental.com');
    await page.selectOption('select', 'Google My Business + SEO');
    await page.fill('input[placeholder="15000"]', '50000');
    await takeScreenshot('deal-new-step1-participant1');

    await page.click('button:has-text("Next: Proof of Interest")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="Paste URL (e.g., https://...)"]', 'https://whatsapp.com/proof-smile-dental');
    await page.fill('textarea[placeholder*="E.g., Dr. Rajesh wants"]', 'Pitched GMB & SEO setup for Rs. 50,000. Customer is ready.');
    await takeScreenshot('deal-new-step2-participant1');

    await page.click('button:has-text("Next: Review & Submit")');
    await page.waitForTimeout(500);
    await takeScreenshot('deal-new-step3-participant1');

    await page.click('button:has-text("Submit to GWD Sales Queue")');
    await page.waitForTimeout(2000);
    await takeScreenshot('deal-submitted-participant1');

    console.log('Logging out Participant 1...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForTimeout(500);

    // ----------------------------------------------------
    // STEP 3: Log in as Participant 2 & Submit Deal (15,000)
    // ----------------------------------------------------
    console.log('\n--- STEP 3: Logging in as Participant 2 ---');
    await page.fill('input[placeholder="you@example.com"]', 'beta_captain@gwd.global');
    await page.fill('input[placeholder="••••••••"]', 'BizSim2026');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    console.log('Successfully logged in as Participant 2.');
    await page.waitForTimeout(1000);
    await takeScreenshot('dashboard-participant2-initial');

    console.log('Navigating to Niche Leads...');
    await page.goto(`${baseUrl}/niche`);
    await page.waitForTimeout(1000);
    await takeScreenshot('niche-leads-participant2');

    console.log('Claiming first available lead...');
    const claimButton2 = page.locator('button:has-text("Claim Lead")').first();
    if (await claimButton2.count() > 0) {
      await claimButton2.click();
      await page.waitForTimeout(1500);
      await takeScreenshot('lead-claimed-participant2');
    }

    console.log('Navigating to New Deal form...');
    await page.goto(`${baseUrl}/deals/new`);
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder="e.g., Sunshine Dental Care"]', 'CareFirst Diagnostics');
    await page.fill('input[placeholder="e.g., Dr. Rajesh Sharma"]', 'Sunil Reddy');
    await page.fill('input[placeholder="+91 98765 43210"]', '+91 97411 22334');
    await page.fill('input[placeholder="doctor@sunshinedental.com"]', 'sunil@carefirst.com');
    await page.selectOption('select', 'Social Media Management');
    await page.fill('input[placeholder="15000"]', '15000');
    await takeScreenshot('deal-new-step1-participant2');

    await page.click('button:has-text("Next: Proof of Interest")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="Paste URL (e.g., https://...)"]', 'https://whatsapp.com/proof-carefirst');
    await page.fill('textarea[placeholder*="E.g., Dr. Rajesh wants"]', 'Pitched Social Media Management for Rs 15,000.');
    await takeScreenshot('deal-new-step2-participant2');

    await page.click('button:has-text("Next: Review & Submit")');
    await page.waitForTimeout(500);
    await takeScreenshot('deal-new-step3-participant2');

    await page.click('button:has-text("Submit to GWD Sales Queue")');
    await page.waitForTimeout(2000);
    await takeScreenshot('deal-submitted-participant2');

    console.log('Logging out Participant 2...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForTimeout(500);

    // ----------------------------------------------------
    // STEP 4: Log in as Organizer & Admin controls
    // ----------------------------------------------------
    console.log('\n--- STEP 4: Logging in as Organizer ---');
    await page.fill('input[placeholder="you@example.com"]', 'organizer@gwd.global');
    await page.fill('input[placeholder="••••••••"]', 'BizSim2026');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    console.log('Successfully logged in as Organizer.');
    await page.waitForTimeout(1000);
    await takeScreenshot('dashboard-organizer');

    console.log('Navigating to Admin Panel...');
    await page.goto(`${baseUrl}/admin`);
    await page.waitForTimeout(1000);
    await takeScreenshot('admin-panel-initial');

    console.log('Pausing event...');
    await page.click('button[title="Pause Event"]');
    await page.waitForSelector('button[title="Resume Event"]', { timeout: 10000 });
    await takeScreenshot('admin-panel-paused');

    console.log('Resuming event...');
    await page.click('button[title="Resume Event"]');
    await page.waitForSelector('button[title="Pause Event"]', { timeout: 10000 });
    await takeScreenshot('admin-panel-resumed');

    console.log('Navigating to Admin Deals Verification Queue...');
    await page.goto(`${baseUrl}/admin/deals`);
    await page.waitForTimeout(1500);
    await takeScreenshot('admin-deals-queue');

    console.log('Marking both deals as contacted...');
    const contactButtons = page.locator('button:has-text("Mark Client Contacted")');
    const contactCount = await contactButtons.count();
    console.log(`Found ${contactCount} open deals to mark contacted.`);
    for (let i = 0; i < contactCount; i++) {
      await contactButtons.nth(0).click();
      await page.waitForTimeout(1000);
    }
    await takeScreenshot('admin-deals-contacted');

    await page.click('button:has-text("3. Awaiting Payment")');
    await page.waitForTimeout(1000);
    await takeScreenshot('admin-deals-awaiting-payment-tab');

    console.log('Confirming payment for Smile Dental Clinic...');
    const closeButtons = page.locator('button:has-text("Confirm GWD Paid & Award Points")');
    await closeButtons.first().click();
    await page.waitForTimeout(500);
    await takeScreenshot('admin-payment-modal-smile-dental');

    await page.fill('input[type="number"]', '50000');
    await page.fill('input[placeholder="pay_P1q2w3e4r5t6y7 or NEFT Ref #..."]', 'pay_Alpha123456');
    await page.click('button:has-text("Confirm GWD Paid & Unlock Points")');
    await page.waitForTimeout(1500);
    await takeScreenshot('admin-deal-smile-dental-closed');

    const closeButtons2 = page.locator('button:has-text("Confirm GWD Paid & Award Points")');
    await closeButtons2.first().click();
    await page.waitForTimeout(500);
    await takeScreenshot('admin-payment-modal-carefirst');

    await page.fill('input[type="number"]', '15000');
    await page.fill('input[placeholder="pay_P1q2w3e4r5t6y7 or NEFT Ref #..."]', 'pay_Beta123456');
    await page.click('button:has-text("Confirm GWD Paid & Unlock Points")');
    await page.waitForTimeout(1500);
    await takeScreenshot('admin-deal-carefirst-closed');

    // ----------------------------------------------------
    // STEP 5: Verify Updated Dashboards & Leaderboard
    // ----------------------------------------------------
    console.log('\n--- STEP 5: Verifying Leaderboard Rankings ---');
    await page.goto(`${baseUrl}/leaderboard`);
    await page.waitForTimeout(1500);
    await takeScreenshot('leaderboard-post-deal-close');

    // ----------------------------------------------------
    // STEP 6: Advance Event Days until Finale Day (Day 9)
    // ----------------------------------------------------
    console.log('\n--- STEP 6: Advancing event days to Day 9 ---');
    await page.goto(`${baseUrl}/admin`);
    await page.waitForTimeout(1000);

    for (let day = 5; day <= 9; day++) {
      console.log(`Advancing to Day ${day}...`);
      await page.click('button[title="Advance Day"]');
      await page.waitForSelector(`text=Day ${day} of`, { timeout: 10000 });
      await takeScreenshot(`admin-day-${day}-advanced`);
    }

    // ----------------------------------------------------
    // STEP 7: Navigate to Grand Finale page as Participant
    // ----------------------------------------------------
    console.log('\n--- STEP 7: Logging out and logging in as Participant 1 to view Grand Finale ---');
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[placeholder="you@example.com"]', 'alpha_captain@gwd.global');
    await page.fill('input[placeholder="••••••••"]', 'BizSim2026');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    console.log('Logged in as Participant 1. Navigating to Grand Finale...');
    await page.goto(`${baseUrl}/finale`);
    await page.waitForTimeout(2000);
    await takeScreenshot('grand-finale-awards');

    const firstPlaceWinner = await page.innerText('div:has-text("Overall Hackathon Champion") >> xpath=.. >> h3');
    console.log(`Displayed #1 Winner on Grand Finale Page: ${firstPlaceWinner.trim()}`);

    console.log('\n--- Simulation Completed Successfully! ---');

  } catch (error) {
    console.error('Simulation Failed:', error);
    await takeScreenshot('simulation-error-state');
  } finally {
    await browser.close();
  }
})();
