// Import The Builder class from selenium-webdriver
const { Builder, By } = require("selenium-webdriver");

// Function to open Google in Chrome
async function openGoogleInChrome() {
  // Create a new Chrome browser instance
  let driver = await new Builder().forBrowser("chrome").build();
  // Navigate to Google's homepage
  await driver.get("https://the-internet.herokuapp.com/login");
  // Make browser window full screen
  await driver.manage().window().maximize();

  // Wait for 3 seconds
  await driver.sleep(2000);

  // Find the Google Search button by its name attribute
  const usernameField = await driver.findElement({
    xpath: '//*[@id="username"]',
  });
  await usernameField.sendKeys("tomsmith");

  const passwordField = await driver.findElement({
    xpath: '//*[@id="password"]',
  });
  await passwordField.sendKeys("SuperSecretPassword!");

  const button = await driver.findElement({
    xpath: '//*[@id="login"]/button/i',
  });
  button.click();

  await driver.sleep(2000);

  // Check if login was successful
  try {
    const successMessage = await driver.findElement({ css: ".flash.success" });
    console.log("Successfully logged in");
    // Take screenshot
    await driver.takeScreenshot().then(function (image) {
      require("fs").writeFileSync("login_success.png", image, "base64");
    });
  } catch (error) {
    console.error("Login failed");
    // Take screenshot
    await driver.takeScreenshot().then(function (image) {
      require("fs").writeFileSync("login_failure.png", image, "base64");
    });
  }

  await driver.sleep(1000);

  // Close the driver
  //await driver.quit();
}

openGoogleInChrome();
