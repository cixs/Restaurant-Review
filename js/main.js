
let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');

  // insert a info text when the searching result is empty
  if (restaurants.length === 0) {
    let elem = document.createElement('h1');
    elem.style.color = '#f80';
    elem.style.fontsize = '1.2em';
    elem.innerText = 'No results matching your criteria';
    ul.append(elem);
  } else {
    restaurants.forEach(restaurant => {
      ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
  }
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.setAttribute('role', 'listitem'); // redundant, but whitout this line it's not seen by the ChromeVox
  li.setAttribute('aria-label', `a restaurant named ${restaurant.name} in ${restaurant.neighborhood}`);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt=`A view inside ${restaurant.name}`;

  image.setAttribute('aria-hidden', 'true');
  image.alt = 'A view inside restaurant'; 
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);


  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = '<span aria-hidden = "true">View Details</span><span class="only-for-sr">More about this restaurant</span>';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
};
/**
 * Add an mouse click handler for search button
 */
document.getElementById('search-button').addEventListener('click', (event) => {
  let input = document.getElementById('search-input');
  let searchString = input.value.toLowerCase();
  DBHelper.fetchRestaurantBySearchText(searchString, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
  event.preventDefault();
});

/*
 * It is kinda annoying when the focus enter inside the google map 
 * and then needs a lot of tab keystrokes to leave all those buttons and location marks
 * looking for a way to deal with this, I've found a nice idea here: https://www.canada.ca/en.html
 * it allows user to decide if he/she wants to do something inside map or to get over to the next content
 * the next three following event handlers are my implementation of this idea
 * (also, I added the necessary elements on index.html)
*/

document.getElementById('page-title').addEventListener('focus', (event) => {
  let element = document.getElementById('skip-focus-on-google-map');
  element.setAttribute('style', 'visibility:visible;');
});

document.getElementById('skip-focus-on-google-map').addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    let element = document.getElementById('neighborhoods-select');
    element.focus();
    event.target.setAttribute('style', 'visibility:hidden;');
  }
});

document.getElementById('skip-focus-on-google-map').addEventListener('focusout', (event) => {
    event.target.setAttribute('style', 'visibility:hidden;');
});
