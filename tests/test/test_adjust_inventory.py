from selenium.webdriver.support import expected_conditions as EC, wait
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from tests.pages.inventory_page import InventoryPage
from tests.pages.checkout_page import CheckOutPage
from tests.utilities.fixtures import login_with_volunteer
from tests.utilities.fixtures import driver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@pytest.fixture(scope="function")
def inventory_page(driver):
    return InventoryPage(driver)

@pytest.mark.usefixtures('login_with_volunteer')
@pytest.mark.regression
@pytest.mark.serial
class TestAdjustInventory:

    def test_adjust_inventory(self, driver, inventory_page):
        inventory_page.click_on_inventory()
        inventory_page.click_status()
        inventory_page.select_status("Out of Stock")
        # Assert Out of Stock rows exist
        rows = inventory_page.get_filtered_rows("Out of Stock")
        assert len(rows) > 0, "No Out of Stock items found"
