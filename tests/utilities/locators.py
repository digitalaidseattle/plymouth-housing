from selenium.webdriver.common.by import By

class CommonLocators:
    INVENTORY_BUTTON = (By.XPATH, "//h6[normalize-space()='Inventory']")
    VOLUNTEER_HOME_BUTTON = (By.XPATH, '//h6[text()="Volunteer Home"]')
    CHECKOUT_MENU_BUTTON = (By.XPATH, "//h6[normalize-space()='Checkout']")
    GENERAL_MENU_BUTTON = (By.XPATH, "//h6[normalize-space()='General']/ancestor::a")
    WELCOME_MENU_BUTTON = (By.XPATH, "//h6[normalize-space()='Welcome basket']/ancestor::a")
    HISTORY_MENU_BUTTON = (By.XPATH, "//a[@href='/history']")

class HistoryPageLocators:
    HISTORY_HEADER = (By.XPATH,"//h6[normalize-space()='History']")
    RECORD_COUNT_TEXT = (By.XPATH,"//span[contains(.,'record')]")
    HISTORY_CARDS = (By.XPATH,"//div[contains(@class,'MuiBox-root') and .//h3 and .//p[contains(text(),'Created')]]")
    NO_TRANSACTIONS_MESSAGE = (By.XPATH, "//*[contains(text(),'No transactions found')]")

class HomePageLocators:
    # ---- Sections ----
    CHECKOUT_SECTION = (By.XPATH, "//h5[normalize-space()='Check out']")
    STOCK_SECTION = (By.XPATH, "//h5[normalize-space()='Stock']")
    # ---- Scoped CTAs ----
    CHECKOUT_GENERAL_INVENTORY = (
        By.XPATH,
        "//h5[normalize-space()='Check out']/following::button[normalize-space()='General Inventory'][1]"
    )

    STOCK_GENERAL_INVENTORY = (
        By.XPATH,
        "//h5[normalize-space()='Stock']/following::button[normalize-space()='General Inventory'][1]"
    )
    ADMIN_HOME_MENU_BUTTON = (By.XPATH, '(//a[contains(@class,"MuiButtonBase")])[1]') # TODO COMMON LOCATORS PUT IN CommonLocators
    EMAIL_ID = (By.XPATH, "//h6[contains(., '@plymouthhousing.org')]")
    LOGOUT_BUTTON = (By.XPATH, "//h6[normalize-space()='Log out']")
    PLYMOUTH_HOUSING_TEXT = (By.XPATH, '//h5[normalize-space()="Plymouth Housing"]')
    VOLUNTEER_HOME_HEADER = (By.XPATH, "//*[normalize-space()='Volunteer Home']")

class LoginPageLocators:
    USERNAME_INPUT  = (By.NAME,  'loginfmt')
    NEXT_BUTTON     = (By.ID,    'idSIButton9')
    PASSWORD_INPUT  = (By.NAME,  'passwd')
    SIGN_IN_BUTTON  = (By.ID,    'idSIButton9')
    YES_BUTTON      = (By.XPATH, '//*[@id="idSIButton9" and normalize-space()="Yes"]')
    NO_BUTTON       = (By.ID,    'idBtn_Back')
    DATABASE_POPUP_TEXT = (By.XPATH, '//*[text()="Database is starting up"]')
    USER_PERSON = (By.XPATH, "//*[@data-testid='volunteer-name-autocomplete']//input")
    CONTINUE_BUTTON = (By.XPATH, '//button[contains(text(),"Continue")]')
    HOMEPAGE_TEXT = (By.XPATH, '//*[text()="Volunteer Home"]')
    NAME_OPTIONS = (By.XPATH, "//li[@role='option']")
    INPUT_FIELD_1 = (By.ID, "pin-input-0")
    INPUT_FIELD_2 = (By.ID, "pin-input-1")
    INPUT_FIELD_3 = (By.ID, "pin-input-2")
    INPUT_FIELD_4 = (By.ID, "pin-input-3")

class LogoutPageLocators:
    AFTER_LOGOUT_MESSAGE = (By.XPATH, "//p[contains(text(), 'logged out')]")

class InventoryPageLocators:
    TABLE_ROWS = (By.XPATH, "//tr[td]")
    ADD_BUTTON = (By.XPATH, "//button[contains(@class,'MuiButton') and normalize-space()='Add']")
    INVENTORY_TYPE = (By.XPATH, "//div[@role='combobox' and contains(@class, 'MuiSelect-select')]")
    SELECT_GENERAL = (By.XPATH, "//li[@role='option' and @data-value='General']")
    SELECT_WELCOME_BASKET = (By.XPATH, "//input[@class='MuiSelect-nativeInput' and @value='Welcome Basket']")
    ITEM_NAME_DROPDOWN = (By.XPATH, "//*[@id='add-item-name']//button[@aria-label='Open' or @title='Open']")
    QUANTITY = (By.XPATH, "//*[normalize-space()='Quantity']")
    CANCEL = (By.XPATH, "//button[normalize-space(text())='Cancel']")
    SEARCH = (By.XPATH, "//input[@type='search' and @placeholder='Search...' and contains(@class, 'MuiInputBase-input')]")
    CLEAR_ICON = (By.XPATH, '//div[contains(@class, "MuiInputAdornment-positionEnd")]//svg[contains(@class, "MuiSvgIcon-root")]')
    @staticmethod
    def get_input_by_value(value):
        locator = f'//li[contains(@class, "MuiAutocomplete-option") and text()="{value}"]'
        return By.XPATH, locator

    @staticmethod
    def get_inventory_locator(item_name):
        locator = f'//*[text()="{item_name}"]/following-sibling::td[5]'
        return By.XPATH, locator


class CheckoutPageLocators:
    BUILDING_CODE = (By.ID, "select-building")
    UNIT_NUMBER = (By.ID, "select-unit-number")
    NAME_INPUT = (By.ID, "resident-name-autocomplete")

    BUILDING_OPTIONS = (By.XPATH, "//ul[@id='select-building-listbox' and not(contains(@style,'display: none'))]//li")
    UNIT_OPTIONS = (By.XPATH, "//ul[@id='select-unit-number-listbox']//li")
    NAME_OPTIONS = (By.XPATH, "//ul[@id='resident-name-autocomplete-listbox']//li")

    CONTINUE_BUTTON = (By.XPATH, '//button[contains(text(),"continue")]')

    PROCEED_TO_CHECKOUT = (By.XPATH, '//button[contains(text(), "Proceed to Checkout")]')
    CONFIRM = (By.XPATH, '//*[text()="Confirm"]')

    SEARCH = (By.XPATH, "//input[@type='search']")

    # modal header
    SUMMARY_HEADER = (By.XPATH, "//h2[contains(text(),'Checkout Summary')]")

    # over limit warning
    OVER_LIMIT_WARNING = (
        By.XPATH,
        "//*[contains(translate(normalize-space(.), "
        "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'over') "
        "and contains(translate(normalize-space(.), "
        "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'limit')]"
    )

    # loading
    LOADING_SPINNER = (By.XPATH, "//*[text()='Loading, please wait...']")

    CHECKOUT_INFO_TEXT = (
        By.XPATH,
        "//*[normalize-space()='Proceed to Checkout' or normalize-space()='Checkout']"
    )

    # ---------------------------------------------------
    # Dynamic Item Add Button
    # ---------------------------------------------------

    @staticmethod
    def get_add_button_locator(item_name):
        return (
            By.XPATH,
            f"//div[contains(@class,'MuiCard-root')][.//*[contains(.,'{item_name}')]]"
            f"//div[contains(@class,'MuiCardActions-root')]"
            f"//div[contains(@class,'MuiBox-root')]"
            f"/button[last()]"
        )

    @staticmethod
    def get_minus_button_locator(item_name):
        return (
            By.XPATH,
            f"//div[contains(@class,'MuiCard-root')][.//*[contains(.,'{item_name}')]]"
            f"//div[contains(@class,'MuiCardActions-root')]"
            f"//div[contains(@class,'MuiBox-root')]"
            f"/button[1]"
        )

class AddItemPageLocators:
    SUBMIT_BUTTON = (By.XPATH, "//button[text()='Submit' or contains(., 'Submit')]")
    CLOSE_MODAL_BUTTON = (By.XPATH, "//button[@aria-label='close']")
    SUCCESS_MODAL_HEADER = (By.XPATH, "//h2[contains(text(), 'Inventory Updated')]")
    QUANTITY_INPUT = (By.NAME, "quantity")
