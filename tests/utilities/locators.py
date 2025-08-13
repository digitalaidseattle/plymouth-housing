from selenium.webdriver.common.by import By


class CommonLocators:
    INVENTORY_BUTTON = (By.XPATH, '//h6[text()="Inventory"]')
    VOLUNTEER_HOME_BUTTON = (By.XPATH, '//h6[text()="Volunteer Home"]')
    CHECKOUT_BUTTON = (By.XPATH, '//h6[text()="Checkout"]')

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
    USER_PERSON = (By.ID, ':r8:')
    # FIRST_OPTION = (By.XPATH, "//input[contains(@class, 'MuiInputBase-input')]")
    CONTINUE_BUTTON = (By.XPATH, '//button[contains(text(),"Continue")]')
    HOMEPAGE_TEXT = (By.XPATH, '//*[text()="Volunteer Home"]')
    FIRST_OPTION = (By.XPATH, "//ul[contains(@class, 'MuiAutocomplete-listbox')]/li[1]")
    INPUT_FIELD_1 = (By.ID, "pin-input-0")
    INPUT_FIELD_2 = (By.ID, "pin-input-1")
    INPUT_FIELD_3 = (By.ID, "pin-input-2")
    INPUT_FIELD_4 = (By.ID, "pin-input-3")

class LogoutPageLocators:
    AFTER_LOGOUT_MESSAGE = (By.XPATH, '//div[@class="container"]/p')

class InventoryPageLocators:
    ADD_BUTTON = (By.XPATH, '//*[text()="Add"]')
    INVENTORY_TYPE = (By.XPATH, "//div[@role='combobox' and contains(@class, 'MuiSelect-select')]")
    SELECT_GENERAL = (By.XPATH, "//li[@role='option' and @data-value='General']")
    SELECT_WELCOME_BASKET = (By.XPATH, "//input[@class='MuiSelect-nativeInput' and @value='Welcome Basket']")
    ITEM_NAME = (By.XPATH, "//button[@aria-label='Open' and @title='Open']")
    QUANTITY = (By.XPATH, '//*[text()="Quantity"]')
    CANCEL = (By.XPATH, "//button[normalize-space(text())='Cancel']")
    SEARCH = (By.XPATH, "//input[@type='search' and @placeholder='Search...' and contains(@class, 'MuiInputBase-input')]")
    CLEAR_ICON = (By.XPATH, '//div[contains(@class, "MuiInputAdornment-positionEnd")]//svg[contains(@class, "MuiSvgIcon-root")]')
    @staticmethod
    def get_input_by_value(value):
        # This assumes the dropdown options are rendered as <li> elements
        locator = f'//li[contains(@class, "MuiAutocomplete-option") and text()="{value}"]'
        return By.XPATH, locator

    @staticmethod
    def get_inventory_locator(item_name):
        locator = f'//*[text()="{item_name}"]/following-sibling::td[5]'
        return By.XPATH, locator


class CheckoutPageLocators:
    BUILDING_CODE = (By.ID, "select-building-code")
    FIRST_LIST_ITEM = (By.CSS_SELECTOR, 'ul[role="listbox"] li[role="option"]')
    UNIT_NUMBER = (By.ID, "select-unit-number")
    NAME_INPUT = (By.ID, "resident-name-autocomplete")
    CONTINUE_BUTTON = (By.XPATH, '//button[contains(text(),"continue")]')
    TWIN_SIZE_BUTTON = (By.XPATH, '//*[text()="Twin-size Sheet Set"]/following::button[1]')
    PROCEED_TO_CHECKOUT = (By.XPATH, '//button[contains(text(), "Proceed to Checkout")]')
    CONFIRM = (By.XPATH, '//*[text()="Confirm"]')
    SEARCH = (By.XPATH, "//input[@type='search' and @placeholder='Search...' and contains(@class, 'MuiInputBase-input')]")
    CLEAR_ICON = (By.XPATH, '//div[contains(@class, "MuiInputAdornment-positionEnd")]//svg[contains(@class, "MuiSvgIcon-root")]')

    @staticmethod
    def get_add_button_locator(item_name):
        locator = f'''//p[@aria-label='{item_name}']/ancestor::div[contains(@class,"MuiCardContent-root")]/following-sibling::div//button[contains(@class,"MuiIconButton-root")]'''
        return By.XPATH, locator




