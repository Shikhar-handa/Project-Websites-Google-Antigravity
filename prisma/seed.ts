// ============================================================
// CraveBite – Prisma Seed Script  (Jaipur Restaurant Dataset)
// Source  : restaurants_jaipur2.csv
// Run via : npx prisma db seed
// Node 24+ strips TypeScript types natively (no ts-node needed)
// ============================================================
//
// NOTE: Menu items are DEMO DATA generated per cuisine type.
//       They do NOT represent the actual menu of any restaurant.
// ============================================================

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// ─── CSV path (relative to project root where Node runs) ─────
const CSV_PATH = path.resolve("restaurants_jaipur2.csv");

// ─── Slug generator ──────────────────────────────────────────
function toSlug(name: string, area: string): string {
  const base = `${name} ${area}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // strip special chars
    .trim()
    .replace(/\s+/g, "-")            // spaces → dashes
    .replace(/-+/g, "-")             // collapse dashes
    .slice(0, 80);
  return base;
}

// ─── Safe rating parser ──────────────────────────────────────
// Returns null for "New", "-", empty or unparseable strings.
function parseRating(raw: string): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "New" || trimmed === "-") return null;
  const n = parseFloat(trimmed);
  if (isNaN(n)) return null;
  if (n < 0 || n > 5) return null;
  return n;
}

// ─── Extract primary cuisine tag from CSV cuisine column ─────
// CSV format: ['North Indian, BBQ, Mughlai'] or ['North Indian']
function parseCuisine(raw: string): string {
  if (!raw) return "Multi-Cuisine";
  // Remove Python-list brackets and quotes
  const cleaned = raw.replace(/^\[['"]?/, "").replace(/['"]?\]$/, "").trim();
  // First comma-separated tag
  const first = cleaned.split(",")[0].trim();
  return first || "Multi-Cuisine";
}

// ─── Delivery time heuristic ─────────────────────────────────
// Base 25–40 min, slightly randomised per restaurant using name hash.
function deliveryTime(name: string, rating: number | null): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  const base = 25 + (hash % 16); // 25–40 min
  // Highly-rated restaurants tend to be busier – small upward nudge
  const ratingAdj = rating && rating >= 4.7 ? 5 : 0;
  return base + ratingAdj;
}

// ─── isPremium heuristic ─────────────────────────────────────
// Premium = rating >= 4.7 only. No fabricated premium claims.
function isPremium(rating: number | null): boolean {
  return rating !== null && rating >= 4.7;
}

// ─── Demo menu generator ─────────────────────────────────────
// Returns 5–8 realistic demo items per cuisine. Clearly demo data.
interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
}

const CUISINE_MENUS: Record<string, MenuItem[]> = {
  "North Indian": [
    { name: "Butter Chicken", description: "Tender chicken in a silky tomato-cream gravy. [DEMO]", price: 349, category: "Main Course", isVeg: false },
    { name: "Dal Makhani", description: "Slow-cooked black lentils in buttery tomato gravy. [DEMO]", price: 259, category: "Main Course", isVeg: true },
    { name: "Paneer Tikka Masala", description: "Grilled cottage cheese in spiced tomato sauce. [DEMO]", price: 299, category: "Main Course", isVeg: true },
    { name: "Garlic Naan", description: "Tandoor-baked flatbread with garlic butter. [DEMO]", price: 55, category: "Starter", isVeg: true },
    { name: "Seekh Kebab", description: "Charcoal-grilled minced lamb seekh kebabs. [DEMO]", price: 299, category: "Starter", isVeg: false },
    { name: "Gulab Jamun", description: "Milk-solid dumplings in rose-cardamom syrup. [DEMO]", price: 109, category: "Dessert", isVeg: true },
    { name: "Mango Lassi", description: "Chilled yoghurt blended with Alphonso mango. [DEMO]", price: 99, category: "Beverage", isVeg: true },
    { name: "Masala Chai", description: "Spiced Indian tea with ginger and cardamom. [DEMO]", price: 49, category: "Beverage", isVeg: true },
  ],
  "Rajasthani": [
    { name: "Dal Baati Churma", description: "Baked wheat balls with lentil gravy and sweet churma. [DEMO]", price: 249, category: "Main Course", isVeg: true },
    { name: "Laal Maas", description: "Fiery Rajasthani red-chilli mutton curry. [DEMO]", price: 399, category: "Main Course", isVeg: false },
    { name: "Gatte ki Sabzi", description: "Chickpea flour dumplings in tangy yoghurt gravy. [DEMO]", price: 229, category: "Main Course", isVeg: true },
    { name: "Pyaaz Kachori", description: "Crispy deep-fried pastry filled with spiced onion. [DEMO]", price: 89, category: "Starter", isVeg: true },
    { name: "Mirchi Vada", description: "Stuffed green chillies dipped in gram-flour batter, fried. [DEMO]", price: 79, category: "Starter", isVeg: true },
    { name: "Ghevar", description: "Disc-shaped Rajasthani sweet with rabri topping. [DEMO]", price: 149, category: "Dessert", isVeg: true },
    { name: "Kanji", description: "Fermented mustard and beet drink – traditional Rajasthani. [DEMO]", price: 69, category: "Beverage", isVeg: true },
  ],
  "Continental": [
    { name: "Grilled Chicken Steak", description: "Herb-marinated chicken breast with mushroom sauce. [DEMO]", price: 429, category: "Main Course", isVeg: false },
    { name: "Penne Arrabbiata", description: "Penne pasta in a fiery tomato-garlic sauce. [DEMO]", price: 279, category: "Main Course", isVeg: true },
    { name: "Grilled Veg Platter", description: "Seasonal vegetables grilled with olive oil and herbs. [DEMO]", price: 299, category: "Main Course", isVeg: true },
    { name: "Bruschetta", description: "Toasted bread with diced tomatoes, garlic and basil. [DEMO]", price: 169, category: "Starter", isVeg: true },
    { name: "Cream of Mushroom Soup", description: "Velvety mushroom veloute with truffle oil. [DEMO]", price: 149, category: "Starter", isVeg: true },
    { name: "Warm Chocolate Fondant", description: "Molten chocolate cake with vanilla ice cream. [DEMO]", price: 219, category: "Dessert", isVeg: true },
    { name: "Iced Lemonade", description: "Fresh-squeezed lemon juice over crushed ice. [DEMO]", price: 89, category: "Beverage", isVeg: true },
  ],
  "Italian": [
    { name: "Margherita Pizza", description: "San Marzano tomato, mozzarella and fresh basil. [DEMO]", price: 329, category: "Main Course", isVeg: true },
    { name: "Fettuccine Alfredo", description: "Egg fettuccine in butter-parmesan cream sauce. [DEMO]", price: 309, category: "Main Course", isVeg: true },
    { name: "Penne Arrabbiata", description: "Spicy tomato-garlic pasta with fresh herbs. [DEMO]", price: 279, category: "Main Course", isVeg: true },
    { name: "Bruschetta al Pomodoro", description: "Toasted sourdough with tomato and basil. [DEMO]", price: 159, category: "Starter", isVeg: true },
    { name: "Minestrone Soup", description: "Classic Italian vegetable soup with pasta. [DEMO]", price: 149, category: "Starter", isVeg: true },
    { name: "Tiramisu", description: "Espresso-soaked ladyfingers with mascarpone cream. [DEMO]", price: 199, category: "Dessert", isVeg: true },
    { name: "Sparkling Lemonade", description: "Housemade lemonade with a sparkling twist. [DEMO]", price: 89, category: "Beverage", isVeg: true },
  ],
  "Chinese": [
    { name: "Veg Hakka Noodles", description: "Stir-fried noodles with crunchy vegetables. [DEMO]", price: 219, category: "Main Course", isVeg: true },
    { name: "Kung Pao Chicken", description: "Stir-fried chicken with peanuts and chillies. [DEMO]", price: 299, category: "Main Course", isVeg: false },
    { name: "Veg Fried Rice", description: "Wok-tossed rice with spring onion and egg. [DEMO]", price: 199, category: "Main Course", isVeg: true },
    { name: "Veg Spring Rolls", description: "Crispy rolls with shredded vegetables. [DEMO]", price: 169, category: "Starter", isVeg: true },
    { name: "Hot and Sour Soup", description: "Tangy broth with tofu, mushrooms and bamboo. [DEMO]", price: 139, category: "Starter", isVeg: true },
    { name: "Mango Pudding", description: "Chilled silken mango pudding. [DEMO]", price: 139, category: "Dessert", isVeg: true },
    { name: "Jasmine Green Tea", description: "Floral jasmine-scented green tea. [DEMO]", price: 79, category: "Beverage", isVeg: true },
  ],
  "Mughlai": [
    { name: "Mutton Biryani", description: "Slow-cooked fragrant rice with tender mutton and saffron. [DEMO]", price: 419, category: "Main Course", isVeg: false },
    { name: "Shahi Paneer", description: "Cottage cheese in a rich cream-cashew gravy. [DEMO]", price: 309, category: "Main Course", isVeg: true },
    { name: "Chicken Korma", description: "Tender chicken in mild almond-cream sauce. [DEMO]", price: 359, category: "Main Course", isVeg: false },
    { name: "Galouti Kebab", description: "Melt-in-the-mouth minced lamb kebabs on sheermal. [DEMO]", price: 329, category: "Starter", isVeg: false },
    { name: "Roomali Roti", description: "Paper-thin handkerchief bread. [DEMO]", price: 45, category: "Starter", isVeg: true },
    { name: "Shahi Tukda", description: "Fried bread in thickened saffron-rabri milk. [DEMO]", price: 159, category: "Dessert", isVeg: true },
    { name: "Rose Sharbat", description: "Chilled rose-water drink with basil seeds. [DEMO]", price: 79, category: "Beverage", isVeg: true },
  ],
  "Biryani": [
    { name: "Chicken Biryani", description: "Fragrant basmati rice with marinated chicken. [DEMO]", price: 349, category: "Main Course", isVeg: false },
    { name: "Veg Biryani", description: "Aromatic rice with seasonal vegetables and whole spices. [DEMO]", price: 279, category: "Main Course", isVeg: true },
    { name: "Mutton Biryani", description: "Slow-cooked tender mutton on saffron basmati. [DEMO]", price: 419, category: "Main Course", isVeg: false },
    { name: "Boti Kebab", description: "Marinated mutton chunks grilled over charcoal. [DEMO]", price: 299, category: "Starter", isVeg: false },
    { name: "Shorba Soup", description: "Light, spiced lamb broth served before the main. [DEMO]", price: 119, category: "Starter", isVeg: false },
    { name: "Seviyan Kheer", description: "Vermicelli pudding with cardamom and pistachios. [DEMO]", price: 99, category: "Dessert", isVeg: true },
    { name: "Aam Panna", description: "Chilled raw mango drink with cumin and mint. [DEMO]", price: 79, category: "Beverage", isVeg: true },
  ],
  "Fast Food": [
    { name: "Crispy Chicken Burger", description: "Buttermilk fried chicken with coleslaw and sriracha mayo. [DEMO]", price: 259, category: "Main Course", isVeg: false },
    { name: "Veggie Supreme Burger", description: "Aloo-tikki patty with lettuce, tomato and chipotle aioli. [DEMO]", price: 219, category: "Main Course", isVeg: true },
    { name: "Loaded Masala Fries", description: "Crispy fries tossed in tangy chaat masala. [DEMO]", price: 149, category: "Starter", isVeg: true },
    { name: "Onion Rings", description: "Beer-battered onion rings with chipotle dip. [DEMO]", price: 129, category: "Starter", isVeg: true },
    { name: "Chocolate Milkshake", description: "Thick chocolate shake with whipped cream. [DEMO]", price: 169, category: "Beverage", isVeg: true },
    { name: "Brownie Sundae", description: "Warm chocolate brownie with vanilla ice cream. [DEMO]", price: 189, category: "Dessert", isVeg: true },
  ],
  "Cafe": [
    { name: "Eggs Benedict", description: "Poached eggs on toasted muffin with hollandaise. [DEMO]", price: 269, category: "Main Course", isVeg: false },
    { name: "Avocado Toast", description: "Sourdough with smashed avocado and cherry tomatoes. [DEMO]", price: 229, category: "Starter", isVeg: true },
    { name: "Banana Pancakes", description: "Fluffy pancakes with fresh banana and maple syrup. [DEMO]", price: 199, category: "Starter", isVeg: true },
    { name: "Choco Lava Cake", description: "Warm chocolate cake with molten centre. [DEMO]", price: 189, category: "Dessert", isVeg: true },
    { name: "Cold Brew Coffee", description: "12-hour cold-extracted smooth black coffee. [DEMO]", price: 149, category: "Beverage", isVeg: true },
    { name: "Masala Chai Latte", description: "Spiced Indian-style tea latte with frothy milk. [DEMO]", price: 99, category: "Beverage", isVeg: true },
    { name: "Mango Passion Smoothie", description: "Fresh mango blended with passionfruit and yoghurt. [DEMO]", price: 179, category: "Beverage", isVeg: true },
  ],
  "Healthy Food": [
    { name: "Quinoa Buddha Bowl", description: "Tri-colour quinoa, roasted veg and tahini drizzle. [DEMO]", price: 329, category: "Main Course", isVeg: true },
    { name: "Grilled Chicken Salad", description: "Herb chicken, greens, avocado and lemon dressing. [DEMO]", price: 299, category: "Main Course", isVeg: false },
    { name: "Hummus Wrap", description: "Whole-wheat wrap with hummus, falafel and greens. [DEMO]", price: 259, category: "Main Course", isVeg: true },
    { name: "Acai Smoothie Bowl", description: "Blended acai topped with granola and berries. [DEMO]", price: 279, category: "Starter", isVeg: true },
    { name: "Chia Seed Pudding", description: "Overnight chia pudding with coconut milk and berries. [DEMO]", price: 189, category: "Dessert", isVeg: true },
    { name: "Cold Pressed Green Juice", description: "Spinach, cucumber, apple and ginger. [DEMO]", price: 169, category: "Beverage", isVeg: true },
    { name: "Kombucha", description: "Naturally fermented sparkling tea ginger-lemon. [DEMO]", price: 139, category: "Beverage", isVeg: true },
  ],
  "South Indian": [
    { name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling and sambar. [DEMO]", price: 149, category: "Main Course", isVeg: true },
    { name: "Idli Sambar (4 pcs)", description: "Steamed rice cakes with lentil sambar and chutney. [DEMO]", price: 99, category: "Starter", isVeg: true },
    { name: "Medu Vada", description: "Savoury fried lentil doughnuts with coconut chutney. [DEMO]", price: 99, category: "Starter", isVeg: true },
    { name: "Chettinad Chicken Curry", description: "Peppery Chettinad-style chicken curry. [DEMO]", price: 319, category: "Main Course", isVeg: false },
    { name: "Payasam", description: "Vermicelli pudding with cardamom and saffron. [DEMO]", price: 119, category: "Dessert", isVeg: true },
    { name: "Filter Coffee", description: "Classic South Indian filter coffee rich and frothy. [DEMO]", price: 59, category: "Beverage", isVeg: true },
  ],
  "Pizza": [
    { name: "Margherita Pizza", description: "Classic tomato-mozzarella-basil on thin crust. [DEMO]", price: 299, category: "Main Course", isVeg: true },
    { name: "BBQ Chicken Pizza", description: "Smoky BBQ sauce with grilled chicken and onion. [DEMO]", price: 369, category: "Main Course", isVeg: false },
    { name: "Peri Peri Paneer Pizza", description: "Tangy peri peri base with cottage cheese. [DEMO]", price: 329, category: "Main Course", isVeg: true },
    { name: "Garlic Bread", description: "Toasted baguette with garlic butter and herbs. [DEMO]", price: 129, category: "Starter", isVeg: true },
    { name: "Tomato Soup", description: "Creamy roasted tomato soup. [DEMO]", price: 129, category: "Starter", isVeg: true },
    { name: "Choco Mousse", description: "Light Belgian chocolate mousse. [DEMO]", price: 169, category: "Dessert", isVeg: true },
    { name: "Oreo Shake", description: "Creamy Oreo cookie milkshake. [DEMO]", price: 159, category: "Beverage", isVeg: true },
  ],
  "Bar Food": [
    { name: "Loaded Nachos", description: "Tortilla chips with cheese sauce, jalapenos and salsa. [DEMO]", price: 229, category: "Starter", isVeg: true },
    { name: "Chicken Wings (6 pcs)", description: "Crispy wings tossed in hot sauce. [DEMO]", price: 319, category: "Starter", isVeg: false },
    { name: "Paneer Tikka", description: "Chargrilled cottage cheese with mint chutney. [DEMO]", price: 279, category: "Starter", isVeg: true },
    { name: "Cheese Quesadilla", description: "Grilled flour tortilla with melted cheese. [DEMO]", price: 229, category: "Main Course", isVeg: true },
    { name: "Classic Burger", description: "Chicken or veg patty with lettuce and special sauce. [DEMO]", price: 249, category: "Main Course", isVeg: false },
    { name: "Brownie with Ice Cream", description: "Warm fudgy brownie served with a scoop of vanilla. [DEMO]", price: 179, category: "Dessert", isVeg: true },
    { name: "Virgin Mojito", description: "Fresh lime and mint with soda water. [DEMO]", price: 109, category: "Beverage", isVeg: true },
  ],
  "Asian": [
    { name: "Pad Thai Noodles", description: "Rice noodles stir-fried with tamarind, peanuts and lime. [DEMO]", price: 289, category: "Main Course", isVeg: true },
    { name: "Thai Green Curry", description: "Aromatic green curry with vegetables and jasmine rice. [DEMO]", price: 319, category: "Main Course", isVeg: true },
    { name: "Chicken Satay", description: "Skewered grilled chicken with peanut dipping sauce. [DEMO]", price: 279, category: "Starter", isVeg: false },
    { name: "Edamame", description: "Salted steamed young soybeans. [DEMO]", price: 149, category: "Starter", isVeg: true },
    { name: "Mango Sticky Rice", description: "Thai sweet sticky rice with fresh mango slices. [DEMO]", price: 189, category: "Dessert", isVeg: true },
    { name: "Thai Iced Tea", description: "Strong Ceylon tea with condensed milk over ice. [DEMO]", price: 109, category: "Beverage", isVeg: true },
  ],
  "Mexican": [
    { name: "Chicken Tacos (3 pcs)", description: "Grilled chicken on soft tortillas with pico de gallo. [DEMO]", price: 299, category: "Main Course", isVeg: false },
    { name: "Black Bean Burrito", description: "Flour tortilla with spiced beans, rice and sour cream. [DEMO]", price: 259, category: "Main Course", isVeg: true },
    { name: "Guacamole and Chips", description: "Fresh-smashed avocado with tortilla chips. [DEMO]", price: 189, category: "Starter", isVeg: true },
    { name: "Nachos Grande", description: "Chips with cheese sauce, jalapenos and salsa. [DEMO]", price: 219, category: "Starter", isVeg: true },
    { name: "Churros", description: "Fried dough sticks with cinnamon sugar and chocolate dip. [DEMO]", price: 159, category: "Dessert", isVeg: true },
    { name: "Virgin Margarita", description: "Fresh lime and orange juice with a salted rim. [DEMO]", price: 119, category: "Beverage", isVeg: true },
  ],
  "Street Food": [
    { name: "Pani Puri (6 pcs)", description: "Crispy puri shells filled with tamarind water and potato. [DEMO]", price: 69, category: "Starter", isVeg: true },
    { name: "Chole Bhature", description: "Spiced chickpeas with fluffy fried bread. [DEMO]", price: 149, category: "Main Course", isVeg: true },
    { name: "Aloo Tikki Chaat", description: "Crispy potato patties topped with chutneys and yoghurt. [DEMO]", price: 99, category: "Starter", isVeg: true },
    { name: "Kachori Sabzi", description: "Flaky kachori with spiced potato gravy. [DEMO]", price: 99, category: "Main Course", isVeg: true },
    { name: "Jalebi (4 pcs)", description: "Crispy fermented batter fried in spiral, soaked in syrup. [DEMO]", price: 79, category: "Dessert", isVeg: true },
    { name: "Sugarcane Juice", description: "Fresh-pressed sugarcane with lemon and ginger. [DEMO]", price: 49, category: "Beverage", isVeg: true },
  ],
  "Kebab": [
    { name: "Seekh Kebab", description: "Minced lamb seekh kebabs grilled over charcoal. [DEMO]", price: 299, category: "Starter", isVeg: false },
    { name: "Galouti Kebab", description: "Melt-in-the-mouth minced lamb on sheermal. [DEMO]", price: 329, category: "Starter", isVeg: false },
    { name: "Paneer Shashlik", description: "Marinated cottage cheese and peppers on skewers. [DEMO]", price: 259, category: "Starter", isVeg: true },
    { name: "Kebab Platter", description: "Mixed platter of chicken, lamb and veg kebabs. [DEMO]", price: 499, category: "Main Course", isVeg: false },
    { name: "Roomali Roti", description: "Paper-thin handkerchief bread. [DEMO]", price: 45, category: "Starter", isVeg: true },
    { name: "Phirni", description: "Chilled rice flour pudding with cardamom. [DEMO]", price: 119, category: "Dessert", isVeg: true },
    { name: "Shikanjvi", description: "Traditional Indian spiced lemonade. [DEMO]", price: 59, category: "Beverage", isVeg: true },
  ],
  "French": [
    { name: "Croque Monsieur", description: "Ham and cheese grilled sandwich with bechamel. [DEMO]", price: 299, category: "Main Course", isVeg: false },
    { name: "Quiche Lorraine", description: "Buttery pastry tart with bacon and cheese filling. [DEMO]", price: 279, category: "Main Course", isVeg: false },
    { name: "Ratatouille", description: "Provencal vegetable casserole with herbes de Provence. [DEMO]", price: 259, category: "Main Course", isVeg: true },
    { name: "French Onion Soup", description: "Caramelised onion broth with gruyere crouton. [DEMO]", price: 179, category: "Starter", isVeg: true },
    { name: "Creme Brulee", description: "Vanilla custard with a caramelised sugar crust. [DEMO]", price: 219, category: "Dessert", isVeg: true },
    { name: "Cafe au Lait", description: "Equal parts strong coffee and steamed milk. [DEMO]", price: 99, category: "Beverage", isVeg: true },
  ],
  "Japanese": [
    { name: "Salmon Nigiri (4 pcs)", description: "Vinegared rice topped with fresh Atlantic salmon. [DEMO]", price: 449, category: "Main Course", isVeg: false },
    { name: "Avocado Maki (8 pcs)", description: "Creamy avocado and cucumber maki roll. [DEMO]", price: 299, category: "Main Course", isVeg: true },
    { name: "Spicy Tuna Roll (8 pcs)", description: "Fresh tuna with sriracha mayo in nori. [DEMO]", price: 399, category: "Main Course", isVeg: false },
    { name: "Edamame", description: "Salted steamed young soybeans. [DEMO]", price: 149, category: "Starter", isVeg: true },
    { name: "Miso Soup", description: "Traditional Japanese soup with tofu and seaweed. [DEMO]", price: 119, category: "Starter", isVeg: true },
    { name: "Matcha Ice Cream", description: "Premium Japanese matcha soft-serve. [DEMO]", price: 179, category: "Dessert", isVeg: true },
    { name: "Sencha Green Tea", description: "Delicate Japanese green tea. [DEMO]", price: 89, category: "Beverage", isVeg: true },
  ],
  "Lebanese": [
    { name: "Chicken Shawarma Wrap", description: "Marinated chicken with garlic sauce in flatbread. [DEMO]", price: 249, category: "Main Course", isVeg: false },
    { name: "Falafel Wrap", description: "Crispy chickpea falafel with hummus and pickles. [DEMO]", price: 219, category: "Main Course", isVeg: true },
    { name: "Hummus with Pita", description: "Smooth chickpea hummus with warm pita bread. [DEMO]", price: 179, category: "Starter", isVeg: true },
    { name: "Fattoush Salad", description: "Fresh Levantine salad with crispy pita croutons. [DEMO]", price: 189, category: "Starter", isVeg: true },
    { name: "Baklava (3 pcs)", description: "Flaky pastry with pistachio and honey syrup. [DEMO]", price: 149, category: "Dessert", isVeg: true },
    { name: "Fresh Lemon Mint Juice", description: "Hand-squeezed lemon with fresh mint. [DEMO]", price: 99, category: "Beverage", isVeg: true },
  ],
  "Bakery": [
    { name: "Croissant", description: "Classic buttery French croissant, baked fresh. [DEMO]", price: 99, category: "Starter", isVeg: true },
    { name: "Quiche Florentine", description: "Spinach and cheese baked in a short-crust pastry. [DEMO]", price: 199, category: "Main Course", isVeg: true },
    { name: "Club Sandwich", description: "Triple-decker with chicken, egg and lettuce. [DEMO]", price: 229, category: "Main Course", isVeg: false },
    { name: "Red Velvet Cake", description: "Classic red velvet slice with cream cheese frosting. [DEMO]", price: 179, category: "Dessert", isVeg: true },
    { name: "Chocolate Eclair", description: "Choux pastry filled with cream and chocolate glaze. [DEMO]", price: 139, category: "Dessert", isVeg: true },
    { name: "Cappuccino", description: "Double espresso with steamed milk foam. [DEMO]", price: 119, category: "Beverage", isVeg: true },
    { name: "Fresh Orange Juice", description: "Cold-pressed seasonal orange juice. [DEMO]", price: 99, category: "Beverage", isVeg: true },
  ],
  "Coffee": [
    { name: "Avocado Toast", description: "Smashed avocado on multigrain toast with chilli flakes. [DEMO]", price: 219, category: "Starter", isVeg: true },
    { name: "Egg Salad Sandwich", description: "Creamy egg salad on whole-wheat bread. [DEMO]", price: 189, category: "Main Course", isVeg: false },
    { name: "Banana Walnut Muffin", description: "Moist banana muffin with crunchy walnuts. [DEMO]", price: 89, category: "Dessert", isVeg: true },
    { name: "Classic Cappuccino", description: "Double espresso with steamed milk and foam. [DEMO]", price: 119, category: "Beverage", isVeg: true },
    { name: "Cold Brew", description: "Smooth 12-hour cold-extracted black coffee. [DEMO]", price: 149, category: "Beverage", isVeg: true },
    { name: "Matcha Latte", description: "Ceremonial-grade matcha with oat milk. [DEMO]", price: 159, category: "Beverage", isVeg: true },
  ],
};

// Fallback menu for cuisines not explicitly listed
const FALLBACK_MENU: MenuItem[] = [
  { name: "Chef Special Main Course", description: "Signature dish from the chef daily selection. [DEMO]", price: 329, category: "Main Course", isVeg: true },
  { name: "Mixed Veg Curry", description: "Seasonal vegetables in a mildly spiced gravy. [DEMO]", price: 249, category: "Main Course", isVeg: true },
  { name: "Grilled Chicken Platter", description: "Herb-marinated grilled chicken with sides. [DEMO]", price: 349, category: "Main Course", isVeg: false },
  { name: "Soup of the Day", description: "Freshly prepared soup from the kitchen. [DEMO]", price: 129, category: "Starter", isVeg: true },
  { name: "Garden Salad", description: "Fresh seasonal salad with house dressing. [DEMO]", price: 149, category: "Starter", isVeg: true },
  { name: "Ice Cream Sundae", description: "Vanilla ice cream with chocolate sauce and sprinkles. [DEMO]", price: 149, category: "Dessert", isVeg: true },
  { name: "Fresh Lime Soda", description: "Sparkling lime soda with a pinch of black salt. [DEMO]", price: 79, category: "Beverage", isVeg: true },
  { name: "Masala Chai", description: "Classic Indian spiced tea. [DEMO]", price: 49, category: "Beverage", isVeg: true },
];

function getMenuForCuisine(cuisineTag: string): MenuItem[] {
  // Try exact match first
  if (CUISINE_MENUS[cuisineTag]) return CUISINE_MENUS[cuisineTag];

  // Try partial matches (case-insensitive)
  const tag = cuisineTag.toLowerCase();
  for (const [key, menu] of Object.entries(CUISINE_MENUS)) {
    if (tag.includes(key.toLowerCase()) || key.toLowerCase().includes(tag)) {
      return menu;
    }
  }

  return FALLBACK_MENU;
}

// ─── CSV parser (simple, handles quoted fields) ───────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = "";

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

interface RawRow {
  name: string;
  area: string;
  rating: string;
  price_range: string;
  cuisine: string;
  link: string;
}

function loadCSV(filePath: string): RawRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = parseCSVLine(lines[0]).map((h) => h.trim());

  const rows: RawRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = (cols[j] ?? "").trim();
    }
    rows.push(row as unknown as RawRow);
  }
  return rows;
}

// ─── Seed function ────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("Starting CraveBite seed (Jaipur dataset)...\n");

  // Reset: delete all menu items and restaurants first for clean re-seed
  console.log("Clearing existing restaurant + menu data...");
  await prisma.menuItem.deleteMany({});
  await prisma.restaurant.deleteMany({});
  console.log("Done.\n");

  const rows = loadCSV(CSV_PATH);
  console.log(`Loaded ${rows.length} rows from CSV.\n`);

  let imported = 0;
  let skipped = 0;
  let menuItemsTotal = 0;
  const skipLog: string[] = [];

  // Track slugs to handle duplicate restaurant names gracefully
  const usedSlugs = new Set<string>();

  for (const row of rows) {
    const name = row.name?.trim();
    const area = row.area?.trim();

    if (!name) {
      skipLog.push("Row skipped – empty name");
      skipped++;
      continue;
    }

    const rating = parseRating(row.rating);
    const cuisineTag = parseCuisine(row.cuisine);
    const dt = deliveryTime(name, rating);
    const premium = isPremium(rating);

    // Build slug; append a counter if already used
    let slug = toSlug(name, area ?? "jaipur");
    if (!slug) slug = `restaurant-${imported + 1}`;
    if (usedSlugs.has(slug)) {
      let counter = 2;
      while (usedSlugs.has(`${slug}-${counter}`)) counter++;
      slug = `${slug}-${counter}`;
    }
    usedSlugs.add(slug);

    const address = area ? `${area}, Jaipur` : "Jaipur";

    try {
      const restaurant = await prisma.restaurant.create({
        data: {
          name,
          slug,
          address,
          rating: rating ?? 0.0,
          cuisine: cuisineTag,
          coverImage: null,
          deliveryTime: dt,
          isPremium: premium,
        },
      });

      const menuItems = getMenuForCuisine(cuisineTag);

      for (const item of menuItems) {
        await prisma.menuItem.create({
          data: {
            restaurantId: restaurant.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            isVeg: item.isVeg,
            imageUrl: null,
            available: true,
          },
        });
        menuItemsTotal++;
      }

      imported++;
      console.log(`[${imported}] ${name} | ${cuisineTag} | rating: ${rating ?? "New"} | ${dt} min`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      skipLog.push(`Row skipped – "${name}": ${msg}`);
      skipped++;
      console.warn(`Skipped "${name}": ${msg}`);
    }
  }

  // Summary
  console.log("\n===================================================");
  console.log(`Restaurants imported : ${imported}`);
  console.log(`Menu items generated : ${menuItemsTotal}`);
  console.log(`Rows skipped         : ${skipped}`);
  if (skipLog.length > 0) {
    console.log("\nSkipped rows:");
    skipLog.forEach((s) => console.log(`  - ${s}`));
  }
  console.log("===================================================");
  console.log("Seed complete!\n");
}

// ─── Entry point ─────────────────────────────────────────────

main()
  .catch((err: unknown) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
