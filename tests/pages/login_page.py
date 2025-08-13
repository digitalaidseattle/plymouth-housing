import time
from selenium.common import StaleElementReferenceException
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.base_page import BasePage
from utilities.locators import LoginPageLocators


class LoginPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.driver = driver
        self.locators = LoginPageLocators

    def enter_username(self, username):
        self.send_keys(self.locators.USERNAME_INPUT, username)

    def enter_password(self, password):
        self.send_keys(self.locators.PASSWORD_INPUT, password)

    def click_next_button(self):
        self.click(self.locators.NEXT_BUTTON)

    def click_sign_in_button(self):
        for _ in range(3):  # Retry up to 3 times
            try:
                self.click(self.locators.SIGN_IN_BUTTON)
                return
            except StaleElementReferenceException:
                continue
        raise Exception("Failed to click the sign-in button due to stale element.")

    def click_yes_button(self):
        self.click(self.locators.SIGN_IN_BUTTON)

    def click_person(self):
        self.wait_for_clickable(self.locators.USER_PERSON, timeout=300) # TODO make it 90

        # Locate the element to hover over
        element_to_hover = self.driver.find_element(*self.locators.USER_PERSON)

        # Create an instance of ActionChains
        actions = ActionChains(self.driver)

        # Perform the hover action
        actions.move_to_element(element_to_hover).perform()

        # Click the element after hovering
        element_to_hover.click()

    def select_first_option(self):
        self.click(self.locators.FIRST_OPTION)

    def click_continue_button(self):
        self.click(self.locators.CONTINUE_BUTTON)

    def enter_pin(self):   # TODO : Make this more dynamic
        self.send_keys(self.locators.INPUT_FIELD_1, "1")
        self.send_keys(self.locators.INPUT_FIELD_2, "2")
        self.send_keys(self.locators.INPUT_FIELD_3, "3")
        self.send_keys(self.locators.INPUT_FIELD_4, "4")

    def is_database_popup_visible(self):
        return self.wait_for_visibility(self.locators.DATABASE_POPUP_TEXT)

    # def get_event_name(self):
    #     return self.driver.find_element(*self.event_name).text
    #
    # def get_event_location(self):
    #     return self.driver.find_element(*self.event_location).text
    #
    # def get_event_date(self):
    #     return self.driver.find_element(*self.event_date).text
    #
    # def get_event_time(self):
    #     return self.driver.find_element(*self.event_time).text

    # def enter_username(self, username):
    #     self.driver.find_element(*self.username_input).send_keys(username)
    #
    # def enter_password(self, password):
    #     self.driver.find_element(*self.password_input).send_keys(password)

    # def enter_your_name(self, name):
    #     self.driver.find_element(*self.enter_your_name_input).send_keys(name)
    #
    # def click_next_button(self):
    #     self.driver.find_element(*self.next_button).click()
    #
    # def click_sign_in_button(self):
    #     self.driver.find_element(*self.sign_in_button).click()
    #
    # def click_yes_button(self):
    #     self.driver.find_element(*self.yes_button).click()
    #
    # def get_displayed_dish_names(self, index):
    #     displayed_dish_names = self.driver.find_elements(*self.displayed_dish_names)
    #     return displayed_dish_names[index].text
