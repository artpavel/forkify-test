import { API_URL, KEY, RES_PER_PAGE } from './config';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = data => {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

// to receive data from API
export const loadRecipe = async function (id) {
  try {
    // get data from url
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    // object
    state.recipe = createRecipeObject(data);

    // check if there was a bookmark
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (error) {
    // temp error handling
    console.error(`${error}`);
    throw error;
  }
};

// search all results
export const loadSearchResults = async query => {
  try {
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.query = query;

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
      };
    });
  } catch (error) {
    throw error;
  }
};

// pagination
export const getSearchResultPage = (page = 1) => {
  // save page to object
  state.search.page = page;
  // dynamic calc date
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

// change servings
export const updateServings = newServings => {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

// save in localstorage list bookmarks
const persisBookmarks = () => {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// add bookmark
export const addBookmark = recipe => {
  // add
  state.bookmarks.push(recipe);
  // mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  // localstorage
  persisBookmarks();
};

// remove bookmark
export const deleteBookmark = id => {
  const index = state.bookmarks.findIndex(item => item.id === id);
  state.bookmarks.splice(index, 1);
  // mark current recipe not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  // localstorage
  persisBookmarks();
};

// get localstorage
const init = () => {
  const storage = localStorage.getItem('bookmarks');

  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

// post form
export const uploadRecipe = async newRecipe => {
  try {
    // transform the object ingradients
    // console.log(newRecipe) - look ingradients
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].replaceAll(' ', '').split(',');
        const [quantity, unit, description] = ingArr;

        // if uncorrectly date in input
        if (ingArr.length !== 3) {
          throw new Error('Wrong ingredient format!!! Use correct format');
        }

        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    // create object
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
