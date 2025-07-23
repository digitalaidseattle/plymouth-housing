from selenium.webdriver.common.by import By


class CommonLocators:
    INVENTORY_BUTTON = (By.XPATH, '(//*[text()="Inventory"])[1]')
    VOLUNTEER_HOME_BUTTON = (By.XPATH, '//*[text()="Volunteer Home"]')
    CHECKOUT_BUTTON = (By.XPATH, '(//*[text()="Checkout"])[1]')

class HomePageLocators:
    ADMIN_HOME_MENU_BUTTON = (By.XPATH, '(//a[contains(@class,"MuiButtonBase")])[1]') # TODO COMMON LOCATORS PUT IN CommonLocators
    EMAIL_ID = (By.XPATH, '//*[contains(@class, "MuiTypography-root MuiTypography-subtitle1")]')
    LOGOUT_BUTTON = (By.XPATH, '//h6[contains(text(), "Log out")]')
    PLYMOUTH_HOUSING_TEXT = (By.XPATH, '//h5[contains(@class,"MuiTypography-root MuiTypography-h5 css-12tpnys")]')
    ADMIN_HOME_HEADER = (By.XPATH, '//*[@class="MuiTypography-root MuiTypography-body1 css-yiejhz"]')
    DATE = (By.CSS_SELECTOR, '.MuiTypography-root.MuiTypography-h6.css-1uc0icm')

class LoginPageLocators:
    USERNAME_INPUT = (By.NAME, 'loginfmt')
    NEXT_BUTTON = (By.ID, 'idSIButton9')
    PASSWORD_INPUT = (By.NAME, 'passwd')
    SIGN_IN_BUTTON = (By.ID, 'idSIButton9')
    YES_BUTTON = (By.ID, 'idSIButton9')
    NO_BUTTON = (By.ID, 'idBtn_Back')
    DATABASE_POPUP_TEXT = (By.XPATH, '//*[text()="Database is starting up"]')
    USER_PERSON = (By.ID, ':r5:')
    # FIRST_OPTION = (By.XPATH, "//input[contains(@class, 'MuiInputBase-input')]")
    CONTINUE_BUTTON = (By.ID, ':r8:')
    SECOND_CONTINUE = (By.XPATH, '//*[@id=":rf:"]')
    HOMEPAGE_TEXT = (By.XPATH, '//*[text()="Volunteer Home"]')
    FIRST_OPTION = (By.XPATH, "//ul[contains(@class, 'MuiAutocomplete-listbox')]/li[1]")
    INPUT_FIELD_1 = (By.ID, "pin-input-0")
    INPUT_FIELD_2 = (By.ID, "pin-input-1")
    INPUT_FIELD_3 = (By.ID, "pin-input-2")
    INPUT_FIELD_4 = (By.ID, "pin-input-3")

class LogoutPageLocators:
    AFTER_LOGOUT_MESSAGE = (By.XPATH, '//div[@class="container"]/p')

class InventoryPageLocators:
    @staticmethod
    def get_inventory_locator(item_name):
        locator = f'//*[text()="{item_name}"]/following-sibling::td[5]'
        return By.XPATH, locator

class CheckoutPageLocators:
    BUILDING_CODE = (By.ID, "select-building-code")
    FIRST_BUILDING = (By.CSS_SELECTOR, 'ul[role="listbox"] li[role="option"]')
    TWIN_SIZE_BUTTON = (By.XPATH, '//*[text()="Twin-size Sheet Set"]/following::button[1]')
    PROCEED_TO_CHECKOUT = (By.XPATH, '//*[text()="Proceed to Checkout"]')
    CONFIRM = (By.XPATH, '//*[text()="Confirm"]')

    @staticmethod
    def get_add_button_locator(item_name):
        locator = f'//*[text()="{item_name}"]/ancestor::*[contains(@class, "MuiPaper-root MuiPaper-outlined MuiPaper-rounded MuiCard-root css-76aip1")]//*[@data-testid="AddIcon"]'
        return By.XPATH, locator

