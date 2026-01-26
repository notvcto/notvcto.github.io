from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        print("Navigating to localhost:3000...")
        try:
            page.goto("http://localhost:3000", wait_until="networkidle")

            # Wait for boot
            time.sleep(5)

            print("Taking desktop screenshot...")
            page.screenshot(path="verification/desktop_v2.png")

            # Check for error text
            if page.get_by_text("1 error").count() > 0:
                print("FOUND '1 error' on the page!")
            else:
                print("No '1 error' found.")

            # Find and click "Show Applications" button
            print("Clicking Show Applications...")
            show_apps_btn = page.locator("img[alt='Show Applications']")
            if show_apps_btn.count() > 0:
                show_apps_btn.click()
                time.sleep(1)
                page.screenshot(path="verification/app_grid.png")
                print("Taking app grid screenshot...")
            else:
                print("Show Applications button not found!")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
