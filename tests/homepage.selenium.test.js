// tests/homepage.selenium.test.js
// Golden Twilight – Homepage Selenium UI tests (Node + Mocha + selenium-webdriver)

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");

const BASE_URL = "http://localhost:3000";

describe("Golden Twilight Homepage – Selenium Tests", function () {
  this.timeout(40000); // 40s total per test if needed

  /** @type {import('selenium-webdriver').ThenableWebDriver} */
  let driver;

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

  // Load homepage before each test
  beforeEach(async () => {
    await driver.get(BASE_URL);
    // Wait for hero title to prove page loaded
    await driver.wait(until.elementLocated(By.css("h1")), 10000);
  });

  // ========== TEST CASE 1: Page loads successfully ==========
  it("TC1: Should load homepage with correct title and hero section", async () => {
    const title = await driver.getTitle();
    assert.strictEqual(
      title,
      "Golden Twilight • Discover Your Next Adventure"
    );

    const h1 = await driver.findElement(By.css("h1"));
    const h1Text = await h1.getText();
    assert.strictEqual(h1Text, "Discover Your Next Adventure");

    const heroText = await driver.findElement(
      By.xpath("//p[contains(text(), 'Transform travel chaos')]")
    );
    assert.ok(await heroText.isDisplayed());
  });

  // ========== TEST CASE 2: Hero CTA button navigates to destinations ==========
  it("TC2: Should navigate to destinations page when clicking 'Explore Destinations' button", async () => {
    const exploreBtn = await driver.findElement(
      By.xpath("//a[contains(text(), 'Explore Destinations')]")
    );
    assert.ok(await exploreBtn.isDisplayed());

    await exploreBtn.click();
    await driver.wait(until.urlContains("/pages/destinations.html"), 5000);

    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes("/pages/destinations.html"));
  });

  // ========== TEST CASE 3: Destination card modal opens and closes ==========
  it("TC3: Should open and close modal when interacting with destination card", async () => {
    // Click on Santorini card to open modal
    const santoriniCard = await driver.findElement(
      By.xpath("//div[@onclick=\"openModal('santorini')\"]")
    );
    await santoriniCard.click();

    // Wait for modal to be visible
    const modal = await driver.wait(
      until.elementLocated(By.id("destinationModal")),
      5000
    );
    await driver.wait(until.elementIsVisible(modal), 5000);

    // Check modal has active class
    let modalClass = await modal.getAttribute("class");
    assert.ok(modalClass.includes("active"));

    // Check modal content
    const modalTitle = await driver.findElement(
      By.xpath("//div[@id='modalBody']//h2[contains(text(), 'Santorini')]")
    );
    assert.ok(await modalTitle.isDisplayed());

    // Click close button
    const closeBtn = await driver.findElement(
      By.xpath("//button[@onclick='closeModal()']")
    );
    await closeBtn.click();

    // Wait for modal to be hidden
    await driver.wait(async () => {
      modalClass = await modal.getAttribute("class");
      return !modalClass.includes("active");
    }, 5000);

    assert.ok(!modalClass.includes("active"));
  });

  // ========== TEST CASE 4: Explore link navigates to destinations page ==========
  it("TC4: Should navigate to destinations page when clicking Explore link on card", async () => {
    // Find and click the Explore link inside first card
    const exploreLink = await driver.findElement(
      By.xpath(
        "//div[@onclick=\"openModal('santorini')\"]//a[contains(@href, 'destinations.html')]"
      )
    );
    await exploreLink.click();

    // Should navigate to destinations page
    await driver.wait(until.urlContains("/pages/destinations.html"), 5000);

    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes("/pages/destinations.html"));
  });
});
