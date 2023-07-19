import styles from "./offer.module.css";

const onImageError = (e) => {
  e.target.src = "/imgNotAvailable.png";
};

function formatDistance(distance) {
  // Format la distance pour qu'elle ait un step de 5
  return Math.round(distance / 5) * 5;
}

function OfferPanel({ offer, contentScrollable }) {
  const imagesUrls =
    offer.ImageUrls != null &&
    offer.ImageUrls.map((imageUrl, index) => (
      <img key={index} src={imageUrl} onError={onImageError} />
    ));

  const titleComponent = (
    <div className="text-2xl font-bold mb-5">
      {offer.Title} - {offer.Address}
    </div>
  );

  const parameterMissing = "Pas de spécification";

  offer.Type = offer.Type || parameterMissing;
  offer.NbRooms = offer.NbRooms || parameterMissing;
  offer.Management = offer.Management || parameterMissing;
  offer.Surface = offer.Surface
    ? offer.Surface.toString() + " m²"
    : parameterMissing;
  offer.Price = offer.Price
    ? offer.Price.toString() + " CHF"
    : parameterMissing;

  const schoolsComponent = <div>{offer.SchoolNumber}</div>;

  const shopsComponent = (
    <ul className="text-1xl pl-2">
      {offer.Shops.map((shop, index) => (
        <li key={index} className="mb-2">
          {shop.Name}
          {shop.Distance == null
            ? ""
            : " à " + formatDistance(shop.Distance) + "m"}
        </li>
      ))}
    </ul>
  );

  const transportsComponent = (
    <ul className="text-1xl pl-2">
      {offer.PublicTransports.map((transport, index) => (
        <li key={index} className="mb-2">
          {transport.Type}: {transport.Name}
          {transport.Distance == null
            ? ""
            : " à " + formatDistance(transport.Distance) + "m"}
        </li>
      ))}
    </ul>
  );

  const interestPointsComponent = (
    <ul className="text-1xl pl-2">
      {offer.InterestPoints.map((point, index) => (
        <div key={index} className="mb-2">
          {point.Type}: {point.Name}
          {point.Distance == null
            ? ""
            : " à " + formatDistance(point.Distance) + "m"}
        </div>
      ))}
    </ul>
  );

  return contentScrollable(
    <div className={styles.offerHeight}>
      {titleComponent}
      {offer.ImageUrls != null && imagesUrls.length > 1 ? (
        contentScrollable(imagesUrls, false, "h-64")
      ) : (
        <div className="mb-5">{imagesUrls}</div>
      )}
      {offer.Description.length > 100 ? (
        contentScrollable(offer.Description, false, "h-48")
      ) : (
        <div>{offer.Description}</div>
      )}
      <div className="text-1xl font-bold mb-5">Informations techniques</div>
      <div className="grid gap-1 grid-cols-2">
        <div className="text-1xl font-bold">Type de bien</div>
        <div className="text-1xl">{offer.Type}</div>
        <div className="text-1xl font-bold">Surface</div>
        <div className="text-1xl">{offer.Surface}</div>
        <div className="text-1xl font-bold">Prix</div>
        <div className="text-1xl">{offer.Price}</div>
        <div className="text-1xl font-bold">Nombre de pièces</div>
        <div className="text-1xl">{offer.NbRooms}</div>
        <div className="text-1xl font-bold">Gérance</div>
        <div className="text-1xl">{offer.Management}</div>
      </div>
      <div className="text-1xl font-bold mb-5 mt-5">
        Structures environnantes
      </div>
      <div className="grid gap-1 grid-cols-2">
        <div className="text-1xl font-bold mb-4">
          Nombre d&apos;écoles primaires à proximité
        </div>
        {schoolsComponent}
        <div className="text-1xl font-bold">Magasins</div>
        {contentScrollable(shopsComponent, false, "h-48")}
        <div className="text-1xl font-bold">Transports publiques</div>
        {contentScrollable(transportsComponent, false, "h-48")}
        <div className="text-1xl font-bold">Points d&apos;intérêt</div>
        {contentScrollable(interestPointsComponent, false, "h-48")}
      </div>
    </div>,
    true
  );
}

export { OfferPanel };
