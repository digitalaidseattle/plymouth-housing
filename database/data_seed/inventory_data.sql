DELETE FROM Items;
GO

INSERT INTO Items (name, type, category_id, quantity, low, medium, description) VALUES
('Bath mat', 'General', 1, 10, 3, 27, ''),
('Bath towel', 'General', 1, 50, 5, 25, ''),
('Hand Towel', 'General', 1, 20, 6, 24, ''),
('Plunger', 'General', 1, 10, 7, 28, ''),
('Shower curtain', 'General', 1, 35, 4, 30, ''),
('Shower curtain rings', 'General', 1, 40, 2, 23, ''),
('Small Trash bin <4 gallons', 'General', 1, 27, 8, 21, ''),
('Toilet brush', 'General', 1, 21, 6, 22, ''),
('Washcloth', 'General', 1, 40, 5, 29, ''),
('Bed Pillow', 'General', 2, 21, 4, 24, ''),
('Blanket', 'General', 2, 22, 3, 27, 'Includes throw and lap blankets'),
('Comforter', 'General', 2, 14, 8, 26, 'Includes comforter, duvet covers, duvet inserts, quilts of all sizes'),
('Decorative Pillow', 'General', 2, 17, 7, 28, ''),
('Fitted Sheet - Twin', 'General', 2, 19, 5, 22, ''),
('Flat Sheet - Twin', 'General', 2, 23, 2, 20, ''),
('Mattress protector - full', 'General', 2, 0, 6, 21, ''),
('Mattress protector - twin', 'General', 2, 1, 4, 24, ''),
('Pillow Case', 'General', 2, 40, 7, 23, ''),
('Sheet set - full', 'General', 2, 0, 5, 25, ''),
('Sheet set - twin', 'General', 2, 0, 3, 28, ''),
('Broom/dustpan', 'General', 3, 17, 6, 22, ''),
('Cleaner', 'General', 3, 21, 8, 30, ''),
('Dish soap', 'General', 3, 50, 4, 27, ''),
('Disinfectant Wipes', 'General', 3, 53, 9, 29, ''),
('Fabric Softener', 'General', 3, 1, 3, 23, ''),
('Hand Soap', 'General', 3, 12, 6, 24, ''),
('Laundry detergent', 'General', 3, 97, 7, 21, ''),
('Paper towel', 'General', 3, 32, 5, 26, ''),
('Sponge', 'General', 3, 28, 4, 30, ''),
('Swiffer Refill', 'General', 3, 9, 2, 22, ''),
('Swiffer / mop & bucket', 'General', 3, 10, 3, 21, ''),
('Trash bags', 'General', 3, 16, 4, 29, ''),
('Ankle Socks', 'General', 4, 124, 5, 30, ''),
('Beanie', 'General', 4, 29, 7, 22, ''),
('Belt', 'General', 4, 16, 8, 21, ''),
('Bikini Underwear', 'General', 4, 49, 6, 23, ''),
('Boxer Briefs', 'General', 4, 22, 4, 24, ''),
('Bra', 'General', 4, 34, 7, 28, ''),
('Coat', 'General', 4, 43, 3, 27, ''),
('Crew Socks', 'General', 4, 119, 9, 21, ''),
('Gloves', 'General', 4, 47, 8, 30, ''),
('Scarf', 'General', 4, 9, 6, 23, ''),
('Slippers (Lg)', 'General', 4, 28, 4, 29, ''),
('Slippers (Sm)', 'General', 4, 22, 5, 22, ''),
('Bars', 'General', 5, 113, 3, 25, ''),
('Cereal', 'General', 5, 114, 6, 24, ''),
('Coffee', 'General', 5, 14, 4, 30, ''),
('Drink Mix', 'General', 5, 180, 7, 22, ''),
('Fruit', 'General', 5, 44, 5, 26, ''),
('Meal', 'General', 5, 166, 6, 30, 'Something one may be able to eat by itself such as mac n cheese, ramen, chef boyardi, chili, soup'),
('Meat', 'General', 5, 44, 2, 21, 'Shelf stable meat such as chicken, tuna, spam, etc.'),
('Milk', 'General', 5, 54, 3, 27, ''),
('Pasta / Rice', 'General', 5, 38, 9, 24, ''),
('Seasoning', 'General', 5, 10, 4, 22, ''),
('Vegetables', 'General', 5, 49, 8, 23, ''),
('First aid Kit', 'General', 6, 50, 6, 22, ''),
('Gauze', 'General', 6, 17, 3, 24, ''),
('Vaseline', 'General', 6, 29, 4, 25, ''),
('Clothing Rack', 'General', 7, 5, 2, 20, ''),
('Curtain Rods', 'General', 7, 20, 6, 30, ''),
('Desk Organizer', 'General', 7, 3, 4, 22, ''),
('Fan', 'General', 7, 14, 5, 24, ''),
('Hanger set', 'General', 7, 20, 8, 26, ''),
('Hanging Hooks', 'General', 7, 5, 3, 23, ''),
('Hanging Organizer', 'General', 7, 5, 4, 28, ''),
('Home Decor Miscellaneous', 'General', 7, 143, 7, 25, 'This includes items such as rugs, frames, knickknacks, wall art, fake plants, planters, vases'),
('Kitchen Organizer', 'General', 7, 4, 6, 22, ''),
('Lamp', 'General', 7, 8, 2, 29, ''),
('Large Organizer', 'General', 7, 4, 5, 23, ''),
('Large trash bin (>7 gallon)', 'General', 7, 6, 3, 27, ''),
('Laundry basket', 'General', 7, 26, 4, 21, ''),
('Mirror', 'General', 7, 4, 7, 28, ''),
('Side Table', 'General', 7, 36, 6, 24, ''),
('Baking Dish (Glass)', 'General', 8, 6, 5, 22, ''),
('Baking Pan (Metal)', 'General', 8, 16, 6, 24, 'Includes baking pans/dishes such as cake pans, muffin tins, baking sheets, casserole dishes and pie pans'),
('Bowl', 'General', 8, 110, 4, 30, ''),
('Butter knife', 'General', 8, 6, 8, 25, ''),
('Can opener', 'General', 8, 20, 3, 29, ''),
('Coffee pot', 'General', 8, 5, 2, 23, ''),
('Cooking Spoon', 'General', 8, 22, 4, 28, ''),
('Crockpot', 'General', 8, 2, 5, 24, ''),
('Cup', 'General', 8, 103, 6, 27, ''),
('Cutting board', 'General', 8, 52, 8, 30, ''),
('Dinner Plate', 'General', 8, 102, 4, 22, ''),
('Dish towel', 'General', 8, 253, 5, 29, ''),
('Flatware Set', 'General', 8, 40, 3, 23, ''),
('Fork (flatware)', 'General', 8, 1, 7, 21, ''),
('Frying pan', 'General', 8, 32, 8, 26, ''),
('Kitchen Miscellaneous', 'General', 8, 15, 6, 25, ''),
('Knife', 'General', 8, 0, 4, 27, ''),
('Liquid Measuring Cup', 'General', 8, 16, 3, 22, ''),
('Mearsuring cup set', 'General', 8, 18, 5, 28, ''),
('Measuring spoon set', 'General', 8, 25, 2, 29, ''),
('Microwave', 'General', 8, 9, 7, 24, ''),
('Mixing bowl', 'General', 8, 20, 6, 30, ''),
('Mug', 'General', 8, 125, 4, 23, ''),
('Oven mitt', 'General', 8, 40, 5, 26, ''),
('Pasta Spoon', 'General', 8, 10, 3, 22, ''),
('Pot', 'General', 8, 24, 6, 27, 'sauce pan, stock pot'),
('Pot / Pan Lid', 'General', 8, 41, 7, 30, ''),
('Potato Peeler', 'General', 8, 5, 8, 22, ''),
('Reusable waterbottle', 'General', 8, 23, 4, 24, ''),
('Sauce pan', 'General', 8, 17, 3, 29, ''),
('Side Plate', 'General', 8, 114, 6, 21, ''),
('Spatula', 'General', 8, 28, 7, 27, ''),
('Spoon (flatware)', 'General', 8, 11, 5, 25, ''),
('Strainer', 'General', 8, 7, 4, 22, ''),
('Tea Kettle', 'General', 8, 3, 2, 30, ''),
('Thermos', 'General', 8, 9, 3, 29, ''),
('Toaster / Toaster Oven', 'General', 8, 4, 4, 23, ''),
('Tongs', 'General', 8, 18, 5, 27, ''),
('Tupperware', 'General', 8, 77, 7, 24, ''),
('Whisk', 'General', 8, 11, 8, 30, ''),
('Art Kit', 'General', 9, 13, 4, 27, 'items where someone can do an entire art experience in one package, such as colored pencils WITH paper in the same package, or paid paint brushes '),
('Book', 'General', 9, 48, 6, 22, ''),
('Coloring Book', 'General', 9, 21, 3, 25, ''),
('Cook book', 'General', 9, 4, 8, 29, ''),
('Drawing Tools', 'General', 9, 61, 4, 24, 'colored pencils, chalk, paint brushes, crayons'),
('Electronics', 'General', 9, 26, 7, 30, 'bluetooth speakers, headphones, charging cables, television, alarm clocks'),
('Game', 'General', 9, 25, 5, 23, ''),
('Home Improvement', 'General', 9, 8, 6, 29, 'tools'),
('Paint', 'General', 9, 15, 3, 28, ''),
('Paper / Canvas', 'General', 9, 18, 2, 24, 'lined paper, notebooks, canvas'),
('Pet food', 'General', 9, 270, 4, 30, ''),
('Pet Supplies', 'General', 9, 7, 5, 27, 'cat litter, food/water bowls, leashes, collars'),
('Planner / Calendar', 'General', 9, 4, 6, 22, ''),
('Playing Cards', 'General', 9, 9, 3, 25, ''),
('Puzzle', 'General', 9, 20, 2, 21, ''),
('Recreation', 'General', 9, 14, 5, 29, ''),
('Sports', 'General', 9, 7, 4, 22, 'camping gear, picnic blankets, sleeping bags, fishing, weights, yoga mat, bat and ball, outdoor activities, exercise equipment, workout gear'),
('Adult absorbent underwear', 'General', 10, 259, 3, 23, ''),
('Baby Wipes', 'General', 10, 3, 2, 21, ''),
('Body lotion', 'General', 10, 26, 6, 28, ''),
('Body soap', 'General', 10, 759, 4, 24, ''),
('Chapstick', 'General', 10, 61, 5, 30, ''),
('Comb / hair brush', 'General', 10, 39, 6, 22, ''),
('Conditioner', 'General', 10, 12, 3, 25, ''),
('Deodorant', 'General', 10, 73, 8, 27, ''),
('Face lotion', 'General', 10, 4, 4, 30, ''),
('Face Masks', 'General', 10, 15, 2, 26, ''),
('Face Tissue', 'General', 10, 8, 7, 21, ''),
('Face wash', 'General', 10, 4, 6, 24, ''),
('Feminine Hygiene Kit', 'General', 10, 63, 3, 28, ''),
('Floss', 'General', 10, 23, 5, 29, 'Scrunchie, hair tie, hair clip, bonnet'),
('Hair Accessory', 'General', 10, 46, 8, 27, ''),
('Hair gel', 'General', 10, 6, 4, 22, ''),
('Hair Tool', 'General', 10, 8, 7, 30, 'Curling iron, hair dryer, hair straightener, shampoo brush'),
('Hygiene Kit', 'General', 10, 11, 6, 25, ''),
('Loofah', 'General', 10, 11, 5, 24, ''),
('Shampoo', 'General', 10, 12, 4, 22, ''),
('Shaving / Razors', 'General', 10, 106, 3, 30, ''),
('Toilet paper', 'General', 10, 215, 7, 29, ''),
('Toothbrush', 'General', 10, 361, 2, 27, ''),
('Toothpaste', 'General', 10, 53, 4, 25, ''),
('Narcan / Syringe', 'General', 9, 53, 4, 25, ''),
('Naloxone', 'General', 9, 53, 4, 25, ''),
('Test Strips', 'General', 9, 53, 4, 25, '');

INSERT INTO Items (name, type, category_id, quantity, low, medium, items_per_basket, [description]) VALUES
('Laundry basket', 'Welcome Basket', 11, 53, 5, 20, 1, ''),
('Dinner plates', 'Welcome Basket', 11, 90, 10, 30, 2, ''),
('Bath towel', 'Welcome Basket', 11, 53, 5, 20, 1, ''),
('Full-size comforter pack', 'Welcome Basket', 11, 53, 5, 25, 1, ''),
('Twin-size Sheet Set', 'Welcome Basket', 11, 13, 4, 22, 0, ''),
('Full-size sheet set', 'Welcome Basket', 11, 41, 3, 10, 0, ''),
('Cooking pot', 'Welcome Basket', 11, 53, 6, 20, 1, ''),
('Hand towel', 'Welcome Basket', 11, 53, 5, 18, 1, ''),
('Shower curtain rings', 'Welcome Basket', 11, 60, 6, 15, 1, ''),
('3-piece kitchen utensil kit', 'Welcome Basket', 11, 53, 5, 22, 1, ''),
('Oven mitt', 'Welcome Basket', 11, 53, 5, 15, 1, ''),
('Kitchen/dish towel', 'Welcome Basket', 11, 55, 6, 20, 1, ''),
('Spoons', 'Welcome Basket', 11, 102, 10, 30, 2, ''),
('Steak knife', 'Welcome Basket', 11, 54, 8, 25, 1, ''),
('Cups', 'Welcome Basket', 11, 109, 15, 35, 2, ''),
('Mugs', 'Welcome Basket', 11, 72, 12, 30, 2, ''),
('Bathmat', 'Welcome Basket', 11, 53, 5, 18, 1, ''),
('Bowls', 'Welcome Basket', 11, 105, 10, 25, 2, ''),
('Side plates', 'Welcome Basket', 11, 745, 12, 30, 2, ''),
('Tupperwear', 'Welcome Basket', 11, 55, 6, 20, 1, ''),
('Cutting board', 'Welcome Basket', 11, 55, 5, 22, 1, ''),
('Can opener', 'Welcome Basket', 11, 53, 5, 20, 1, ''),
('Wash clothes', 'Welcome Basket', 11, 119, 10, 30, 2, ''),
('Small bathroom trash bin', 'Welcome Basket', 11, 53, 5, 20, 1, ''),
('Laundry detergent', 'Welcome Basket', 11, 56, 6, 18, 1, ''),
('Toothbrush', 'Welcome Basket', 11, 69, 8, 25, 1, ''),
('Toothpaste', 'Welcome Basket', 11, 33, 5, 20, 1, ''),
('Floss', 'Welcome Basket', 11, 57, 6, 18, 1, ''),
('Razor pack', 'Welcome Basket', 11, 104, 7, 22, 1, ''),
('Dish soap', 'Welcome Basket', 11, 55, 10, 25, 1, ''),
('Body soap', 'Welcome Basket', 11, 104, 5, 18, 1, ''),
('Hand soap', 'Welcome Basket', 11, 57, 6, 18, 1, ''),
('Trash bags', 'Welcome Basket', 11, 95, 5, 15, 1, ''),
('Paper towel roll', 'Welcome Basket', 11, 81, 10, 20, 1, ''),
('Plunger', 'Welcome Basket', 11, 56, 6, 20, 1, ''),
('Sponge', 'Welcome Basket', 11, 96, 8, 22, 1, ''),
('Large trash bin', 'Welcome Basket', 11, 60, 6, 20, 1, ''),
('Pillow', 'Welcome Basket', 11, 53, 5, 18, 1, ''),
('Frying pan', 'Welcome Basket', 11, 53, 6, 22, 1, ''),
('Toilet bowl brush', 'Welcome Basket', 11, 53, 5, 18, 1, ''),
('Shower curtain', 'Welcome Basket', 11, 53, 5, 20, 1, ''),
('Broom/dustpan set', 'Welcome Basket', 11, 53, 5, 15, 1, ''),
('Toilet Paper', 'Welcome Basket', 11, 146, 20, 50, 2, ''),
('All purpose cleaner', 'Welcome Basket', 11, 53, 5, 15, 1, ''),
('Shampoo', 'Welcome Basket', 11, 58, 6, 20, 1, ''),
('Conditioner', 'Welcome Basket', 11, 56, 6, 22, 1, '');
