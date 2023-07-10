import styles from "./offer-panel.module.css";

function contentScrollable(element, rightScroll, height = "h-full") {
  let containerClassName = "overflow-y-auto " + height + " mb-5 " + rightScroll;

  if (!rightScroll) {
    containerClassName += " " + styles.leftScroll;
  }

  return <div className={containerClassName}>{element}</div>;
}

const onImageError = (e) => {
  e.target.src = "/imgNotAvailable.png";
};

function OfferPanel({ offer }) {
  let descriptionComponent = <></>;
  if (offer.Description.length > 100) {
    descriptionComponent = contentScrollable(offer.Description, false, "h-48");
  } else {
    descriptionComponent = <div>{offer.Description}</div>;
  }

  const imagesUrls =
    offer.ImageUrls != null &&
    offer.ImageUrls.map((imageUrl, index) => (
      <img key={index} src={imageUrl} onError={onImageError} />
    ));

  const imagesComponent =
    offer.ImageUrls != null && imagesUrls.length > 1 ? (
      contentScrollable(imagesUrls, false, "h-64")
    ) : (
      <div className="mb-5">{imagesUrls}</div>
    );

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

  const schoolsComponent = (
    <ul className="text-1xl">
      {offer.Schools.map((school, index) => (
        <li key={index}>
          {school.Name} - {school.Distance} m
        </li>
      ))}
    </ul>
  );

  const shopsComponent = (
    <ul className="text-1xl">
      {offer.Shops.map((shop, index) => (
        <li key={index}>
          {shop.Name} - {shop.Distance} m
        </li>
      ))}
    </ul>
  );

  const transportsComponent = (
    <ul className="text-1xl">
      {offer.PublicTransports.map((transport, index) => (
        <li key={index}>
          {transport.Name} - {transport.Distance} m
        </li>
      ))}
    </ul>
  );

  const InterestPointsComponent = (
    <ul className="text-1xl">
      {offer.InterestPoints.map((point, index) => (
        <div key={index}>
          {point.Type} - {point.Name} - {point.Distance} m
        </div>
      ))}
    </ul>
  );

  return contentScrollable(
    <div className={styles.offerHeight}>
      {titleComponent}
      {imagesComponent}
      {descriptionComponent}
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
      <div className="text-1xl font-bold mb-5">Structures environnantes</div>
      <div className="grid gap-1 grid-cols-2">
        <div className="text-1xl font-bold">Ecoles</div>
        {schoolsComponent}
        <div className="text-1xl font-bold">Magasins</div>
        {shopsComponent}
        <div className="text-1xl font-bold">Transports publiques</div>
        {transportsComponent}
        <div className="text-1xl font-bold">Points d'intérêt</div>
        {InterestPointsComponent}
      </div>
    </div>,
    true
  );
}

export { OfferPanel };
