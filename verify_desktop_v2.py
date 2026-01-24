from playwright.sync_api import sync_playwright
import time

def verify_desktop():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Wait for desktop to load
        page.wait_for_selector("[data-context='desktop-area']")
        time.sleep(2) # Extra wait for animations

        # 1. Test Selection (Drag)
        # Mouse down on desktop, move, mouse up
        page.mouse.move(100, 100)
        page.mouse.down(button="left")
        page.mouse.move(300, 300)

        # Take screenshot of selection
        page.screenshot(path="/home/jules/verification/selection_v2.png")

        page.mouse.up()

        # 2. Test Drag Icon
        # Find Firefox icon (id="firefox")
        # UbuntuApp component renders with id props.id
        firefox = page.locator("#firefox").first
        if firefox.count() > 0:
            box = firefox.bounding_box()
            if box:
                # Drag it
                page.mouse.move(box['x'] + box['width']/2, box['y'] + box['height']/2)
                page.mouse.down()
                page.mouse.move(box['x'] + 150, box['y'] + 150) # Move
                page.mouse.up()

                time.sleep(1) # Wait for snap
                page.screenshot(path="/home/jules/verification/dragged_v2.png")

        # 3. Test Context Menu (Regression Test)
        # Right click on desktop area
        page.mouse.move(500, 100)
        page.mouse.down(button="right")
        page.mouse.up(button="right")
        time.sleep(0.5)
        page.screenshot(path="/home/jules/verification/context_menu.png")

        browser.close()

if __name__ == "__main__":
    verify_desktop()
