const fs = require("fs");
const csv = require("csv-parser");
const { Builder, By } = require("selenium-webdriver");

let savedData = [];

// Read data from CSV file
fs.createReadStream("books.csv")
  .pipe(csv())
  .on("data", (row) => {
    savedData.push(row);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
    // Proceed with the testing after reading the CSV
    runPriceVerificationTest();
  });

async function runPriceVerificationTest() {
  // Initialize WebDriver from Chrome
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // Array to hold current website data
    let currentData = [];

    // Loop through the first two pages
    for (let page = 1; page <= 2; page++) {
      // Navigate to the website or next page
      if (page === 1) {
        await driver.get("http://books.toscrape.com/");
      } else {
        await driver.get(
          `http://books.toscrape.com/catalogue/page-${page}.html`,
        );
      }

      // Wait for the page to load
      await driver.sleep(2000);

      // Find all the book elements
      let books = await driver.findElements(By.css("article.product_pod"));

      // Extract title and price from each book
      for (let book of books) {
        let titleElement = await book.findElement(By.css("h3 > a"));
        let title = await titleElement.getAttribute("title");

        let priceElement = await book.findElement(By.css("p.price_color"));
        let price = await priceElement.getText();

        currentData.push({ Title: title, Price: price });
      }
    }

    // Compare current data with saved data
    let discrepancies = [];

    for (let i = 0; i < savedData.length; i++) {
      let savedBook = savedData[i];
      let currentBook = currentData.find(
        (book) => book.Title === savedBook.Title,
      );

      if (currentBook) {
        if (currentBook.Price !== savedBook.Price) {
          discrepancies.push({
            Title: savedBook.Title,
            SavedPrice: savedBook.Price,
            CurrentPrice: currentBook.Price,
          });
          console.log(
            `Price discrepancy found for "${savedBook.Title}": Saved Price = ${savedBook.Price}, Current Price = ${currentBook.Price}`,
          );
        } else {
          console.log(
            `Price verified for "${savedBook.Title}": ${savedBook.Price}`,
          );
        }
      } else {
        console.log(`Book not found on the website: "${savedBook.Title}"`);
      }

      // Optionally, write discrepancies to a file
      if (discrepancies.length > 0) {
        let discrepancyContent = "Title,SavedPrice,CurrentPrice\n";
        for (let item of discrepancies) {
          discrepancyContent += `"${item.Title}","${item.SavedPrice}","${item.CurrentPrice}"\n`;
        }
        fs.writeFileSync("price_discrepancies.csv", discrepancyContent);
        console.log("Discrepancies saved to price_discrepancies.csv");
      } else {
        console.log("No price discrepancies found");
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    // Ensure the driver quits in case of an error or after completion
    await driver.quit();
  }
}
