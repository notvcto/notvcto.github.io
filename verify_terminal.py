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

        # Type lsblk
        print("Typing lsblk...")
        page.keyboard.type("lsblk")
        page.keyboard.press("Enter")
        time.sleep(1) # Wait for output

        print("Screenshotting lsblk...")
        page.screenshot(path="/home/jules/verification/terminal_lsblk.png")

        # Type nano test.txt
        print("Typing nano test.txt...")
        page.keyboard.type("nano test.txt")
        page.keyboard.press("Enter")
        time.sleep(1) # Wait for UI switch

        print("Screenshotting Nano...")
        page.screenshot(path="/home/jules/verification/terminal_nano.png")

        # Verify Nano UI
        content = page.content()
        if "GNU nano" in content:
             print("Nano header found.")
        else:
             print("Nano header NOT found.")

        # Exit Nano
        print("Exiting Nano...")
        page.keyboard.press("Control+x")
        time.sleep(1)

        print("Screenshotting Exit...")
        page.screenshot(path="/home/jules/verification/terminal_exit.png")

        browser.close()

if __name__ == "__main__":
    verify_terminal()
