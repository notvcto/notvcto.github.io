import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to a common desktop resolution
  await page.setViewportSize({ width: 1280, height: 720 });

  try {
      console.log('Navigating to localhost:3001...');
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

      // Wait for boot
      await page.waitForTimeout(5000);

      console.log('Taking desktop screenshot...');
      await page.screenshot({ path: 'verification/desktop_v2.png' });

      // Check for error text
      const errorText = await page.getByText('1 error').count();
      if (errorText > 0) {
          console.log('FOUND "1 error" on the page!');
      } else {
          console.log('No "1 error" found.');
      }

      // Find and click "Show Applications" button
      // It's the last item in the sidebar, has title "Show Applications"
      console.log('Clicking Show Applications...');
      // We can find it by title attribute or alt text
      const showAppsBtn = page.getByAltText('Show Applications');
      if (await showAppsBtn.count() > 0) {
          await showAppsBtn.click();
          await page.waitForTimeout(1000); // Wait for transition
          await page.screenshot({ path: 'verification/app_grid.png' });
          console.log('Taking app grid screenshot...');
      } else {
          console.error('Show Applications button not found!');
      }

  } catch (e) {
      console.error('Error during verification:', e);
  } finally {
      await browser.close();
  }
})();
