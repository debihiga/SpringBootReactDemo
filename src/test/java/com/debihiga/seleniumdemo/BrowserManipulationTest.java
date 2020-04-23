package com.debihiga.seleniumdemo;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class BrowserManipulationTest {

    // Browser
    private WebDriver driver;
    // DOM nodes
    private WebElement buttonCreate;

    @Before
    public void setup() {
        System.setProperty("webdriver.chrome.driver", "src/test/resources/webdriver/chromedriver/81.0.4044.69/chromedriver.exe");
        driver = new ChromeDriver();
        // Navigate to application
        driver.get("https://localhost:8080");
        // Locate elements
        // https://www.selenium.dev/documentation/en/getting_started_with_webdriver/locating_elements/
        buttonCreate = driver.findElement(By.tagName("CreateDialog"));
        //buttonCreate = driver.findElement(By.id("cheese"));
        // driver.findElement(By.cssSelector("#cheese #cheddar"));
        // List<WebElement> muchoCheese = driver.findElements(By.cssSelector("#cheese li"));

        // Send keys
        // String name = "Charles";
        //driver.findElement(By.name("name")).sendKeys(name);

        // Drag and drop
        // WebElement source = driver.findElement(By.id("source"));
        //WebElement target = driver.findElement(By.id("target"));
        //new Actions(driver).dragAndDrop(source, target).build().perform();

        // Get current URL
        // driver.getCurrentUrl();
        // driver.navigate().back();
        // driver.navigate().forward();
        // driver.navigate().refresh();
        // driver.getTitle();


// Opens a new tab and switches to new tab
        //driver.switchTo().newWindow(WindowType.TAB);

// Opens a new window and switches to new window
        //driver.switchTo().newWindow(WindowType.WINDOW);

        //Close the tab or window
        //driver.close();

//Switch back to the old tab or window
        //driver.switchTo().window(originalWindow);
    }

    /**
     * Quit will:
     * + Close all the windows and tabs associated with that WebDriver session
     * + Close the browser process
     * + Close the background driver process
     * + Notify Selenium Grid that the browser is no longer in use so it can be used by another session
     * (if you are using Selenium Grid)
     * */
    @After
    public void tearDown() {
        driver.quit();
    }
/*
https://www.selenium.dev/documentation/en/webdriver/browser_manipulation/
* Switch between windows or tabs
* //Store the ID of the original window
String originalWindow = driver.getWindowHandle();

//Check we don't have other windows open already
assert driver.getWindowHandles().size() == 1;

//Click the link which opens in a new window
driver.findElement(By.linkText("new window")).click();

//Wait for the new window or tab
wait.until(numberOfWindowsToBe(2));

//Loop through until we find a new window handle
for (String windowHandle : driver.getWindowHandles()) {
    if(!originalWindow.contentEquals(windowHandle)) {
        driver.switchTo().window(windowHandle);
        break;
    }
}

//Wait for the new tab to finish loading content
wait.until(titleIs("Selenium documentation"));
* */
    /**
     * Verify if a modal opens after clicking a button.
     * */
    @Test
    public void verifyCreateButtonOpensDialog() {
        buttonCreate.click();
    }


}
