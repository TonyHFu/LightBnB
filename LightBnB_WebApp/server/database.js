const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require("pg");
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(`
    SELECT * 
    FROM users
    WHERE email = $1;
  `, [email])
    .then(result => {
      if (result.rows.length === 0) {
        // console.log("failed to get user by email");
        return null; 
      }
      // console.log("result.rows email", result.rows);
      return result.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });


};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
    SELECT * 
    FROM users
    WHERE id = $1;
  `, [id])
    .then(result => {
      if (result.rows.length === 0) {
        // console.log("failed to get user by id");
        return null; 
      }
      // console.log("result.rows id", result.rows);
      return result.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(`
    INSERT INTO users
    VALUES
    (DEFAULT, $1, $2, $3)
    RETURNING *;
  `, [user.name, user.email, user.password])
    .then((result) => {
      // console.log("user successfully added");
      // console.log("user.rows[0]", user.rows[0]);
      return result.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN reservations ON (reservations.property_id = properties.id)
    JOIN property_reviews ON (property_reviews.property_id = properties.id)
    WHERE reservations.guest_id = $1
    GROUP BY  reservations.id, properties.id
    ORDER BY start_date
    LIMIT $2;
  `, [guest_id, limit])
    .then(result => {
      return result.rows;
    })
    .catch(err => {
      console.log(err.message);
    })
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {

  const queryParams = [];
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    WHERE true
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `
      AND UPPER(city) LIKE UPPER($${queryParams.length})
    `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `
      AND properties.owner_id = $${queryParams.length}
    `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `
      AND properties.cost_per_night >= $${queryParams.length}
    `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `
      AND properties.cost_per_night <= $${queryParams.length}
    `;
  }

  
  queryString += `
    GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `
    HAVING avg(property_reviews.rating) >= $${queryParams.length}
    `;
  }
  
  queryParams.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  // console.log(queryString, queryParams);
  
  return pool.query(queryString, queryParams)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });


}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  // console.log("property",property);
  return pool.query(`
    INSERT INTO properties
    VALUES
    (
      DEFAULT,
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      $14,
      true
    )
    RETURNING *;
  `, [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night * 100,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
    property.country,
    property.street,
    property.city,
    property.province,
    property.post_code
  ])
    .then((result) => {
      return result.rows;
    })
    .catch(err => {
      console.log(err.message);
    });

}
exports.addProperty = addProperty;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
 const bookReservation = function(propertyId, start, end, userId) {
  return pool.query(`
    INSERT INTO reservations
    VALUES
    (
      DEFAULT,
      $1,
      $2,
      $3,
      $4
    )
    RETURNING *;
  `, [start, end, propertyId, userId])
    .then(result => {
      return result.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });
};
exports.bookReservation = bookReservation;
