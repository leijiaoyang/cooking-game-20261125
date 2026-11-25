// Sizzle & Serve — ingredients and dishes (the recipe book).
// Every dish needs at least two different cooking actions and one timed step.
// A "component" is an ingredient after one action: chop, fry, boil or none (raw).

export const INGREDIENTS = {
  bun:      { id: 'bun',      name: 'Bun',      price: 2, action: 'raw',  color: '#e8b06a', shape: 'bun' },
  patty:    { id: 'patty',    name: 'Beef Patty', price: 4, action: 'fry',  color: '#8a5a2b', shape: 'patty' },
  tomato:   { id: 'tomato',   name: 'Tomato',   price: 2, action: 'chop', color: '#e4572e', shape: 'tomato' },
  lettuce:  { id: 'lettuce',  name: 'Lettuce',  price: 2, action: 'chop', color: '#4caf50', shape: 'lettuce' },
  cheese:   { id: 'cheese',   name: 'Cheese',   price: 3, action: 'raw',  color: '#f2b705', shape: 'cheese' },
  onion:    { id: 'onion',    name: 'Onion',    price: 2, action: 'chop', color: '#f3e5f5', shape: 'onion' },
  mushroom: { id: 'mushroom', name: 'Mushroom', price: 3, action: 'fry',  color: '#d7ccc8', shape: 'mushroom' },
  egg:      { id: 'egg',      name: 'Egg',      price: 3, action: 'fry',  color: '#fff8e1', shape: 'egg' },
  fish:     { id: 'fish',     name: 'Fish Fillet', price: 5, action: 'fry', color: '#90caf9', shape: 'fish' },
  potato:   { id: 'potato',   name: 'Potato',   price: 2, action: 'fry',  color: '#ffd54f', shape: 'potato' },
  lemon:    { id: 'lemon',    name: 'Lemon',    price: 2, action: 'raw',  color: '#ffee58', shape: 'lemon' },
  pasta:    { id: 'pasta',    name: 'Pasta',    price: 3, action: 'boil', color: '#ffca28', shape: 'pasta' },
};

export const INGREDIENT_LIST = Object.values(INGREDIENTS);

// A dish is a multiset of components, each "ingredient:action".
// price: coins earned on serve. time: par serve time (seconds) for the best-time record.
export const DISHES = [
  {
    id: 'burger',
    name: 'Classic Burger',
    components: ['bun:raw', 'patty:fry', 'tomato:chop', 'lettuce:chop', 'cheese:raw'],
    price: 18, par: 45,
    blurb: 'The house classic. Fry the patty, chop the veg, stack it high.',
  },
  {
    id: 'swiss-burger',
    name: 'Mushroom Swiss Burger',
    components: ['bun:raw', 'patty:fry', 'mushroom:fry', 'cheese:raw'],
    price: 20, par: 40,
    blurb: 'Swap the salad for fried mushrooms — same patty, richer bite.',
  },
  {
    id: 'salad',
    name: 'Garden Salad',
    components: ['tomato:chop', 'lettuce:chop', 'onion:chop', 'lemon:raw'],
    price: 14, par: 35,
    blurb: 'No stove needed, but three chops under the clock.',
  },
  {
    id: 'fish-chips',
    name: 'Fish & Chips',
    components: ['fish:fry', 'potato:fry', 'lemon:raw'],
    price: 22, par: 40,
    blurb: 'Two fryers at once — mind the temperature on both.',
  },
  {
    id: 'omelette',
    name: 'Cheesy Omelette',
    components: ['egg:fry', 'cheese:raw', 'onion:chop', 'mushroom:fry'],
    price: 20, par: 42,
    blurb: 'Fry the egg gently, fold in cheese, onion and mushroom.',
  },
  {
    id: 'pasta',
    name: 'Tomato Pasta',
    components: ['pasta:boil', 'tomato:chop', 'cheese:raw'],
    price: 16, par: 38,
    blurb: 'Boil the pasta, chop the tomato, shower it with cheese.',
  },
];

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

// Components of a dish as {ingredient, action} pairs, in recipe order.
export function dishSteps(dish) {
  return dish.components.map((c) => {
    const [ingredient, action] = c.split(':');
    return { ingredient, action };
  });
}

// Does the plate's multiset of components exactly match a dish?
export function matchDish(components) {
  const key = [...components].sort().join('|');
  return DISHES.find((d) => [...d.components].sort().join('|') === key) || null;
}

// Which dishes could this plate still become? (plate is a subset of the dish)
export function possibleDishes(components) {
  const have = {};
  for (const c of components) have[c] = (have[c] || 0) + 1;
  return DISHES.filter((d) => {
    const need = {};
    for (const c of d.components) need[c] = (need[c] || 0) + 1;
    return Object.keys(have).every((c) => (need[c] || 0) >= have[c]);
  });
}
