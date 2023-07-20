import styles from "./offer.module.css";

// Change l'image par défaut si l'image de l'offre n'est pas disponible
const onImageError = (e) => {
  e.target.src = "/imgNotAvailable.png";
};

// Formate la distance pour qu'elle soit un multiple de 5
function formatDistance(distance) {
  return Math.round(distance / 5) * 5;
}

/**
 * Affiche les informations d'une offre dans un panneau
 * @param offer L'offre à afficher
 * @param contentScrollable Fonction qui permet de rendre le contenu scrollable
 * @returns Le panneau contenant les informations de l'offre en JSX
 */
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
  offer.Surface = offer.Surface ? offer.Surface.toString() : parameterMissing;
  offer.Price = offer.Price ? offer.Price.toString() : parameterMissing;

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
        <div className="text-1xl">{offer.Surface} m2</div>
        <div className="text-1xl font-bold">Prix</div>
        <div className="text-1xl">{offer.Price} CHF</div>
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
