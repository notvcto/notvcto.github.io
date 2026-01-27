import time
from playwright.sync_api import sync_playwright

def verify_terminal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to localhost:3000...")
        page.goto("http://localhost:3000")

        # Wait for loading to finish (wait for desktop or sidebar)
        print("Waiting for sidebar...")
        try:
            # Look for any sidebar item
            page.wait_for_selector('[id^="sidebar-"]', timeout=30000)
        except:
             print("Sidebar not found. Taking debug screenshot.")
             page.screenshot(path="/home/jules/verification/debug_load_fail.png")
             browser.close()
             return

        # Click Terminal
        print("Clicking Terminal...")
        try:
             page.click("#sidebar-terminal", timeout=5000)
        except:
             print("sidebar-terminal not found. Taking debug screenshot...")
             page.screenshot(path="/home/jules/verification/debug_sidebar.png")
             browser.close()
             return

        # Wait for terminal window
        print("Waiting for terminal window...")
        try:
            page.wait_for_selector("text=vcto@ubuntu", timeout=10000)
        except:
             print("Terminal window not found. Screenshotting.")
             page.screenshot(path="/home/jules/verification/debug_terminal_fail.png")
             browser.close()
             return

        # Type nano test_save.txt
        print("Typing nano test_save.txt...")
        page.keyboard.type("nano test_save.txt")
        page.keyboard.press("Enter")
        time.sleep(1) # Wait for UI switch

        # Type some text
        page.keyboard.type("Hello World")
        time.sleep(0.5)

        # Save with Ctrl+O
        print("Saving with Ctrl+O...")
        page.keyboard.press("Control+o")
        time.sleep(0.5)

        print("Screenshotting Nano Save...")
        page.screenshot(path="/home/jules/verification/terminal_nano_save.png")

        # Exit Nano
        print("Exiting Nano...")
        page.keyboard.press("Control+x")
        time.sleep(1)

        # Verify file exists via cat
        print("Verifying file content via cat...")
        page.keyboard.type("cat test_save.txt")
        page.keyboard.press("Enter")
        time.sleep(1)

        print("Screenshotting Cat Output...")
        page.screenshot(path="/home/jules/verification/terminal_cat_verify.png")

        browser.close()

if __name__ == "__main__":
    verify_terminal()
