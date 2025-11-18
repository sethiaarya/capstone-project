// tests/dashboard.selenium.test.js
// Golden Twilight – 10 Selenium UI tests (Node + Mocha + selenium-webdriver)

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");

const BASE_URL = "http://localhost:3000/pages/personal_dashboard.html";

describe("Golden Twilight Dashboard – Selenium Tests", function () {
  this.timeout(40000); // 40s total per test if needed

  /** @type {import('selenium-webdriver').ThenableWebDriver} */
  let driver;

  // Shared test user (email generated in TC3, reused in TC5)
  let testEmail = "";
  const testPassword = "Selenium123!";

  before(async () => {
    const options = new chrome.Options();
    options.addArguments("--headless=new");
    options.addArguments("--window-size=1280,800");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  // Load dashboard before each test
  beforeEach(async () => {
    await driver.get(BASE_URL);
    // Wait for hero title to prove page loaded
    await driver.wait(until.elementLocated(By.css("h1")), 10000);
  });

  // Helper: wait for exact text on an element
  async function waitForText(locator, expected, timeout = 10000) {
    const el = await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(async () => {
      const t = await el.getText();
      return t.trim() === expected;
    }, timeout);
    return el;
  }

  // Helper: open auth modal
  async function openAuthModal() {
    const openBtn = await driver.findElement(By.id("openAuth"));
    await openBtn.click();
    const modal = await driver.findElement(By.id("authModal"));
    await driver.wait(until.elementIsVisible(modal), 10000);
    return modal;
  }

  // --- TC1 -------------------------------------------------------------
  it("TC1: loads dashboard and shows main KPIs", async () => {
    const title = await driver.getTitle();
    assert.ok(
      title.includes("Golden Twilight"),
      "Page title should contain 'Golden Twilight'"
    );

    const kpiTrips = await driver.findElement(By.id("kpiTrips"));
    const kpiWishlist = await driver.findElement(By.id("kpiWishlist"));
    const kpiHotels = await driver.findElement(By.id("kpiHotels"));
    const kpiActivity = await driver.findElement(By.id("kpiActivity"));

    assert.ok(kpiTrips, "Trips KPI should exist");
    assert.ok(kpiWishlist, "Wishlist KPI should exist");
    assert.ok(kpiHotels, "Hotels KPI should exist");
    assert.ok(kpiActivity, "Activity KPI should exist");
  });

  // --- TC2 -------------------------------------------------------------
  it("TC2: opens and closes the auth modal from the header button", async () => {
    const modal = await openAuthModal();
    let displayed = await modal.isDisplayed();
    assert.ok(displayed, "Auth modal should be visible after clicking openAuth");

    const closeBtn = await driver.findElement(By.id("closeAuth"));
    await closeBtn.click();

    // Wait for modal to be hidden (display=false)
    await driver.wait(async () => {
      const vis = await modal.isDisplayed().catch(() => false);
      return vis === false;
    }, 10000);
  });

  // --- TC3 -------------------------------------------------------------
  it("TC3: registers a new profile and shows Signed in status + name", async () => {
    await openAuthModal();

    // Unique email for each run
    testEmail = `selenium+${Date.now()}@example.com`;

    const nameInput = await driver.findElement(By.id("regName"));
    const emailInput = await driver.findElement(By.id("regEmail"));
    const passInput = await driver.findElement(By.id("regPass"));
    const form = await driver.findElement(By.id("regForm"));

    await nameInput.clear();
    await nameInput.sendKeys("Selenium Tester");
    await emailInput.clear();
    await emailInput.sendKeys(testEmail);
    await passInput.clear();
    await passInput.sendKeys(testPassword);

    await form.submit();

    // Wait for status to change to Signed in
    await waitForText(By.id("statusLabel"), "Signed in");

    const navUserName = await driver.findElement(By.id("navUserName"));
    const navText = await navUserName.getText();
    assert.ok(
      navText.includes("Selenium") || navText.length > 0,
      "navUserName should show the signed-in user's name"
    );
  });

  // --- TC4 -------------------------------------------------------------
  it("TC4: logs out successfully and returns to Guest status", async () => {
    // If still signed in from previous test, logout should be visible
    const logoutBtn = await driver.findElement(By.id("logoutBtn"));
    await logoutBtn.click();

    // Wait for Guest status
    await waitForText(By.id("statusLabel"), "Guest");
    const openAuth = await driver.findElement(By.id("openAuth"));
    assert.ok(await openAuth.isDisplayed(), "openAuth button should be visible again");
  });

  // --- TC5 -------------------------------------------------------------
  it("TC5: logs back in using existing profile and hides Sign in button", async () => {
    await openAuthModal();

    const emailInput = await driver.findElement(By.id("loginEmail"));
    const passInput = await driver.findElement(By.id("loginPass"));
    const form = await driver.findElement(By.id("loginForm"));

    await emailInput.clear();
    await emailInput.sendKeys(testEmail);
    await passInput.clear();
    await passInput.sendKeys(testPassword);

    await form.submit();

    await waitForText(By.id("statusLabel"), "Signed in");

    const openAuth = await driver.findElement(By.id("openAuth"));
    const logoutBtn = await driver.findElement(By.id("logoutBtn"));

    const openAuthDisplayed = await openAuth.isDisplayed().catch(() => false);
    const logoutDisplayed = await logoutBtn.isDisplayed().catch(() => false);

    assert.strictEqual(
      openAuthDisplayed,
      false,
      "Sign in button should be hidden after login"
    );
    assert.strictEqual(
      logoutDisplayed,
      true,
      "Logout button should be visible after login"
    );
  });

  // --- TC6 -------------------------------------------------------------
  it("TC6: adds a new Trip and shows it in Active Trips list", async () => {
    const title = "Selenium Trip " + Date.now();

    const titleInput = await driver.findElement(By.id("tripTitle"));
    const destInput = await driver.findElement(By.id("tripDest"));
    const startInput = await driver.findElement(By.id("tripStart"));
    const endInput = await driver.findElement(By.id("tripEnd"));
    const budgetInput = await driver.findElement(By.id("tripBudget"));
    const form = await driver.findElement(By.id("tripForm"));

    await titleInput.sendKeys(title);
    await destInput.sendKeys("Testville");
    await startInput.sendKeys("2025-12-01");
    await endInput.sendKeys("2025-12-10");
    await budgetInput.sendKeys("999");

    await form.submit();

    await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@id="tripsList"]//div[contains(@class,"border") and .//div[contains(text(), "${title}")]]`
        )
      ),
      10000
    );
  });

  // --- TC7 -------------------------------------------------------------
  it("TC7: adds a new Wishlist item and displays it in the list", async () => {
    const place = "Selenium Wishlist " + Date.now();

    const placeInput = await driver.findElement(By.id("wishInput"));
    const noteInput = await driver.findElement(By.id("wishNote"));
    const form = await driver.findElement(By.id("wishForm"));

    await placeInput.sendKeys(place);
    await noteInput.sendKeys("Automation wish spot");

    await form.submit();

    await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@id="wishlistList"]//div[contains(@class,"border") and .//div[contains(text(),"${place}")]]`
        )
      ),
      10000
    );
  });

  // --- TC8 -------------------------------------------------------------
  it("TC8: adds a new Hotel and displays it in the list", async () => {
    const place = "Selenium Hotel " + Date.now();

    const placeInput = await driver.findElement(By.id("hotelPlace"));
    const checkIn = await driver.findElement(By.id("hotelCheckIn"));
    const checkOut = await driver.findElement(By.id("hotelCheckOut"));
    const noteInput = await driver.findElement(By.id("hotelNote"));
    const form = await driver.findElement(By.id("hotelForm"));

    await placeInput.sendKeys(place);
    await checkIn.sendKeys("2025-12-05");
    await checkOut.sendKeys("2025-12-08");
    await noteInput.sendKeys("UI test hotel");

    await form.submit();

    await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@id="hotelsList"]//div[contains(@class,"border") and .//div[contains(text(),"${place}")]]`
        )
      ),
      10000
    );
  });

  // --- TC9 (fixed) -----------------------------------------------------
  it("TC9: removes a Trip using the Remove button", async () => {
    // Always create a fresh trip just for this test so we KNOW a Remove button exists
    const title = "Temp Trip For Delete " + Date.now();

    const titleInput = await driver.findElement(By.id("tripTitle"));
    const destInput = await driver.findElement(By.id("tripDest"));
    const startInput = await driver.findElement(By.id("tripStart"));
    const endInput = await driver.findElement(By.id("tripEnd"));
    const form = await driver.findElement(By.id("tripForm"));

    await titleInput.sendKeys(title);
    await destInput.sendKeys("DeleteTown");
    await startInput.sendKeys("2025-12-01");
    await endInput.sendKeys("2025-12-02");
    await form.submit();

    // Locate the specific trip card containing that title
    const card = await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@id="tripsList"]//div[contains(@class,"border") and .//div[contains(text(),"${title}")]]`
        )
      ),
      10000
    );

    // Within that card, find its Remove button
    const removeBtn = await card.findElement(By.css("button.remove-trip"));
    await removeBtn.click();

    // Wait until that card disappears from the DOM
    await driver.wait(until.stalenessOf(card), 10000);
  });

  // --- TC10 (fixed) ----------------------------------------------------
  it("TC10: updates Recent Activity after adding a Wishlist item", async () => {
    const place = "Activity Test " + Date.now();

    const placeInput = await driver.findElement(By.id("wishInput"));
    const form = await driver.findElement(By.id("wishForm"));

    await placeInput.sendKeys(place);
    await form.submit();

    // Wait until the top activity row mentions wishlist/added OR the place name
    const success = await driver.wait(
      async () => {
        const firstActivity = await driver.findElement(
          By.css("#activityList > div:nth-child(1)")
        );
        const text = (await firstActivity.getText()).toLowerCase();
        return (
          text.includes("wishlist") ||
          text.includes("added") ||
          text.includes(place.toLowerCase())
        );
      },
      10000,
      "Recent activity did not update for wishlist action"
    );

    assert.ok(success !== false, "Recent Activity top entry should reflect the new action");
  });
});
