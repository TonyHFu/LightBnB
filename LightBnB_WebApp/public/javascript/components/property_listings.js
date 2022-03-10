$(() => {

  const $propertyListings = $(`
  <section class="property-listings" id="property-listings">
      <p>Loading...</p>
    </section>
  `);
  window.$propertyListings = $propertyListings;

  window.propertyListings = {};

  function addListing(listing) {
    $propertyListings.append(listing);
  }
  function clearListings() {
    $propertyListings.empty();
  }
  window.propertyListings.clearListings = clearListings;

  function addProperties(properties, isReservation = false) {
    clearListings();
    for (const propertyId in properties) {
      const property = properties[propertyId];
      const listing = propertyListing.createListing(property, isReservation);
      addListing(listing);
      
      $(`.reserve-button-${property.id}`).on("click", function(e) {
        // alert("reserved!");
        console.log("reserved", property.id);
        $(".reservation-form").empty();
        $(".reservation-form").append(`
          <form>
            <div>
              <label for="start">Start date:</label>
              <input type="date" id="start" name="reservation-start">
            </div>
            <div>
              <label for="end">End date:</label>
              <input type="date" id="end" name="reservation-end">
            </div>
            <button type="submit" id="submit-reservation">
              Confirm
            </button>
          </form> 
        `);
        $("#submit-reservation").on("click", function(e) {
          e.preventDefault();
          makeReservation({
            propertyId: property.id,
            start: $("#start").val(),
            end: $("#end").val(),
          })
            .then(result => {
              alert("booked!");
            })
            .catch(err => {
              console.error(err);
            });
        })
      });
    }
  }
  window.propertyListings.addProperties = addProperties;

});