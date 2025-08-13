import pytest
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait

from pages.home_page import HomePage
from pages.login_page import LoginPage
from utilities.data import URL
from utilities.data import ADMIN_PASSWORD
from utilities.data import ADMIN_USERNAME
from utilities.data import VOLUNTEER_USERNAME
from utilities.data import VOLUNTEER_PASSWORD

@pytest.fixture(scope="module")
def driver():
    driver = webdriver.Chrome()
    driver.maximize_window()
    driver.implicitly_wait(10)  # Implicit wait for general stability
    driver.wait = WebDriverWait(driver, 10)  # Explicit wait setup
    driver.get(URL)
    yield driver
    driver.quit()

@pytest.fixture(scope="class")# TODO check if function needed somewhere else
def login_with_volunteer(driver):  # TODO update this like admin_home_page below
    # Move URL and credentials to centralized place
    driver.get(URL)
    login_page = LoginPage(driver)
    login_page.enter_username(VOLUNTEER_USERNAME)
    login_page.click_next_button()
    login_page.enter_password(VOLUNTEER_PASSWORD)
    login_page.click_sign_in_button()
    login_page.click_yes_button()
    # login_page.wait_for_database()
    login_page.click_person()
    login_page.select_first_option()
    login_page.click_continue_button()
    login_page.enter_pin()
    login_page.click_continue_button()

@pytest.fixture(scope="module")  # Changed scope for better isolation
def admin_home_page(driver):
    login_page = LoginPage(driver)
    login_page.enter_username(ADMIN_USERNAME)
    login_page.click_next_button()
    login_page.enter_password(ADMIN_PASSWORD)
    login_page.click_sign_in_button()
    login_page.click_yes_button()
    home_page = HomePage(driver)
    return home_page