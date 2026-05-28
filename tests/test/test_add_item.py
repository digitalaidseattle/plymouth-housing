import pytest


@pytest.mark.usefixtures('login_with_volunteer')
class TestAddItem:

    @pytest.mark.parametrize('item, quantity', [
        ('Baby Wipes', 5),
    ])
    @pytest.mark.regression
    @pytest.mark.serial
    def test_add_item(self, inventory_page, add_item_page, item, quantity):

        inventory_page.click_on_inventory()
        inventory_page.search_item(item)
        inventory_page.wait_for_search_results(item)

        initial_quantity = inventory_page.get_inventory_quantity(item)

        inventory_page.click_on_add_item()

        add_item_page.click_inventory_type()
        add_item_page.select_general_option()
        add_item_page.click_add_item()

        add_item_page.wait_for_data_load(item)
        add_item_page.select_add_item(item)
        add_item_page.set_quantity(quantity)

        add_item_page.click_submit()

        # 🔥 CRITICAL WAIT
        inventory_page.wait_for_quantity_update(item, initial_quantity + quantity)

        updated_quantity = inventory_page.get_inventory_quantity(item)

        assert initial_quantity + quantity == updated_quantity