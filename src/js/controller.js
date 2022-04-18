import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// request one recipe. When we click on recipe with the all of recipes
const controlRecipes = async () => {
  try {
    // hash with url. Our id
    const id = window.location.hash.slice(1);
    //if won't hash and only empty string. Not error
    if (!id) {
      return;
    }

    // start spinner
    recipeView.renderSpiner();
    // Loading recipe
    await model.loadRecipe(id);

    // rendering recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError(`${error}`);
  }
};

// search all recipes
const controlSearchResults = async () => {
  try {
    resultsView.renderSpiner();
    // get search query
    const query = searchView.getQuery();

    if (!query) {
      return;
    }

    // udate list bookmarks
    bookmarksView.render(model.state.bookmarks);
    // load search results
    await model.loadSearchResults(query);
    // render results
    //resultsView.render(model.state.search.results);

    // pagination
    resultsView.render(model.getSearchResultPage());

    // render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    recipeView.renderError(`${error}`);
  }
};

// pagination
const controlPagination = goToPage => {
  // render new pagination
  resultsView.render(model.getSearchResultPage(goToPage));

  // render new pagination buttons
  paginationView.render(model.state.search);
};

// for change ingradient, when we change servings
const controlServings = newServings => {
  // update recipe servings (in state)
  model.updateServings(newServings);
  // update recipe view
  recipeView.render(model.state.recipe);
};

// for bookmark
const controlAddBookmark = () => {
  // add or remove bookmarks
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // update recipe view
  recipeView.render(model.state.recipe);
  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

// localstorage
const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks);
};

// work with form (new recipe)
const controlAddRecipe = async newRecipe => {
  try {
    // upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    // render recipe
    recipeView.render(model.state.recipe);
    // render bookmarks
    bookmarksView.render(model.state.bookmarks);
    // change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // close form window
    setTimeout(() => addRecipeView.toggleWindow(), 1500);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

// listen event.
const init = () => {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
