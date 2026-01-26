from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Listen for console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    # Go to local host
    page.goto("http://localhost:3002")

    # Wait for loading
    page.wait_for_selector('text=Activities', timeout=10000)
    page.wait_for_timeout(3000)

    # Get the navbar
    navbar = page.locator(".main-navbar-vp")

    # Print HTML for debugging
    # print(navbar.inner_html())

    # Target the clock div (2nd child)
    clock_el = navbar.locator("> div:nth-child(2)")
    print(f"Targeting: {clock_el.inner_text()}")

    # Force mousedown via JS (updated for onMouseDown handler)
    print("Triggering mousedown via JS...")
    clock_el.evaluate("element => element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))")

    # Wait for panel
    try:
        page.wait_for_selector("text=Notifications", timeout=5000)
        print("Panel opened!")
    except Exception as e:
        print(f"Panel did not open: {e}")
        page.screenshot(path="verification/failure_debug.png")
        browser.close()
        return

    # Take screenshot
    page.screenshot(path="verification/notification_panel_v3.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
